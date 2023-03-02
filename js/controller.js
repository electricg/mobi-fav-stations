/* global app, URL_BASE */
(function (window) {
  'use strict';

  /**
   * Take a model and view and acts as the controller between them
   * @param {object} model The model instance
   * @param {object} view The view instance
   */
  const Controller = function (model, view) {
    const _self = this;
    _self.model = model;
    _self.view = view;

    const fetchData = async (url) => {
      return await app.Helpers.fetchData(`${URL_BASE}${url}`);
    };

    const getData = function (search) {
      return {
        stations: _self.model.stations,
        favorites: _self.model.favorites,
        lastUpdated: _self.model.lastUpdatedStatus,
        filteredStations: _self.model.filterStations(search),
      };
    };

    /**
     * Insert data into the views
     */
    const setData = function () {
      _self.view.bind('home', function (search) {
        return getData(search);
      });
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

    const editItem = function (id, item) {
      const res = _self.model.edit(id, item);
      if (res !== -1) {
        setData();
      } else {
        _self.view.render('error', 'Error editing entry'); // TODO
      }
      return res;
    };

    _self.view.bind('showItemEdit', function (id) {
      return _self.model.getById(id);
    });

    _self.view.bind('itemEdit', function (id, date) {
      return editItem(id, date);
    });

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

    /**
     * Init app
     */
    this.init = function () {
      console.log('init');
      _self.view.render('chrome');
      setData();
      // _self.loadStatus(); // TODO
    };
  };

  // export to window
  window.app = window.app || {};
  window.app.Controller = Controller;
})(window);
