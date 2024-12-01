import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiResponse } from "../helpers/ApiResponse.js";
import { ApiError } from "../helpers/ApiError.js";
import { User } from "../models/user-model.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false})
        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Something went wrong, cannot generate Tokens!")
    }
};

const loginUser = asyncHandler( async(req, res) => {
    const {email, password} = req.body;
    console.log(req.body)
    console.log(email, password); 

    //checking the validity of the field.
    if(!(email)){
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404, "User not found");
    }
    const isValidPassword = await user.isPasswordCorrect(password);

    if(!isValidPassword){
        throw new ApiError(401, "Invalid password");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    //console.log(accessToken, refreshToken);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    //console.log(loggedInUser);

    const cookieOptions = {
        httpOnly: true,
        secure: false,
    }

    res.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
});

const logoutUser = asyncHandler( async(req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            // $set: {
            //     refreshToken: undefined,
            // }
            $unset: {
                refreshToken: 1, //removes the field itself from the document.
            }
        },
        {
            new: true,
        }
    )

    //deleting the accessToken from cookie.
    const cookieOptions = {
        httpOnly: true,
        secure: false,
    }

    console.log("User Logged Out!!");
    return res.status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
});

const refreshAccessToken = asyncHandler( async(req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request!!");
    }

    //verify the refreshToken.
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    //check if the user still exists in the database.
    const user = await User.findById(decoded?._id);
    if(!user){
        throw new ApiError(401, "Invalid RefreshToken!!");
    }

    //now we have to match the encoded refreshToken stored in the database with our incomingRefreshToken.
    if(user?.refreshToken !== incomingRefreshToken){
        throw new ApiError(401, "Different RefreshTokens, Access Denied!!");
    }

    //generate a new accessToken.
    const cookieOptions = {
        httpOnly: true,
        secure: false,
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    return res.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(
            200, 
            {accessToken, refreshToken},
            "New Access Token and Refresh Token generated successfully!!"
        )
    )
});

export { 
    loginUser, 
    logoutUser, 
    refreshAccessToken,
}