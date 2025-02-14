/* global VERSION */
(function (window) {
  'use strict';

  const Model = function (storage) {
    let _information = []; // copy of the api data
    let _status = []; // copy of the api data
    let _user = {}; // user data for the stations
    let _favorites = []; // it's an array (of IDs) because I want to choose the order
    let _stations = {}; // merge of all the above data
    let _bikes = {}; // copy of the api data
    let _lastUpdatedInformation = 0;
    let _lastUpdatedStatus = 0;
    let _lastUpdatedBikes = 0;

    Object.defineProperty(this, 'stations', {
      get: function () {
        return _stations;
      },
    });

    Object.defineProperty(this, 'favorites', {
      get: function () {
        return [..._favorites];
      },
    });

    Object.defineProperty(this, 'user', {
      get: function () {
        return structuredClone(_user);
      },
    });

    Object.defineProperty(this, 'lastUpdatedInformation', {
      get: function () {
        return _lastUpdatedInformation;
      },
    });

    Object.defineProperty(this, 'lastUpdatedStatus', {
      get: function () {
        return _lastUpdatedStatus;
      },
    });

    Object.defineProperty(this, 'lastUpdatedBikes', {
      get: function () {
        return _lastUpdatedBikes;
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
     * @param {object} id - id to add
     * @returns {number} -1 if not successful, otherwise the added element
     */
    const addFavorite = function (id) {
      if (findFavoriteById(id) !== -1) {
        return -1;
      }
      _favorites.push(id);
      if (!_stations[id].user) {
        _stations[id].user = {};
      }
      _stations[id].user.favorite = true;
      return id;
    };

    /**
     * Remove single favorite occurance
     * @param {string} id - id of the occurance to remove
     * @returns {number} -1 if not successful, otherwise the removed element
     */
    const removeFavorite = function (id) {
      const index = findFavoriteById(id);
      if (index === -1) {
        return -1;
      }
      const removed = _favorites.splice(index, 1);
      if (!_stations[id].user) {
        _stations[id].user = {};
      }
      _stations[id].user.favorite = false;
      return removed[0];
    };

    /**
     * Move favorite up or down in the list
     * @param {string} id - id of the occurance to move
     * @param {["up"|"down"]} dir - direction of the move [up|down]
     * @returns {number|object} -1 if not successful, otherwise the affected element
     */
    const orderFavorite = function (id, dir) {
      const index = findFavoriteById(id);
      if (index === -1) {
        return -1;
      }
      if (index === 0 && dir === 'up') {
        return id;
      }
      const newIndex = dir === 'up' ? index - 1 : index + 1;
      _favorites.splice(index, 1);
      _favorites.splice(newIndex, 0, id);
      return id;
    };

    /**
     * Change single occurance
     * @param {string} id - id of the occurance to edit
     * @param {object} newData - object of the data to change, doesn't need all the props as it is a merge
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
      if (!_user[id]) {
        _user[id] = {};
      }
      _user[id] = {
        ..._user[id],
        ...newData,
      };
      return el.user;
    };

    /**
     * Change user description for the selected station
     * @param {string} id - id of the occurance to edit
     * @param {string} newDesc - new description
     * @returns {number|string} -1 if not successful, otherwise the updated description
     */
    const editDescription = function (id, newDesc) {
      const res = editStation(id, { description: newDesc });
      if (res !== -1) {
        return newDesc;
      }
      return res;
    };

    /**
     * Merge all the data (information, status, user, favorites) into the station object
     */
    const updateStations = function () {
      _stations = {};

      _information.forEach((item) => {
        const id = item.station_id;
        if (id) {
          if (!_stations[id]) {
            _stations[id] = {};
          }
          _stations[id].information = { ...item };
        }
      });

      _status.forEach((item) => {
        const id = item.station_id;
        if (id) {
          if (!_stations[id]) {
            _stations[id] = {};
          }
          _stations[id].status = { ...item };
        }
      });

      Object.keys(_user).forEach((id) => {
        if (_stations[id]) {
          _stations[id].user = { ..._user[id] };
        }
      });

      _favorites.forEach((id) => {
        if (_stations[id]) {
          if (!_stations[id].user) {
            _stations[id].user = {};
          }
          _stations[id].user.favorite = true;
        }
      });
    };

    /**
     * Update stations information
     * @param {array} newList - new list of station information
     * @param {number} lastUpdated - last updated
     */
    const updateStationsInformation = function (newList, lastUpdated) {
      _information = newList;
      _lastUpdatedInformation = lastUpdated;
      updateStations();
    };

    /**
     * Update stations status
     * @param {array} newList - new list of station information
     * @param {number} lastUpdated - last updated
     */
    const updateStationsStatus = function (newList, lastUpdated) {
      _status = newList;
      _lastUpdatedStatus = lastUpdated;
      updateStations();
    };

    /**
     * Update bikes status
     * @param {object} newData - new data about bikes status
     * @param {number} lastUpdated - last updated
     */
    const updateBikesStatus = function (newData, lastUpdated) {
      _bikes = newData;
      _lastUpdatedBikes = lastUpdated;
    };

    /**
     * Update stations user data and favorites
     * @param {object} newData
     * @param {object} newData.user
     * @param {array} newData.favorites
     */
    const updateStationsUserData = function ({ user, favorites }) {
      _user = user;
      _favorites = favorites;
      updateStations();
    };

    /**
     * Modify occurances
     * @param {string} how - How to change
     * @param {string} id - id of the occurance
     * @param {object|string} newData - new data
     * @param {array} newList - new list
     * @param {number} lastUpdated - last updated
     * @returns {number|object} -1 if not successful, otherwise the affected elements
     */
    const modify = function (how, id, newData, newList, lastUpdated) {
      let mod = -1;

      switch (how) {
        case 'addFavorite': {
          mod = addFavorite(id);
          break;
        }
        case 'removeFavorite': {
          mod = removeFavorite(id);
          break;
        }
        case 'orderFavorite': {
          mod = orderFavorite(id, newData);
          break;
        }
        case 'editStation': {
          mod = editStation(id, newData);
          break;
        }
        case 'editDescription': {
          mod = editDescription(id, newData);
          break;
        }
        case 'updateStationsInformation': {
          mod = updateStationsInformation(newList, lastUpdated);
          break;
        }
        case 'updateStationsStatus': {
          mod = updateStationsStatus(newList, lastUpdated);
          break;
        }
        case 'updateStationsUserData': {
          mod = updateStationsUserData(newData);
          break;
        }
        case 'updateBikesStatus': {
          mod = updateBikesStatus(newData, lastUpdated);
          break;
        }
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
      _status = storage.getItem('status') || [];
      _information = storage.getItem('information') || [];
      _user = storage.getItem('user') || {};
      _favorites = storage.getItem('favorites') || [];
      _bikes = storage.getItem('bikes') || {};
      _lastUpdatedInformation = storage.getItem('lastUpdatedInformation') || 0;
      _lastUpdatedStatus = storage.getItem('lastUpdatedStatus') || 0;
      _lastUpdatedBikes = storage.getItem('lastUpdatedBikes') || 0;
    };

    /**
     * Save to storage
     * @returns {boolean} True if save was successful
     */
    const save = function () {
      return (
        storage.setItem('status', _status) &&
        storage.setItem('information', _information) &&
        storage.setItem('bikes', _bikes) &&
        storage.setItem('user', _user) &&
        storage.setItem('favorites', _favorites) &&
        storage.setItem('lastUpdatedInformation', _lastUpdatedInformation) &&
        storage.setItem('lastUpdatedStatus', _lastUpdatedStatus) &&
        storage.setItem('lastUpdatedBikes', _lastUpdatedBikes) &&
        storage.setItem('version', VERSION)
      );
    };

    /**
     * Start data
     */
    this.init = function () {
      load();
      updateStations();
    };

    /**
     * Add single occurance
     * @param {string} id - id to add
     * @returns {number} -1 if not successful, otherwise the affected element
     */
    this.addFavorite = function (id) {
      return modify('addFavorite', id);
    };

    /**
     * Delete single occurance
     * @param {string} id - id of the occurance to remove
     * @returns {number} -1 if not successful, otherwise the affected element
     */
    this.removeFavorite = function (id) {
      return modify('removeFavorite', id);
    };

    /**
     * Move favorite up or down in the list
     * @param {string} id - id of the occurance to move
     * @param {['up'|'down']} dir - direction of the move [up|down]
     * @returns {number} -1 if not successful, otherwise the affected element
     */
    this.orderFavorite = function (id, dir) {
      return modify('orderFavorite', id, dir);
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
     * Edit user description for the selected station
     * @param {string} id - id of the occurance to edit
     * @param {string} newData - new description
     * @returns {number|string} -1 if not successful, otherwise the updated description
     */
    this.editDescription = function (id, newData) {
      return modify('editDescription', id, newData);
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

    this.updateBikesStatus = function (newData, lastUpdated) {
      return modify('updateBikesStatus', null, newData, null, lastUpdated);
    };

    /**
     * Replace user data and favorites
     * @param {*} newData
     * @returns
     */
    this.updateStationsUserData = function (newData) {
      return modify('updateStationsUserData', null, newData);
    };

    /**
     * Reset user data and favorites
     * @returns
     */
    this.resetStationsUserData = function () {
      const newData = {
        user: {},
        favorites: [],
      };
      return modify('updateStationsUserData', null, newData);
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

    /**
     * Get all station details by id
     * @param {string} id - station id
     * @returns {object} Selected station
     */
    this.getStationInfoById = function (id) {
      return {
        ..._stations[id],
        ...(_bikes[id] && { bikes: _bikes[id] }),
      };
    };
  };

  // export to window
  window.app = window.app || {};
  window.app.Model = Model;
})(window);
