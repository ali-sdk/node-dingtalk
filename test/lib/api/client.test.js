'use strict';

const assert = require('power-assert');
const urllib = require('urllib');

const DingTalk = require('../../../lib/dingtalk');
const options = require('./../../fixtures/test.config.json');

describe('test/lib/api/client.test.js', () => {
  let dingtalk;

  before(function* () {
    dingtalk = new DingTalk(Object.assign(options, { urllib }));
  });

  it('getAccessToken', function* () {
    const token = yield dingtalk.client.getAccessToken();
    const expireTime = dingtalk.client.accessTokenExpireTime;
    assert(token);
    assert(expireTime >= Date.now());

    const token2 = yield dingtalk.client.getAccessToken();
    assert(token === token2);
    assert(expireTime === dingtalk.client.accessTokenExpireTime);
  });

  it('getJSApiTicket', function* () {
    const token = yield dingtalk.client.getJSApiTicket();
    const expireTime = dingtalk.client.jsapiTicketExpireTime;
    assert(token);
    assert(expireTime >= Date.now());

    const token2 = yield dingtalk.client.getJSApiTicket();
    assert(token === token2);
    assert(expireTime === dingtalk.client.jsapiTicketExpireTime);
  });

});
