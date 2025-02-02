/* jshint unused:false */
/* eslint no-unused-vars: "off" */
'use strict';

const VERSION = '0.7.56';
const NAMESPACE = 'mobiFavStations';

const URL_LOCAL = 'http://localhost:8080/mobi-fav-stations/json/';
const URL_REMOTE = 'https://mobi-api.giulia.dev/';
const URL_BAD = 'https://vancouver-gbfs.smoove.pro/gbfs/2/en/';

const DEFAULT_USER_SETTINGS = {
  showClassics: true,
  showEbikes: true,
  showDocks: true,
  compactLayout: false,
  showStationDetails: '1', // 0 all, 1 classic, 2 ebike
};

const FEATURES = {
  local: false, // todo need to use it for offline
};

const FILE = {
  name: 'mobi-fav-stations_${now}.txt',
  title: 'Mobi Fav Stations Backup ${now}',
};

Object.freeze(DEFAULT_USER_SETTINGS);
Object.freeze(FEATURES);
Object.freeze(FILE);

const URL_BASE = FEATURES.local ? URL_LOCAL : URL_REMOTE;
