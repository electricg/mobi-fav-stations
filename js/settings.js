/* jshint unused:false */
/* eslint no-unused-vars: "off" */
'use strict';

const VERSION = '0.7.28';
const NAMESPACE = 'mobiFavStations';

const URL_LOCAL = 'http://localhost:8080/mobi-fav-stations/json/';
const URL_REMOTE = 'https://giulia.dev/mobi-api/';
const URL_BAD = 'https://vancouver-gbfs.smoove.pro/gbfs/2/en/';

const DEFAULT_USER_SETTINGS = {
  showClassics: true,
  showEbikes: true,
  showDocks: true,
  compactLayout: false,
};

const FEATURES = {
  local: false,
};

Object.freeze(DEFAULT_USER_SETTINGS);
Object.freeze(FEATURES);

const URL_BASE = FEATURES.local ? URL_LOCAL : URL_REMOTE;
