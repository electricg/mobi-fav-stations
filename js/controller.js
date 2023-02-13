/* global app, NAMESPACE, VERSION, FILE */
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

    /**
     * Init app
     */
    this.init = function () {
      console.log('init');
      _self.view.render('chrome');
      _self.setData();
      // _self.loadStatus(); // TODO
    };

    /**
     * Insert data into the views
     */
    this.setData = function () {
      _self.view.render('home', _self.model);
    };

    this.editItem = function (id, item) {
      const res = _self.model.edit(id, item);
      if (res !== -1) {
        _self.setData();
      } else {
        _self.view.render('error', 'Error editing entry');
      }
      return res;
    };

    this.loadStatus = async function () {
      const data = await app.Helpers.fetchData('station_status.json');
      console.log(data);

      _self.model.updateStationsStatus(data.data.stations, data.last_updated);

      // update the ui
      _self.setData();
      _self.view.render('success', 'Stations status imported successfully');
    };

    this.loadInformation = async function () {
      const data = await app.Helpers.fetchData('station_information.json');
      console.log(data);

      _self.model.updateStationsInformation(
        data.data.stations,
        data.last_updated
      );

      // update the ui
      _self.setData();
      _self.view.render(
        'success',
        'Stations information imported successfully'
      );
    };

    _self.view.bind('itemEdit', function (id, date) {
      return _self.editItem(id, date);
    });

    _self.view.bind('showItemEdit', function (id) {
      return _self.model.getById(id);
    });

    _self.view.bind('toggleStations', function () {
      return {
        stations: _self.model.stations,
        lastUpdate: _self.model.lastUpdatedInformation,
      };
    });

    _self.view.bind('loadStatus', async function () {
      return _self.loadStatus();
    });

    _self.view.bind('loadInformation', async function () {
      return _self.loadInformation();
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
  };

  // export to window
  window.app = window.app || {};
  window.app.Controller = Controller;
})(window);
