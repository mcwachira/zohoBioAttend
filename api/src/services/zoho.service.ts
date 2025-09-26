import axios from 'axios';
import {getZohoAccessToken}  from "../utils/token.util";

const ZOHO_OWNER = process.env.ZOHO_OWNER!;
const ZOHO_APP = process.env.ZOHO_APP!;

//Fetch Records

export async function  fetchFormRecords(formName:string){
    const token = await getZohoAccessToken();

    const url = `https://creator.zoho.com/api/v2/${ZOHO_OWNER}/${ZOHO_APP}/report/${formName}_Report`;

    const res = await axios.get(url, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });

    console.log(res.data.data)

    return res.data.data;
}

//Add Form Record
export async function addFormRecord(formName: string, record: Record<string, any>) {
    const token = await getZohoAccessToken();
    const url = `https://creator.zoho.com/api/v2/${ZOHO_OWNER}/${ZOHO_APP}/form/${formName}/record`;

    return axios.post(url, { data: record }, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });
}