/* exported $, $$ */
'use strict';

const $ = document.querySelectorAll.bind(document);
const $$ = document.querySelector.bind(document);
Element.prototype.on = Element.prototype.addEventListener;

// https://developer.mozilla.org/en/docs/Web/API/NodeList
NodeList.prototype.forEach = Array.prototype.forEach;

(function (window) {
  const Helpers = function () {
    /**
     * Prevent default event
     * @param {object} event
     */
    this.prev = function (event) {
      if (event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
    };

    /**
     * Attach a handler to event for all elements that match the selector,
     * now or in the future, based on a root element
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
  };

  window.app = window.app || {};
  window.app.Helpers = new Helpers();
})(window);
