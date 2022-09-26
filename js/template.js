/* global */
(function (window) {
  'use strict';

  var Template = function () {
    this.alert = function (type, msg) {
      const code = `
          <div class="alert alert--${type}">
            <span>${msg}</span>
            <button class="alert__close js-close" title="Close" aria-label="Close" onClick="this.parentNode.remove()">
              <svg class="icon alert__close__icon" focusable="false" aria-hidden="true">
                <use href="#icon-cancel-circle"></use>
              </svg>
            </button>
          </div>
        `;

      return code;
    };
  };

  window.app = window.app || {};
  window.app.Template = Template;
})(window);
