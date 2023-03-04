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

    const formatStatusSpan = (value, label) => {
      return `<span${
        value ? '' : ' tabindex="0"'
      } title="${label}">${formatStatus(value)}</span>`;
    };

    const formatCharging = (value) => (value ? 'Y' : '');

    const formatLastUpdate = (value) => new Date(value * 1000).toLocaleString();

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
          <div class="favorite">
            <div class="favorite__actions">
              <input type="button" data-id="${id}" data-action="up" class="favorite__up js-edit-favorites" value="▲" />
              <input type="button" data-id="${id}" data-action="down" class="favorite__down js-edit-favorites" value="▼" />
              <input type="button" data-id="${id}" data-action="remove" class="favorite__remove js-edit-favorites" value="✕" />
            </div>
            <div class="favorite__title"><span class="favorite__id">${id}</span> ${name}</div>
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
                <span class="favorite__kpi__count">${
                  vehicleTypesAvailable?.[0].count
                }</span>
                <svg class="favorite__kpi__icon icon test test1" focusable="false" aria-hidden="true"><use href="#icon-bike"></use></svg>
                <span class="favorite__kpi__type">Classics</span>
              </div>
              <div class="favorite__kpi">
                <span class="favorite__kpi__count">${
                  vehicleTypesAvailable?.[1].count
                }</span>
                <svg class="favorite__kpi__icon icon test test2" focusable="false" aria-hidden="true"><use href="#icon-bike"></use></svg>
                <span class="favorite__kpi__type">E-Bikes</span>
              </div>
              <div class="favorite__kpi">
                <span class="favorite__kpi__count">${numDocksAvailable}</span>
                <svg class="favorite__kpi__icon icon test test3" focusable="false" aria-hidden="true"><use href="#icon-dock"></use></svg>
                <span class="favorite__kpi__type">Docks</span>
              </div>
            </div>
          </div>
        `;

      return code;
    };

    this.favorites = function (favorites, stations) {
      const code = `
          <div class="favorites">
            ${favorites.map((id) => favorite(stations[id])).join('')}
          </div>
        `;

      return code;
    };

    this.lastUpdated = function (lastUpdated) {
      const code = `<time>${formatLastUpdate(lastUpdated)}</time>`;

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
            <th>${formatUndefined(name)}</th>
            <td>${formatUndefined(capacity)}</td>
            <td>${formatCharging(isCharging)}</td>
            <td>${formatStatusSpan(isInstalled, 'Installed')}${formatStatusSpan(
        isRenting,
        'Renting'
      )}${formatStatusSpan(isReturning, 'Returning')}</td>
            <td>${formatNumber(numBikesAvailable)}</td>
            <td>${formatNumber(numBikesDisabled)}</td>
            <td>${formatNumber(numDocksAvailable)}</td>
            <td>${formatNumber(vehicleTypesAvailable?.[0].count)}</td>
            <td>${formatNumber(vehicleTypesAvailable?.[1].count)}</td>
            <td>
              <button type="button" aria-pressed="${
                favorite ? 'true' : 'false'
              }" data-id="${id}" class="button-toggle station__favorite-toggle js-toggle-favorite">
                <span aria-hidden="true" title="Add to favorites">☆</span>
                <span aria-hidden="true" title="Remove from favorites">★</span>
              </button>
            </td>
            <td><span class="js-toggle-description station__description" data-id="${id}">${description}</span></td>
          </tr>
        `;

      return code;
    };

    this.stations = function (stations) {
      const code = `
          <table>
            <thead>
              <tr>
                <th>N&deg;</th>
                <th>Name</th>
                <th tabindex="0" title="Capacity">C</th>
                <th tabindex="0" title="Charging">⚡️</th>
                <th>Status</th>
                <th tabindex="0" title="Bikes Available Total">BA</th>
                <th tabindex="0" title="Bikes Disabled">BD</th>
                <th tabindex="0" title="Docks Available">DA</th>
                <th tabindex="0" title="Bikes Available">1</th>
                <th tabindex="0" title="E-bikes Available">2</th>
                <th tabindex="0" title="Favorites">⭐️</th>
                <th>Description</th>
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
