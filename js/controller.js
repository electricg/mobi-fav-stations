/* global app, URL_BASE, NAMESPACE, VERSION, FILE */
(function (window) {
  'use strict';

  /**
   * Take a model and view and acts as the controller between them
   * @param {object} model The model instance
   * @param {object} view The view instance
   * @param {object} config The config instance
   * @param {object} offline The offline instance
   */
  const Controller = function (model, view, config, offline) {
    const _self = this;
    _self.model = model;
    _self.view = view;
    _self.config = config;
    _self.offline = offline;

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

    const importData = async function (file, search) {
      const res = await app.Helpers.readFromInputFile(file);
      const data = JSON.parse(res)[NAMESPACE];

      // TODO should check that the data imported is correct
      _self.config.update(data.config);
      _self.model.updateStationsUserData({
        user: data.user,
        favorites: data.favorites,
      });

      return getData(search);
    };

    const prepareDataForExport = function () {
      const data = JSON.stringify({
        [NAMESPACE]: {
          version: VERSION,
          config: _self.config.getAll(),
          favorites: _self.model.favorites,
          user: _self.model.user,
        },
      });
      const now = app.Helpers.todayStr;
      const filename = FILE.name.replace('${now}', now);
      const title = FILE.title.replace('${now}', now);

      return { data, filename, title };
    };

    const exportData = async function () {
      const { data, filename } = prepareDataForExport();
      await app.Helpers.writeToFile(filename, data);
    };

    const shareData = function () {
      const { data, filename, title } = prepareDataForExport();
      app.Helpers.shareTo(filename, data, title);
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

      _self.view.bind('installOffline', function () {
        _self.offline.init();
      });

      _self.view.bind('importData', async function (file, search) {
        return importData(file, search);
      });

      _self.view.bind('exportData', function () {
        return exportData();
      });

      _self.view.bind('shareData', function () {
        return shareData();
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
