'use strict';

const assert = require('assert');
const Url = require('url');
const crypto = require('crypto');
const Agent = require('agentkeepalive');
const HttpsAgent = require('agentkeepalive').HttpsAgent;
const FormStream = require('formstream');
const urllib = require('urllib');
const utility = require('utility');
const is = require('is-type-of');

const URLLIB = Symbol('URLLIB');
const CACHE = Symbol('CACHE');
const LRU = Symbol('LRU');

/**
 * 鉴权 && 请求相关 API
 * @type {Client}
 */
module.exports = class Client {
  /**
   * Client 构造函数
   * @param {Object} options 配置参数
   *  - {String} corpid - 企业ID
   *  - {String} corpsecret - 企业秘钥
   *  - {String} host - 钉钉服务接口地址
   *  - {Object} [requestOpts] - urllib 默认请求参数
   * @constructor
   */
  constructor(options) {
    assert(options.corpid, 'options.corpid required');
    assert(options.corpsecret, 'options.corpsecret required');
    assert(options.host, 'options.host required');

    this.options = Object.assign({
      accessTokenLifeTime: (7200 - 1000) * 1000,
      jsapiTicketLifeTime: (7200 - 1000) * 1000,
    }, options);
  }

  /**
   * 返回 options.cache 实例或者初始化一个
   * @return {Object} cache 实例
   */
  get cache() {
    if (!this[CACHE]) {
      if (this.options.cache) {
        this[CACHE] = this.options.cache;
      } else {
        if (!this[LRU]) {
          this[LRU] = {};
        }
        const LRU_CACHE = this[LRU];
        this[CACHE] = {
          get(key) {
            if (LRU_CACHE[key] && (LRU_CACHE[key].expired > Date.now())) {
              return LRU_CACHE[key].value;
            }
            return null;
          },
          set(key, value, maxAge) {
            const obj = {
              expired: maxAge,
              value,
            };
            LRU_CACHE[key] = obj;
            return obj;
          },
        };
      }
    }
    return this[CACHE];
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
   * callFn
   * @param {Function} fn 函数名
   * @param {Array} args 函数参数
   * @param {Object} self 函数的上下文
   * @see https://github.com/eggjs/egg-core/blob/11be6705d20cc104ab44cc2a521f97b84313d38a/lib/utils/index.js#L39
   * @return {Object} 函数的返回值
   */
  * callFn(fn, args, self) {
    args = args || [];
    if (!is.function(fn)) return;
    if (is.generatorFunction(fn)) {
      return yield fn.apply(self, args);
    }
    const r = fn.apply(self, args);
    if (is.promise(r)) {
      return yield r;
    }
    return r;
  }

  /**
   * send http request
   * @param {String} url 请求地址
   * @param {Object} [params] 请求参数
   * @return {Object} 返回结果的 data
   */
  * request(url, params) {
    const requestParams = Object.assign({ dataType: 'json' }, this.options.requestOpts, params);
    const response = yield this.urllib.request(url, requestParams);
    const result = response.data;
    if (result) {
      if (result.errcode !== 0) {
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
    let accessToken = opts && opts.accessToken;
    if (!accessToken) {
      accessToken = yield this.getAccessToken();
    }
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
    let accessToken = opts && opts.accessToken;
    if (!accessToken) {
      accessToken = yield this.getAccessToken();
    }
    const url = `${this.options.host}/${api}?access_token=${accessToken}`;
    return yield this.request(url, Object.assign({
      method: 'POST',
      contentType: 'json',
      data,
    }, opts));
  }

  /**
   * 获取网站应用钉钉扫码登录 URL，用于网站本身偷懒不想单独做一个登录页面的情况
   * https://open-doc.dingtalk.com/docs/doc.htm?treeId=168&articleId=104882&docType=1
   * @param {Object} [query] - qrconnect url params
   * @param {String} [query.appid] - 钉钉应用 id
   * @param {String} [query.redirect_uri] - 登录成功后的回跳 URL，必须跟钉钉应用后台配置的一致
   * @return {String} qrconnect url
   */
  * getQRConnectUrl(query) {
    const params = Object.assign({
      response_type: 'code',
      scope: 'snsapi_login',
      state: 'STATE',
      appid: this.options.appid, // 必填
      redirect_uri: this.options.redirect_uri, // 必填
    }, query);
    const url = new Url.URL(`${this.options.host}/connect/qrconnect`);
    for (const key in params) {
      url.searchParams.set(key, params[key]);
    }
    return url.toString();
  }

  /**
   * 获取 iframe 形式内嵌二维码的登录 goto
   * https://open-doc.dingtalk.com/docs/doc.htm?treeId=168&articleId=104882&docType=1
   * @param {Object} [query] - qrconnect url params
   * @param {String} [query.appid] - 钉钉应用 id
   * @param {String} [query.redirect_uri] - 登录成功后的回跳 URL，必须跟钉钉应用后台配置的一致
   * @return {String} qrconnect url
   */
  * getIframeQRGotoUrl(query) {
    const params = Object.assign({
      response_type: 'code',
      scope: 'snsapi_login',
      state: 'STATE',
      appid: this.options.appid, // 必填
      redirect_uri: this.options.redirect_uri, // 必填
    }, query);
    const url = new Url.URL(`${this.options.host}/connect/oauth2/sns_authorize`);
    for (const key in params) {
      url.searchParams.set(key, params[key]);
    }
    return url.toString();
  }

  /**
   * 获取 iframe goto 成功后的最终跳转验证 URL
   * https://open-doc.dingtalk.com/docs/doc.htm?treeId=168&articleId=104882&docType=1
   * @param {Object} query - qrconnect url params
   * @param {String} query.loginTmpCode - 一次性临时登录验证 code
   * @param {String} [query.appid] - 钉钉应用 id
   * @param {String} [query.redirect_uri] - 登录成功后的回跳 URL，必须跟钉钉应用后台配置的一致
   * @return {String} qrconnect url
   */
  * getSnsAuthorizeUrl(query) {
    assert(query && query.loginTmpCode, 'loginTmpCode required');
    const params = Object.assign({
      response_type: 'code',
      scope: 'snsapi_login',
      state: 'STATE',
      appid: this.options.appid, // 必填
      redirect_uri: this.options.redirect_uri, // 必填
    }, query);
    const url = new Url.URL(`${this.options.host}/connect/oauth2/sns_authorize`);
    for (const key in params) {
      url.searchParams.set(key, params[key]);
    }
    return url.toString();
  }

  * getPersistentCode(accessToken, tmpAuthCode) {
    // accessToken 必须是 appid 获取的 accessToken
    const data = {
      tmp_auth_code: tmpAuthCode,
    };
    return yield this.post('sns/get_persistent_code', data, { accessToken });
  }

  * getSnsToken(accessToken, openid, persistentCode) {
    // accessToken 必须是 appid 获取的 accessToken
    const data = {
      openid,
      persistent_code: persistentCode,
    };
    return yield this.post('sns/get_sns_token', data, { accessToken });
  }

  * getSnsUserInfo(accessToken, snsToken) {
    // accessToken 必须是 appid 获取的 accessToken
    const data = {
      sns_token: snsToken,
    };
    return yield this.get('sns/getuserinfo', data, { accessToken });
  }

  * getUserInfo(accessToken, userid) {
    return yield this.get('user/get', { userid }, { accessToken });
  }

  /**
   * 获取 AccessToken, 并在有效期内自动缓存
   * - gettoken
   * @param {Object} [options] - 可以通过 appid 获取，也可以通过 corpid 获取
   * @return {String} accessToken
   */
  * getAccessToken(options) {
    options = options || {};
    const appid = options.appid;
    const appsecret = options.appsecret;
    const corpid = options.corpid || this.options.corpid;
    const corpsecret = options.corpsecret || this.options.corpsecret;
    const cacheKey = 'accessToken_' + utility.md5(appid ? `${appid}|${appsecret}` : `${corpid}|${corpsecret}`);
    let accessToken = yield this.callFn(this.cache.get, [ cacheKey ], this.cache);
    if (!accessToken) {
      let url;
      let data;
      if (appid) {
        url = `${this.options.host}/sns/gettoken`;
        data = { appid, appsecret };
      } else {
        url = `${this.options.host}/gettoken`;
        data = { corpid, corpsecret };
      }
      const response = yield this.request(url, { data });
      const accessTokenExpireTime = Date.now() + this.options.accessTokenLifeTime;
      accessToken = response.access_token;
      yield this.cache.set(cacheKey, accessToken, accessTokenExpireTime);
      return accessToken;
    }
    return accessToken;
  }

  * getAppAccessToken() {
    return yield this.getAccessToken({
      appid: this.options.appid,
      appsecret: this.options.appsecret,
    });
  }

  * getCorpAccessToken() {
    return yield this.getAccessToken({
      corpid: this.options.corpid,
      corpsecret: this.options.corpsecret,
    });
  }

  /**
   * 获取 jsapi_ticket, 并在有效期内自动缓存
   *  - get_jsapi_ticket
   * @return {String} jsapiTicket
   * @see https://open-doc.dingtalk.com/doc2/detail.htm?treeId=172&articleId=104966&docType=1
   */
  * getJSApiTicket() {
    let jsapiTicket = yield this.callFn(this.cache.get, [ 'jsapiTicket' ], this.cache);
    if (!jsapiTicket) {
      const response = yield this.get('get_jsapi_ticket', { type: 'jsapi' });
      const jsapiTicketExpireTime = Date.now() + Math.min(response.expires_in * 1000, this.options.jsapiTicketLifeTime);
      jsapiTicket = response.ticket;
      yield this.cache.set('jsapiTicket', jsapiTicket, jsapiTicketExpireTime);
      return jsapiTicket;
    }
    return jsapiTicket;
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
