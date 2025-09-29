import axios from "axios";
import { getZohoAccessToken } from "../utils/token.util";

const ZOHO_BASE_URL = "https://www.zohoapis.com/creator/v2.1";
const ZOHO_OWNER = "wavemarkpropertieslimited";
const ZOHO_APP = "attendance-management-system";

// Fetch Records
export async function fetchFormRecords(reportName: string) {
    const token = await getZohoAccessToken();
    const url = `${ZOHO_BASE_URL}/data/${ZOHO_OWNER}/${ZOHO_APP}/report/${reportName}?max_records=200`;

    try {
        const res = await axios.get(url, {
            headers: {
                Authorization: `Zoho-oauthtoken ${token}`,
                Accept: "application/json",
            },
        });

        return res.data.data;
    } catch (err: any) {
        console.error("Fetch error:", err.response?.data || err.message);
        throw err;
    }
}

// Add Form Record
export async function addFormRecord(formName: string, record: Record<string, any>) {
    const token = await getZohoAccessToken();
    const url = `${ZOHO_BASE_URL}/data/${ZOHO_OWNER}/${ZOHO_APP}/form/${formName}`;

    try {
        const res = await axios.post(
            url,
            { data: record },
            {
                headers: {
                    Authorization: `Zoho-oauthtoken ${token}`,
                    Accept: "application/json",
                },
            }
        );

        const body = res.data;

        // ✅ Case 1: New format { code, data, message }
        if (body.code === 3000 && body.data?.ID) {
            console.log(`✅ Zoho ${formName} record created:`, body.data.ID);
            return {
                success: true,
                id: body.data.ID,
                message: body.message,
            };
        }

        // ✅ Case 2: Old format { code, result: [ { code, data, message } ] }
        if (body.code === 3000 && Array.isArray(body.result)) {
            const result = body.result[0];
            if (result.code === 3000) {
                console.log(`✅ Zoho ${formName} record created:`, result.data.ID);
                return {
                    success: true,
                    id: result.data.ID,
                    message: result.message,
                };
            }
        }

        throw new Error(`Unexpected Zoho response: ${JSON.stringify(body)}`);
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
