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

    const formatStatusSpan = (value, label) =>
      `<span${value ? '' : ' tabindex="0"'} title="${label}">${formatStatus(
        value
      )}</span>`;

    const formatCharging = (value) => (value ? 'Y' : '');

    const elDescriptionTextarea = (id, description, showLabel = false) => `
      ${showLabel ? `<span class="description__label">Description:</span>` : ``}
      <div data-id="${id}" class="description__textarea js-edit-description" contenteditable="true">${description}</div>
    `;

    const elIconSvg = (name) =>
      `<svg class="icon icon--${name}" focusable="false" aria-hidden="true"><use href="#icon-${name}"/></svg>`;

    const kpi = (name, value, label) => `
      <div class="kpi">
        <span class="kpi__count">${formatKpiNumber(value)}</span>
        ${elIconSvg(name)}
        <span class="kpi__type">${label}</span>
      </div>
    `;

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
              ${[
                ['up', '▲'],
                ['down', '▼'],
                ['remove', '✕'],
              ]
                .map(
                  ([name, value]) =>
                    `<input type="button" data-id="${id}" data-action="${name}" class="favorite__${name} js-edit-favorites" value="${value}" />`
                )
                .join('')}
            </div>
            <div class="favorite__title">
              <span class="favorite__id">${id}</span> ${name || ''}
            </div>
            <div class="favorite__description">
              ${elDescriptionTextarea(id, description, true)}
            </div>
            ${
              !(isInstalled && isRenting && isReturning)
                ? `
                <div class="favorite__status">
                  <span title="Installed">${formatStatus(isInstalled)}</span>
                  <span title="Renting">${formatStatus(isRenting)}</span>
                  <span title="Returning">${formatStatus(isReturning)}</span>
                </div>`
                : ``
            }
            <div class="favorite__kpis">
              ${
                showClassics
                  ? kpi('bike', vehicleTypesAvailable?.[0].count, 'Classics')
                  : ``
              }
              ${
                showEbikes
                  ? kpi('ebike', vehicleTypesAvailable?.[1].count, 'E-Bikes')
                  : ``
              }
              ${showDocks ? kpi('dock', numDocksAvailable, 'Docks') : ``}
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
            <td>
            ${elDescriptionTextarea(id, description)}
            </td>
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

      const {
        name,
        is_charging_station: isCharging,
        lat,
        lon,
      } = item?.information || {};
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
          }<span class="detail__id">${id}</span> ${
        name || ''
      } <a href="https://www.google.com/maps/search/?api=1&query=${lat}%2C${lon}" target="_blank" title="Open location on Google Maps">📍</a></div>
          <div class="detail__description">${description}</div>
          <div class="detail__status">
            <span>${formatStatus(isInstalled)}<small> Installed</small></span>
            <span>${formatStatus(isRenting)}<small> Renting</small></span>
            <span>${formatStatus(isReturning)}<small> Returning</small></span>
            <span><b${
              isCharging ? '' : ' class="not-charging"'
            }>⚡️</b> <small>${isCharging ? '' : 'Not '}Charging</small></span>
          </div>

          <div class="detail__kpis">
            ${kpi('bike', vehicleTypesAvailable?.[0].count, 'Classics')}
            ${kpi('ebike', vehicleTypesAvailable?.[1].count, 'E-Bikes')}
            ${kpi('dock', numDocksAvailable, 'Docks')}
          </div>

          <div class="detail__bike-show">
            ${[
              ['0', 'All'],
              ['1', 'Classic'],
              ['2', 'E-bike'],
            ]
              .map(
                ([value, label]) => `
                  <div>
                    <label tabindex="0">
                      <input type="radio" id="detail__bike-show-${value}" name="detail__bike-show"${
                  showStationDetails === value ? ' checked' : ''
                }>
                      <span>${label}</span>
                    </label>
                  </div>`
              )
              .join('')}
          </div>
          
          <table class="detail__table">
            <thead>
              <th scope="col">Dock</th>
              <th scope="col">Type</th>
              <th scope="col">Id</th>
              <th scope="col">Range</th>
            </thead>
            <tbody>
            ${bikes
              .map((bike) => {
                return `
              <tr class="detail__bike-${bike?.d === '2' ? `e` : ``}bike${
                  bike?.c ? ` detail__bike-disabled` : ``
                }">
                <td>
                  ${elIconSvg('dock')}
                  ${formatDockNumber(bike?.z)}
                </td>
                <td>
                  ${elIconSvg(`${bike?.d === '2' ? `e` : ``}bike`)}
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
              ${elIconSvg('cancel-circle')}
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
      '0008': 'Are you sure you want to delete your personal settings?',
      '0009': 'Data deleted successfully',
      '0010': 'Uninstall this app?',
      '0011': 'This app is now installed!',
      '0012': 'This app has an update, please <a href="./">refresh</a>',
    };

    // todo: make it more generic
    this.strings = function (id, a) {
      return strings[id].replace('${a}', a) || '';
    };
  };

  window.app = window.app || {};
  window.app.Template = Template;
})(window);
