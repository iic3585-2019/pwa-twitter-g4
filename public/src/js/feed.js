const sharedPostsArea = document.querySelector("#shared-posts");

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

  const cardTitle = document.createElement("h5");
  cardTitle.textContent = data.title;

  const cardText = document.createElement("p");
  cardText.className = "card-text";
  cardText.textContent = data.location;

  const cardButton = document.createElement("button");
  cardButton.classList.add("btn", "btn-primary");
  cardButton.textContent = "Save offline";
  cardButton.addEventListener("click", onSaveButtonClick);

  cardBody.appendChild(cardImage);
  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardText);
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

const url = "https://my-first-pwa-a099e.firebaseio.com/posts.json";
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
