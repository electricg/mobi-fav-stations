/* global $, $$, helpers, VERSION */
(function (window) {
  'use strict';

  /**
   * View
   */
  var View = function (template) {
    var _self = this;
    _self.template = template;

    var $sections = $('.main-section');
    var $navLinks = $('.main-nav a');

    var $deleteAll = $$('#delete-all');

    var $alerts = $$('#alerts');

    var $statusOffline = $$('#status-icon-offline');

    var $version = $$('#version');

    var _viewCommands = {};

    _viewCommands.alert = function (type, msg) {
      $alerts.innerHTML += _self.template.alert(type, msg);
    };

    _viewCommands.info = function (err) {
      _viewCommands.alert('info', err);
    };

    _viewCommands.error = function (err) {
      _viewCommands.alert('error', err);
    };

    _viewCommands.success = function (err) {
      _viewCommands.alert('success', err);
    };

    _viewCommands.warning = function (err) {
      _viewCommands.alert('warning', err);
    };

    _viewCommands.section = function (model, parameter) {
      parameter = parameter || 'home';
      $sections.forEach(function ($el) {
        $el.classList.remove('main-section--selected');
      });
      let $selectedSection = $$('#' + parameter);

      if (!$selectedSection) {
        parameter = 'not-found';
        $selectedSection = $$('#' + parameter);
      }

      $selectedSection.classList.add('main-section--selected');
      $navLinks.forEach(function ($el) {
        if ($el.getAttribute('href') === '#/' + parameter) {
          $el.classList.add('main-nav__link--selected');
        } else {
          $el.classList.remove('main-nav__link--selected');
        }
      });
    };

    _viewCommands.chrome = function () {
      $version.innerHTML = VERSION;
    };

    _viewCommands.home = function (model) {
      console.log('home');
    };

    this.render = function (viewCmd, model, parameter, args) {
      _viewCommands[viewCmd](model, parameter, args);
    };

    this.bind = function (event, handler) {
      if (event === 'itemAdd') {
        console.log('itemAdd');
      } else if (event === 'itemRemove') {
        console.log('itemRemove');
      } else if (event === 'showItemEdit') {
        console.log('showItemEdit');
      } else if (event === 'itemEdit') {
        console.log('itemEdit');
      } else if (event === 'itemRemoveAll') {
        $deleteAll.on('click', function () {
          if (
            window.confirm(
              'Are you sure you want to delete all the entries and reset the settings?'
            )
          ) {
            handler();
          }
        });
      }
    };
  };

  // export to window
  window.app = window.app || {};
  window.app.View = View;
})(window);
