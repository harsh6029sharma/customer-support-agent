import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

interface DecodedUser {
    id: number,
    email: string
}

declare global {
    namespace Express {
        interface Request {
            user: JwtPayload
        }
    }
}

const verifyJwt = async (req: Request, _: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "") 

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const access_secret = process.env.ACCESS_TOKEN_SECRET!

        const decodedToken = jwt.verify(token, access_secret) as DecodedUser

        const user = await prisma.user.findUnique({
            where: {
                id: decodedToken.id
            }
        })

        if (!user) {
            throw new ApiError(401, "User not found")
        }

        req.user = decodedToken
        console.log(req.user)

        next()

    } catch (error) {
        next(new ApiError(401, "Invalid or expired token"))
    }
}

export { verifyJwt }