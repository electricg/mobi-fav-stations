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
      if (value === null || value === undefined) {
        return '_';
      }
      return value;
    };

    const formatDockNumber = (value) => {
      let str;
      if (value === null || value === undefined) {
        str = '';
      } else {
        str = value + '';
      }
      return str.padStart(2, '0');
    };

    const formatRangeNumber = (value) => {
      if (value === null || value === undefined) {
        return '';
      }
      return value / 1000 + ' km';
    };

    const formatStatusSpan = (value, label) => {
      return `<span${
        value ? '' : ' tabindex="0"'
      } title="${label}">${formatStatus(value)}</span>`;
    };

    const formatCharging = (value) => (value ? 'Y' : '');

    const favorite = function (id, item, config) {
      const { name } = item?.information || {};
      const {
        is_installed: isInstalled,
        is_renting: isRenting,
        is_returning: isReturning,
        num_docks_available: numDocksAvailable,
        vehicle_types_available: vehicleTypesAvailable,
      } = item?.status || {};
      const { description = '' } = item?.user || {};
      const { showClassics, showEbikes, showDocks } = config;

      const code = `
          <div class="favorite js-show-station" data-id="${id}">
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

            ${
              showClassics
                ? `<div class="favorite__kpi">
                <span class="favorite__kpi__count">${formatKpiNumber(
                  vehicleTypesAvailable?.[0].count
                )}</span>
                <svg class="icon favorite__kpi__icon favorite__kpi__icon--bike" focusable="false" aria-hidden="true"><use href="#icon-bike"></use></svg>
                <span class="favorite__kpi__type">Classics</span>
              </div>`
                : ``
            }

            ${
              showEbikes
                ? `<div class="favorite__kpi">
                <span class="favorite__kpi__count">${formatKpiNumber(
                  vehicleTypesAvailable?.[1].count
                )}</span>
                <svg class="icon favorite__kpi__icon favorite__kpi__icon--ebike" focusable="false" aria-hidden="true"><use href="#icon-bike"></use></svg>
                <span class="favorite__kpi__type">E-Bikes</span>
              </div>`
                : ``
            }

            ${
              showDocks
                ? `<div class="favorite__kpi">
                <span class="favorite__kpi__count">${formatKpiNumber(
                  numDocksAvailable
                )}</span>
                <svg class="icon favorite__kpi__icon favorite__kpi__icon--dock" focusable="false" aria-hidden="true"><use href="#icon-dock"></use></svg>
                <span class="favorite__kpi__type">Docks</span>
              </div>`
                : ``
            }
            </div>
          </div>
        `;

      return code;
    };

    this.favorites = function (favorites, stations, config) {
      const { showClassics, showEbikes, showDocks } = config;
      const items = showClassics + showEbikes + showDocks;

      const favs = `
          <div class="favorites" style="--items:${items}">
            ${favorites
              .map((id) => favorite(id, stations[id], config))
              .join('')}
          </div>
        `;
      const noFavs = `<p>Add your favourites from the stations list below</p>`;

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
            <td data-id="${id}" class="js-show-station">${id}</td>
            <th scope="row">${formatUndefined(name)}</th>
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
              }" data-id="${id}" class="button-toggle station__favorite-toggle js-toggle-favorite" aria-label="Add to favourites">
                <span aria-hidden="true" title="Add to favourites">☆</span>
                <span aria-hidden="true" title="Remove from favourites">★</span>
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
          ${body}
        `;

      return code;
    };

    this.bikes = function (id, item, config) {
      const { bikes = [] } = item;
      const { showStationDetails } = config;

      const { name, is_charging_station: isCharging } = item?.information || {};
      const {
        is_installed: isInstalled,
        is_renting: isRenting,
        is_returning: isReturning,
        num_docks_available: numDocksAvailable,
        vehicle_types_available: vehicleTypesAvailable,
      } = item?.status || {};
      const { favorite, description = '' } = item?.user || {};

      const code = `
        <div class="detail">
          <div class="detail__title">${
            favorite ? `<span title="Favourite">⭐️ </span>` : ``
          }<span class="detail__id">${id}</span> ${name || ''}</div>
          <div class="detail__description">${description}</div>
          <div class="detail__status">
            <span>${formatStatus(isInstalled)}<small> Installed</small></span>
            <span>${formatStatus(isRenting)}<small> Renting</small></span>
            <span>${formatStatus(isReturning)}<small> Returning</small></span>
            <span><b${
              isCharging ? '' : ' class="not-charging"'
            }>⚡️</b> <small>${isCharging ? '' : 'Not '}Charging</small></span>
          </div>

          <div class="detail__kpi-container">
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

          <div class="detail__bike-show">
            <div><label><input type="radio" id="detail__bike-show-all" name="detail__bike-show"${
              showStationDetails === '0' ? ' checked' : ''
            }><span>All</span></label></div>
            <div><label><input type="radio" id="detail__bike-show-bike" name="detail__bike-show"${
              showStationDetails === '1' ? ' checked' : ''
            }><span>Classic</span></label></div>
            <div><label><input type="radio" id="detail__bike-show-ebike" name="detail__bike-show"${
              showStationDetails === '2' ? ' checked' : ''
            }><span>E-Bike</span></label></div>
          </div>
          
          <table>
            <thead>
              <th>Dock</th>
              <th>Type</th>
              <th>Id</th>
              <th>Range</th>
            </thead>
            <tbody>
            ${bikes
              .map((bike) => {
                return `
              <tr class="detail__bike-${bike?.d === '2' ? `e` : ``}bike${
                  bike?.c ? ` detail__bike-disabled` : ``
                }">
                <td>
                  <svg class="icon detail__icon detail__icon--dock" focusable="false" aria-hidden="true"><use href="#icon-dock"></use></svg>
                  ${formatDockNumber(bike?.z)}
                </td>
                <td>
                  <svg class="icon detail__icon detail__icon--${
                    bike?.d === '2' ? `e` : ``
                  }bike" focusable="false" aria-hidden="true"><use href="#icon-bike"></use></svg>
                </td>
                <td><span class="detail__bike-id">${bike?.a}</span></td>
                <td>${formatRangeNumber(bike?.e)}</td>
              </tr>`;
              })
              .join('')}
            </tbody>
          </table>
        </div>`;

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

    const strings = {
      '0001': 'Data imported successfully',
      '0002':
        'This will completely overwrite the data. Do you want to continue?',
      '0003': 'Error in updating the favourites order',
      '0004': 'Error in updating this station description',
      '0005':
        'The station you are trying to remove from your favourite is not present in the list',
      '0006':
        'The station you are trying to add to your favourite is already present in the list',
      '0007': 'Are you sure you want to remove station ${a}?',
    };

    // todo: make it more generic
    this.strings = function (id, a) {
      return strings[id].replace('${a}', a) || '';
    };
  };

  window.app = window.app || {};
  window.app.Template = Template;
})(window);
