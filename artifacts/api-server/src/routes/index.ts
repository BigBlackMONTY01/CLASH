import { Router, type IRouter } from "express";
import healthRouter from "./health";
import debateRouter from "./debate";
import playersRouter from "./players";
import authRouter from "./auth";
import roomsRouter from "./rooms";
import oneVOneRouter from "./1v1";

const router: IRouter = Router();

router.use(healthRouter);
router.use(debateRouter);
router.use(playersRouter);
router.use(authRouter);
router.use(roomsRouter);
router.use(oneVOneRouter);

export default router;
