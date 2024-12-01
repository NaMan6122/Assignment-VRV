import {Router} from "express"
import { registerUser, updateMyData } from "../controllers/user.controller.js";
import { verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

//public routes:
router.route("/register").post(registerUser); 

//auth routes:
router.route("/update-user-data/:id").put(verifyJWT, updateMyData);

export default router;