import { Router, type IRouter } from "express";
import healthRouter from "./health";
import simulateRouter from "./simulate";
import debateRouter from "./debate";
import playersRouter from "./players";

const router: IRouter = Router();

router.use(healthRouter);
router.use(simulateRouter);
router.use(debateRouter);
router.use(playersRouter);

export default router;
