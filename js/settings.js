/* jshint unused:false */
/* eslint no-unused-vars: "off" */
'use strict';

const VERSION = '0.5';
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
