async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    const swRegistration = await navigator.serviceWorker.register("/sw.js");
    console.log("SW Registered");
    return swRegistration;
  }
}

async function requestNotificationPermission() {
  const permission = await window.Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Permission not granted for Notification");
  }
}

function showLocalNotification(title, body, swRegistration) {
  const options = { body };

  swRegistration.showNotification(title, options);
}

// function getCards() {
//   const comments = db.collection('posts').get();
//   comments.then(docs => docs.forEach(doc => createCard(doc.data().content)));
// }

function postComment() {
  const content = document.getElementById("body");
  db.collection("posts").add({ content: content.value });
  createCard(content.value);
  content.value = "";
}

function createCard(content) {
  const cardWrapper = document.createElement("div");
  cardWrapper.className = "card";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";
  cardBody.textContent = content;

  cardWrapper.appendChild(cardBody);
  sharedPostsArea.appendChild(cardWrapper);
}

async function main() {
  const swRegistration = await registerServiceWorker();
  const permission = await requestNotificationPermission();

  showLocalNotification(
    "Hello World",
    "You have approved notifications",
    swRegistration
  );
}

registerServiceWorker();
