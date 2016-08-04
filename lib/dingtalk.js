'use strict';

const Client = require('./api/client');
const Department = require('./api/department');
const User = require('./api/user');
const Message = require('./api/message');

module.exports = class DingTalk {
  constructor(options) {
    options.host = options.host || 'https://oapi.dingtalk.com';
    this.client = new Client(options);
    this.department = new Department(this.client, options);
    this.user = new User(this.client, options);
    this.message = new Message(this.client, options);
  }
};
