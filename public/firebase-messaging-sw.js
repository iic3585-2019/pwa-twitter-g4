importScripts('/__/firebase/5.5.6/firebase-app.js');
importScripts('/__/firebase/5.5.6/firebase-messaging.js');
importScripts('/__/firebase/init.js');

var messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    var notificationTitle = 'Background Message Title';
    var notificationOptions = {
        body: 'Background Message body.',
        icon: '/firebase-logo.png'
    };

    return self.registration.showNotification(notificationTitle,
        notificationOptions);
});

// Self refers to the service worker process
self.addEventListener("install", function(event) {
  console.log("SW installed");
  // wait until, because sw go idle after a certain amount of time and I don't want it to sleep while I cache data
  event.waitUntil(
    caches.open("static").then(cache => {
      console.log("[SW]: caching app shell");
      cache.addAll([
        "/",
        "/index.html",
        "/help/index.html",
        "/src/images/share_home.jpg",
        "/src/js/app.js",
        "/src/css/app.css",
        "/favicon.ico",
        "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css",
        "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js",
        "https://code.jquery.com/jquery-3.3.1.slim.min.js",
        "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js",
        "https://fonts.googleapis.com/css?family=Raleway:400,700"
      ]);
    })
  );
});

// it triggers when all instances of the service worker are closed, ie, after user installed the pwa and closed all tabs related to the page
self.addEventListener("activate", async function() {
  console.log("SW activated");
  try {
    const options = {};
    const subscription = await self.registration.pushManager.subscribe(options);

    console.log(JSON.stringify(subscription));
  } catch (error) {
    console.log("Error", error);
  }
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(res => {
      if (res) {
        return res;
      } else {
        return fetch(event.request);
      }
    })
  );
});
