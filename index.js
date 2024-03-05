// node modules import.
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const path = require('path')
const helmet = require('helmet')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const cron = require('node-cron')
const moment = require('moment')
const cookieParser = require('cookie-parser')
const {logger} = require("./services/logger")
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')
const { userModel } = require('./models/user')
const { meetModel } = require("./models/meet")
const authRoutes = require('./routes/auth.routes')
const chatRoutes = require('./routes/chat.routes')
const loungeRoutes = require('./routes/lounge.routes')
const meetRoutes = require('./routes/meet.routes')
const notificationRoutes = require('./routes/notification.routes')
const userRoutes = require('./routes/user.routes')
const commonRoutes = require('./routes/common.routes')
const eventRoutes = require('./routes/event.routes')
const organizationRoutes = require('./routes/organization.routes')
const zoomRoutes = require('./routes/zoom.routes')

require('./services/mongoose')
require('dotenv').config()
app.use(helmet())

// const whitelist=['http://localhost:3000','http://localhost:3001','http://localhost:4001', 'http://67.205.148.222', 'http://165.22.213.33', 'http://api.voehub.com', 'https://dashboard.voehub.com', 'https://event.voehub.com/', 'https://api.voehub.com', 'http://dashboard.voehub.com', 'http://event.voehub.com/', 'http://api.voehub.com:4001/api/v1/']
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error("Not allowed by CORS"))
//     }
//   },
//   credentials: true,
// }
// app.use(cors(corsOptions))
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.JWT_SECRET))
app.use(express.static(path.join(__dirname, 'public/files')))
// app.use('/public/files', express.static('public/files'));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 

app.use((req, res, next) => {
  if (req.url === '/api/v1/') {
    console.log(req.method, req.url, req.body)
  }
  next()
})

var http = require('http')
var https = require('https')
var fs = require( 'fs' )


var options = {
  key: fs.readFileSync('./privkey1.pem'),
  requestCert: false,
  rejectUnauthorized: false
}
var serverLoc = http.createServer(app);

var server = https.createServer({ 
  // key: fs.readFileSync('privkey1.pem'),
  // cert: fs.readFileSync('fullchain1.pem') 
  key: fs.readFileSync('privkey2.pem'),
  cert: fs.readFileSync('fullchain2.pem') 
}, app);


// let io = require('socket.io')(server);

const socketio = require('socket.io'); //socket cors
const io = socketio(server,{
  cors: {
    origin: "*",
  },
});

let socketIO = require("./services/socket").openIO(io);

io.sockets.on('connection', function (socket) {
  console.log(`Socket Secure Connection successful,${socket.id}`);
});

app.use('/api/v1', [
  authRoutes,
  chatRoutes,
  loungeRoutes,
  notificationRoutes,
  meetRoutes,
  userRoutes,
  organizationRoutes,
  eventRoutes,
  zoomRoutes
])

app.use(async (req, res, next) => {
  if (req.headers["x-access-token"]) {
    try {
      const accessToken = req.headers["x-access-token"];
      const { userId, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);
      // If token has expired
      if (exp < Date.now().valueOf() / 1000) {
        return res.status(401).json({
          error: "JWT token has expired, please login to obtain a new one"
        });
      }
      res.locals.loggedInUser = await userModel.findById(userId);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// cron.schedule('*/2 * * * * *', async () => {
//   let endDate = moment(new Date()).format("DD/MM/YYYY hh:mm a");
//   const pendingReq = await meetModel.find({
//     status: 0
//   },{ schedTime:1})
//   for (let i = 0; i < pendingReq.length; i++) {
//     if (endDate.valueOf() > pendingReq[i].schedTime.valueOf()) {
//        await meetModel.findByIdAndUpdate(pendingReq[i]._id,{
//             status : 2
//           })
//     } else {
//       console.log("false");
//     }
//   }
// });


app.get('/healthcheck', (req, res) => res.status(200).send('Working..'))

serverLoc.listen(process.env.NODE_PORT ? process.env.NODE_PORT : 4001, () => { //rmv server for nrml cnnctn use app 
  logger.info(`Magic happens on port :${process.env.NODE_PORT ? process.env.NODE_PORT : 4001}`)
  console.log(`Magic happens on port :${process.env.NODE_PORT ? process.env.NODE_PORT : 4001}`)
})

server.listen(process.env.NODE_PORT ? process.env.NODE_PORT : 4002, () => { //rmv server for nrml cnnctn use app 
  logger.info(`Magic happens on port :${process.env.NODE_PORT ? process.env.NODE_PORT : 4002}`)
  console.log(`Magic happens on port :${process.env.NODE_PORT ? process.env.NODE_PORT : 4002}`)
})

