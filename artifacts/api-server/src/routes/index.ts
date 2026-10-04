import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import studentsRouter from "./students";
import careersRouter from "./careers";
import coursesRouter from "./courses";
import questionsRouter from "./questions";
import assessmentRouter from "./assessment";
import recommendationsRouter from "./recommendations";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(studentsRouter);
router.use(careersRouter);
router.use(coursesRouter);
router.use(questionsRouter);
router.use(assessmentRouter);
router.use(recommendationsRouter);
router.use(adminRouter);

export default router;
