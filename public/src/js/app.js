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
    console.log("No permission granted");
    return;
  }

  return permission;
}

function showLocalNotification(title, body, swRegistration) {
  const options = { body };

  swRegistration.showNotification(title, options);
}

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

async function onRequestNotificationButton() {
  const permission = await requestNotificationPermission();

  // Confirm notification
  if ("serviceWorker" in navigator && permission) {
    const options = {
      body: "You successfully subscribed to notifications",
      icon: "/src/images/icons/app-icon-96x96.png",
      tag: "confirm-notification"
    };

    navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
      serviceWorkerRegistration.showNotification(
        "Successfully subscribed",
        options
      );
    });
  }
}

registerServiceWorker();
