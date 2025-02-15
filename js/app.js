/* global NAMESPACE, DEFAULT_USER_SETTINGS */
(function (window) {
  'use strict';

  const App = function (app, namespace, settings) {
    this.helpers = new app.Helpers();
    this.storage = new app.Storage(namespace);
    this.config = new app.Config(settings, this.storage);
    this.model = new app.Model(this.storage);
    this.template = new app.Template();
    this.view = new app.View(this.template, this.helpers, {
      debug: true,
    });
    this.offline = new app.Offline({
      debug: true,
      UIInstalled: () => this.view.render('offlineInstalled'),
      UIUpdated: () => this.view.render('offlineUpdated'),
      UIStatus: (status) => this.view.render('offlineStatus', status),
    });
    this.controller = new app.Controller(
      this.model,
      this.view,
      this.config,
      this.offline,
      this.helpers
    );
    this.init = () => {
      this.controller.init();
    };

    if (location.protocol === 'http:' && location.hostname !== 'localhost') {
      const newUrl = location.href.replace('http://', 'https://');
      this.view.render(
        'warning',
        `Warning: this app is better loaded from its <a href="${newUrl}">https counterpart</a>`
      );
    }

    window.addEventListener('load', this.init);
  };

  // export to window
  window.app = window.app || {};
  window.app.instance = new App(window.app, NAMESPACE, DEFAULT_USER_SETTINGS);
})(window);
