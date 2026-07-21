import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { ApiError } from './ApiError.js'

type TokenUser = {
    id: number,
    email: string,
    name: string | null
}


const hashPassword = (password: string) => {
    const hashedPassword = bcrypt.hash(password, 10)
    return hashedPassword
}

const checkPassword = (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword)
}

const generateAccessToken = (data: TokenUser) => {
    const secret = process.env.ACCESS_TOKEN_SECRET

    if (!secret) {
        throw new ApiError(500, "ACCESS_TOKEN_SECRET is not defined in your environment variable")
    }
    const token = jwt.sign(
        // payload
        {
            id: data.id,
            email: data.email,
            name: data.name
        },
        secret,
        {
            expiresIn: '1d'
        }

    )
    return token
}

const generateRefreshToken = (data: TokenUser) => {
    const secret = process.env.REFRESH_TOKEN_SECRET

    if (!secret) {
        throw new ApiError(500, "REFRESH_TOKEN_SECRET is not defined in your environment variable")
    }
    const token = jwt.sign(
        // payload
        {
            id: data.id,
        },
        secret,
        {
            expiresIn: '10d'
        }

    )
    return token
}


export {
    hashPassword,
    checkPassword,
    generateAccessToken,
    generateRefreshToken
}