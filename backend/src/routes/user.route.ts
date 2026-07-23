import { Router } from "express";
import {loginUser, logoutUser, registerUser} from '../controllers/user.controller.js'
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router()

router.route("/register").post(authLimiter,registerUser)
router.route("/login").post(authLimiter,loginUser)
router.route("/logout").post(verifyJwt,logoutUser)

export default router