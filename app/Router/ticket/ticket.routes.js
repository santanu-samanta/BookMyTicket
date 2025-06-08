const express = require("express");
const routeLabel = require("route-label");

const TicketController = require("../../Module/Tickets/controller/Ticket.Controller");
const { userauthCheck } = require("../../Middleware/authCheck");
const { userrolechack } = require("../../Helper/rolechack");

const router = express.Router();
const namedRouter = routeLabel(router);


// shoe ticket in image fromat
namedRouter.get("payment.ticket_show",'/:id',userauthCheck,userrolechack,TicketController.ticketshow)
// downlode ticket in pdf format
// namedRouter.get("payment.ticket_pdf",'/download-ticket/:ticketId',userauthCheck,userrolechack,TicketController.pdfwownlode_ticket)
namedRouter.post("payment.ticket",'/create-order',userauthCheck,userrolechack,TicketController.payment_create)
namedRouter.post("payment.ticket_formovie",'/create',userauthCheck,userrolechack,TicketController.createTicketformovie)
namedRouter.post("payment.ticket_forevent",'/create/event',userauthCheck,userrolechack,TicketController.createTicketforevent)



module.exports = router;