'use strict';

const assert = require('power-assert');

const DingTalk = require('../../../lib/dingtalk');
const options = require('./../../fixtures/test.config');

describe('test/lib/api/multi.test.js', () => {
  let dingtalk;
  const corpid1 = process.env.NODE_DINGTALK_TEST_CORPID || 'NODE_DINGTALK_TEST_CORPID';
  const corpsecret1 = process.env.NODE_DINGTALK_TEST_CORPSECRET || 'NODE_DINGTALK_TEST_CORPSECRET';
  const appid1 = process.env.NODE_DINGTALK_TEST_APPID || 'NODE_DINGTALK_TEST_APPID';
  const appsecret1 = process.env.NODE_DINGTALK_TEST_APPSECRET || 'NODE_DINGTALK_TEST_APPSECRET';

  const corpid2 = process.env.NODE_DINGTALK_TEST_CORPID2 || 'NODE_DINGTALK_TEST_CORPID2';
  const corpsecret2 = process.env.NODE_DINGTALK_TEST_CORPSECRET2 || 'NODE_DINGTALK_TEST_CORPSECRET2';
  const appid2 = process.env.NODE_DINGTALK_TEST_APPID2 || 'NODE_DINGTALK_TEST_APPID2';
  const appsecret2 = process.env.NODE_DINGTALK_TEST_APPSECRET2 || 'NODE_DINGTALK_TEST_APPSECRET2';

  before(function* () {
    dingtalk = new DingTalk(options);
  });

  it('getAccessToken from corp', function* () {
    const token = yield dingtalk.client.getAccessToken({
      corpid: corpid1,
      corpsecret: corpsecret1,
    });
    assert(token);

    const token2 = yield dingtalk.client.getAccessToken({
      corpid: corpid1,
      corpsecret: corpsecret1,
    });
    assert(token === token2);

    // other corp
    const token3 = yield dingtalk.client.getAccessToken({
      corpid: corpid2,
      corpsecret: corpsecret2,
    });
    assert(token !== token3);
  });

  it('getAccessToken from app', function* () {
    const token = yield dingtalk.client.getAccessToken({
      appid: appid1,
      appsecret: appsecret1,
    });
    assert(token);

    const token2 = yield dingtalk.client.getAccessToken({
      appid: appid1,
      appsecret: appsecret1,
    });
    assert(token === token2);

    // other corp
    const token3 = yield dingtalk.client.getAccessToken({
      appid: appid2,
      appsecret: appsecret2,
    });
    assert(token !== token3);
  });

  it('getQRConnectUrl', function* () {
    const url = yield dingtalk.client.getQRConnectUrl({
      redirect_uri: 'http://127.0.0.1:7001/auth/callback/dingding',
      appid: appid1,
    });
    assert(url.includes(appid1));
    const url1 = yield dingtalk.client.getQRConnectUrl({
      redirect_uri: 'http://127.0.0.1:7001/auth/callback/dingding',
      appid: appid1,
    });
    assert(url === url1);

    const url2 = yield dingtalk.client.getQRConnectUrl({
      redirect_uri: 'http://127.0.0.1:7001/auth/callback/dingding',
      appid: appid2,
    });
    assert(url2.includes(appid2));
  });

  it('getIframeQRGotoUrl', function* () {
    const url = yield dingtalk.client.getIframeQRGotoUrl({
      redirect_uri: 'http://127.0.0.1:7001/auth/callback/dingding',
      appid: appid1,
    });
    assert(url.includes(appid1));
    const url1 = yield dingtalk.client.getIframeQRGotoUrl({
      redirect_uri: 'http://127.0.0.1:7001/auth/callback/dingding',
      appid: appid1,
    });
    assert(url === url1);

    const url2 = yield dingtalk.client.getIframeQRGotoUrl({
      redirect_uri: 'http://127.0.0.1:7001/auth/callback/dingding',
      appid: appid2,
    });
    assert(url2.includes(appid2));
  });
});
