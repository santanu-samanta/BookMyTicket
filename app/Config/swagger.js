// swagger.js
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "🎟️ BookMyTicket API",
      version: "1.0.0",
      description: "API documentation for Movie and Event Ticket Booking Platform by Santanu Samanta",
      contact: {
        name: "Santanu Samanta",
      },
    },
    servers: [
      {
        url: "http://localhost:3006",
        description: "Local development server",
      },
    ],
  },
  apis: [
    "./app/Router/admin*.js",
    "./app/Router/user*.js",
    "./app/Router/organizer*.js",
    "./app/Router/web*.js",
  ],
};

module.exports = swaggerOptions;
