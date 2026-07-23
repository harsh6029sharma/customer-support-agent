import { Router } from "express";
import { createTicket,getUserTickets,getTicketById,updateTicketById, getAnalytics, addMessage, getTicketMessages } from "../controllers/ticket.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router()

// Static routes 
router.route("/analytics").get(apiLimiter, verifyJwt, getAnalytics)
// User tickets
router.route("/my-tickets").get(apiLimiter, verifyJwt, getUserTickets)


// Dynamic routes
router.route("/").post(apiLimiter, verifyJwt, createTicket)

router.route("/:ticketId").get(apiLimiter, verifyJwt, getTicketById)

router.route("/:ticketId").patch(apiLimiter, verifyJwt, updateTicketById)

router.route("/:ticketId/messages").post(apiLimiter, verifyJwt, addMessage)

router.route("/:ticketId/messages").get(apiLimiter, verifyJwt, getTicketMessages)

export default router