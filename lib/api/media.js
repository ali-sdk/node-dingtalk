'use strict';

const assert = require('assert');
const formstream = require('formstream');

module.exports = class Media {
  constructor(client, options) {
    this.client = client;
    this.options = options;
  }

  * upload(type, filePath) {
    assert(type, 'type required');
    assert(filePath, 'filePath required');

    const form = formstream();
    form.file('media', filePath);
    const accessToken = yield this.client.getAccessToken();
    const url = `${this.options.host}/media/upload?access_token=${accessToken}&type=${type}`;
    return yield this.client.request(url, Object.assign({
      method: 'POST',
      headers: form.headers(),
      stream: form,
    }));
  }
};
