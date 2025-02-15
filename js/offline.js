(function (window) {
  'use strict';

  const Offline = function ({
    debug = false,
    registerFile = 'sw.js',
    UIInstalled = () => {},
    UIUpdated = () => {},
    UIStatus = (status) => status,
  } = {}) {
    let isSWInstalled = false;

    /**
     * Print debug messages in the console
     * @param  {...any} args arguments to print
     */
    const printDebug = (...args) => {
      debug && console.debug('offline debug:', ...args);
    };

    /**
     * Show service worker status
     * @param {boolean} status true if sw is active
     */
    const swUIStatus = (status) => {
      printDebug('sw status', !!status);
      UIStatus(status);
    };

    /**
     * Show service worker has been installed for the first time ever
     */
    const swUIFirstTime = () => {
      printDebug('sw first time ever');
      swUIStatus(true);
      UIInstalled();
    };

    /**
     * Show service worker has been installed
     */
    const swUIInstalled = () => {
      printDebug('sw installed');
      swUIStatus(true);
    };

    /**
     * Show that service worker has a new update to show
     */
    const swUIUpdate = () => {
      printDebug('sw there is a new update, please refresh');
      UIUpdated();
    };

    /**
     * Show service worker has returned an error
     * @param {Object} err error
     */
    const swUIError = (err) => {
      printDebug('sw registration failed: ', err);
    };

    /**
     * Check if service worker is active
     * @returns {boolean}
     */
    const swCheckStatus = () => {
      return !!navigator.serviceWorker.controller;
    };

    const onStateChange = (newWorker) => {
      printDebug('sw onStateChange', newWorker.state);
      if (newWorker.state === 'activated') {
        if (!isSWInstalled) {
          isSWInstalled = swCheckStatus();
          swUIFirstTime();
        } else {
          swUIInstalled();
        }
      } else if (
        newWorker.state === 'installed' &&
        navigator.serviceWorker.controller
      ) {
        swUIUpdate();
      }
    };

    /**
     * Send message object to the service worker
     * @param {object} message
     */
    const sendMessage = (message) => {
      navigator.serviceWorker.controller.postMessage(message);
    };

    /**
     * Unregister all service workers in the same domain - not used for now
     * @returns {Promise<boolean>}
     */
    // eslint-disable-next-line no-unused-vars
    const swUnregisterAll = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const unregisterPromises = registrations.map((registration) =>
        registration.unregister()
      );
      return await Promise.all([...unregisterPromises]);
    };

    /**
     * Unregister current service worker
     * @returns {Promise<boolean>}
     */
    const swUnregisterCurrent = async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return await registration.unregister();
    };

    this.init = function () {
      printDebug('sw installing');
      if ('serviceWorker' in navigator) {
        isSWInstalled = swCheckStatus();

        if (isSWInstalled) {
          swUIInstalled();
        }

        navigator.serviceWorker
          .register(registerFile)
          .then((registration) => {
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;

              registration.installing.addEventListener('statechange', () =>
                onStateChange(newWorker)
              );
            });
          })
          .catch((err) => {
            swUIError(err);
          });

        //listen to messages
        navigator.serviceWorker.addEventListener('message', (message) => {
          printDebug('sw msg received', message);

          switch (message?.data?.type) {
            // message from service worker about clear caches result
            case 'clearAllResponse': {
              swUIStatus(false);
              break;
            }
          }
        });
      }
    };

    /**
     * Unregister service worker and send message to delete all caches
     */
    this.clearSW = async function () {
      printDebug('sw clearing');

      // unregister current service worker
      await swUnregisterCurrent();

      // send message to service worker to clear caches
      sendMessage({
        type: 'clearAll',
      });
    };

    if ('serviceWorker' in navigator) {
      printDebug('sw supported');

      isSWInstalled = swCheckStatus();

      if (isSWInstalled) {
        printDebug('sw is installed, auto init');
        this.init();
      } else {
        swUIStatus(isSWInstalled);
      }
    } else {
      printDebug('sw not supported');
    }
  };

  // export to window
  window.app = window.app || {};
  window.app.Offline = Offline;
})(window);
