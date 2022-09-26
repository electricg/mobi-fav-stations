/* global */
(function (window) {
  'use strict';

  const Model = function (storage) {
    let _list = [];

    Object.defineProperty(this, 'list', {
      get: function () {
        return _list;
      },
    });

    /**
     * Find occurance by id
     * @param {string} id - id of the occurance to find
     * @returns {number} -1 if not found, otherwise index number of the element
     */
    const findById = function (id) {
      return _list.findIndex((item) => item.id === id);
    };

    /**
     * Add single occurance
     * @param {object} item - item to add
     * @returns {number|object} -1 if not successful, otherwise the added element
     */
    const add = function (item) {
      if (findById(item.id) !== -1) {
        return -1;
      }
      _list.push(item);
      return item;
    };

    /**
     * Change single occurance
     * @param {string} id - id of the occurance to edit
     * @param {object} newData - data to change
     * @returns {number|object} -1 if not successful, otherwise the updated element
     */
    const edit = function (id, newData) {
      const index = findById(id);
      if (index === -1) {
        return -1;
      }

      _list[index] = {
        ..._list[index],
        ...newData,
      };

      return _list[index];
    };

    /**
     * Remove single occurance
     * @param {string} id - id of the occurance to remove
     * @returns {number|object} -1 if not successful, otherwise the removed element
     */
    const remove = function (id) {
      const index = findById(id);
      if (index === -1) {
        return -1;
      }
      const removed = _list.splice(index, 1);
      return removed[0];
    };

    /**
     * Remove all occurances
     * @returns {number|object} -1 if data was already empty, otherwise the removed elements
     */
    const clear = function () {
      let removed = -1;
      if (_list.length > 0) {
        removed = _list.splice(0);
      }
      return removed;
    };

    /**
     * Replace all occurances with passed list
     * @param {array} newList - new list of occurances
     * @returns {array}
     */
    const update = function (newList) {
      _list = [...newList];
      return _list;
    };

    /**
     * Modify occurances
     * @param {string} how - How to change
     * @param {string} id - id of the occurance
     * @param {object} item - item
     * @param {array} list - new list
     * @returns {number|object} -1 if not successful, otherwise the affected elements
     */
    const modify = function (how, id, item, list) {
      let mod = -1;
      if (how === 'add') {
        mod = add(item);
      }
      if (how === 'edit') {
        mod = edit(id, item);
      }
      if (how === 'remove') {
        mod = remove(id);
      }
      if (how === 'clear') {
        mod = clear();
      }
      if (how === 'update') {
        mod = update(list);
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
     * @returns {boolean} True if load was successful
     */
    const load = function () {
      _list = storage.getItem('list') || [];
    };

    /**
     * Save to storage
     * @returns {boolean} True if save was successful
     */
    const save = function () {
      return storage.setItem('list', _list);
    };

    /**
     * Init data
     * @returns {array}
     */
    this.init = function () {
      load();
    };

    /**
     * Add single occurance
     * @param {object} item - item
     * @returns {number|object} -1 if not successful, otherwise the affected elements
     */
    this.add = function (item) {
      return modify('add', null, item);
    };

    /**
     * Edit single occurance
     * @param {string} id - id of the occurance to edit
     * @param {object} item - item
     * @returns {number|object} -1 if not successful, otherwise the affected elements
     */
    this.edit = function (id, item) {
      return modify('edit', id, item);
    };

    /**
     * Delete single occurance
     * @param {string} id - id of the occurance to remove
     * @returns {number|object} -1 if not successful, otherwise the affected elements
     */
    this.remove = function (id) {
      return modify('remove', id);
    };

    /**
     * Delete all occurances
     * @returns {number|object} -1 if not successful, otherwise the affected elements
     */
    this.clear = function () {
      return modify('clear');
    };

    /**
     * Replace list
     * @param {array} list
     * @returns {array} -1 if not successful, otherwise the new list
     */
    this.update = function (list) {
      return modify('update', null, null, list);
    };

    /**
     * Return item selected by id
     * @param {string} id
     * @returns {number|object} -1 if not successful, otherwise the selected item
     */
    this.getById = function (id) {
      return findById(id);
    };

    this.init();
  };

  // export to window
  window.app = window.app || {};
  window.app.Model = Model;
})(window);
