import { Router, type IRouter } from "express";
import healthRouter from "./health";
import debateRouter from "./debate";
import playersRouter from "./players";
import authRouter from "./auth";
import roomsRouter from "./rooms";

const router: IRouter = Router();

router.use(healthRouter);
router.use(debateRouter);
router.use(playersRouter);
router.use(authRouter);
router.use(roomsRouter);

export default router;
