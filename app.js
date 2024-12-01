import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({
    limit: "500kb",
}));

app.use(express.urlencoded({
    limit: "500kb",
    extended: true,
}));

app.use(cookieParser());

//routes:
import userRouter from "./src/routes/user.routes.js";
import adminRouter from "./src/routes/admin.routes.js";
import commonRouter from "./src/routes/common.routes.js";
import modRouter from "./src/routes/moderator.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/", commonRouter);
app.use("/api/v1/moderator", modRouter);


export { app }