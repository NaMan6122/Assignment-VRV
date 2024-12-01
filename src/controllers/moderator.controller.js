import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiResponse } from "../helpers/ApiResponse.js";
import { ApiError } from "../helpers/ApiError.js";
import { User } from "../models/user-model.js";
import { MODERATOR, USER } from "../constants/names.js";

const registerModerator = asyncHandler( async (req, res) => {
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
        role: MODERATOR,
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

const getAllUsers = asyncHandler( async (req, res) => {
    try {
        const users = await User.find({ role: USER}).select("-password -refreshToken");
        res.status(200).json(new ApiResponse(200, users, "All Users fetched successfully!!"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, "Failed to fetch users."));
    }
});

const getUserById = asyncHandler( async (req, res) => {
    try {
        const userId = req.params.id;
        if(!userId){
            throw new ApiError(400, "User ID is required!!");
        }
        const currUser = await User.findOne({ _id: userId, role: USER }).select("-password -refreshToken");
        if(!currUser){
            throw new ApiError(404, "User not found!!");
        }
        res.status(200).json(new ApiResponse(200, currUser, "User fetched successfully!!"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, "Failed to fetch user."));
    }
});

const updateUserData = asyncHandler( async (req, res) => {
    try {
        const userId = req.params.id;
        const {fullName, email, phone} = req.body;
        if(!userId){
            throw new ApiError(400, "User ID is required!!");
        }
        
        const updatedUser = await User.updateOne(
            {
                _id: userId,
                role: USER,
            },
            {
                $set: {
                    fullName,
                    email,
                    phone,
                },
            },
            {
                //ew: true,
                runValidators: true,
            }
        );

        if(!updatedUser){
            throw new ApiError(404, "User not found!!");
        }
        res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully!!"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, "Failed to update user."));
    }
});

const deleteUserById = asyncHandler( async (req, res) => {
    try {
        const userId = req.params.id;

        if(!userId){
            throw new ApiError(400, "User ID is required!!");
        }

        const deletedUser = await User.deleteOne({
            _id: userId,
            role: USER,
        });

        if (deletedUser.deletedCount === 0) {
            return res.status(404).json({ message: "User not found or not a normal user." });
        }

        res.status(200).json(new ApiResponse(200, null, "User deleted successfully!!"));
    } catch(error){
        if(error instanceof ApiError){
            res.status(error.statusCode).json(new ApiResponse(error.statusCode, null, error.message));
        }else{
            res.status(500).json(new ApiResponse(500, null, "Failed to delete user."));
        }
    }
});

export {
    registerModerator, 
    getAllUsers, 
    getUserById, 
    updateUserData, 
    deleteUserById 
}