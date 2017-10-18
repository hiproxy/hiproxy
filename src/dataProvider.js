/**
 * @file hiproxy plugin data provier
 * @author zdying
 */
'use strict';

module.exports = {
  _data_: {
    hiproxy: {}
  },
  getData: function (namespace) {
    return this._data_[namespace] || (this._data_[namespace] = Object.create({
      _data_: {},

      get: function (key) {
        if (!key) {
          return this._data_;
        } else {
          return this._data_[key];
        }
      },

      set: function (key, value) {
        if (key) {
          this._data_[key] = value;
        }
      }
    }));
  }
};
