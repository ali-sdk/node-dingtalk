'use strict';

const assert = require('assert');

module.exports = class Department {
  constructor(client, options) {
    this.client = client;
    this.options = options;
  }

  * list(opts) {
    return yield this.client.get('department/list', opts);
  }

  * get(id) {
    assert(id, 'department id required');
    return yield this.client.get('department/get', { id });
  }

  * create(opts) {
    assert(opts.name, 'options.name required');
    assert(opts.parentid, 'options.parentid required, root is 1');
    return yield this.client.post('department/create', opts);
  }

  * update(opts) {
    assert(opts.id, 'options.id required');
    return yield this.client.post('department/update', opts);
  }

  * delete(id) {
    assert(id, 'department id required');
    return yield this.client.get('department/delete', { id });
  }
};
