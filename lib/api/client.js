'use strict';

const assert = require('assert');
const Url = require('url');
const crypto = require('crypto');
const Agent = require('agentkeepalive');
const HttpsAgent = require('agentkeepalive').HttpsAgent;
const FormStream = require('formstream');
const urllib = require('urllib');
const URLLIB = Symbol('URLLIB');

/**
 * 鉴权 && 请求相关 API
 * @type {Client}
 */
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
    const requestParams = Object.assign({ dataType: 'json' }, this.options.requestOpts, params);
    const response = yield this.urllib.request(url, requestParams);
    const result = response.data;
    if (result) {
      const ignoreError = (params.data && params.data.ignoreError) || this.options.ignoreError;
      if (result.errcode !== 0 && !ignoreError) {
        const err = new Error(`${url} got error: ${JSON.stringify(result)}`);
        err.code = result.errcode;
        err.data = result;
        throw err;
      } else {
        return result;
      }
    } else {
      return response;
    }
  }

  /**
   * upload file
   * @param {String} url 请求地址
   * @param {Object} fileInfo 文件信息 { field, path }
   * @param {Object} [fields] 其他信息
   * @return {Object} 操作结果
   */
  * upload(url, fileInfo, fields) {
    assert(fileInfo.field, 'fileInfo.field required');
    assert(fileInfo.path, 'fileInfo.path required');

    const form = FormStream();
    if (fields) {
      for (const key of Object.keys(fields)) {
        form.field(key, fields[key]);
      }
    }
    form.file(fileInfo.field, fileInfo.path);

    return yield this.request(url, {
      method: 'POST',
      headers: form.headers(),
      stream: form,
    });
  }

  /**
   * send GET request to dingtalk
   * @param {String} api - api name, not need start with `/`
   * @param {Object} [data] - query object
   * @param {Object} [opts] - urllib opts
   * @return {Object} response.data
   */
  * get(api, data, opts) {
    assert(api, 'api path required');
    const accessToken = yield this.getAccessToken();
    const url = `${this.options.host}/${api}`;
    return yield this.request(url, Object.assign({
      data: Object.assign({ access_token: accessToken }, data),
    }, opts));
  }

  /**
   * send POST request to dingtalk
   * @param {String} api - api name, not need start with `/`
   * @param {Object} [data] - post body object
   * @param {Object} [opts] - urllib opts
   * @return {Object} response.data
   */
  * post(api, data, opts) {
    assert(api, 'api path required');
    const accessToken = yield this.getAccessToken();
    const url = `${this.options.host}/${api}?access_token=${accessToken}`;
    return yield this.request(url, Object.assign({
      method: 'POST',
      contentType: 'json',
      data,
    }, opts));
  }

  /**
   * 获取 AccessToken, 并在有效期内自动缓存
   * - gettoken
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
      this.accessToken = response.access_token;
      this.accessTokenExpireTime = Date.now() + this.options.accessTokenLifeTime;
    }
    return this.accessToken;
  }

  /**
   * 获取 jsapi_ticket, 并在有效期内自动缓存
   *  - get_jsapi_ticket
   * @return {String} jsapiTicket
   * @see https://open-doc.dingtalk.com/doc2/detail.htm?treeId=172&articleId=104966&docType=1
   */
  * getJSApiTicket() {
    if (!this.jsapiTicket || !this.jsapiTicketExpireTime || this.jsapiTicketExpireTime <= Date.now()) {
      const response = yield this.get('get_jsapi_ticket', { type: 'jsapi' });
      this.jsapiTicket = response.ticket;
      this.jsapiTicketExpireTime = Date.now() + Math.min(response.expires_in * 1000, this.options.jsapiTicketLifeTime);
    }
    return this.jsapiTicket;
  }

  /**
   * 对签名用的 url 做处理
   *  - 干掉 hash
   *  - query 参数需要做 url decode, 不能包含 %2F 等
   * @param {String} url 需转换的 url
   * @return {String} 转换后的 url
   * @private
   * @see https://open-doc.dingtalk.com/doc2/detail.htm?spm=a219a.7386797.0.0.WXYE3B&treeId=171&articleId=104934&docType=1
   */
  _normalizeUrl(url) {
    // url 处理, 干掉 hash, query 需做 url decode
    const originUrlObj = Url.parse(url, true);
    const queryStr = Object.keys(originUrlObj.query).reduce((result, key) => {
      const value = originUrlObj.query[key];
      result.push(`${key}=${(value)}`);
      return result;
    }, []).join('&');
    delete originUrlObj.hash;
    delete originUrlObj.query;
    delete originUrlObj.search;
    return Url.format(originUrlObj) + (queryStr ? '?' + queryStr : '');
  }

  /**
   * 获取 js api 接入时需要的配置数据
   * @param {String} url 当前页面的地址 (注意: egg 里面是 `this.href`)
   * @param {Object} [opts] 其他参数, 包括 noncestr, timestamp
   * @return {Object} 配置, 前端还需要单独配置 agentId 和 jsApiList
   * @see https://open-doc.dingtalk.com/doc2/detail.htm?spm=a219a.7386797.0.0.WXYE3B&treeId=171&articleId=104934&docType=1
   */
  * getJSApiConfig(url, opts) {
    const ticket = yield this.getJSApiTicket();

    const signObj = Object.assign({
      jsapi_ticket: ticket,
      noncestr: 'DingTalk#' + Date.now(),
      timestamp: Date.now(),
      url: this._normalizeUrl(url),
    }, opts);

    const signContent = Object.keys(signObj).sort().map(key => `${key}=${signObj[key]}`);
    const sha1 = crypto.createHash('sha1');
    sha1.update(signContent.join('&'), 'utf8');
    const signature = sha1.digest('hex');

    return {
      corpId: this.options.corpid,
      timeStamp: signObj.timestamp,
      nonceStr: signObj.noncestr,
      signature,
    };
  }
};
