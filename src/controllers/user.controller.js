import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiResponse } from "../helpers/ApiResponse.js";
import { ApiError } from "../helpers/ApiError.js";
import { User } from "../models/user-model.js";


const registerUser = asyncHandler( async (req, res) => {
    const {fullName, email, password, phone} = req.body;
    console.log(fullName, email, password, phone);
    
    if( //validation.
        [fullName, password, email, phone].some((field) => {
            return field.trim() === "";
        })
    ){
        throw new ApiError(400, "Please fill all fields properly!");
    }

    //checking if user exists.
    const existingUser = await User.findOne({
        $or: [{phone}, {email}]
    });
    if(existingUser){
        throw new ApiError(409, "User already exists!");
    }

    //entry in db
    const user = await User.create({
        fullName,
        email,
        password,
        phone,
    });

    //validating the creation of user in database.
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "User cannot be registered, try again later!")
    }
    
    res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully!!"),
    )
});

const updateMyData = asyncHandler( async (req, res) => {
    const {fullName, email, phone} = req.body;
    const userId = req.user._id;

    if( //validation.
        [fullName, email, phone].some((field) => {
            return field.trim() === "";
        })
    ){
        throw new ApiError(400, "Please fill all fields properly!");
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
        fullName,
        email,
        phone,
    }, {
        new: true,
        runValidators: true,
    }).select("-password -refreshToken");

    if(!updatedUser){
        throw new ApiError(500, "User cannot be updated, try again later!")
    }

    res.status(200).json(
        new ApiResponse(200, updatedUser, "User updated successfully!!"),
    )
});

export {
    registerUser,
    updateMyData,
}