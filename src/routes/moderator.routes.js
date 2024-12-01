import { Router } from "express";
import { verifyJWT, verifyIsModerator } from "../middlewares/auth.middleware.js";
import { registerModerator, getAllUsers, getUserById, updateUserData, deleteUserById } from "../controllers/moderator.controller.js";

const router = Router();

router.route("/").get(verifyJWT, verifyIsModerator, (req, res) => {
    res.json({ message: "Welcome to Moderator Routes!!" });
});

router.route("/register-moderator").post(registerModerator);
router.route("/get-all-users").get(verifyJWT, verifyIsModerator, getAllUsers);
router.route("/get-user/:id").get(verifyJWT, verifyIsModerator, getUserById);
router.route("/update-user/:id").put(verifyJWT, verifyIsModerator, updateUserData);
router.route("/delete-user/:id").delete(verifyJWT, verifyIsModerator, deleteUserById);

export default router;