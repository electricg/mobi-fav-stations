/* global $$, app, VERSION */
(function (window) {
  'use strict';

  /**
   * View
   */
  const View = function (template) {
    const _self = this;
    _self.template = template;

    const $load = {
      loadStatus: $$('#load-status'),
      loadInformation: $$('#load-information'),
      loadBikes: $$('#load-bikes'),
    };
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

    const $settingsCompactLayout = $$('#settings-compact-layout');

    const $importData = $$('#import-data');
    const $exportData = $$('#export-data');
    const $shareData = $$('#share-data');

    const $bikesInfo = $$('#bikes-info');
    const $bikesInfoClose = $$('#bikes-info-close');
    const $bikesInfoContent = $$('#bikes-info-content');
    const $lastUpdatedBikes = $$('#last-updated-bikes');

    const $alerts = $$('#alerts');

    const $version = $$('#version');

    const $installOffline = $$('#install');

    let _showAllStations = false;

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

      // prettier-ignore
      (function () {
        let c=0,t=0;app.Helpers.$delegate($body,"#version","click",(function(){const e=Date.now();c++,1!==c?(e-t>2e3&&(c=0),t=e,5===c&&(c=0,this.insertAdjacentHTML("afterend",'<input type="text" id="v" autofocus>'))):t=e})),app.Helpers.$delegate($body,"#v","change",(function(){localStorage.setItem(String.fromCharCode(83,104,111,119,45,69,98,105,107,101,115),this.value),this.remove()}));
      })();
    };

    _viewCommands.data = function (data) {
      const {
        stations,
        favorites,
        lastUpdatedInformation,
        lastUpdatedStatus,
        lastUpdatedBikes,
        station,
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
      if (_showAllStations) {
        $stationsList.innerHTML = _self.template.stations(filteredStations);
      }
      if (station) {
        $bikesInfoContent.innerHTML = _self.template.bikes(station);
        $lastUpdatedBikes.innerHTML =
          _self.template.lastUpdated(lastUpdatedBikes);
      }
      // settings
      $settingsShowClassics.checked = config.showClassics;
      $settingsShowEbikes.checked = config.showEbikes;
      $settingsShowDocks.checked = config.showDocks;
      $settingsCompactLayout.checked = config.compactLayout;

      $body.classList.toggle('compact', config.compactLayout);
    };

    this.render = function (viewCmd, data) {
      _viewCommands[viewCmd](data);
    };

    this.bind = function (event, handler) {
      if (event === 'start') {
        _self.render('chrome');
        const data = handler();
        _self.render('data', data);
        ['loadStatus', 'loadBikes'].forEach((i) => $load[i].click()); // TODO
      } else if (event === 'toggleStations') {
        $toggleStations.on('click', function () {
          _showAllStations = !_showAllStations;
          this.setAttribute('aria-pressed', _showAllStations);
          $stations.classList.toggle('hide', !_showAllStations);
          if (_showAllStations) {
            const stations = handler();
            $stationsList.innerHTML = _self.template.stations(stations);
            $stations.scrollIntoView({ behavior: 'smooth' });
          } else {
            $stationsList.innerHTML = '';
            $stationsFilterInput.value = '';
          }
        });
      } else if (
        event === 'loadStatus' ||
        event === 'loadInformation' ||
        event === 'loadBikes'
      ) {
        $load[event].on('click', async function () {
          this.classList.toggle('success', false);
          this.classList.toggle('rotating', true);
          try {
            const data = await handler();
            this.classList.toggle('success', true);
            _self.render('data', data);
          } catch (e) {
            _self.render('error', e);
          }
          this.classList.toggle('rotating', false);
        });
      } else if (event === 'filterStations') {
        $stationsFilterInput.on('input', function (event) {
          const stations = handler(event.target.value);
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
              const res = handler(id, action);
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
            const data = handler();
            _self.render('data', data);
          }
        });
      } else if (event === 'settingsUpdate') {
        const opts = {};

        [
          $settingsShowClassics,
          $settingsShowEbikes,
          $settingsShowDocks,
          $settingsCompactLayout,
        ].forEach(($el) =>
          $el.on('change', function () {
            opts[this.value] = this.checked;
            const data = handler(opts);
            _self.render('data', data);
          })
        );
      } else if (event === 'installOffline') {
        $installOffline.on('click', async function () {
          handler();
        });
      } else if (event === 'importData') {
        $importData.on('click', function (event) {
          if (
            !window.confirm(
              'This will completely overwrite the data. Do you want to continue?'
            )
          ) {
            event.preventDefault();
          }
        });
        $importData.on('change', async function () {
          try {
            const [file] = $importData.files;
            const data = await handler(file);
            _self.render('data', data);
            _self.render('success', 'Data imported successfully');
          } catch (e) {
            _self.render('error', e);
          }
        });
      } else if (event === 'exportData') {
        $exportData.on('click', function () {
          try {
            handler();
          } catch (e) {
            _self.render('error', e);
          }
        });
      } else if (event === 'shareData') {
        $shareData.on('click', function () {
          try {
            handler();
          } catch (e) {
            _self.render('error', e);
          }
        });
      } else if (event === 'showBikes') {
        $bikesInfoClose.on('click', function () {
          $bikesInfo.close();
        });
        $bikesInfo.on('close', function () {
          handler();
          $bikesInfoContent.innerHTML = '';
          $lastUpdatedBikes.innerHTML = '';
          $load['loadBikes'].classList.toggle('success', false);
        });
        app.Helpers.$delegate($favorites, '.favorite', 'click', function () {
          const id = this.getAttribute('data-id');
          const { station, lastUpdatedBikes } = handler(id);
          $bikesInfoContent.innerHTML = _self.template.bikes(station);
          $lastUpdatedBikes.innerHTML =
            _self.template.lastUpdated(lastUpdatedBikes);
          $bikesInfo.showModal();
        });
        app.Helpers.$delegate(
          // todo better code
          $stationsList,
          'tbody td:nth-child(1)',
          'click',
          function () {
            const id = this.innerText;
            const { station, lastUpdatedBikes } = handler(id);
            $bikesInfoContent.innerHTML = _self.template.bikes(station);
            $lastUpdatedBikes.innerHTML =
              _self.template.lastUpdated(lastUpdatedBikes);
            $bikesInfo.showModal();
          }
        );
      }
    };
  };

  // export to window
  window.app = window.app || {};
  window.app.View = View;
})(window);
