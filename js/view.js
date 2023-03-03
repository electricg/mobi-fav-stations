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
    const $toggleEdit = $$('#toggle-edit');
    const $toggleStations = $$('#toggle-stations');

    const $body = document.body;

    const $favorites = $$('#favorites');

    const $stations = $$('#stations');
    const $stationsFilterInput = $$('#stations-filter-input');
    const $stationsList = $$('#stations-list');

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
        $stationsList.innerHTML = _self.template.stations(filteredStations);
      }
    };

    this.render = function (viewCmd, data) {
      _viewCommands[viewCmd](data);
    };

    this.bind = function (event, handler) {
      if (event === 'home') {
        const data = handler(_filter);
        _self.render('home', data);
      } else if (event === 'toggleStations') {
        $toggleStations.on('click', function () {
          _showStations = !_showStations;
          this.querySelectorAll('span').forEach(($el) => {
            $el.classList.toggle('hide'); // TODO
          });
          $stations.classList.toggle('hide', !_showStations);
          if (_showStations) {
            const stations = handler();
            $stationsList.innerHTML = _self.template.stations(stations);
          } else {
            $stationsList.innerHTML = '';
            $stationsFilterInput.value = '';
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
        $stationsFilterInput.on('input', function (event) {
          _filter = event.target.value;
          const stations = handler(_filter);
          $stationsList.innerHTML = _self.template.stations(stations);
        });
      } else if (event === 'toggleFavorite') {
        app.Helpers.$delegate(
          $stationsList,
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
      } else if (event === 'toggleDescription') {
        app.Helpers.$delegate(
          $stations,
          '.js-toggle-description',
          'dblclick',
          function () {
            const id = this.getAttribute('data-id');
            const text = this.innerHTML;
            const input = document.createElement('textarea');
            input.setAttribute('class', 'js-edit-description');
            input.setAttribute('data-id', id);
            input.value = text;
            this.innerHTML = '';
            this.appendChild(input);
            input.focus();
          }
        );
      } else if (event === 'editDescription') {
        app.Helpers.$delegate(
          $stations,
          '.js-edit-description',
          'blur',
          function () {
            const id = this.getAttribute('data-id');
            const value = this.value;
            const res = handler(id, value);
            if (res !== -1) {
              this.parentNode.innerHTML = res;
            } else {
              _self.render(
                'error',
                'Error in updating this station description'
              );
            }
          }
        );
      } else if (event === 'editFavorite') {
        app.Helpers.$delegate(
          $favorites,
          '.js-edit-favorites',
          'click',
          function () {
            const id = this.getAttribute('data-id');
            const action = this.getAttribute('data-action');
            const res = handler(id, action, _filter);
            if (res !== -1) {
              _self.render('home', res);
            } else {
              _self.render('error', 'Error in updating the favorites order');
            }
          }
        );
      } else if (event === 'toggleEdit') {
        $toggleEdit.on('click', function () {
          $body.classList.toggle('edit');
          this.querySelectorAll('span').forEach(($el) => {
            $el.classList.toggle('hide'); // TODO
          });
        });
      }
    };
  };

  // export to window
  window.app = window.app || {};
  window.app.View = View;
})(window);
