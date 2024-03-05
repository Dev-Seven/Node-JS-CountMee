const fs = require('fs')
const { messages } = require('../api.response')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const nodemailer = require('nodemailer')
const fcm = require('fcm-notification')
const FCM = require('../epitome-voe-firebase-adminsdk-c1frr-0e6a17be59.json')
require('dotenv').config()
const config = require('../config')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const response = (req, res, status, jsonStatus, message, extra) => {
  const resJson = {
    code: jsonStatus,
    message: messages[req.userLanguage][message] ? messages[req.userLanguage][message] : message,
    ...extra
  }

  return res.status(status).jsonp(resJson)
}

const catchError = (name, error, req, res) => {
  console.log(name, error)
  if (res) return res.send({ type: 'error', message: messages.english.error, data: null })
}

const genJwtHash = (data) => {
  return jwt.sign(data, config.JWT_SECRET, { expiresIn: config.JWT_VALIDITY })
}

const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    // eslint-disable-next-line no-prototype-builtins
    if (object && object.hasOwnProperty(key)) {
      obj[key] = object[key]
    }
    return obj
  }, {})
}

const generateRandomNumber = () => {
  return Math.floor(1000 + Math.random() * 9000);
}
// const generateRandomPassword = () => {
//   return Math.random().toString(36).slice(-8);
// }

const generateRandomPassword = () => {
  var length = 8,
      charset = "@#$&abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

const hashPassword = async (hashItem) => {
  // const password = user.password
  const hashIt = hashItem;
  const saltRounds = 10;
  // const hashedPassword = await new Promise((resolve, reject) => {
   return await new Promise((resolve, reject) => {
    bcrypt.hash(hashIt, saltRounds, function(err, hash) {
      if (err) reject(err)
      resolve(hash)
    });
  })
  // return hashedPassword
}

const passwordSecure = (value) => {

  const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");

  if(value.length < 8){
      const json = `{ "status" : false, "msg" : "password must consist more than 8 character."}`
      return  JSON.parse(json);
  }

  if(value.toLowerCase().includes('password')){ 
      const json = `{ "status" : false, "msg" : "can not consist word password in it."}`
      return  JSON.parse(json);
  }
  if(!strongRegex.test(value)) {
      const json = `{ "status" : false, "msg" : "Password must be including 1 upper case, special character and alphanumeric."}`
      return  JSON.parse(json);
  }

  const json = `{ "status" : true, "msg" : "Password is secured"}`
  return  JSON.parse(json);
}

const sendPushNotification = (message, title, topicName, data = {}) => {
  pushmessage = {
    data: data,
    notification: {
      title: title,
      body: message,
    },
    //token: token,
    topic: topicName,
  };
  // console.log("pushmessage", pushmessage);
  // FCM.send(pushmessage, function (err, response) {
  //   if (err) {
  //     console.log("error found", err.message);
  //   } else {
  //     console.log("response here", response);
  //   }
  // });
};

function sendNotification(notificationID, message, key, attempts) {

  console.log("Sending notification");

  request(
    {
      method: 'POST',
      uri: 'https://fcm.googleapis.com/fcm/send',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'key=CLOUD MESSAGING SERVER KEY'
      },
      body: JSON.stringify({
        "registration_ids": notificationID, // This is an aray of the users device tokens. Up to 1000 allowed by FCM
        "priority": "high", // Change this value for different behavior on devices
        "notification" : {
          "body" : message,
          "title": "NAME OF APP",
          "sound": "default",
          "badge": 0
        }
      })
    },
    function (error, response, body) {
      if(response.statusCode == 200){

        console.log('Success')

        // Create a reference to the notification in the Firebase database
        var notificationRef = db.ref("notifications/" + key);

        // Set "sent" to true to avoid the notification being sent more than once
        notificationRef.child("sent").set(true);

        // Increment the "attempts"
        notificationRef.child("attempts").set(attempts+1);
      } else {
        console.log('error: '+ response.statusCode)

        // Create a reference to the notifications in the Firebase database
        var notificationRef = db.ref("notifications/" + key);

        // Increment the "attempts". Since "sent" is still false "child_changed" will be called
        notificationRef.child("attempts").set(attempts+1);
      }
    }
  )
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

  // let email = {
  //     from: 'nikhil@sevensquaretech.com',
  //     to: emailAddress,
  //     subject: subjectEmail,
  //     text: "VOE",
  //     html: displayMessageHTML
  // }
  let email = {
    from: 'nikhil@sevensquaretech.com',
    to: 'nikhil@sevensquaretech.com',
    subject: 'VOE Forget Password Code',
    text: "VOE",
    html: displayMessageHTML
}
  sgMail.send(email).then(() => {
      console.log('Message sent')
  }).catch((error) => {
      console.log(error)
  })
}

sendEmailCred = (password, emailAddress, subjectEmail, checkpassword, eventDetails = null, orgDetails = null) => {
  console.log("password........................", password)
  console.log(emailAddress)
  console.log(subjectEmail)
  console.log(checkpassword)
  let DASHBOARD_URL = process.env.DASHBOARD_URL;
  let displayMessageHTML;

  // if(eventDetails){
  //   displayMessageHTML = eventDetails;
  // }
  // if(orgDetails){
  //   displayMessageHTML = orgDetails;
  // }

  if (eventDetails) {
    displayMessageHTML = eventDetails;
  } else if (orgDetails) {
    displayMessageHTML = orgDetails;
  } else {
  }

  if (checkpassword === true) {
      // displayMessageHTML += `<p> Your login credentials is : <br>email : ${emailAddress} </br> <br>password : ${password} </br></p>`,
      displayMessageHTML += `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="width:100%;font-family:Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
         <head>
            <meta charset="UTF-8">
            <meta content="width=device-width, initial-scale=1" name="viewport">
            <meta name="x-apple-disable-message-reformatting">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta content="telephone=no" name="format-detection">
            <title>New email template 2021-02-21</title>
            <!--[if (mso 16)]>
            <style type="text/css">     a {text-decoration: none;}     </style>
            <![endif]--> <!--[if gte mso 9]>
            <style>sup { font-size: 100% !important; }</style>
            <![endif]--> <!--[if gte mso 9]>
            <xml>
               <o:OfficeDocumentSettings>
                  <o:AllowPNG></o:AllowPNG>
                  <o:PixelsPerInch>96</o:PixelsPerInch>
               </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            <style type="text/css">#outlook a {    padding:0;}.ExternalClass { width:100%;}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div {  line-height:100%;}.es-button {  mso-style-priority:100!important;   text-decoration:none!important;}a[x-apple-data-detectors] { color:inherit!important;    text-decoration:none!important; font-size:inherit!important;    font-family:inherit!important;  font-weight:inherit!important;  line-height:inherit!important;}.es-desk-hidden {    display:none;   float:left; overflow:hidden;    width:0;    max-height:0;   line-height:0;  mso-hide:all;}@media only screen and (max-width:600px) {p, ul li, ol li, a { font-size:16px!important; line-height:150%!important } h1 { font-size:30px!important; text-align:center; line-height:120%!important } h2 { font-size:26px!important; text-align:center; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } h1 a { font-size:30px!important } h2 a { font-size:26px!important } h3 a { font-size:20px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } a.es-button, button.es-button { font-size:20px!important; display:block!important; border-width:10px 20px 10px 20px!important } }</style>
         </head>
         <body style="width:100%;font-family:Arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
            <div class="es-wrapper-color" style="background-color:#555555">
               <!--[if gte mso 9]>
               <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                  <v:fill type="tile" color="#555555"></v:fill>
               </v:background>
               <![endif]-->
               <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top">
                  <tr style="border-collapse:collapse">
                     <td valign="top" style="padding:0;Margin:0">
                        <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                           <tr style="border-collapse:collapse">
                              <td align="center" style="padding:0;Margin:0">
                                 <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" cellspacing="0" cellpadding="0" align="center">
                                    <tr style="border-collapse:collapse">
                                       <td align="left" style="padding:0;Margin:0;padding-bottom:5px;padding-left:10px;padding-right:10px">
                                          <!--[if mso]>
                                          <table style="width:580px" cellpadding="0" cellspacing="0">
                                             <tr>
                                                <td style="width:280px" valign="top">
                                                   <![endif]-->
                                                   <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                                      <tr style="border-collapse:collapse">
                                                         <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:280px">
                                                            <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                               <tr style="border-collapse:collapse">
                                                                  <td class="es-infoblock" align="left" style="padding:0;Margin:0;line-height:14px;font-size:12px;color:#A0A7AC">
                                                                  </td>
                                                               </tr>
                                                            </table>
                                                         </td>
                                                      </tr>
                                                   </table>
                                                   <!--[if mso]>
                                                </td>
                                                <td style="width:20px"></td>
                                                <td style="width:280px" valign="top">
                                                   <![endif]-->
                                                   <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                      <tr style="border-collapse:collapse">
                                                         <td align="left" style="padding:0;Margin:0;width:280px">
                                                            <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                               <tr style="border-collapse:collapse">
                                                                  <td align="right" class="es-infoblock" style="padding:0;Margin:0;line-height:14px;font-size:12px;color:#A0A7AC">
                                                                     <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:12px;font-family:Arial, sans-serif;line-height:14px;color:#A0A7AC"><a href="${DASHBOARD_URL}" target="_blank" class="view" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;font-size:12px;text-decoration:none;color:#A0A7AC;line-height:18px">MORE</a></p>
                                                                  </td>
                                                               </tr>
                                                            </table>
                                                         </td>
                                                      </tr>
                                                   </table>
                                                   <!--[if mso]>
                                                </td>
                                             </tr>
                                          </table>
                                          <![endif]-->
                                       </td>
                                    </tr>
                                 </table>
                              </td>
                           </tr>
                        </table>
                        <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                           <tr style="border-collapse:collapse">
                              <td align="center" style="padding:0;Margin:0">
                                 <table class="es-content-body" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#F8F8F8;width:600px">
                                    <tr style="border-collapse:collapse">
                                       <td style="Margin:0;padding-left:10px;padding-right:10px;padding-top:20px;padding-bottom:20px;background-color:#191919" bgcolor="#191919" align="left">
                                          <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                             <tr style="border-collapse:collapse">
                                                <td valign="top" align="center" style="padding:0;Margin:0;width:580px">
                                                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                      <tr style="border-collapse:collapse">
                                                         <td align="center" style="padding:0;Margin:0;font-size:0"><a target="_blank" href="${DASHBOARD_URL}" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;font-size:14px;text-decoration:none;color:#3CA7F1"><img class="adapt-img" src="https://api.voehub.com/public/files/voe_logo.png" alt width="105" height="101" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a></td>
                                                      </tr>
                                                   </table>
                                                </td>
                                             </tr>
                                          </table>
                                       </td>
                                    </tr>
                                    <tr style="border-collapse:collapse">
                                       <td style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px;background-color:#FFCC99" bgcolor="#ffcc99" align="left">
                                          <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                             <tr style="border-collapse:collapse">
                                                <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                                                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                      <tr style="border-collapse:collapse">
                                                         <td align="center" style="padding:0;Margin:0;padding-top:15px;padding-bottom:15px">
                                                            <div>
                                                               <!-- <h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:Arial, sans-serif;font-size:24px;font-style:normal;font-weight:normal;color:#242424"><span style="font-size:30px"><strong>Event Details </strong></span><br></h2><br> -->
                                                               <h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:Arial, sans-serif;font-size:24px;font-style:normal;font-weight:normal;color:#242424"><span style="font-size:30px"><strong>Your login credentials is </strong></span><br></h2>
                                                            </div>
                                                         </td>
                                                      </tr>
                                                      <tr style="border-collapse:collapse">
                                                         <td align="center" style="padding:0;Margin:0;padding-left:10px">
                                                            <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:Arial, sans-serif;line-height:21px;color:#242424">Hi ${emailAddress} your password is ${password} <br></p>
                                                            <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:Arial, sans-serif;line-height:21px;color:#242424">for Event login<br></p>
                                                         </td>
                                                      </tr>
                                                      <tr style="border-collapse:collapse">
                                                         <td align="center" style="Margin:0;padding-left:10px;padding-right:10px;padding-top:15px;padding-bottom:15px"><span class="es-button-border" style="border-style:solid;border-color:#2CB543;background:#191919 none repeat scroll 0% 0%;border-width:0px;display:inline-block;border-radius:20px;width:auto"><a href="${DASHBOARD_URL}" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'lucida sans unicode', 'lucida grande', sans-serif;font-size:18px;color:#FFFFFF;border-style:solid;border-color:#191919;border-width:10px 35px;display:inline-block;background:#191919 none repeat scroll 0% 0%;border-radius:20px;font-weight:normal;font-style:normal;line-height:22px;width:auto;text-align:center">Click here for more details</a></span></td>
                                                      </tr>
                                                   </table>
                                                </td>
                                             </tr>
                                          </table>
                                       </td>
                                    </tr>
                                    <tr style="border-collapse:collapse">
                                       <td style="Margin:0;padding-top:10px;padding-bottom:10px;padding-left:10px;padding-right:10px;background-color:#F8F8F8" bgcolor="#f8f8f8" align="left">
                                          <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                             <tr style="border-collapse:collapse">
                                                <td valign="top" align="center" style="padding:0;Margin:0;width:580px">
                                                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                      <tr style="border-collapse:collapse">
                                                         <td bgcolor="#f8f8f8" align="center" style="Margin:0;padding-left:10px;padding-right:10px;padding-top:20px;padding-bottom:20px;font-size:0">
                                                            <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                               <tr style="border-collapse:collapse">
                                                                  <td style="padding:0;Margin:0;border-bottom:1px solid #191919;background:#FFFFFF none repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td>
                                                               </tr>
                                                            </table>
                                                         </td>
                                                      </tr>
                                                   </table>
                                                </td>
                                             </tr>
                                          </table>
                                       </td>
                                    </tr>
                                 </table>
                              </td>
                           </tr>
                        </table>
                        <table cellpadding="0" cellspacing="0" class="es-footer" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                           <tr style="border-collapse:collapse">
                              <td align="center" style="padding:0;Margin:0">
                                 <table class="es-footer-body" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#242424;width:600px">
                                    <tr style="border-collapse:collapse">
                                       <td align="left" style="padding:20px;Margin:0">
                                          <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                             <tr style="border-collapse:collapse">
                                                <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                                                   <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                      <tr style="border-collapse:collapse">
                                                         <td align="center" style="padding:0;Margin:0;display:none"></td>
                                                      </tr>
                                                   </table>
                                                </td>
                                             </tr>
                                          </table>
                                       </td>
                                    </tr>
                                 </table>
                              </td>
                           </tr>
                        </table>
                        <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                           <tr style="border-collapse:collapse">
                              <td align="center" style="padding:0;Margin:0">
                                 <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" cellspacing="0" cellpadding="0" align="center">
                                    <tr style="border-collapse:collapse">
                                       <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:30px;padding-bottom:30px">
                                          <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                             <tr style="border-collapse:collapse">
                                                <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                                                   <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                      <tr style="border-collapse:collapse">
                                                         <td align="center" style="padding:0;Margin:0;display:none"></td>
                                                      </tr>
                                                   </table>
                                                </td>
                                             </tr>
                                          </table>
                                       </td>
                                    </tr>
                                 </table>
                              </td>
                           </tr>
                        </table>
                     </td>
                  </tr>
               </table>
            </div>
         </body>
      </html>`
  } else {
      displayMessageHTML += "<p>Your Organization login credentials is " + password + " .</p>";
  }

  let email = {
      from: `${process.env.DEV_SG_EMAIL}`,
      to: emailAddress,
      subject: subjectEmail,
      text: "VOE",
      html: displayMessageHTML,
      // templateId: 'd-1ff742c36b704c04b851b88c0e3524da',
  }
  sgMail.send(email).then(() => {
      console.log('Message sent')
  }).catch((error) => {
      console.log(error)
  })
}

sendEmailCredNodem = (password, emailAddress, subjectEmail, checkpassword, eventDetails = null) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "nikunjprajapati77@gmail.com",
        pass: "gnnhgffwvzuiboqk"
    },
});
  console.log("password........................", password)
  console.log(emailAddress)
  console.log(subjectEmail)
  console.log(checkpassword)
  let displayMessageHTML ="";

  if(eventDetails){
    displayMessageHTML = eventDetails;
  }

  if (checkpassword === true) {
      displayMessageHTML += `<p> Your login credentials is : <br>email : ${emailAddress} </br> <br>password : ${password} </br></p>`
  } else {
      displayMessageHTML += "<p>Your Organization login credentials is " + password + " .</p>";
  }

  transporter.sendMail ({
      from: 'info@voe.com',
      to: emailAddress,
      subject: subjectEmail,
      text: "VOE",
      html: displayMessageHTML,
      // templateId: 'd-03233ef8ef2a4114b95a32d384f22441',
  });
  transporter.sendMail(transporter).then(() => {
      console.log('Message sent')
  }).catch((error) => {
      console.log(error)
  })
}



sendTemplate = (to,from, templateId, dynamic_template_data) => {
  const msg = {
    to,
    from: { name: 'voe cred', email: 'nikhil@sevensquaretech.com' },
    templateId: 'd-4b455902d1d744c297488b8d54addd0f',
    dynamic_template_data
  };
  console.log(msg)
  sgMail.send(msg)
    .then((response) => {
      console.log('mail-sent-successfully', {templateId, dynamic_template_data });
      console.log('response', response);
      /* assume success */

    })
    .catch((error) => {
      /* log friendly error */
      console.error('send-grid-error: ', error.toString());
    });
};

module.exports = {
  response,
  catchError,
  genJwtHash,
  pick,
  generateRandomNumber,
  generateRandomPassword,
  hashPassword,
  passwordSecure,
  sendPushNotification,
  sendEmailMsg,
  sendEmailCred,
  sendTemplate,
  sendEmailCredNodem
}
