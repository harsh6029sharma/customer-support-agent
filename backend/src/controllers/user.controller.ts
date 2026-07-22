import { type Request, type Response } from "express"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { prisma } from "../lib/prisma.js"
import { checkPassword,generateAccessToken,generateRefreshToken,hashPassword } from "../utils/jwt.js"
import { createUserSchema, loginUserSchema } from "../schemas/zod.schemas.js"


const generateAccessAndRefreshToken = async (userId: number): Promise<{ accessToken: string, refreshToken: string }> => {

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            }
        })

        if (!user) {
            throw new ApiError(404, "user not found")
        }

        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)

        user.refreshToken = refreshToken

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                refreshToken: refreshToken
            }
        })

        return { accessToken, refreshToken }

    } catch (error) {

        throw new ApiError(500, "something went wrong while generating access token and refresh token")
    }

}

const registerUser = asyncHandler(async (req: Request, res: Response) => {

    const validatedData = createUserSchema.parse(req.body)
    // check if this user already exist or not 
    const existedUser = await prisma.user.findUnique({
        where: {
            email: validatedData.email
        }
    })

    if (existedUser) {
        throw new ApiError(409, "user already exist with this email")
    }

    const hashedPassword = await hashPassword(validatedData.password)

    const user = await prisma.user.create({
        data: {
            name: validatedData.name ?? null,
            email: validatedData.email,
            password: hashedPassword
        }
    })

    const { password, refreshToken, ...safeUser } = user

    return res.status(201).json(
        new ApiResponse(201, safeUser, "user created successfully")
    )

})


const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = loginUserSchema.parse(req.body)

    if (!validatedData.email) {
        throw new ApiError(400, "email is required for login")
    }

    const user = await prisma.user.findUnique({
        where: {
            email: validatedData.email
        }
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const hashedPassword = user.password

    const isPasswordCorrect = await checkPassword(validatedData.password, hashedPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Password is incorrect")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user.id)

    const loggedInUser = await prisma.user.findUnique({
        where: {
            id: user.id
        },
        select: {
            name: true,
            email: true
        }

    })

    const Options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
    }

    return res.status(200)
        .cookie("accessToken", accessToken, Options)
        .cookie("refreshToken", refreshToken, Options)
        .json(
            new ApiResponse(
                200, {
                user: loggedInUser, accessToken
            },
                "User logged in successfully"
            )
        )
})


const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    await prisma.user.update({
        where: { id: req.user.id },
        data: { refreshToken: null }
    })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).
        clearCookie("accessToken", options).clearCookie("refreshToken", options).json(
            new ApiResponse(200, {}, "User logged out successfully")
        )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    generateAccessAndRefreshToken
}