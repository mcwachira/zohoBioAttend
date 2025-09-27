import { Request, Response} from "express";
import {addFormRecord, fetchFormRecords} from "../services/zoho.service";
import { formatDate, formatDateTime } from "../utils/date.utils";


async function getRecordIdByName(reportName: string, fieldName: string, value: string) {
    const records = await fetchFormRecords(reportName);

    // Normalize the input (lowercase + collapse spaces)
    const normalize = (str: string) =>
        str.replace(/\s+/g, " ").trim().toLowerCase();

    const normalizedInput = normalize(value);

    const record = records.find((r: any) => {
        const field = r[fieldName];
        if (!field) return false;

        // Case 1: plain string field
        if (typeof field === "string") {
            return normalize(field) === normalizedInput;
        }

        // Case 2: Zoho object with display value
        if (typeof field === "object" && field.zc_display_value) {
            return normalize(field.zc_display_value) === normalizedInput;
        }

        return false;
    });

    if (!record) throw new Error(`${value} not found in ${reportName}`);

    return record.ID;
}




export const checkIn = async(req: Request, res: Response) => {

    console.log("Check-in request received:", req.body);
    try{
        const { workerId, siteId, status, mode } = req.body;

        // Validate input
        if (!workerId || !siteId) {
            return res.status(400).json({ status: "error", message: "Missing workerId or siteId" });
        }

        console.log("Resolved IDs:", { workerId, siteId });


        const record = {
            Worker: workerId,
            Construction_Site: siteId,
            Status: status,
            Mode: mode,       // lookup object
            Check_In_Time: formatDateTime(new Date()),   // dd-MMM-yyyy HH:mm:ss
            Attendance_Date: formatDate(new Date()),     // dd-MMM-yyyy
        };
        console.log("record to be sent", record);

        try {
            // Send record to Zoho
            const zohoResponse = await addFormRecord("Check_In_Form", record);
            console.log("Zoho response:", zohoResponse.data);

            return res.json({ status: "success", record });
        } catch (zohoErr: any) {
            // Log Zoho error and send detailed response
            console.error("Zoho API error:", zohoErr || zohoErr.message);

            return res.status(502).json({
                status: "error",
                message: "Failed to send record to Zoho",
                details: zohoErr.response?.data || zohoErr.message,
            });
        }
    } catch (err: any) {
        console.error("Server error:", err.message);
        return res.status(500).json({ status: "error", message: err.message });
    }
};


export const checkOut = async (req: Request, res: Response) => {
    try {
        const { employeeName, status } = req.body;

        // Validate input
        if (!employeeName || !status) {
            return res.status(400).json({ status: "error", message: "Missing required fields" });
        }
        // Resolve lookup ID
        const workerId = await getRecordIdByName("Worker_Report", "Name", employeeName);

        const record = {
            Worker: workerId,            // send ID instead of name
            Check_Out_Time: new Date().toISOString(),
            Attendance_Date: new Date().toISOString().split("T")[0],
            Status: status,
            Mode: "Fingerprint",
        };


        await addFormRecord("Check_Out_Form", record);
        res.json({ status: "success", record });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
    }
};