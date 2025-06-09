const { join, resolve } = require("path");
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { get } = require("http");
const db=require('./app/Config/db')
const cors=require('cors')
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const path=require('path')
const fs = require('fs');
// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./app/Config/swagger'); 
dotenv.config();
db()

const app = express();
const namedRouter = require("route-label")(app);
/******************** Import Configuration and Custome Modules *******************/
const appConfig = require(resolve(join(__dirname, "app/Config", "index")));
// Import Utils Module
const utils = require(resolve(join(__dirname, "app/Helper", "utils")));
/******************** Configuration Registration *******************/
const getPort = appConfig.appRoot.port; // get port number
const getHost = appConfig.appRoot.host; // get host
const isProduction = appConfig.appRoot.isProd;








const getAdminFolderName = appConfig.appRoot.getAdminFolderName;                                        
const getUserFolderName = appConfig.appRoot.getUserFolderName;
const getOrganizerFolderName = appConfig.appRoot.getOrganizerFolderName;
const  getWebFolderName = appConfig.appRoot. getWebFolderName;
const getTicketFolderName = appConfig.appRoot.getTicketFolderName;

// Global function to generate URLs for named routes
global.generateUrl = generateUrl = (routeName, routeParams = {}) => {
    // Generate the URL using the named route and parameters
    const url = namedRouter.urlFor(routeName, routeParams);
    // Return the generated URL
    // console.log(url); // for testing
    return url;
  };

    // Serving public folder statically
app.use(express.static(resolve(join(__dirname, "public"))));
// Connect body-parser
app.use( bodyParser.json({
      limit: "50mb",
    })
  );
  // Get information from html forms
  app.use(bodyParser.urlencoded({
      limit: "50mb",
      extended: true,
      parameterLimit: 3000,
    })
  );

app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('uploads'));
app.use('/uploads', express.static(__dirname +'uploads'));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.set('views','views');
app.use(cors({
  // origin: "http://localhost:3000",
  // credentials: true,
}))

app.use(cookieParser());

// Session management
app.use(session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: false
}));

// Flash message middleware
app.use(flash());

// Middleware to pass flash messages to views
app.use((req, res, next) => {
    res.locals.success_mssg = req.flash('success');
    res.locals.error_mssg = req.flash('error');
    res.locals.info_mssg = req.flash('info');
    res.locals.warning_mssg = req.flash('warning');
    res.locals.msg_mssg = req.flash('message');
    // Debugging to check flash messages
    console.log(res.locals)
    next();
});

const swaggerSpec = swaggerJsdoc(swaggerOptions);


// Error handling function for the server
const onError = (error) => {
    // Retrieve the port that the server is trying to listen on
    const port = getPort;
  
    // Check if the error is related to the 'listen' system call,
    // which happens when the server attempts to bind to a port.
    if (error.syscall !== "listen") {
      // If it's not a 'listen' error, rethrow the error and handle it elsewhere
      throw error;
    }
  
    // Determine the type of binding:
    // If the port is a string, it's likely a named pipe; if it's a number, it's a network port.
    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
  
    // Switch statement to handle specific error codes that may occur when listening on a port
    switch (error.code) {
      // Case when the process lacks permissions to bind to the specified port --> Access Denied
      case "EACCES":
        console.error(bind + " requires elevated privileges");
        // Exit the process with an exit code of 1 (indicating an error)
        process.exit(1);
        break;
  
      // Case when the specified port or pipe is already in use by another process --> Port Already in Use
      case "EADDRINUSE":
        console.error(bind + " is already in use");
        // Exit the process with an exit code of 0 (indicating normal termination)
        process.exit(0);
        break;
  
      // Default case: If the error code is something else, rethrow the error to be handled elsewhere
      default:
        throw error;
    }
  };

  (async () => {
    try {
      // Connect Database
      //await require(resolve(join(__dirname, "app/config", "db")))();
  
      /*********************** Connect Routes **********************/
      
      
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // -------admin folder route-------

  const adminFiles = await utils._readdir(`./app/Router/${getAdminFolderName}`);

  adminFiles.forEach((file) => {
    if (!file || file[0] == ".") return;
    namedRouter.use("/admin", require(join(__dirname, file)));
  });

  // -------user folder route-------

  const userFiles = await utils._readdir(`./app/Router/${getUserFolderName}`);

  userFiles.forEach((file) => {
    if (!file || file[0] == ".") return;
    namedRouter.use("/user", require(join(__dirname, file)));
  });

  // -------organizer folder route-------

  const organizerFiles = await utils._readdir(`./app/Router/${getOrganizerFolderName}`);

  organizerFiles.forEach((file) => {
    if (!file || file[0] == ".") return;
    namedRouter.use("/organizer", require(join(__dirname, file)));
  });

  // -------event folder route-------

  const webFiles = await utils._readdir(`./app/Router/${ getWebFolderName}`);

  webFiles.forEach((file) => {
    if (!file || file[0] == ".") return;
    namedRouter.use("/", require(join(__dirname, file)));
  });

    // -------organizer folder route-------

    const ticketFiles = await utils._readdir(`./app/Router/${getTicketFolderName}`);

    ticketFiles.forEach((file) => {
      if (!file || file[0] == ".") return;
      namedRouter.use("/ticket", require(join(__dirname, file)));
    });
  
      // Building the Route Tables for debugging
      namedRouter.buildRouteTable();
  
      // if (!isProduction && process.env.SHOW_NAMED_ROUTES === "true") {
      //   const adminRouteList = namedRouter.getRouteTable("/admin");
      //   const userRouteList = namedRouter.getRouteTable("/user")
      //   const organizerRouteList = namedRouter.getRouteTable("/organizer")
      //   const ticketRouteList = namedRouter.getRouteTable("/ticket")
      //   const eventRouteList = namedRouter.getRouteTable("/")
  
      //   // Show both route tables simultaneously
      //   console.log("Route Tables:");
      //   console.log("Admin Routes:", adminRouteList);
      //   console.log("User Routes:", userRouteList);
      //   console.log("Organizer Routes:", organizerRouteList);
      //   console.log("Ticket Routes:", ticketRouteList);
      //   console.log("Event Routes:", eventRouteList);
      // }
  
      // Set-up server
      app.listen(getPort);
      // Register the 'onError' function to listen for 'error' events on the 'app' object (likely an Express app or HTTP server)
      // When an error event is emitted, the 'onError' function will be called to handle it
      app.on("error", onError);
  
      console.log(`Project is running on http://${getHost}:${getPort}`);
    } catch (error) {
      console.log(error);
    }
  })();