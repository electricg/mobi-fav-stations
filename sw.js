const VERSION = '0.8.33';
const NAMESPACE = 'mobiFavStations';

const CACHE_NAMESPACE = `::${NAMESPACE}::`;
const CACHE_NAME = `v${VERSION}${CACHE_NAMESPACE}`;

const FILE_LIST = `
./
css/main.css
images/logo/icon.svg
images/logo/favicon.ico
js/app.js
js/config.js
js/controller.js
js/helpers.js
js/model.js
js/offline.js
js/settings.js
js/storage.js
js/template.js
js/view.js
manifest.webmanifest
`
  .trim()
  .split('\n')
  .filter(Boolean);

self.addEventListener('install', (e) => {
  // once the SW is installed, go ahead and fetch the resources
  // to make this work offline
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(FILE_LIST).then(() => {
          self.skipWaiting();
        });
      })
      .then(() => {
        console.log(`offline ${VERSION} ready 🎉`);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // when the browser fetches a url, either response with the cached object
  // or go ahead and fetch the actual url and add it to the cache at the same time
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      const url = event.request;
      return cache
        .match(url)
        .then((res) => {
          return (
            res ||
            fetch(url).then((response) => {
              const requestURL = new URL(url.url);
              // check if request is made by chrome extensions or web page, because of some installed chrome extension, service worker throws the error `TypeError: Request scheme 'chrome-extension' is unsupported`
              // https://stackoverflow.com/questions/49157622/service-worker-typeerror-when-opening-chrome-extension
              if (
                url.url.startsWith('http') &&
                requestURL.origin === location.origin
              ) {
                cache.put(url, response.clone());
              }
              return response;
            })
          );
        })
        .catch((error) => {
          console.error(error);
        });
    })
  );
});

/**
 * Clear all old caches in the same namespace except the current one
 * @param {string} currentCache Name of the current cache
 * @param {string} cacheNamespace Text the cache name must include to be cleared
 * @returns {Array<Promise>} Fulfilled when all of selected the caches are cleared
 */
const clearOldCaches = (currentCache, cacheNamespace) =>
  caches
    .keys()
    .then((keys) =>
      Promise.all(
        keys
          .filter(
            (key) => key !== currentCache && key.indexOf(cacheNamespace) !== -1
          )
          .map((key) => caches.delete(key))
      )
    );

/**
 * Clear all caches in the same namespace
 * @param {string} cacheNamespace Text the cache name must include to be cleared
 * @returns {Array<Promise>} Fulfilled when all of the selected caches are cleared
 */
const clearAllCaches = (cacheNamespace) =>
  caches
    .keys()
    .then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.indexOf(cacheNamespace) !== -1)
          .map((key) => caches.delete(key))
      )
    );

/**
 * Send message object to the clients
 * @param {object} message
 */
const sendMessage = (message) => {
  // obtain an array of Window client objects
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage(message);
    });
  });
};

self.addEventListener('activate', (event) => {
  event.waitUntil(
    clearOldCaches(CACHE_NAME, CACHE_NAMESPACE).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  console.log('sw received message:', event);

  switch (event?.data?.type) {
    case 'clearAll': {
      clearAllCaches(CACHE_NAMESPACE).then((res) => {
        // send message to the client
        sendMessage({ type: 'clearAllResponse', res: res });
      });
      break;
    }
  }
});
