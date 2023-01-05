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
     * Insert data into the views
     */
    this.setData = function () {
      _self.view.render('chrome');
      _self.view.render('home', _self.model);
    };

    this.addItem = function (item) {
      const res = _self.model.add(item);
      if (res !== -1) {
        _self.setData();
      } else {
        _self.view.render('error', 'Error adding entry');
      }
      return res;
    };

    this.removeItem = function (id) {
      const res = _self.model.remove(id);
      if (res !== -1) {
        _self.setData();
      } else {
        _self.view.render('error', 'Error removing entry');
      }
      return res;
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

    this.removeAllItem = function () {
      _self.model.clear();
      _self.setData();
      _self.view.render('success', 'Data deleted successfully');
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

    _self.view.bind('itemAdd', function (date) {
      return _self.addItem(date);
    });

    _self.view.bind('itemRemove', function (id) {
      return _self.removeItem(id);
    });

    _self.view.bind('itemEdit', function (id, date) {
      return _self.editItem(id, date);
    });

    _self.view.bind('showItemEdit', function (id) {
      return _self.model.getById(id);
    });

    _self.view.bind('toggleStations', function () {
      return _self.model.stations;
    });

    _self.view.bind('itemRemoveAll', function () {
      return _self.removeAllItem();
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
  };

  // export to window
  window.app = window.app || {};
  window.app.Controller = Controller;
})(window);
