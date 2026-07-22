import * as z from 'zod'

export const createUserSchema = z.object({
    email:z.email("Invalid email format"),
    password:z.string(),
    name:z.string().optional()
})

export const loginUserSchema = z.object({
    email:z.email("Invalid email format"),
    password:z.string()
})

export const createTicketSchema = z.object({
    title:z.string(),
    description:z.string()
})

export const TicketAnalysisSchema = z.object({
  category: z.enum([
    "PAYMENT",
    "ACCOUNT",
    "TECHNICAL",
    "SHIPPING",
    "OTHER"
  ]),
  priority: z.enum([
    "LOW",
    "MEDIUM",
    "HIGH"
  ]),
  suggestedReply:z.string()
});