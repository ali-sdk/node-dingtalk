'use strict';

const assert = require('power-assert');
const mm = require('mm');
const urllib = require('urllib');

const DingTalk = require('../../../lib/dingtalk');
const options = require('./../../fixtures/test.config');


describe('test/lib/api/client.test.js', () => {
  let dingtalk;

  before(function* () {
    dingtalk = new DingTalk(options);
  });

  afterEach(mm.restore);

  it('getAccessToken', function* () {
    const token = yield dingtalk.client.getAccessToken();
    assert(token);

    const token2 = yield dingtalk.client.getAccessToken();
    assert(token === token2);
  });

  it('getJSApiTicket', function* () {
    const token = yield dingtalk.client.getJSApiTicket();
    assert(token);

    const token2 = yield dingtalk.client.getJSApiTicket();
    assert(token === token2);
  });

  it('normalizeUrl', () => {
    const mapping = [
      {
        src: 'http://localhost:5000/test',
        target: 'http://localhost:5000/test',
      },
      {
        src: 'http://localhost:5000/test#top',
        target: 'http://localhost:5000/test',
      },
      {
        src: 'http://localhost:5000/test?url=http%3A%2F%2Fabc.com%2Fsomewhere#top',
        target: 'http://localhost:5000/test?url=http://abc.com/somewhere',
      },
      {
        src: 'http://localhost:5000/test?a=b&url=http%3A%2F%2Fabc.com%2Fsomewhere#top',
        target: 'http://localhost:5000/test?a=b&url=http://abc.com/somewhere',
      },
    ];
    for (const item of mapping) {
      assert(dingtalk.client._normalizeUrl(item.src) === item.target);
    }
  });

  it('getJSApiConfig', function* () {
    const opts = {
      jsapi_ticket: 'HerLBdXanXEE9D78HR1IutOlhOXkFWMKZThJ5bX35HSJA5s8jZUaKWQT7rauior2qyqLMehYaoA9iCemhUBVDD',
      noncestr: 'DingTalk#1470295596107',
      timestamp: 1470295596107,
    };
    const cfg = yield dingtalk.client.getJSApiConfig('http://localhost:5000/?url=http%3A%2F%2Fabc.com%2Fsomewhere#top', opts);
    assert(cfg.corpId === options.corpid);
    assert(cfg.timeStamp === opts.timestamp);
    assert(cfg.nonceStr === opts.noncestr);
    assert(cfg.signature === 'd392648b027b8f6ce13dc89db8b1a86c94764fae');
  });

  it('getQRConnectUrl', function* () {
    const url = yield dingtalk.client.getQRConnectUrl({
      redirect_uri: 'http://127.0.0.1:7001/auth/callback/dingding',
    });
    console.log(url);
    assert(url);

    const url2 = yield dingtalk.client.getQRConnectUrl({
      redirect_uri: 'http://127.0.0.1:7001/auth/callback/dingding',
    });
    assert(url2 === url);
  });

  it('should proxy work', function* () {
    const proxyOptions = Object.assign({ proxy: 'http://127.0.0.1:7002', urllib }, options);
    mm(urllib, 'request', function* (url, params) {
      assert(url === 'http://127.0.0.1:7002/foo/bar');
      assert(params.headers.host === 'oapi.dingtalk.com');
      return {
        data: { errcode: 0 },
      };
    });
    dingtalk = new DingTalk(proxyOptions);
    const res = yield dingtalk.client.request(proxyOptions.host + '/foo/bar');
    assert(res);
  });
});
