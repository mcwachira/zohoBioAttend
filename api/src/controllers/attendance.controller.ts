import { Request, Response} from "express";
import {addFormRecord, fetchFormRecords} from "../services/zoho.service";
import dayjs from "dayjs";


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
        const { workerId, siteId, status, mode,qr_Code_Scanned } = req.body;

        // Validate input
        if (!workerId || !siteId) {
            return res.status(400).json({ status: "error", message: "Missing workerId or siteId" });
        }

        console.log("Resolved IDs:", { workerId, siteId });


        const now = dayjs();
        const record = {
            Worker: workerId,
            Construction_Site: siteId,
            Status: status,
            Mode: mode,       // lookup object
            QR_Code_Scanned:qr_Code_Scanned,
            Check_In_Time: now.format("DD-MMM-YYYY HH:mm:ss"),   // ✅ Correct Zoho time format
            Attendance_Date: now.format("DD-MMM-YYYY"),
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
        const { workerId,  status, mode, qr_Code_Scanned } = req.body;

        // Validate input
        if (!workerId || !status) {
            return res.status(400).json({ status: "error", message: "Missing required fields" });
        }


        const now = dayjs();
        const record = {
            Worker: workerId,
            Status: status,
            Mode: mode,       // lookup object
            QR_Code_Scanned:qr_Code_Scanned,
            Check_Out_Time: now.format("DD-MMM-YYYY HH:mm:ss"), // ✅ Correct Zoho time format
            Attendance_Date: now.format("DD-MMM-YYYY"),
        };


        await addFormRecord("Check_Out_Form", record);
        res.json({ status: "success", record });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
    }
};