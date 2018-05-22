'use strict';

const Client = require('./api/client');
const Department = require('./api/department');
const User = require('./api/user');
const Message = require('./api/message');
const Media = require('./api/media');
const Auth = require('./api/auth');
const Extcontact = require('./api/extcontact');

/**
 * 钉钉 SDK
 * @type {DingTalk}
 */
module.exports = class DingTalk {
  constructor(options) {
    options.host = options.host || 'https://oapi.dingtalk.com';
    this.client = new Client(options);
    this.department = new Department(this.client, options);
    this.user = new User(this.client, options);
    this.message = new Message(this.client, options);
    this.media = new Media(this.client, options);
    this.auth = new Auth(this.client, options);
    this.extcontact = new Extcontact(this.client, options);
  }
};
