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

    let _search = '';
    let _station = undefined;

    const fetchData = async (url, options) => {
      const response = await fetch(`${URL_BASE}${url}`, options);
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        throw new Error(
          `Fetch of '${url}' returned: '${data?.error || response?.status}'`
        );
      }
    };

    const getData = function () {
      return {
        stations: _self.model.stations,
        favorites: _self.model.favorites,
        lastUpdatedInformation: _self.model.lastUpdatedInformation,
        lastUpdatedStatus: _self.model.lastUpdatedStatus,
        filteredStations: _self.model.filterStations(_search),
        config: _self.config.getAll(),
      };
    };

    const getDataStation = function (id) {
      if (!id) {
        return;
      }
      return {
        id,
        station: _self.model.getStationInfoById(id),
        lastUpdatedBikes: _self.model.lastUpdatedBikes,
        config: _self.config.getAll(),
      };
    };

    const loadStatus = async function () {
      const data = await fetchData('station_status.json');

      _self.model.updateStationsStatus(data.data.stations, data.last_updated);

      return getData();
    };

    const loadInformation = async function () {
      const data = await fetchData('station_information.json');

      _self.model.updateStationsInformation(
        data.data.stations,
        data.last_updated
      );

      return getData();
    };

    const loadBikes = async function () {
      const a=((a=String.fromCharCode(83,104,111,119,45,69,98,105,107,101,115),b=localStorage[a])=>b&&{headers:{[a]:b}})(); // prettier-ignore

      const data = await fetchData('free_bike_status.json', a);

      _self.model.updateBikesStatus(data.data.stations, data.last_updated);

      return getDataStation(_station);
    };

    const updateSettings = function (data) {
      _self.config.update(data);
    };

    const importData = async function (file) {
      const res = await app.Helpers.readFromInputFile(file);
      const data = JSON.parse(res)[NAMESPACE];

      // TODO should check that the data imported is correct
      _self.config.update(data.config);
      _self.model.updateStationsUserData({
        user: data.user,
        favorites: data.favorites,
      });

      return getData();
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

    const deleteData = function () {
      _self.config.reset();
      _self.model.resetStationsUserData();

      return getData();
    };

    const bindAll = function () {
      _self.view.bind('toggleStations', function () {
        return _self.model.stations;
      });

      _self.view.bind('loadStatus', async function () {
        return loadStatus();
      });

      _self.view.bind('loadInformation', async function () {
        return loadInformation();
      });

      _self.view.bind('loadBikes', async function () {
        return loadBikes();
      });

      _self.view.bind('filterStations', function (search) {
        _search = search;
        return _self.model.filterStations(_search);
      });

      _self.view.bind('toggleFavorite', function (id, pressed) {
        if (!pressed) {
          return _self.model.addFavorite(id);
        }
        return _self.model.removeFavorite(id);
      });

      _self.view.bind('toggleEdit', function () {
        return getData();
      });

      _self.view.bind('editDescription', function (id, newDesc) {
        return _self.model.editDescription(id, newDesc);
      });

      _self.view.bind('editFavorite', function (id, action) {
        let res;
        if (action === 'remove') {
          res = _self.model.removeFavorite(id);
        } else if (action === 'up' || action === 'down') {
          res = _self.model.orderFavorite(id, action);
        }
        if (res === -1) {
          return res;
        }
        return getData();
      });

      _self.view.bind('settingsUpdate', function (data) {
        updateSettings(data);
        return getData();
      });

      _self.view.bind('installOffline', function (install) {
        if (install) {
          _self.offline.init();
        } else {
          _self.offline.clearSW();
        }
      });

      _self.view.bind('importData', async function (file) {
        return importData(file);
      });

      _self.view.bind('exportData', function () {
        return exportData();
      });

      _self.view.bind('shareData', function () {
        return shareData();
      });

      _self.view.bind('deleteData', function () {
        return deleteData();
      });

      _self.view.bind('showBikes', function (id) {
        _station = id;
        return getDataStation(id);
      });

      // This goes last for now
      _self.view.bind('start', function () {
        return getData();
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
