import {Request, Response} from "express";
import {fetchFormRecords}    from "../services/zoho.service";

export const getSites = async (req: Request, res: Response) => {
    try{
        const sites = await fetchFormRecords("All_Construction_Sites")
        const formatted = sites.map((site:any) => ({
            id:site.ID,
            name: site.Site_Name,
        }) )

        res.status(200).json(formatted)
    }catch(err:any) {
        res.status(500).json({error:err.message})
    }
}