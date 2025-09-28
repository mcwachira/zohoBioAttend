import {Request, Response} from "express";
import {fetchFormRecords}    from "../services/zoho.service";


export const getWorkers = async (req: Request, res: Response) => {
    try{
        const workers = await fetchFormRecords('Worker_Report');
        const formatted = workers
            .filter((w: any) => w.Status === "Active")
            .map((w: any) => ({
                id: w.ID,
                qrCode:w.QR_Code.value,
                name: `${w.Worker_Name?.zc_display_value || `${w.Worker_Name?.first_name} ${w.Worker_Name?.last_name}`} (${w.Role})`,

            }))
        console.log("formated data",formatted);
        res.status(200).json(formatted)
    }catch(err:any) {
        res.status(500).json({error:err.message})
    }
}