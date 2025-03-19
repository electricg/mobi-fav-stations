(function (window) {
  'use strict';

  const Storage = function (namespace) {
    /**
     * Transform to uppercase the first letter of the string
     * @param {string} string String to transform
     * @returns {string} Transformed string
     */
    const capitalize = (string) => {
      if (string === '') {
        return string;
      }
      return string[0].toUpperCase() + string.substring(1);
    };

    /**
     * Get key with project namespace
     * @param {string} key Key to get
     * @returns {string} Key with namespace
     */
    const getKey = (key) => namespace + capitalize(key);

    /**
     * Load value from localStorage
     * @param {string} key Key to get
     * @returns {object} Value
     */
    this.getItem = function (key) {
      try {
        return JSON.parse(localStorage.getItem(getKey(key)));
      } catch (e) {
        console.error(e);
        return {};
      }
    };

    /**
     * Save to localStorage
     * @param {string} key
     * @param {object} data
     * @returns {boolean} True if save was successful
     */
    this.setItem = function (key, data) {
      try {
        localStorage.setItem(getKey(key), JSON.stringify(data));
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    };

    /**
     * Remove item from localStorage
     * @param {string} key Key to remove
     * @returns {object|boolean} Removed value or false if unsuccessful
     */
    this.removeItem = function (key) {
      try {
        return localStorage.removeItem(getKey(key));
      } catch (e) {
        console.error(e);
        return false;
      }
    };

    /**
     * Clear all items of the project namespace
     */
    this.clear = function () {
      Object.keys(localStorage).forEach((key) => {
        if (key.indexOf(namespace) === 0) {
          localStorage.removeItem(key);
        }
      });
    };
  };

  // export to window
  window.app = window.app || {};
  window.app.Storage = Storage;
})(window);
