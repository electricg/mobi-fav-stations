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
        lastUpdatedInformation: _self.model.lastUpdatedInformation,
        lastUpdatedStatus: _self.model.lastUpdatedStatus,
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

    /**
     * Init app
     */
    this.init = function () {
      setData();
      _self.view.init();
    };
  };

  // export to window
  window.app = window.app || {};
  window.app.Controller = Controller;
})(window);

/* global */
/* exported $, $$ */
('use strict');

const $ = document.querySelectorAll.bind(document);
const $$ = document.querySelector.bind(document);
Element.prototype.on = Element.prototype.addEventListener;

// https://developer.mozilla.org/en/docs/Web/API/NodeList
NodeList.prototype.forEach = Array.prototype.forEach;

(function (window) {
  const Helpers = function () {
    /**
     * Prevent default event
     * @param {object} event
     */
    this.prev = function (event) {
      if (event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
    };

    /**
     * Attach a handler to event for all elements that match the selector,
     * now or in the future, based on a root element
     */
    this.$delegate = function (target, selector, type, handler) {
      function dispatchEvent(event) {
        let el = event.target;
        const els = [];
        let found = false;
        let hasMatch;
        const potentialElements = target.querySelectorAll(selector);
        while (el) {
          els.unshift(el);
          hasMatch = Array.prototype.indexOf.call(potentialElements, el) >= 0;
          if (hasMatch) {
            found = true;
            break;
          }
          el = el.parentNode;
        }
        if (found) {
          handler.call(el);
        }
      }

      // https://developer.mozilla.org/en-US/docs/Web/Events/blur
      const useCapture = type === 'blur' || type === 'focus';

      target.addEventListener(type, dispatchEvent, !!useCapture);
    };

    this.fetchData = async (url) => {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    };
  };

  window.app = window.app || {};
  window.app.Helpers = new Helpers();
})(window);

/* global VERSION */
(function (window) {
  'use strict';

  const Model = function (storage) {
    let _information = []; // copy of the api data
    let _status = []; // copy of the api data
    let _user = {}; // user data for the stations
    let _favorites = []; // it's an array (of IDs) because I want to choose the order
    let _stations = {}; // merge of all the above data
    let _lastUpdatedInformation = 0;
    let _lastUpdatedStatus = 0;

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
     * Merge all the data (information, status, user) into the station object
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

      if (how === 'addFavorite') {
        mod = addFavorite(id);
      } else if (how === 'removeFavorite') {
        mod = removeFavorite(id);
      } else if (how === 'orderFavorite') {
        mod = orderFavorite(id, newData);
      } else if (how === 'editStation') {
        mod = editStation(id, newData);
      } else if (how === 'editDescription') {
        mod = editDescription(id, newData);
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
      _status = storage.getItem('status') || [];
      _information = storage.getItem('information') || [];
      _user = storage.getItem('user') || {};
      _favorites = storage.getItem('favorites') || [];
      _lastUpdatedInformation = storage.getItem('lastUpdatedInformation') || 0;
      _lastUpdatedStatus = storage.getItem('lastUpdatedStatus') || 0;
    };

    /**
     * Save to storage
     * @returns {boolean} True if save was successful
     */
    const save = function () {
      return (
        storage.setItem('status', _status) &&
        storage.setItem('information', _information) &&
        storage.setItem('user', _user) &&
        storage.setItem('favorites', _favorites) &&
        storage.setItem('lastUpdatedInformation', _lastUpdatedInformation) &&
        storage.setItem('lastUpdatedStatus', _lastUpdatedStatus) &&
        storage.setItem('version', VERSION)
      );
    };

    /**
     * Init data
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

(function (window) {
  'use strict';

  const Offline = function ({
    showOffline = () => {},
    showInfo = () => {},
    debug = false,
    registerFile = 'sw.js',
    msgInstalled = 'This app is now available offline!',
    msgUpdated = 'This app has an update, please refresh.',
  }) {
    debug && console.log('debug: on');
    let isSWInstalled = false;

    /**
     * Show service worker status
     * @param {boolean} status true if sw is active
     */
    const swUIStatus = (status) => {
      debug && console.log('debug: sw status', !!status);
      showOffline(status);
    };

    /**
     * Show service worker has been installed for the first time ever
     */
    const swUIFirstTime = () => {
      debug && console.log('debug: sw first time ever');
      swUIStatus(true);
      swUIMessage(msgInstalled);
    };

    /**
     * Show service worker has been installed
     */
    const swUIInstalled = () => {
      debug && console.log('debug: sw installed');
      swUIStatus(true);
    };

    /**
     * Show that service worker has a new update to show
     */
    const swUIUpdate = () => {
      debug && console.log('debug: sw there is a new update, please refresh');
      swUIMessage(msgUpdated);
    };

    /**
     * Show service worker has returned an error
     * @param {Object} err error
     */
    const swUIError = (err) => {
      debug && console.error('debug: sw registration failed: ', err);
    };

    /**
     * Change the sw message
     * @param {string} msg
     */
    const swUIMessage = (msg) => {
      showInfo(msg);
    };

    /**
     * Check if service worker is active
     * @returns {boolean}
     */
    const swCheckStatus = () => {
      return !!navigator.serviceWorker.controller;
    };

    const onStateChange = (newWorker) => {
      debug && console.log('debug: sw onStateChange', newWorker.state);
      if (newWorker.state === 'activated') {
        if (!isSWInstalled) {
          isSWInstalled = swCheckStatus();
          swUIFirstTime();
        } else {
          swUIInstalled();
        }
      } else if (
        newWorker.state === 'installed' &&
        navigator.serviceWorker.controller
      ) {
        swUIUpdate();
      }
    };

    const init = function () {
      if ('serviceWorker' in navigator) {
        isSWInstalled = swCheckStatus();

        if (isSWInstalled) {
          swUIInstalled();
        }

        navigator.serviceWorker
          .register(registerFile)
          .then((registration) => {
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;

              registration.installing.addEventListener('statechange', () =>
                onStateChange(newWorker)
              );
            });
          })
          .catch((err) => {
            swUIError(err);
          });
      }
    };

    /**
     * Send message object to the service worker
     * @param {object} message
     */
    const sendMessage = (message) => {
      navigator.serviceWorker.controller.postMessage(message);
    };

    /**
     * Unregister service worker and send message to delete all caches
     */
    this.clearSW = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const unregisterPromises = registrations.map((registration) =>
        registration.unregister()
      );
      await Promise.all([...unregisterPromises]);
      sendMessage({
        type: 'clear',
      });
    };

    init();
  };

  // export to window
  window.app = window.app || {};
  window.app.Offline = Offline;
})(window);

/* jshint unused:false */
/* eslint no-unused-vars: "off" */
('use strict');

const VERSION = '0.7.10';
const NAMESPACE = 'mobiFavStations';

const URL_LOCAL = 'http://localhost:8080/mobi-fav-stations/json/';
const URL_REMOTE = 'https://giulia.dev/mobi-api/';
const URL_BAD = 'https://vancouver-gbfs.smoove.pro/gbfs/2/en/';

const FEATURES = {
  offline: false,
  local: false,
};

Object.freeze(FEATURES);

const URL_BASE = FEATURES.local ? URL_LOCAL : URL_REMOTE;

(function (window) {
  'use strict';

  const Storage = function (namespace) {
    const capitalize = function (string) {
      if (string === '') {
        return string;
      }
      return string[0].toUpperCase() + string.substring(1);
    };

    /**
     * Load from localStorage
     * @returns {object}
     */
    this.getItem = function (key) {
      try {
        return JSON.parse(localStorage.getItem(namespace + capitalize(key)));
      } catch (e) {
        console.error(e);
        return {};
      }
    };

    /**
     * Save to localStorage
     * @returns {boolean} True if save was successful
     */
    this.setItem = function (key, data) {
      try {
        localStorage.setItem(namespace + capitalize(key), JSON.stringify(data));
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    };

    /**
     * Remove item from localStorage
     * @returns {object}
     */
    this.removeItem = function (key) {
      try {
        return localStorage.removeItem(namespace + capitalize(key));
      } catch (e) {
        console.error(e);
        return false;
      }
    };

    /**
     * Clear all items of the namespace
     */
    this.clear = function () {
      Object.keys(localStorage).forEach((key) => {
        if (key.indexOf(namespace) === 0) {
          localStorage.removeItem(key);
        }
      });
    };
  };

  // export to window
  window.app = window.app || {};
  window.app.Storage = Storage;
})(window);

/* global */
(function (window) {
  'use strict';

  const Template = function () {
    const formatUndefined = (value) => (value === undefined ? '' : value);

    const formatNumber = (value) => {
      if (value === undefined) {
        return '';
      }
      if (value === null) {
        return '0';
      }
      return value;
    };

    const formatStatus = (value) => {
      if (value === undefined) {
        return '?';
      }
      if (value) {
        return '✅';
      } else {
        return '❌';
      }
    };

    const formatKpiNumber = (value) => {
      if (value == null) {
        return '_';
      }
      return value;
    };

    const formatStatusSpan = (value, label) => {
      return `<span${
        value ? '' : ' tabindex="0"'
      } title="${label}">${formatStatus(value)}</span>`;
    };

    const formatCharging = (value) => (value ? 'Y' : '');

    const favorite = function (id, item) {
      const { name } = item?.information || {};
      const {
        is_installed: isInstalled,
        is_renting: isRenting,
        is_returning: isReturning,
        num_docks_available: numDocksAvailable,
        vehicle_types_available: vehicleTypesAvailable,
      } = item?.status || {};
      const { description = '' } = item?.user || {};

      const code = `
            <div class="favorite">
              <div class="favorite__actions">
                <input type="button" data-id="${id}" data-action="up" class="favorite__up js-edit-favorites" value="▲" />
                <input type="button" data-id="${id}" data-action="down" class="favorite__down js-edit-favorites" value="▼" />
                <input type="button" data-id="${id}" data-action="remove" class="favorite__remove js-edit-favorites" value="✕" />
              </div>
              <div class="favorite__title"><span class="favorite__id">${id}</span> ${
        name || ''
      }</div>
              <div class="favorite__description">
                ${
                  description
                    ? `<span class="favorite__description__text">${description}</span>`
                    : ``
                }
                <label class="favorite__description__form">Description: <textarea data-id="${id}" class="js-edit-description">${description}</textarea></label>
              </div>
              ${
                !(isInstalled && isRenting && isReturning)
                  ? `<div class="favorite__status">
                  <span title="Installed">${formatStatus(isInstalled)}</span>
                  <span title="Renting">${formatStatus(isRenting)}</span>
                  <span title="Returning">${formatStatus(isReturning)}</span>
                </div>`
                  : ``
              }
              <div class="favorite__kpis">
                <div class="favorite__kpi">
                  <span class="favorite__kpi__count">${formatKpiNumber(
                    vehicleTypesAvailable?.[0].count
                  )}</span>
                  <svg class="icon favorite__kpi__icon favorite__kpi__icon--bike" focusable="false" aria-hidden="true"><use href="#icon-bike"></use></svg>
                  <span class="favorite__kpi__type">Classics</span>
                </div>
                <div class="favorite__kpi">
                  <span class="favorite__kpi__count">${formatKpiNumber(
                    vehicleTypesAvailable?.[1].count
                  )}</span>
                  <svg class="icon favorite__kpi__icon favorite__kpi__icon--ebike" focusable="false" aria-hidden="true"><use href="#icon-bike"></use></svg>
                  <span class="favorite__kpi__type">E-Bikes</span>
                </div>
                <div class="favorite__kpi">
                  <span class="favorite__kpi__count">${formatKpiNumber(
                    numDocksAvailable
                  )}</span>
                  <svg class="icon favorite__kpi__icon favorite__kpi__icon--dock" focusable="false" aria-hidden="true"><use href="#icon-dock"></use></svg>
                  <span class="favorite__kpi__type">Docks</span>
                </div>
              </div>
            </div>
          `;

      return code;
    };

    this.favorites = function (favorites, stations) {
      const favs = `
            <div class="favorites">
              ${favorites.map((id) => favorite(id, stations[id])).join('')}
            </div>
          `;
      const noFavs = `<p>Add your favorites from the stations list below</p>`;

      return favorites.length ? favs : noFavs;
    };

    this.lastUpdated = function (lastUpdated) {
      const date = new Date(lastUpdated * 1000);
      const code = lastUpdated
        ? `<time datetime="${date.toISOString()}">${date.toLocaleString()}</time>`
        : `no data`;

      return code;
    };

    const stationRow = function (item) {
      const {
        station_id: id1,
        name,
        capacity,
        is_charging_station: isCharging,
      } = item.information || {};
      const {
        station_id: id2,
        is_installed: isInstalled,
        is_renting: isRenting,
        is_returning: isReturning,
        num_bikes_available: numBikesAvailable,
        num_bikes_disabled: numBikesDisabled,
        num_docks_available: numDocksAvailable,
        vehicle_types_available: vehicleTypesAvailable,
      } = item.status || {};
      const { favorite, description = '' } = item.user || {};
      const id = id1 || id2;

      const code = `
            <tr>
              <td>${id}</td>
              <th scope="row">${formatUndefined(name)}</th>
              <td>${formatUndefined(capacity)}</td>
              <td>${formatCharging(isCharging)}</td>
              <td>${formatStatusSpan(
                isInstalled,
                'Installed'
              )}${formatStatusSpan(isRenting, 'Renting')}${formatStatusSpan(
        isReturning,
        'Returning'
      )}</td>
              <td>${formatNumber(numBikesAvailable)}</td>
              <td>${formatNumber(numBikesDisabled)}</td>
              <td>${formatNumber(numDocksAvailable)}</td>
              <td>${formatNumber(vehicleTypesAvailable?.[0].count)}</td>
              <td>${formatNumber(vehicleTypesAvailable?.[1].count)}</td>
              <td>
                <button type="button" aria-pressed="${
                  favorite ? 'true' : 'false'
                }" data-id="${id}" class="button-toggle station__favorite-toggle js-toggle-favorite" aria-label="Add to favorites">
                  <span aria-hidden="true" title="Add to favorites">☆</span>
                  <span aria-hidden="true" title="Remove from favorites">★</span>
                </button>
              </td>
              <td><textarea class="station__description js-edit-description" data-id="${id}" aria-label="Description">${description}</textarea></td>
            </tr>
          `;

      return code;
    };

    this.stations = function (stations) {
      const body = Object.keys(stations).length
        ? Object.keys(stations)
            .map((id) => stationRow(stations[id]))
            .join('')
        : `<tr><td colspan="12">No station found</td></tr>`;

      const code = `
            <table>
              <thead>
                <tr>
                  <th scope="col">N&deg;</th>
                  <th scope="col">Name</th>
                  <th scope="col" tabindex="0" title="Capacity">C</th>
                  <th scope="col" tabindex="0" title="Charging">⚡️</th>
                  <th scope="col">Status</th>
                  <th scope="col" tabindex="0" title="Bikes Available Total">BA</th>
                  <th scope="col" tabindex="0" title="Bikes Disabled">BD</th>
                  <th scope="col" tabindex="0" title="Docks Available">DA</th>
                  <th scope="col" tabindex="0" title="Bikes Available">1</th>
                  <th scope="col" tabindex="0" title="E-bikes Available">2</th>
                  <th scope="col" tabindex="0" title="Favorites">⭐️</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                ${body}
              </tbody>
            </table>
          `;

      return code;
    };

    this.alert = function (type, msg) {
      const code = `
            <div class="alert alert--${type}">
              <span>${msg}</span>
              <button class="alert__close js-close" title="Close" aria-label="Close" onClick="this.parentNode.remove()">
                <svg class="icon alert__close__icon" focusable="false" aria-hidden="true">
                  <use href="#icon-cancel-circle"></use>
                </svg>
              </button>
            </div>
          `;

      return code;
    };
  };

  window.app = window.app || {};
  window.app.Template = Template;
})(window);

/* global $$, app, VERSION */
(function (window) {
  'use strict';

  /**
   * View
   */
  const View = function (template) {
    const _self = this;
    _self.template = template;

    const $loadStatus = $$('#load-status');
    const $loadInformation = $$('#load-information');
    const $toggleEdit = $$('#toggle-edit');
    const $toggleStations = $$('#toggle-stations');

    const $body = document.body;

    const $favorites = $$('#favorites');

    const $stations = $$('#stations');
    const $stationsFilterInput = $$('#stations-filter-input');
    const $stationsList = $$('#stations-list');

    const $lastUpdatedStatus = $$('#last-updated-status');
    const $lastUpdatedInformation = $$('#last-updated-information');

    const $alerts = $$('#alerts');

    const $version = $$('#version');

    let _showStations = false;
    let _filter = '';

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

    _viewCommands.home = function (data) {
      const {
        stations,
        favorites,
        lastUpdatedInformation,
        lastUpdatedStatus,
        filteredStations,
      } = data;
      $favorites.innerHTML = _self.template.favorites(favorites, stations);
      $lastUpdatedStatus.innerHTML =
        _self.template.lastUpdated(lastUpdatedStatus);
      $lastUpdatedInformation.innerHTML = _self.template.lastUpdated(
        lastUpdatedInformation
      );
      if (_showStations) {
        $stationsList.innerHTML = _self.template.stations(filteredStations);
      }
    };

    this.render = function (viewCmd, data) {
      _viewCommands[viewCmd](data);
    };

    this.bind = function (event, handler) {
      if (event === 'home') {
        const data = handler(_filter);
        _self.render('home', data);
      } else if (event === 'toggleStations') {
        $toggleStations.on('click', function () {
          _showStations = !_showStations;
          this.setAttribute('aria-pressed', _showStations);
          $stations.classList.toggle('hide', !_showStations);
          if (_showStations) {
            const stations = handler();
            $stationsList.innerHTML = _self.template.stations(stations);
          } else {
            $stationsList.innerHTML = '';
            $stationsFilterInput.value = '';
          }
        });
      } else if (event === 'loadStatus') {
        $loadStatus.on('click', async function () {
          $loadStatus.classList.toggle('success', false);
          $loadStatus.classList.toggle('rotating', true);
          try {
            const data = await handler(_filter);
            $loadStatus.classList.toggle('success', true);
            _self.render('home', data);
          } catch (e) {
            console.log(e);
            _self.render('error', e);
          }
          $loadStatus.classList.toggle('rotating', false);
        });
      } else if (event === 'loadInformation') {
        // TODO show visual
        $loadInformation.on('click', async function () {
          try {
            const data = await handler(_filter);
            _self.render('home', data);
            _self.render(
              'success',
              'Stations information updated successfully'
            );
          } catch (e) {
            console.log(e);
            _self.render('error', e);
          }
        });
      } else if (event === 'filterStations') {
        $stationsFilterInput.on('input', function (event) {
          _filter = event.target.value;
          const stations = handler(_filter);
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
              const res = handler(id, action, _filter);
              if (res !== -1) {
                _self.render('home', res);
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
            const data = handler(_filter);
            _self.render('home', data);
          }
        });
      }
    };

    this.init = function () {
      $version.innerHTML = VERSION;
      $loadStatus.click(); // TODO
    };
  };

  // export to window
  window.app = window.app || {};
  window.app.View = View;
})(window);

/* global app, NAMESPACE, FEATURES */
('use strict');

const App = function (namespace) {
  this.storage = new app.Storage(namespace);
  this.model = new app.Model(this.storage);
  this.template = new app.Template();
  this.view = new app.View(this.template);
  this.controller = new app.Controller(this.model, this.view);
};

app.instance = new App(NAMESPACE);

const load = function () {
  app.instance.controller.init();
};

if (location.protocol === 'http:' && location.hostname !== 'localhost') {
  const newUrl = location.href.replace('http://', 'https://');
  app.instance.view.render(
    'warning',
    `Warning: this app is better loaded from its <a href="${newUrl}">https counterpart</a>`
  );
}

window.addEventListener('load', load);

if (FEATURES.offline) {
  app.instance.offline = new app.Offline({
    showInfo: (msg) => app.instance.view.render('info', msg),
  });
}
