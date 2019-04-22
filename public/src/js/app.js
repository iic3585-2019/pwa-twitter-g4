const sharedPostsArea = document.querySelector("#shared-posts");


async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
      const swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("SW Registered");
    return swRegistration;
  }
}


function createFixedCard() {
  const cardWrapper = document.createElement("div");
  cardWrapper.className = "card";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";
  cardBody.textContent = "This a super cool post";

  cardWrapper.appendChild(cardBody);
  sharedPostsArea.appendChild(cardWrapper);
}

function getCards() {
  const comments = db.collection('posts').get();
  comments.then(docs => docs.forEach(doc => createCard(doc.data().content)));
}

function postComment() {
  const content = document.getElementById("body");  
  db.collection('posts').add({ content: content.value });
  createCard(content.value);
  content.value = '';
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

  getCards();
  // const permission = await requestNotificationPermission();

  // showLocalNotification(
  //   "Hello World",
  //   "You have approved notifications",
  //   swRegistration
  // );
}

// fetch("https://httpbin.org/get")
//   .then(function(res) {
//     return res.json();
//   })
//   .then(function(data) {
//     createCard();
//   });

// registerServiceWorker();

<<<<<<< HEAD
=======
main();
>>>>>>> 7f5d69f5598839349d1651aa155d0419e85eec60
