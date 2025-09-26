import { Router } from "express";
import { checkIn, checkOut } from "../controllers/attendace.controller";

const router = Router();

router.post("/checkin", checkIn);
router.post("/checkout", checkOut);

export default router;
