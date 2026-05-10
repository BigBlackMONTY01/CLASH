import { Router, type IRouter } from "express";
import healthRouter from "./health";
import simulateRouter from "./simulate";
import debateRouter from "./debate";

const router: IRouter = Router();

router.use(healthRouter);
router.use(simulateRouter);
router.use(debateRouter);

export default router;
