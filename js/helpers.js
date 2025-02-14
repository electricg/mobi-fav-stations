(function (window) {
  'use strict';

  const Helpers = function () {
    // keep these global
    window.$ = document.querySelectorAll.bind(document);
    window.$$ = document.querySelector.bind(document);
    Element.prototype.on = Element.prototype.addEventListener;

    const _notSupported =
      'This functionality is not supported in your browser/os/device';

    /**
     * Get today date in the YYYY-MM-DD format
     */
    Object.defineProperty(this, 'todayStr', {
      get: function () {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = (today.getMonth() + 1 + '').padStart(2, '0');
        const dd = (today.getDate() + '').padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        return todayStr;
      },
    });

    /**
     * Attach a handler to an event for all elements that match the selector,
     * now or in the future, based on a root element
     * @param {Element} target Root element, it has to exist
     * @param {string} selector Elements that should trigger the event, no need to exist yet
     * @param {string} type Type of event (click, change, input, etc...)
     * @param {Function} handler Function to run
     */
    this.$delegate = function (target, selector, type, handler) {
      function dispatchEvent(event) {
        let el = event.target;
        const els = [];
        let found = false;
        let hasMatch;
        const potentialElements = target.querySelectorAll(selector);
        while (el) {
          els.unshift(el);
          hasMatch = Array.prototype.indexOf.call(potentialElements, el) >= 0;
          if (hasMatch) {
            found = true;
            break;
          }
          el = el.parentNode;
        }
        if (found) {
          handler.call(el);
        }
      }

      // https://developer.mozilla.org/en-US/docs/Web/Events/blur
      const useCapture = type === 'blur' || type === 'focus';

      target.addEventListener(type, dispatchEvent, !!useCapture);
    };

    /**
     * Download a file with the given name and content, this is for old browsers
     * @param {string} filename - name of the file
     * @param {string} text - content of the file
     */
    const oldDownload = function (filename, text) {
      var el = document.createElement('a');
      el.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
      );
      el.setAttribute('download', filename);

      el.style.display = 'none';
      document.body.appendChild(el);

      el.click();

      document.body.removeChild(el);
    };

    /**
     * Read content from uploaded file
     * @param {File} file File object
     * @returns {Promise<string>} Promise with the content of the file
     */
    this.readFromInputFile = async function (file) {
      if (!('FileReader' in window)) {
        throw new Error(_notSupported);
      }

      const reader = new FileReader();
      if (file) {
        reader.readAsText(file);
      }

      return new Promise((resolve) => {
        reader.addEventListener(
          'load',
          function () {
            resolve(reader.result);
          },
          false
        );
      });
    };

    /**
     * Write content into file
     * @param {string} filename - name of the file
     * @param {string} text - content of the file
     */
    this.writeToFile = async function (filename, text) {
      if (!('showSaveFilePicker' in window)) {
        oldDownload(filename, text);
        return;
      }

      const options = {
        suggestedName: filename,
        types: [{ accept: { 'text/plain': ['.txt'] } }],
      };

      try {
        const fileHandle = await window.showSaveFilePicker(options);
        const writable = await fileHandle.createWritable();
        await writable.write(text);
        await writable.close();
      } catch (e) {
        // if the user doesn't save the file, swallow the relative browser error
      }
    };

    /**
     * Share content to other apps
     * @param {string} filename - name of the file
     * @param {string} text - content of the file
     * @param {string} title - title of the file
     */
    this.shareTo = function (filename, text, title) {
      const file = new File([text], filename, { type: 'text/plain' });
      const isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;

      // Firefox has a bug where text is not actually shared, and
      // sharing of files is not supported at all, so functionality is
      // totally disabled for it
      // https://github.com/mozilla-mobile/fenix/issues/11946
      if (navigator.canShare && !isFirefox) {
        const sharedObj = {
          title: title,
        };

        if (navigator.canShare({ files: [file] })) {
          sharedObj.files = [file];
        } else if (navigator.canShare({ text: text })) {
          sharedObj.text = text;
        }

        navigator.share(sharedObj).catch(() => {
          // if the user doesn't share the file, swallow the relative browser error
        });
      } else {
        throw new Error(_notSupported);
      }
    };
  };

  // export to window
  window.app = window.app || {};
  window.app.Helpers = Helpers;
})(window);
