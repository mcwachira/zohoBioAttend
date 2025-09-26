import express , {Request, Response} from "express"
import "dotenv/config"
import bodyParser from "body-parser";
import attendanceRoutes from "./routes/attendace.routes";

const app  = express()
app.use(bodyParser.json())

const CLIENT_ID = process.env.CLIENT_ID!;
const CLIENT_SECRET = process.env.CLIENT_SECRET!;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN!;
const ZOHO_OWNER = process.env.ZOHO_OWNER!;
const ZOHO_APP = process.env.ZOHO_APP!;
const ATTENDANCE_FORM = process.env.ATTENDANCE_FORM!;

// Register routes
app.use("/api", attendanceRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));