import { Request, Response} from "express";
import {addFormRecord} from "../services/zoho.service";

export const checkIn = async(req: Request, res: Response) => {

    try{
        const { employeeName, constructionSiteName, status } = req.body;
        const record = {
            Worker: employeeName,
            Construction_Site: constructionSiteName,
            Check_In_Time: new Date().toISOString(),
            Attendance_Date: new Date().toISOString().split("T")[0],
            Status: "Check In",
            Mode: "Fingerprint",
        };
        await addFormRecord("Check_In_Form", record)
        res.json({status: "success", record })
    }catch (error:any){
        res.status(500).json({ status: "error", message: error.message });
    }

}

export const checkOut = async (req: Request, res: Response) => {
    try {
        const { employeeName, status } = req.body;
        const record = {
            Worker: employeeName,
            Check_Out_Time: new Date().toISOString(),
            Attendance_Date: new Date().toISOString().split("T")[0],
            Status: "Checked Out",
            Mode: "Fingerprint",
        };

        await addFormRecord("Check_Out_Form", record);
        res.json({ status: "success", record });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
    }
};