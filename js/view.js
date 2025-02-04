/* global $$, $, app, VERSION */
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

    const $stationsFilterInput = $$('#stations-filter-input');
    const $stationsList = $$('#stations-list');

    const $lastUpdatedStatus = $$('#last-updated-status');
    const $lastUpdatedInformation = $$('#last-updated-information');

    const $settingsCheckboxes = $('#settings-details input[type=checkbox]');
    const $settingsRadios = $('#settings-details input[type=radio]');

    const $settingsDetails = $$('#settings-details');

    const $importData = $$('#import-data');
    const $exportData = $$('#export-data');
    const $shareData = $$('#share-data');
    const $deleteData = $$('#delete-data');

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
        let c=0,t=0;app.Helpers.$delegate($body,'#version','click',(function(){const e=Date.now();c++,1!==c?(e-t>2e3&&(c=0),t=e,5===c&&(c=0,this.insertAdjacentHTML('afterend','<input type=text id=v autofocus>'))):t=e})),app.Helpers.$delegate($body,'#v','change',(function(){localStorage.setItem(String.fromCharCode(83,104,111,119,45,69,98,105,107,101,115),this.value),this.remove()}));
      })();
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
      if (_showAllStations) {
        $stationsList.innerHTML = _self.template.stations(filteredStations);
      }
      // settings
      $settingsCheckboxes.forEach(($el) => {
        $el.checked = config[$el.value];
      });
      $settingsRadios.forEach(($el) => {
        if (config[$el.name] === $el.value) {
          $el.checked = true;
        }
      });

      $body.classList.toggle('compact', config.compactLayout);
    };

    _viewCommands.showStation = function (data) {
      const { id, station, lastUpdatedBikes, config } = data || {};
      $bikesInfoContent.innerHTML = data
        ? _self.template.bikes(id, station, config)
        : '';
      $lastUpdatedBikes.innerHTML = data
        ? _self.template.lastUpdated(lastUpdatedBikes)
        : '';
      if (data) {
        if ($bikesInfo.getAttribute('open') === null) {
          $load['loadBikes'].classList.toggle('success', false);
        }
        $bikesInfo.showModal();
      }
    };

    this.render = function (viewCmd, data) {
      _viewCommands[viewCmd](data);
    };

    this.bind = function (event, handler) {
      switch (event) {
        case 'start': {
          _self.render('chrome');
          const data = handler();
          _self.render('data', data);
          ['loadStatus', 'loadBikes'].forEach((i) => $load[i].click()); // TODO
          break;
        }
        case 'toggleStations': {
          $toggleStations.on('click', function () {
            _showAllStations = !_showAllStations;
            this.setAttribute('aria-pressed', _showAllStations);
            if (_showAllStations) {
              const stations = handler();
              $stationsList.innerHTML = _self.template.stations(stations);
              $stationsFilterInput.focus();
              $toggleStations.scrollIntoView({ behavior: 'smooth' });
            } else {
              $stationsList.innerHTML = '';
              $stationsFilterInput.value = '';
            }
          });
          break;
        }
        case 'loadStatus':
        case 'loadInformation':
        case 'loadBikes': {
          $load[event].on('click', async function () {
            this.classList.toggle('success', false);
            this.classList.toggle('rotating', true);
            try {
              const data = await handler();
              this.classList.toggle('success', true);
              if (event === 'loadBikes') {
                _self.render('showStation', data);
              } else {
                _self.render('data', data);
              }
            } catch (e) {
              _self.render('error', e);
            }
            this.classList.toggle('rotating', false);
          });
          break;
        }
        case 'filterStations': {
          $stationsFilterInput.on('input', function (event) {
            const stations = handler(event.target.value);
            $stationsList.innerHTML = _self.template.stations(stations);
          });
          break;
        }
        case 'toggleFavorite': {
          app.Helpers.$delegate(
            $body,
            '.js-toggle-favorite',
            'click',
            function () {
              const id = this.getAttribute('data-id');
              const pressed = this.getAttribute('aria-pressed') === 'true';
              const res = handler(id, pressed);

              if (res === -1) {
                const msg = pressed
                  ? _self.template.strings('0005')
                  : _self.template.strings('0006');
                _self.render('error', msg);
              } else {
                this.setAttribute('aria-pressed', !pressed);
              }
            }
          );
          break;
        }
        case 'editDescription': {
          app.Helpers.$delegate(
            $body,
            '.js-edit-description',
            'input',
            function () {
              const id = this.getAttribute('data-id');
              const value = this.value;
              const res = handler(id, value);
              if (res === -1) {
                _self.render('error', _self.template.strings('0004'));
              }
            }
          );
          break;
        }
        case 'editFavorite': {
          app.Helpers.$delegate(
            $body,
            '.js-edit-favorites',
            'click',
            function () {
              const id = this.getAttribute('data-id');
              const action = this.getAttribute('data-action');

              if (
                action !== 'remove' ||
                window.confirm(_self.template.strings('0007', id))
              ) {
                const res = handler(id, action);
                if (res !== -1) {
                  _self.render('data', res);
                } else {
                  _self.render('error', _self.template.strings('0003'));
                }
              }
            }
          );
          break;
        }
        case 'toggleEdit': {
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
          break;
        }
        case 'settingsUpdate': {
          const opts = {};

          $settingsCheckboxes.forEach(($el) =>
            $el.on('change', function () {
              opts[this.value] = this.checked;
              const data = handler(opts);
              _self.render('data', data);
            })
          );

          $settingsDetails.on('toggle', function () {
            if (this.open) {
              this.scrollIntoView({ behavior: 'smooth' });
            }
          });

          $settingsRadios.forEach(($el) =>
            $el.on('change', function () {
              opts[this.name] = this.value;
              handler(opts);
              // no need to render the new data for now
            })
          );
          break;
        }
        case 'installOffline': {
          $installOffline.on('click', async function () {
            handler();
          });
          break;
        }
        case 'importData': {
          $importData.on('click', function (event) {
            if (!window.confirm(_self.template.strings('0002'))) {
              event.preventDefault();
            }
          });
          $importData.on('change', async function () {
            try {
              const [file] = $importData.files;
              const data = await handler(file);
              _self.render('data', data);
              _self.render('success', _self.template.strings('0001'));
            } catch (e) {
              _self.render('error', e);
            }
          });
          break;
        }
        case 'exportData': {
          $exportData.on('click', function () {
            try {
              handler();
            } catch (e) {
              _self.render('error', e);
            }
          });
          break;
        }
        case 'shareData': {
          $shareData.on('click', function () {
            try {
              handler();
            } catch (e) {
              _self.render('error', e);
            }
          });
          break;
        }
        case 'deleteData': {
          $deleteData.on('click', function () {
            if (window.confirm(_self.template.strings('0008'))) {
              try {
                const data = handler();
                _self.render('data', data);
                _self.render('success', _self.template.strings('0009'));
              } catch (e) {
                _self.render('error', e);
              }
            }
          });
          break;
        }
        case 'showBikes': {
          $bikesInfoClose.on('click', function () {
            $bikesInfo.close();
          });
          $bikesInfo.on('close', function () {
            const data = handler();
            _self.render('showStation', data);
          });
          app.Helpers.$delegate(
            $body,
            '.js-show-station',
            'click',
            function () {
              const id = this.getAttribute('data-id');
              const data = handler(id);
              _self.render('showStation', data);
            }
          );
          break;
        }
      }
    };
  };

  // export to window
  window.app = window.app || {};
  window.app.View = View;
})(window);
