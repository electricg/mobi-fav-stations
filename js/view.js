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
    const $toggleStations = $$('#toggle-stations');

    const $favorites = $$('#favorites');

    const $stations = $$('#stations');
    const $filterStationsInput = $$('#filter-stations-input');

    const $listStations = $$('#list-stations');

    const $alerts = $$('#alerts');

    const $statusOffline = $$('#status-icon-offline');

    const $version = $$('#version');

    let _showStations = false;

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
      const { stations, favorites, lastUpdatedStatus } = model;
      $favorites.innerHTML = _self.template.favorites(
        favorites,
        stations,
        lastUpdatedStatus
      );
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
      if (event === 'showItemEdit') {
        // console.log('showItemEdit');
      } else if (event === 'itemEdit') {
        // console.log('itemEdit');
      } else if (event === 'toggleStations') {
        $toggleStations.on('click', function () {
          _showStations = !_showStations;
          this.querySelectorAll('span').forEach(($el) => {
            $el.classList.toggle('hide'); // TODO
          });
          $stations.classList.toggle('main-section--selected', _showStations);
          if (_showStations) {
            const { stations, lastUpdate } = handler();
            $listStations.innerHTML = _self.template.stations(
              stations,
              lastUpdate
            );
          } else {
            $listStations.innerHTML = '';
            $filterStationsInput.value = '';
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
      } else if (event === 'toggleFavorite') {
        app.Helpers.$delegate(
          $listStations,
          '.js-toggle-favorite',
          'click',
          function () {
            const id = this.getAttribute('data-id');
            const pressed = this.getAttribute('aria-pressed') === 'true';
            const res = handler(id, pressed);

            if (res === -1) {
              const msg = pressed
                ? 'The station you are trying to remove from your favorite is not present in the list'
                : 'The station you are trying to add to your favorite is already present in the list';
              _self.render('error', msg);
            } else {
              this.setAttribute('aria-pressed', !pressed);
            }
          }
        );
      }
    };
  };

  // export to window
  window.app = window.app || {};
  window.app.View = View;
})(window);
