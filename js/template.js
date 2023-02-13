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
        return '';
      }
      if (value) {
        return '✅';
      } else {
        return '❌';
      }
    };

    const formatCharging = (value) => (value ? 'Y' : '');

    const formatLastUpdate = (value) => new Date(value * 1000);

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

    const favorite = function (item) {
      const { station_id: id1, name } = item.information || {};
      const {
        station_id: id2,
        is_installed: isInstalled,
        is_renting: isRenting,
        is_returning: isReturning,
        num_docks_available: numDocksAvailable,
        vehicle_types_available: vehicleTypesAvailable,
      } = item.status || {};
      const { description = '' } = item.user || {};
      const id = id1 || id2;

      const code = `
          <div>
            <div>${description}</div>
            <div>${name}</div>
            <div>${id}</div>
            <div><svg class="icon test test1" focusable="false" aria-hidden="true"><use href="#icon-bike"></use></svg>${
              vehicleTypesAvailable?.[0].count
            }</div>
            <div><svg class="icon test test2" focusable="false" aria-hidden="true"><use href="#icon-bike"></use></svg>${
              vehicleTypesAvailable?.[1].count
            }</div>
            <div><svg class="icon test test3" focusable="false" aria-hidden="true"><use href="#icon-dock"></use></svg>${numDocksAvailable}</div>
            <div>
              <span title="Installed">${formatStatus(isInstalled)}</span>
              <span title="Renting">${formatStatus(isRenting)}</span>
              <span title="Returning">${formatStatus(isReturning)}</span></div>
          </div>
        `;

      return code;
    };

    this.favorites = function (favorites, stations, lastUpdated) {
      const code = `
          <div>
            <div>${formatLastUpdate(lastUpdated)}</div>
            ${favorites.map((id) => favorite(stations[id])).join('')}
          </div>
        `;

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
            <td>${formatUndefined(name)}</td>
            <td>${formatUndefined(capacity)}</td>
            <td>${formatCharging(isCharging)}</td>
            <td><span title="Installed">${formatStatus(
              isInstalled
            )}</span><span title="Renting">${formatStatus(
        isRenting
      )}</span><span title="Returning">${formatStatus(isReturning)}</span></td>
            <td>${formatNumber(numBikesAvailable)}</td>
            <td>${formatNumber(numBikesDisabled)}</td>
            <td>${formatNumber(numDocksAvailable)}</td>
            <td>${formatNumber(vehicleTypesAvailable?.[0].count)}</td>
            <td>${formatNumber(vehicleTypesAvailable?.[1].count)}</td>
            <td>
              <button type="button" aria-pressed="${
                favorite ? 'true' : 'false'
              }" data-id="${id}" class="favorite-toggle js-toggle-favorite">
                <span class="visually-hidden">Favorite</span>
                <span class="favorite-toggle__add" aria-hidden="true" title="Add to favorites">☆</span>
                <span class="favorite-toggle__remove" aria-hidden="true" title="Remove from favorites">★</span>
              </button>
            </td>
            <td>${description}</td>
          </tr>
        `;

      return code;
    };

    this.stations = function (stations, lastUpdated) {
      const code = `
          <div>${formatLastUpdate(lastUpdated)}</div>
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th title="Capacity">C</th>
                <th title="Charging">⚡️</th>
                <th title="Status">S</th>
                <th title="Bikes Available Total">BA</th>
                <th title="Bikes Disabled">BD</th>
                <th title="Docks Available">DA</th>
                <th title="Bikes Available">1</th>
                <th title="E-bikes Available">2</th>
                <th title="Favorites">⭐️</th>
                <th title="Description">D</th>
              </tr>
            </thead>
            <tbody>
              ${Object.keys(stations)
                .map((id) => stationRow(stations[id]))
                .join('')}
            </tbody>
          </table>
        `;

      return code;
    };
  };

  window.app = window.app || {};
  window.app.Template = Template;
})(window);
