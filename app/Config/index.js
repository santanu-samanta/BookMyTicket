module.exports = {
    // Define application configuration
    appRoot: {
      env: process.env.NODE_ENV || "development",
      isProd: process.env.NODE_ENV === "production",
      host: process.env.HOST || "localhost",
      port: process.env.PORT || 3006,
      appName: process.env.APP_NAME || "newProjectSetup",
      getUserFolderName: process.env.USER_FOLDER_NAME || "user",
      getAdminFolderName: process.env.ADMIN_FOLDER_NAME || "admin",
      getWebFolderName: process.env.WEB_FOLDER_NAME || "web",
      getTicketFolderName: process.env.TICKET_FOLDER_NAME || "ticket",
      getOrganizerFolderName: process.env.ORGANIZER_FOLDER_NAME || "organizer",
    },
  };
  
  