import axios from 'axios';
import "dotenv/config"

export async function getZohoAccessToken(): Promise<string> {

    const res = await axios.post("https://accounts.zoho.com/oauth/v2/token", null, {

        params:{
            refresh_token: process.env.REFRESH_TOKEN,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "refresh_token",
        }
    })

    console.log(res);

    console.log(res.data.access_token)

    return res.data.access_token;
}



