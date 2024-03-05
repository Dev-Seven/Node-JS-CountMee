const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');
const fetch = require('node-fetch');
const admin = require('firebase-admin');

const { globalModel } = require('./../models/globalModel');

class emailService {
  constructor() {
    this.globals = null;
    this.firebaseApp = null;
  }

  static async loadGlobals() {
    if (this.globals == null) {
      const Globals_tab = await globalModel.find({ name: 'global' });
      this.globals = await {
        ...Globals_tab[0]['Markup'],
        ...Globals_tab[0]['rowsBack'],
        ...Globals_tab[0]['ApiInfo'],
        ...Globals_tab[0]['AWSMonitor'],
        ...Globals_tab[0]['All']
      };

      this.firebaseApp = firebase.initializeApp(this.globals.firebaseConfig);
    }
  }
  static async sendMessage(
    topic,
    dashboardToast,
    notificationText = null
  ) {
    await this.loadGlobals();
    console.log('Sending message: ' + topic);

    const db = firebase.database().ref();

    db.update({
      notificationObj: { dashboardToast, time: Date.now() }
    }).then(res => {
      console.log('SuccessSully Updated In Firebase');
    });

    if (
      topic == 'event' ||
      (topic == 'schedule' && notificationText != null)
    ) {
     {
        dashboardToast = notificationText;
      }
    }

    await this.sendPushNotification(topic, dashboardToast);
  }

  static async sendPushNotification(notificationTitle, notificationBody) {
    try {
      var res = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        withCredentials: true,
        body: JSON.stringify({
          data: { title: 'Event', message: notificationBody },
          to: '/topics/all',
          notification: {
            title: notificationTitle,
            body: notificationBody,
            click_action: 'ChatActivity'
          }
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'key=AAAAwl3Dn2s:APA91bEQ4hrdvlCAaAzPj8SluMb1aBxYOKpPWjD0Qg87SqSkcjihW6X41iiD0Q63-FxB8KEbY6DGDFY_10bfUpK7Z-JNLhFUEl5-5EMsphfj5NxDAAM6fxqelOD8FSb55N7MzOR0vAnP'
        }
      }).catch(err => console.error(err));

      // console.log("res", res);
    } catch (error) {
      console.log('error', error);
    }
  }

  static async registerToTopic(token, topic) {
    console.log('Registering Token: ' + topic);

    admin
      .messaging()
      .subscribeToTopic(token, topic)
      .then(function(response) {
        // See the MessagingTopicManagementResponse reference documentation
        // for the contents of response.
        console.log('Successfully subscribed to topic:', response);
      })
      .catch(function(error) {
        console.log('Error subscribing to topic:', error);
      });
  }
}

module.exports = emailService;
