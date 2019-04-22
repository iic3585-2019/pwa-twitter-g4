importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

const CACHE_STATIC_NAME = "static-v16";
const CACHE_DYNAMIC_NAME = "dynamic-v4";
const STATIC_FILES = [
  "/", // think that you are caching requests
  "/index.html",
  "/offline.html",
  "/src/images/share_home.jpg",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/idb.js",
  "/src/js/utility.js",
  "/src/css/app.css",
  "/favicon.ico",
  "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js",
  "https://code.jquery.com/jquery-3.3.1.slim.min.js",
  "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js",
  "https://fonts.googleapis.com/css?family=Raleway:400,700"
];

// Used to trim the dynamic cache
function trimCache(cacheName, maxItems) {
  caches.open(cacheName).then(cache => {
    cache.keys().then(keyList => {
      if (keyList.length > maxItems) {
        // Delete oldest item in cache until the condition above is false
        cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
      }
    });
  });
}

// Self refers to the service worker process
self.addEventListener("install", function(event) {
  console.log("[SW] Installing service worker");
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(cache => {
      console.log("[SW]: Caching app shell");
      cache.addAll(STATIC_FILES);
    })
  );
});

// it triggers when all instances of the service worker are closed, ie, after user installed the pwa and closed all tabs related to the page
self.addEventListener("activate", function(event) {
  console.log("[SW]: Activating");
  // Clean older versions of caches
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log("[SW] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

function isInArray(string, array) {
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    if (element === string) {
      return true;
    }
    return false;
  }
}

self.addEventListener("fetch", function(event) {
  const url = "https://quacker-g4.firebaseio.com/posts.json";
  // If the fetch is for this url, save to dynamic cache
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      fetch(event.request).then(res => {
        const clonedRes = res.clone();
        clonedRes.json().then(data => {
          // Save data to IndexDB
          for (let key in data) {
            writeData("posts", data[key]);
          }
        });
        return res;
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    // If the url is for the STATIC_FILES, send the cached version
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(res => {
              return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch(err => {
              return caches.open(CACHE_STATIC_NAME).then(cache => {
                if (event.request.headers.get("accept").includes("text/html")) {
                  return cache.match("/offline.html");
                }
              });
            });
        }
      })
    );
  }
});

self.addEventListener("sync", function(event) {
  console.log("[SW] Internet connection again", event);
  if (event.tag === "sync-new-posts") {
    console.log("[SW] Syncing new post");
    event.waitUntil(
      readAllData("sync-posts").then(data => {
        for (let dt of data) {
          fetch(
            "https://us-central1-quacker-g4.cloudfunctions.net/storePostData",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
              },
              body: JSON.stringify({
                id: dt.id,
                title: dt.title,
                location: dt.location,
                image:
                  "https://firebasestorage.googleapis.com/v0/b/my-first-pwa-a099e.appspot.com/o/sf-boat.jpg?alt=media&token=d5e491d0-f500-4b5c-9967-4d332f579e25"
              })
            }
          )
            .then(res => {
              console.log("Sent data", res);
              if (res.ok) {
                // delete item from IndexedDB
                res.json().then(resData => {
                  deleteItemFromData("sync-posts", resData.id);
                });
              }
            })
            .catch(err => console.log("Error sending data", err));
        }
      })
    );
  }
});
