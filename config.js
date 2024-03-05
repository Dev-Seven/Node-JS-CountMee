const dotenv = require('dotenv')
const fs = require('fs')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const envConfig = dotenv.parse(fs.readFileSync('.env'))
for (const k in envConfig) {
  process.env[k] = envConfig[k]
}

// console.log('ENV :: ', process.env.NODE_ENV)
const dev = {
  mongoUri: process.env.MONGODB_URI,
  mongoOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
  },
  JWT_SECRET: process.env.JWT_SECRET || '$#GR24T4344$#$@#%WTEWTEAE%$6',
  JWT_VALIDITY: process.env.JWT_VALIDITY || '2h',
}

const prod = {
  mongoUri: process.env.MONGODB_URI,
  mongoOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
  },
  JWT_SECRET: process.env.JWT_SECRET || '$#GR24T4344$#$@#%WTEWTEAE%$6',
  JWT_VALIDITY: process.env.JWT_VALIDITY || '2h',
}


sendEmailMsg = (code, emailAddress, subjectEmail, checkotp) => {
  console.log("code........................", code)
  console.log(emailAddress)
  console.log(subjectEmail)
  console.log(checkotp)
  let displayMessageHTML;

  if (checkotp === true) {
      displayMessageHTML = `<p> Your OTP is ${code}</p>`
  } else {
      displayMessageHTML = "<p>Your Verification code for VOE registration is " + code + " .</p>";
  }

  let email = {
      from: 'nikhil@sevensquaretech.com',
      to: emailAddress,
      subject: subjectEmail,
      text: "VOE",
      html: displayMessageHTML
  }
//   let email = {
//     from: 'nikhil@sevensquaretech.com',
//     to: 'nikhil@sevensquaretech.com',
//     subject: 'Voe Registration code',
//     text: "Voe",
//     html: displayMessageHTML
// }
  sgMail.send(email).then(() => {
      console.log('Message sent')
  }).catch((error) => {
      console.log(error)
  })
}


module.exports = {
  sendEmailMsg
}

module.exports = (process.env.NODE_ENV === 'production') ? prod : dev
