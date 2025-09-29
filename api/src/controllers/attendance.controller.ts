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




export const checkIn = async (req: Request, res: Response) => {
    console.log("Check-in request received:", req.body);

    try {
        const { workerId, siteId, status, mode, qr_Code_Scanned } = req.body;

        if (!workerId || !siteId) {
            return res.status(400).json({ status: "error", message: "Missing workerId or siteId" });
        }

        const now = dayjs();
        const today = now.format("DD-MMM-YYYY");

        const existing = await fetchFormRecords("Check_In_Form_Report");
        const alreadyCheckedIn = existing.find(
            (r: any) =>
                r.Worker === workerId && r.Attendance_Date === today && r.Status === "Check In"
        );

        if (alreadyCheckedIn) {
            return res.status(400).json({
                status: "error",
                message: "Worker already checked in today",
            });
        }

        const record = {
            Worker: workerId,
            Construction_Site: siteId,
            Status: status,
            Mode: mode,
            QR_Code_Scanned: qr_Code_Scanned,
            Check_In_Time: now.format("DD-MMM-YYYY HH:mm:ss"),
            Attendance_Date: today,
        };

        const zohoResponse = await addFormRecord("Check_In_Form", record);
        return res.json({ status: "success", record, zohoResponse });
    } catch (err: any) {
        console.error("CheckIn error:", err);
        return res.status(500).json({ status: "error", message: err.message });
    }
};

export const checkOut = async (req: Request, res: Response) => {
    try {
        const { workerId, status, mode, qr_Code_Scanned } = req.body;

        if (!workerId || !status) {
            return res.status(400).json({ status: "error", message: "Missing required fields" });
        }

        const now = dayjs();
        const today = now.format("DD-MMM-YYYY");

        const existing = await fetchFormRecords("Check_Out_Form_Report");
        const alreadyCheckedOut = existing.find(
            (r: any) =>
                r.Worker === workerId && r.Attendance_Date === today && r.Status === "Check Out"
        );

        if (alreadyCheckedOut) {
            return res.status(400).json({
                status: "error",
                message: "Worker already checked out today",
            });
        }

        const record = {
            Worker: workerId,
            Status: status,
            Mode: mode,
            QR_Code_Scanned: qr_Code_Scanned,
            Check_Out_Time: now.format("DD-MMM-YYYY HH:mm:ss"),
            Attendance_Date: today,
        };

        const zohoResponse = await addFormRecord("Check_Out_Form", record);
        return res.json({ status: "success", record, zohoResponse });
    } catch (error: any) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};
