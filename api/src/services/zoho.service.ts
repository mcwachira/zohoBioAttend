import axios from 'axios';
import {getZohoAccessToken}  from "../utils/token.util";


const ZOHO_BASE_URL = "https://www.zohoapis.com/creator/v2.1";
const ZOHO_OWNER = "wavemarkpropertieslimited"
const ZOHO_APP = "attendance-management-system";


//Fetch Records

export async function  fetchFormRecords(reportName:string){
    const token = await getZohoAccessToken();

    console.log(reportName)
    const url = `${ZOHO_BASE_URL}/data/${ZOHO_OWNER}/${ZOHO_APP}/report/${reportName}?max_records=200`;

    try {
        const res = await axios.get(url, {
            headers: {
                Authorization: `Zoho-oauthtoken ${token}`,
                Accept: "application/json",},
        });
        // console.log("Zoho raw response:", JSON.stringify(res.data, null, 2));
        return res.data.data;
    } catch (err: any) {
        console.error("Fetch error:", err.response?.data || err.message);
        throw err;
    }
}

//Add Form Record
export async function addFormRecord(formName: string, record: Record<string, any>) {
    const token = await getZohoAccessToken();
    console.log(token)
    console.log(formName)
    console.log(record)
    const url = `${ZOHO_BASE_URL}/data/${ZOHO_OWNER}/${ZOHO_APP}/form/${formName}`;

    try {
        const res = await axios.post(
            url,
            { data: [record] },
            {
                headers: {
                    Authorization: `Zoho-oauthtoken ${token}`,
                    Accept: "application/json",
                },
            }
        );

        const result = res.data?.data?.[0];

        if (!result) {
            throw new Error(`Unexpected Zoho response: ${JSON.stringify(res.data)}`);
        }

        if (result.code === "SUCCESS") {
            console.log(`✅ Zoho ${formName} record created:`, result.details);
            return result.details;
        }

        if (result.code === "ERROR") {
            console.error("❌ Zoho field error:", result.message);
            throw new Error(`Zoho API field error: ${JSON.stringify(result.message)}`);
        }

        return result;
    } catch (err: any) {
        if (err.response) {
            const { status, data } = err.response;

            if (status === 404) {
                throw new Error(
                    `Zoho API 404: Form "${formName}" not found. Check ZOHO_OWNER, ZOHO_APP, and form name.`
                );
            } else if (status === 401) {
                throw new Error("Zoho API 401: Unauthorized. Check access token and credentials.");
            } else {
                throw new Error(`Zoho API ${status}: ${JSON.stringify(data)}`);
            }
        } else {
            throw new Error(`Zoho request failed: ${err.message}`);
        }
    }
}