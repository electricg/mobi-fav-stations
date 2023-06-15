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

    const $lastUpdatedStatus = $$('#last-updated-status');
    const $lastUpdatedInformation = $$('#last-updated-information');

    const $settingsShowClassics = $$('#settings-show-classics');
    const $settingsShowEbikes = $$('#settings-show-ebikes');
    const $settingsShowDocks = $$('#settings-show-docks');

    const $alerts = $$('#alerts');

    const $version = $$('#version');

    const $install = $$('#install');

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

      $install.on('click', async function () {
        console.log('install');
        // window.app.instance.offline.init(); // TODO
      });
    };

    _viewCommands.data = function (data) {
      const {
        stations,
        favorites,
        lastUpdatedInformation,
        lastUpdatedStatus,
        filteredStations,
        config,
      } = data;
      $favorites.innerHTML = _self.template.favorites(
        favorites,
        stations,
        config
      );
      $lastUpdatedStatus.innerHTML =
        _self.template.lastUpdated(lastUpdatedStatus);
      $lastUpdatedInformation.innerHTML = _self.template.lastUpdated(
        lastUpdatedInformation
      );
      if (_showStations) {
        $stationsList.innerHTML = _self.template.stations(filteredStations);
      }
      // settings
      $settingsShowClassics.checked = config.showClassics;
      $settingsShowEbikes.checked = config.showEbikes;
      $settingsShowDocks.checked = config.showDocks;
    };

    this.render = function (viewCmd, data) {
      _viewCommands[viewCmd](data);
    };

    this.bind = function (event, handler) {
      if (event === 'start') {
        _self.render('chrome');
        const data = handler(_filter);
        _self.render('data', data);
        $loadStatus.click(); // TODO
      } else if (event === 'toggleStations') {
        $toggleStations.on('click', function () {
          _showStations = !_showStations;
          this.setAttribute('aria-pressed', _showStations);
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
          $loadStatus.classList.toggle('success', false);
          $loadStatus.classList.toggle('rotating', true);
          try {
            const data = await handler(_filter);
            $loadStatus.classList.toggle('success', true);
            _self.render('data', data);
          } catch (e) {
            console.log(e);
            _self.render('error', e);
          }
          $loadStatus.classList.toggle('rotating', false);
        });
      } else if (event === 'loadInformation') {
        // TODO show visual
        $loadInformation.on('click', async function () {
          try {
            const data = await handler(_filter);
            _self.render('data', data);
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
      } else if (event === 'editDescription') {
        app.Helpers.$delegate(
          $body,
          '.js-edit-description',
          'input',
          function () {
            const id = this.getAttribute('data-id');
            const value = this.value;
            const res = handler(id, value);
            if (res === -1) {
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

            if (
              action !== 'remove' ||
              window.confirm(`Are you sure you want to remove station ${id}?`)
            ) {
              const res = handler(id, action, _filter);
              if (res !== -1) {
                _self.render('data', res);
              } else {
                _self.render('error', 'Error in updating the favorites order');
              }
            }
          }
        );
      } else if (event === 'toggleEdit') {
        $toggleEdit.on('click', function () {
          const pressed = this.getAttribute('aria-pressed') === 'true';
          this.setAttribute('aria-pressed', !pressed);
          $body.classList.toggle('edit', !pressed);
          if (pressed) {
            // finished editing, rerender with the updated data
            const data = handler(_filter);
            _self.render('data', data);
          }
        });
      } else if (event === 'settingsUpdate') {
        const opts = {};

        [
          $settingsShowClassics,
          $settingsShowEbikes,
          $settingsShowDocks,
        ].forEach(($el) =>
          $el.on('change', function () {
            opts[this.value] = this.checked;
            const data = handler(opts, _filter);
            _self.render('data', data);
          })
        );
      }
    };
  };

  // export to window
  window.app = window.app || {};
  window.app.View = View;
})(window);
