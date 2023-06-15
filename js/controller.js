/* global app, URL_BASE */
(function (window) {
  'use strict';

  /**
   * Take a model and view and acts as the controller between them
   * @param {object} model The model instance
   * @param {object} view The view instance
   * @param {object} config The config instance
   */
  const Controller = function (model, view, config) {
    const _self = this;
    _self.model = model;
    _self.view = view;
    _self.config = config;

    const fetchData = async (url) => {
      return await app.Helpers.fetchData(`${URL_BASE}${url}`);
    };

    const getData = function (search) {
      return {
        stations: _self.model.stations,
        favorites: _self.model.favorites,
        lastUpdatedInformation: _self.model.lastUpdatedInformation,
        lastUpdatedStatus: _self.model.lastUpdatedStatus,
        filteredStations: _self.model.filterStations(search),
        config: _self.config.getAll(),
      };
    };

    const loadStatus = async function (search) {
      const data = await fetchData('station_status.json');

      _self.model.updateStationsStatus(data.data.stations, data.last_updated);

      return getData(search);
    };

    const loadInformation = async function (search) {
      const data = await fetchData('station_information.json');

      _self.model.updateStationsInformation(
        data.data.stations,
        data.last_updated
      );

      return getData(search);
    };

    const updateSettings = function (data) {
      _self.config.update(data);
    };

    const bindAll = function () {
      _self.view.bind('toggleStations', function () {
        return _self.model.stations;
      });

      _self.view.bind('loadStatus', async function (search) {
        return loadStatus(search);
      });

      _self.view.bind('loadInformation', async function (search) {
        return loadInformation(search);
      });

      _self.view.bind('filterStations', function (search) {
        return _self.model.filterStations(search);
      });

      _self.view.bind('toggleFavorite', function (id, pressed) {
        if (!pressed) {
          return _self.model.addFavorite(id);
        }
        return _self.model.removeFavorite(id);
      });

      _self.view.bind('toggleEdit', function (search) {
        return getData(search);
      });

      _self.view.bind('editDescription', function (id, newDesc) {
        return _self.model.editDescription(id, newDesc);
      });

      _self.view.bind('editFavorite', function (id, action, search) {
        let res;
        if (action === 'remove') {
          res = _self.model.removeFavorite(id);
        } else if (action === 'up' || action === 'down') {
          res = _self.model.orderFavorite(id, action);
        }
        if (res === -1) {
          return res;
        }
        return getData(search);
      });

      _self.view.bind('settingsUpdate', function (data, search) {
        updateSettings(data);
        return getData(search);
      });

      // This goes last for now
      _self.view.bind('start', function (search) {
        return getData(search);
      });
    };

    /**
     * Start controller
     */
    this.init = function () {
      _self.model.init();
      bindAll();
    };
  };

  // export to window
  window.app = window.app || {};
  window.app.Controller = Controller;
})(window);
