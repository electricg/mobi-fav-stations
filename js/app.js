/* global app, NAMESPACE, FEATURES */
'use strict';

const App = function (namespace) {
  this.storage = new app.Storage(namespace);
  this.model = new app.Model(this.storage);
  this.template = new app.Template();
  this.view = new app.View(this.template);
  this.controller = new app.Controller(this.model, this.view);
};

app.instance = new App(NAMESPACE);

const load = function () {
  app.instance.controller.setData();
};

if (location.protocol === 'http:' && location.hostname !== 'localhost') {
  const newUrl = location.href.replace('http://', 'https://');
  app.instance.view.render(
    'warning',
    `Warning: this app is better loaded from its <a href="${newUrl}">https counterpart</a>`
  );
}

window.addEventListener('load', load);

if (FEATURES.offline) {
  app.instance.offline = new app.Offline({
    showOffline: (status) => app.instance.view.render('offline', status),
    showInfo: (msg) => app.instance.view.render('info', msg),
  });
}
