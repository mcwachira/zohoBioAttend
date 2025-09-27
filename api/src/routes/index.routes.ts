import { Router } from "express";
import { checkIn, checkOut } from "../controllers/attendance.controller";
import { getWorkers } from "../controllers/worker.controller";
import { getSites } from "../controllers/site.controller";

const router = Router();

//attendance
router.post("/checkin", checkIn);
router.post("/checkout", checkOut);

// workers & sites
router.get("/workers", getWorkers);
router.get("/sites", getSites);


export default router;
