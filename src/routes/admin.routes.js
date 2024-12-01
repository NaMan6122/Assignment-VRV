import { Router } from "express";
import { verifyJWT, verifyIsAdmin } from "../middlewares/auth.middleware.js";
import { registerAdmin, getAllUsers, getUserById, updateUserData, deleteUserById } from "../controllers/admin.controller.js";

const router = Router();

router.route("/").get(verifyJWT, verifyIsAdmin, (req, res) => {
    res.json({ message: "Welcome to Admin Routes!!" });
});
router.route("/register-admin").post(registerAdmin);
router.route("/get-all-users").get(verifyJWT, verifyIsAdmin, getAllUsers);
router.route("/get-user/:id").get(verifyJWT, verifyIsAdmin, getUserById);
router.route("/update-user/:id").put(verifyJWT, verifyIsAdmin, updateUserData);
router.route("/delete-user/:id").delete(verifyJWT, verifyIsAdmin, deleteUserById);

export default router;