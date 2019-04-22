/* Utility to access IndexDB */

// For json data, we should prefer IndexDb
const dbPromise = idb.open("posts-store", 1, function(db) {
  if (!db.objectStoreNames.contains("posts")) {
    db.createObjectStore("posts", { keyPath: "id" });
  }
  if (!db.objectStoreNames.contains("sync-posts")) {
    db.createObjectStore("sync-posts", { keyPath: "id" });
  }
});

function writeData(st, data) {
  return dbPromise.then(db => {
    // Create transaction object
    const tx = db.transaction(st, "readwrite");
    // Create store
    const store = tx.objectStore(st);
    store.put(data);
    return tx.complete;
  });
}

function readAllData(st) {
  return dbPromise.then(db => {
    const tx = db.transaction(st, "readwrite");
    const store = tx.objectStore(st);
    return store.getAll();
  });
}
