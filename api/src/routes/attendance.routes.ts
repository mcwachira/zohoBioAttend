import { Router } from "express";
import { checkIn, checkOut } from "../controllers/attendance.controller";

const router = Router();

router.post("/checkin", checkIn);
router.post("/checkout", checkOut);

export default router;
