import { Router, type IRouter } from "express";
import healthRouter from "./health";
import debateRouter from "./debate";
import playersRouter from "./players";
import authRouter from "./auth";
import roomsRouter from "./rooms";
import oneVOneRouter from "./1v1";
import rankingsRouter from "./rankings";
import cardsRouter from "./cards";
import progressionRouter from "./progression";
import aiPersonasRouter from "./ai-personas";
import rivalsRouter from "./rivals";
import feedbackRouter from "./feedback";

const router: IRouter = Router();

router.use(healthRouter);
router.use(debateRouter);
router.use(playersRouter);
router.use(authRouter);
router.use(roomsRouter);
router.use(oneVOneRouter);
router.use(rankingsRouter);
router.use(cardsRouter);
router.use(progressionRouter);
router.use(aiPersonasRouter);
router.use(rivalsRouter);
router.use(feedbackRouter);

export default router;
