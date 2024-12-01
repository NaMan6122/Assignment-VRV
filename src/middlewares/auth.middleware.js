import { User } from "../models/user-model.js";
import { ApiError } from "../helpers/ApiError.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import { ADMIN, MODERATOR } from "../constants/names.js";
import jwt from "jsonwebtoken";

//as we know, middleware adds more properties in req, res objects so that we can implement more functionalities and checks.

export const verifyJWT = asyncHandler( async (req, res, next) => {
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "");
    //console.log(req.cookies);
    //console.log(req.header("Authorization"));
    if (!accessToken) {
        throw new ApiError(401, "Unauthorized Request!!");
    }
    //console.log(accessToken);

    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    if(!user){
        throw new ApiError(401, "Inavlid Access Token!!");
    }
    //storing the user in the request object, so that we can access it using req.user, this is not predefined field, we made a custom field req.user.
    req.user = user;
    next();
});

export const verifyIsModerator = asyncHandler( async (req, res, next) => {
    if(req.user.role !== MODERATOR){
        throw new ApiError(403, "Unauthorized, Only Moderators are allowed!!");
    }
    next();
});

export const verifyIsAdmin = asyncHandler( async (req, res, next) => {
    if(req.user.role !== ADMIN){
        throw new ApiError(403, "Unauthorized, Only Admins are allowed!!");
    }
    next();
});