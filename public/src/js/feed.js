const sharedPostsArea = document.querySelector("#shared-posts");
const form = document.querySelector("form");
const titleInput = document.querySelector("#title");

// Currently not in use, allows to save content to cache on demand
function onSaveButtonClick(event) {
  // Manually add to cache
  console.log("clicked");
  if ("caches" in window) {
    caches.open("user-requested").then(cache => {
      cache.add("https://httpbin.org/get");
      cache.add("/src/images/sf-boat.jpg");
    });
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

function createCard(data) {
  const cardWrapper = document.createElement("div");
  cardWrapper.className = "card";

  const cardImage = document.createElement("img");
  cardImage.setAttribute("src", data.image);
  cardImage.className = "card-img-top";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const textContainer = document.createElement("div");
  textContainer.className = "text";

  const cardText = document.createElement("p");
  cardText.className = "card-text";
  cardText.textContent = data.location;

  const cardTitle = document.createElement("h5");
  cardTitle.textContent = data.title;

  const cardButton = document.createElement("button");
  cardButton.classList.add("btn", "btn-primary");
  cardButton.textContent = "Save offline";
  cardButton.addEventListener("click", onSaveButtonClick);

  cardBody.appendChild(cardImage);
  textContainer.appendChild(cardText);
  textContainer.appendChild(cardTitle);
  cardBody.appendChild(textContainer);
  // cardBody.appendChild(cardButton);

  cardWrapper.appendChild(cardBody);

  sharedPostsArea.appendChild(cardWrapper);
}

function clearCards() {
  while (sharedPostsArea.hasChildNodes()) {
    sharedPostsArea.removeChild(sharedPostsArea.lastChild);
  }
}

function updateUI(data) {
  clearCards();

  for (let index = 0; index < data.length; index++) {
    const element = data[index];
    createCard(element);
  }
}

const url = "https://quacker-g4.firebaseio.com/posts.json";
let networkDataReceived = false;
// cache, then network strategy
fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log("From web", data);
    let dataArray = [];
    for (const key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

if ("indexedDB" in window) {
  console.log("indexDB available in browser");
  readAllData("posts").then(data => {
    if (!networkDataReceived) {
      console.log("From cache", data);
      updateUI(data);
    }
  });
}

// Directly send data to backend
function sendData() {
  fetch("https://us-central1-quacker-g4.cloudfunctions.net/storePostData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: "Fixed location",
      image:
        "https://firebasestorage.googleapis.com/v0/b/my-first-pwa-a099e.appspot.com/o/sf-boat.jpg?alt=media&token=d5e491d0-f500-4b5c-9967-4d332f579e25"
    })
  }).then(res => {
    console.log("Sent data", res);
  });
}

form.addEventListener("submit", function() {
  event.preventDefault();
  if (titleInput.value.trim() === "") {
    alert("Please enter valid data");
    return;
  }

  // Register background sync request
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    // Check that sw is installed and activated
    navigator.serviceWorker.ready.then(sw => {
      const post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: "Santiago"
      };
      // Save to IndexedDB
      writeData("sync-posts", post)
        .then(() => {
          sw.sync.register("sync-new-posts");
          console.log("Successfully registered sync task");
        })
        .catch(err => console.log(err));
    });
  } else {
    console.log("SyncManager not supported");
    sendData();
  }
});
