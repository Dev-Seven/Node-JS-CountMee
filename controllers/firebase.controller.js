const firebaseService = require('../services/firebaseService');
const catchAsync = require('./../utils/catchAsync');
const { catchError } = require('../services/utilities')
const { getMessaging, getToken } = require("firebase/messaging") ;


exports.sendMessage = catchError(async (req, res, next) => {
  var topic = req.body.topic;
  var notificationText = req.body.notificationText;

  await firebaseService.sendMessage(
    topic,
    notificationText
  );

  res.status(200).json({
    status: 'success',
    messsge: 'Message Successfully Send'
  });
});

exports.registerToTopic = catchAsync(async (req, res, next) => {
  var token = req.query.token;
  var topic = req.query.topic;

  //console.log("token", token)
  await firebaseService.registerToTopic(token, topic);

  res.status(200).json({
    status: 'success',
    messsge: 'Registered To Topic Successfully'
  });

});


// Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
const messaging = getMessaging();
getToken(messaging, { vapidKey: process.env.VAPID_KEY }).then((currentToken) => {
  if (currentToken) {
    // Send the token to your server and update the UI if necessary
    // ...
  } else {
    // Show permission request UI
    console.log('No registration token available. Request permission to generate one.');
    // ...
  }
}).catch((err) => {
  console.log('An error occurred while retrieving token. ', err);
  // ...
});