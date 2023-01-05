/* global VERSION */
(function (window) {
  'use strict';

  const Model = function (storage) {
    const _defaultLastUpdated = {
      information: 0,
      status: 0,
    };

    let _stations = {};
    let _favorites = [];
    let _lastUpdated = { ..._defaultLastUpdated };

    Object.defineProperty(this, 'stations', {
      get: function () {
        return _stations;
      },
    });

    Object.defineProperty(this, 'favorites', {
      get: function () {
        return _favorites;
      },
    });

    Object.defineProperty(this, 'lastUpdatedInformation', {
      get: function () {
        return _lastUpdated.information;
      },
    });

    Object.defineProperty(this, 'lastUpdatedStatus', {
      get: function () {
        return _lastUpdated.status;
      },
    });

    /**
     * Find favorite by id
     * @param {string} id - id of the occurance to find
     * @returns {number} -1 if not found, otherwise the found item
     */
    const findFavoriteById = function (id) {
      return _favorites.findIndex((item) => item === id);
    };

    /**
     * Add single favorite occurance
     * @param {object} item - item to add
     * @returns {number|object} -1 if not successful, otherwise the added element
     */
    const addFavorite = function (item) {
      if (findFavoriteById(item) !== -1) {
        return -1;
      }
      _favorites.push(item);
      return item;
    };

    /**
     * Remove single favorite occurance
     * @param {string} id - id of the occurance to remove
     * @returns {number|object} -1 if not successful, otherwise the removed element
     */
    const removeFavorite = function (id) {
      const index = findFavoriteById(id);
      if (index === -1) {
        return -1;
      }
      const removed = _favorites.splice(index, 1);
      return removed[0];
    };

    const orderFavorites = function () {};

    /**
     * Remove all favorite occurances
     * @returns {number|object} -1 if data was already empty, otherwise the removed elements
     */
    const clearFavorites = function () {
      let removed = -1;
      if (_favorites.length > 0) {
        removed = _favorites.splice(0);
      }
      return removed;
    };

    /**
     * Change single occurance
     * @param {string} id - id of the occurance to edit
     * @param {object} newData - string in YYYY-DD-MM format
     * @returns {number|object} -1 if not successful, otherwise the updated element
     */
    const editStation = function (id, newData) {
      const el = _stations[id];
      if (!el) {
        return -1;
      }
      el.user = {
        ...el.user,
        ...newData,
      };
      return el;
    };

    /**
     * Update stations information
     * @param {array} newList - new list of station information
     * @param {number} lastUpdated - last updated
     */
    const updateStationsInformation = function (newList, lastUpdated) {
      newList.forEach((item) => {
        const id = item.station_id;
        if (id) {
          if (!_stations[id]) {
            _stations[id] = {};
          }
          _stations[id].information = { ...item };
        }
      });

      _lastUpdated.information = lastUpdated;
    };

    /**
     * Update stations status
     * @param {array} newList - new list of station information
     * @param {number} lastUpdated - last updated
     */
    const updateStationsStatus = function (newList, lastUpdated) {
      newList.forEach((item) => {
        const id = item.station_id;
        if (id) {
          if (!_stations[id]) {
            _stations[id] = {};
          }
          _stations[id].status = { ...item };
        }
      });

      _lastUpdated.status = lastUpdated;
    };

    /**
     * Modify occurances
     * @param {string} how - How to change
     * @param {string} id - id of the occurance
     * @param {object} newData - new data
     * @param {array} newList - new list
     * @param {number} lastUpdated - last updated
     * @returns {number|object} -1 if not successful, otherwise the affected elements
     */
    const modify = function (how, id, newData, newList, lastUpdated) {
      let mod = -1;

      if (how === 'addFavorite') {
        mod = addFavorite(id);
      } else if (how === 'removeFavorite') {
        mod = removeFavorite(id);
      } else if (how === 'orderFavorites') {
        mod = orderFavorites();
      } else if (how === 'clearFavorites') {
        mod = clearFavorites();
      } else if (how === 'editStation') {
        mod = editStation(id, newData);
      } else if (how === 'updateStationsInformation') {
        mod = updateStationsInformation(newList, lastUpdated);
      } else if (how === 'updateStationsStatus') {
        mod = updateStationsStatus(newList, lastUpdated);
      }

      if (mod !== -1) {
        if (save()) {
          return mod;
        }
        return -1;
      }
      return -1;
    };

    /**
     * Load from storage
     */
    const load = function () {
      _stations = storage.getItem('stations') || {};
      _favorites = storage.getItem('favorites') || [];
      _lastUpdated = storage.getItem('lastUpdated') || {
        ..._defaultLastUpdated,
      };
    };

    /**
     * Save to storage
     * @returns {boolean} True if save was successful
     */
    const save = function () {
      return (
        storage.setItem('stations', _stations) &&
        storage.setItem('favorites', _favorites) &&
        storage.setItem('lastUpdated', _lastUpdated) &&
        storage.setItem('version', VERSION)
      );
    };

    /**
     * Init data
     */
    this.init = function () {
      load();
    };

    /**
     * Add single occurance
     * @param {string} id - id to add
     * @returns {number|object} -1 if not successful, otherwise the affected elements
     */
    this.addFavorite = function (id) {
      return modify('addFavorite', id);
    };

    /**
     * Delete single occurance
     * @param {string} id - id of the occurance to remove
     * @returns {number|object} -1 if not successful, otherwise the affected elements
     */
    this.removeFavorite = function (id) {
      return modify('removeFavorite', id);
    };

    /**
     *
     */
    this.orderFavorites = function () {};

    /**
     * Delete all occurances
     * @returns {number|object} -1 if not successful, otherwise the affected elements
     */
    this.clearFavorites = function () {
      return modify('clearFavorites');
    };

    /**
     * Edit single occurance
     * @param {string} id - id of the occurance to edit
     * @param {object} newData - new data
     * @returns {number|object} -1 if not successful, otherwise the affected elements
     */
    this.editStation = function (id, newData) {
      return modify('editStation', id, newData);
    };

    /**
     * Replace stations information
     * @param {array} newList
     * @param {number} lastUpdated - last updated
     * @returns {array} -1 if not successful, otherwise the new list
     */
    this.updateStationsInformation = function (newList, lastUpdated) {
      return modify(
        'updateStationsInformation',
        null,
        null,
        newList,
        lastUpdated
      );
    };

    /**
     * Replace station status
     * @param {array} newList
     * @param {number} lastUpdated - last updated
     * @returns {array} -1 if not successful, otherwise the new list
     */
    this.updateStationsStatus = function (newList, lastUpdated) {
      return modify('updateStationsStatus', null, null, newList, lastUpdated);
    };

    /**
     * Return item selected by id
     * @param {string} id
     * @returns {number|object} -1 if not successful, otherwise the selected item
     */
    this.getById = function (id) {
      return _stations[id];
    };

    /**
     * Filter stations by name or id
     * @param {string} search - name or id
     * @returns {object} Stations that match the search
     */
    this.filterStations = function (search) {
      const sanitizedSearch = search.trim().toLowerCase();
      if (!sanitizedSearch) {
        return _stations;
      }
      return Object.keys(_stations).reduce((acc, key) => {
        if (key.includes(sanitizedSearch)) {
          acc[key] = _stations[key];
        } else {
          const name = _stations[key]?.information?.name;
          if (name && name.toLowerCase().includes(sanitizedSearch)) {
            acc[key] = _stations[key];
          }
        }
        return acc;
      }, {});
    };

    this.init();
  };

  // export to window
  window.app = window.app || {};
  window.app.Model = Model;
})(window);
