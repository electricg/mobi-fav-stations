/* global $$, app, VERSION */
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

    const $lastUpdated = $$('#last-updated');

    const $alerts = $$('#alerts');

    const $statusOffline = $$('#status-icon-offline');

    const $version = $$('#version');

    let _showStations = false;
    let _filter = '';

    const _viewCommands = {};

    _viewCommands.alert = function (type, msg) {
      $alerts.innerHTML += _self.template.alert(type, msg);
    };

    _viewCommands.info = function (msg) {
      _viewCommands.alert('info', msg);
    };

    _viewCommands.error = function (msg) {
      _viewCommands.alert('error', msg);
    };

    _viewCommands.success = function (msg) {
      _viewCommands.alert('success', msg);
    };

    _viewCommands.warning = function (msg) {
      _viewCommands.alert('warning', msg);
    };

    _viewCommands.chrome = function () {
      $version.innerHTML = VERSION;
    };

    _viewCommands.offline = function (status) {
      $statusOffline.classList.toggle('hide', status);
    };

    _viewCommands.home = function (data) {
      const { stations, favorites, lastUpdated, filteredStations } = data;
      $favorites.innerHTML = _self.template.favorites(favorites, stations);
      $lastUpdated.innerHTML = _self.template.lastUpdated(lastUpdated);
      if (_showStations) {
        $listStations.innerHTML = _self.template.stations(filteredStations);
      }
    };

    this.render = function (viewCmd, data) {
      _viewCommands[viewCmd](data);
    };

    this.bind = function (event, handler) {
      if (event === 'home') {
        const data = handler(_filter);
        _self.render('home', data);
      } else if (event === 'showItemEdit') {
        // console.log('showItemEdit');
      } else if (event === 'itemEdit') {
        // console.log('itemEdit');
      } else if (event === 'toggleStations') {
        $toggleStations.on('click', function () {
          _showStations = !_showStations;
          this.querySelectorAll('span').forEach(($el) => {
            $el.classList.toggle('hide'); // TODO
          });
          $stations.classList.toggle('hide', !_showStations);
          if (_showStations) {
            const stations = handler();
            $listStations.innerHTML = _self.template.stations(stations);
          } else {
            $listStations.innerHTML = '';
            $filterStationsInput.value = '';
          }
        });
      } else if (event === 'loadStatus') {
        $loadStatus.on('click', async function () {
          try {
            const data = await handler(_filter);
            _self.render('home', data);
            _self.render('success', 'Stations status updated successfully');
          } catch (e) {
            console.log(e);
            _self.render('error', e);
          }
        });
      } else if (event === 'loadInformation') {
        $loadInformation.on('click', async function () {
          try {
            const data = await handler(_filter);
            _self.render('home', data);
            _self.render(
              'success',
              'Stations information updated successfully'
            );
          } catch (e) {
            console.log(e);
            _self.render('error', e);
          }
        });
      } else if (event === 'filterStations') {
        $filterStationsInput.on('input', function (event) {
          _filter = event.target.value;
          const stations = handler(_filter);
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
