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

        // ✅ Success: new format
        if (body.code === 3000 && body.data?.ID) {
            return { success: true, id: body.data.ID, message: body.message };
        }

        // ✅ Success: old format
        if (body.code === 3000 && Array.isArray(body.result)) {
            const result = body.result[0];
            if (result.code === 3000) {
                return { success: true, id: result.data.ID, message: result.message };
            }
        }

        // ❌ Failure with alerts
        if (body.code === 3001 && body.error) {
            const alert = body.error.find((e: any) => e.alert_message);
            const message =
                alert?.alert_message?.[0] || body.error[0]?.message || "Zoho form submission failed";
            throw new Error(message);
        }

        throw new Error(`Unexpected Zoho response: ${JSON.stringify(body)}`);
    } catch (err: any) {
        if (err.response) {
            const { status, data } = err.response;
            if (status === 404) {
                throw new Error(`Zoho API 404: Form "${formName}" not found.`);
            }
            if (status === 401) {
                throw new Error("Zoho API 401: Unauthorized. Check access token.");
            }
            throw new Error(data?.message || JSON.stringify(data));
        }
        throw new Error(err.message);
    }
}
