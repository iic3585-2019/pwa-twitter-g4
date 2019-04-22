const sharedPostsArea = document.querySelector("#shared-posts");


async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
      const swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("SW Registered");
    return swRegistration;
  }
}


function createCard() {
  const cardWrapper = document.createElement("div");
  cardWrapper.className = "card";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";
  cardBody.textContent = "This a super cool post";

  cardWrapper.appendChild(cardBody);
  sharedPostsArea.appendChild(cardWrapper);
}


fetch("https://httpbin.org/get")
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    createCard();
  });

registerServiceWorker();

