importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: "AIzaSyBMMTjliC7P4S0SDDr-o-ybMA1y2KxUK4c",
  authDomain: "linking-32bc1.firebaseapp.com",
  projectId: "linking-32bc1",
  storageBucket: "linking-32bc1.appspot.com",
  messagingSenderId: "907357123753",
  appId: "1:907357123753:web:a844de16276ef2a15965b8",
  measurementId: "G-BJV39NP01T"
}

firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
    console.log(
      "[firebase-messaging-sw.js] Received background message ",
      payload
    )
    
    const notificationTitle = "Background Message Title"
    const notificationOptions = {
      body: payload,
      icon: "/firebase-logo.png",
    }
    
    self.registration.showNotification(notificationTitle, notificationOptions)
  })