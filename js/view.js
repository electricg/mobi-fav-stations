/* global $, $$, app, VERSION */
(function (window) {
  'use strict';

  /**
   * View
   */
  const View = function (template) {
    const _self = this;
    _self.template = template;

    const $loadStatus = $$('#load-status');
    const $loadInformation = $$('#load-information');
    const $editFavorites = $$('#edit-favorites');
    const $deleteAll = $$('#delete-all');
    const $toggleStations = $$('#toggle-stations');

    const $stations = $$('#stations');
    const $filterStationsForm = $$('#filter-stations-form');
    const $filterStationsInput = $$('#filter-stations-input');

    const $listStations = $$('#list-stations');

    const $alerts = $$('#alerts');

    const $statusOffline = $$('#status-icon-offline');

    const $version = $$('#version');

    const _viewCommands = {};

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

    _viewCommands.chrome = function () {
      $version.innerHTML = VERSION;
    };

    _viewCommands.home = function (model) {
      // console.log('model', model);
    };

    _viewCommands.offline = function (status) {
      $statusOffline.classList.toggle(
        'main-header__status__icon--active',
        status
      );
    };

    this.render = function (viewCmd, model, parameter, args) {
      _viewCommands[viewCmd](model, parameter, args);
    };

    this.bind = function (event, handler) {
      if (event === 'itemAdd') {
        // console.log('itemAdd');
      } else if (event === 'itemRemove') {
        // console.log('itemRemove');
      } else if (event === 'showItemEdit') {
        // console.log('showItemEdit');
      } else if (event === 'itemEdit') {
        // console.log('itemEdit');
      } else if (event === 'toggleStations') {
        $toggleStations.on('click', function () {
          this.querySelectorAll('span').forEach(($el) => {
            $el.classList.toggle('hide');
          });
          const res = $stations.classList.toggle('main-section--selected');
          if (res) {
            const stations = handler();
            $listStations.innerHTML = _self.template.stations(stations);
          } else {
            $listStations.innerHTML = '';
            $filterStationsForm.reset();
          }
        });
      } else if (event === 'itemRemoveAll') {
        $deleteAll.on('click', function () {
          if (window.confirm('Are you sure you want to delete all the data?')) {
            handler();
          }
        });
      } else if (event === 'loadStatus') {
        $loadStatus.on('click', async function () {
          await handler();
        });
      } else if (event === 'loadInformation') {
        $loadInformation.on('click', async function () {
          await handler();
        });
      } else if (event === 'filterStations') {
        $filterStationsInput.on('input', function (event) {
          const stations = handler(event.target.value);
          $listStations.innerHTML = _self.template.stations(stations);
        });

        $filterStationsForm.on('submit', function (event) {
          app.Helpers.prev(event);
        });
      }
    };
  };

  // export to window
  window.app = window.app || {};
  window.app.View = View;
})(window);
