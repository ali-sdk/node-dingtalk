'use strict';

const assert = require('assert');
const Agent = require('agentkeepalive');
const HttpsAgent = require('agentkeepalive').HttpsAgent;
const urllib = require('urllib');
const URLLIB = Symbol('URLLIB');

module.exports = class Client {
  constructor(options) {
    assert(options.corpid, 'options.corpid required');
    assert(options.corpsecret, 'options.corpsecret required');
    assert(options.host, 'options.host required');

    this.options = Object.assign({
      accessTokenLifeTime: (7200 - 1000) * 1000,
      jsapiTicketLifeTime: (7200 - 1000) * 1000,
    }, options);

    this.accessToken = undefined;
    this.accessTokenExpireTime = undefined;
    this.jsapiTicket = undefined;
    this.jsapiTicketExpireTime = undefined;
  }

  /**
   * 返回 option.urlib 实例或者根据配置初始化一个
   * @return {Object} urlib 实例
   * @see https://www.npmjs.com/package/urllib
   */
  get urllib() {
    if (!this[URLLIB]) {
      // 直接传递 urllib 实例
      if (this.options.urllib && this.options.urllib.request) {
        this[URLLIB] = this.options.urllib;
      } else {
        // urllib 配置
        const opts = Object.assign({
          keepAlive: true,
          keepAliveTimeout: 30000,
          timeout: 30000,
          maxSockets: Infinity,
          maxFreeSockets: 256,
        }, this.options.urllib);

        this[URLLIB] = urllib.create({
          agent: new Agent(opts),
          httpsAgent: new HttpsAgent(opts),
        });
      }
    }
    return this[URLLIB];
  }

  /**
   * send http request
   * @param {String} url 请求地址
   * @param {Object} [params] 请求参数
   * @return {Object} 返回结果的 data
   * @private
   */
  * request(url, params) {
    const requestParams = Object.assign({ dataType: 'json' }, params);
    const response = yield this.urllib.request(url, requestParams);
    const result = response.data;

    if (result.errcode !== 0 && !params.data.ignoreError && !this.options.ignoreError) {
      throw Error(`${url} got error: ${JSON.stringify(result)}`);
    } else {
      return result;
    }
  }

  /**
   * send GET request to dingtalk
   * @param {String} api - api name, not need start with `/`
   * @param {Object} [data] - query object
   * @return {Object} response.data
   */
  * get(api, data) {
    assert(api, 'api path required');
    const accessToken = yield this.getAccessToken();
    const url = `${this.options.host}/${api}`;
    return yield this.request(url, {
      data: Object.assign({ access_token: accessToken }, data),
    });
  }

  /**
   * send POST request to dingtalk
   * @param {String} api - api name, not need start with `/`
   * @param {Object} [data] - post body object
   * @return {Object} response.data
   */
  * post(api, data) {
    assert(api, 'api path required');
    const accessToken = yield this.getAccessToken();
    const url = `${this.options.host}/${api}?access_token=${accessToken}`;
    return yield this.request(url, {
      method: 'POST',
      contentType: 'json',
      dataType: 'json',
      data,
    });
  }

  /**
   * 获取 AccessToken, 并在有效期内自动缓存
   * @return {String} accessToken
   */
  * getAccessToken() {
    if (!this.accessToken || !this.accessTokenExpireTime || this.accessTokenExpireTime <= Date.now()) {
      const url = `${this.options.host}/gettoken`;
      const response = yield this.request(url, {
        data: {
          corpid: this.options.corpid,
          corpsecret: this.options.corpsecret,
        },
      });
      // TODO: check error
      this.accessToken = response.access_token;
      this.accessTokenExpireTime = Date.now() + this.options.accessTokenLifeTime;
    }
    return this.accessToken;
  }

  /**
   * 获取 jsapi_ticket, 并在有效期内自动缓存
   * @see https://ddtalk.github.io/dingTalkDoc/#获取jsapi_ticket
   * @return {String} jsapiTicket
   */
  * getJSApiTicket() {
    if (!this.jsapiTicket || !this.jsapiTicketExpireTime || this.jsapiTicketExpireTime <= Date.now()) {
      const response = yield this.get('get_jsapi_ticket', { type: 'jsapi' });
      this.jsapiTicket = response.ticket;
      this.jsapiTicketExpireTime = Date.now() + Math.min(response.expires_in * 1000, this.options.jsapiTicketLifeTime);
    }
    return this.jsapiTicket;
  }
};
