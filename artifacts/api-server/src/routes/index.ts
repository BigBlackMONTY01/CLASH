import { Router, type IRouter } from "express";
import healthRouter from "./health";
import debateRouter from "./debate";
import playersRouter from "./players";

const router: IRouter = Router();

router.use(healthRouter);
router.use(debateRouter);
router.use(playersRouter);

export default router;
