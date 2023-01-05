'use strict';

const $ = document.querySelectorAll.bind(document);
const $$ = document.querySelector.bind(document);
Element.prototype.on = Element.prototype.addEventListener;

const fetchJson = async (url) => {
  console.log('fetchJson');
  const response = await fetch(`http://localhost:8080/mobi-fav-stations/json/${url}`);
  const data = await response.json();
  return data;
};

const $loadStatus = $$('#load-status');
const $loadInformation = $$('#load-information');
const $editFavorites = $$('#edit-favorites');

$loadStatus.on('click', async function() {
  const data = await fetchJson('station_status.json');
  console.log('load status', data);
});

$loadInformation.on('click', async function() {
  const data = await fetchJson('station_information.json');
  console.log('load information', data);
});