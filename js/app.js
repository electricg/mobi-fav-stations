/* global app, NAMESPACE, DEFAULT_USER_SETTINGS */
'use strict';

const App = function (namespace, settings) {
  this.storage = new app.Storage(namespace);
  this.config = new app.Config(settings, this.storage);
  this.model = new app.Model(this.storage);
  this.template = new app.Template();
  this.view = new app.View(this.template);
  this.controller = new app.Controller(this.model, this.view, this.config);
  this.offline = new app.Offline({
    showInfo: (msg) => this.view.render('info', msg),
  });
  this.init = () => {
    this.controller.init();
  };
};

app.instance = new App(NAMESPACE, DEFAULT_USER_SETTINGS);

if (location.protocol === 'http:' && location.hostname !== 'localhost') {
  const newUrl = location.href.replace('http://', 'https://');
  app.instance.view.render(
    'warning',
    `Warning: this app is better loaded from its <a href="${newUrl}">https counterpart</a>`
  );
}

window.addEventListener('load', app.instance.init);
