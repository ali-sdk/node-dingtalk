'use strict';

const assert = require('assert');
const Url = require('url');
const crypto = require('crypto');

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

  /**
   * 获取 js api 接入时需要的配置数据
   * @param {String} url 当前页面的地址 (注意: egg 里面是 `this.href`)
   * @return {Object} 配置, 前端还需要单独配置 agentId 和 jsApiList
   * @see https://ddtalk.github.io/dingTalkDoc/#权限验证配置-beta
   */
  * getJSApiConfig(url) {
    const ticket = yield this.client.getJSApiTicket();

    const originUrlObj = Url.parse(url);
    delete originUrlObj.hash;

    const signObj = {
      jsapi_ticket: ticket,
      noncestr: 'DingTalk#' + Date.now(),
      timestamp: Date.now(),
      url: Url.format(originUrlObj),
    };

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

  /**
   * 根据 js 获取到的 code 获取用户信息
   * @param {String} code 调用 js 获得的 code
   * @param {Boolean} withDetail 是否获取用户详细信息
   * @return {Object} 用户信息
   * @see https://ddtalk.github.io/dingTalkDoc/#通过code换取用户身份
   */
  * getUserInfoByCode(code, withDetail) {
    const result = yield this.client.get('user/getuserinfo', { code });
    if (withDetail) {
      return yield this.getUser(result.userid);
    }
    return result;
  }

  * sendMessage(options) {
    assert(options.touser || options.toparty, 'touser or toparty required');
    assert(options.agentid, 'agentid required');
    assert(options.msgtype, 'msgtype required');
    return yield this.client.post('message/send', options);
  }

  * getTotalUserList(department_id) {
    let result = [];
    let hasMore = true;
    let offset = 0;
    while (hasMore) {
      const response = yield this.userList(department_id, { offset, size: 100 });
      const userList = response.userlist;
      hasMore = response.hasMore && userList.length;
      offset += userList.length;
      result = [].concat(userList || []);
    }
    return result;
  }

  * getAllUserList() {
    const userMap = new Map();
    const departmentList = yield this.department.list();
    for (const department of departmentList.department) {
      const userList = yield this.getTotalUserList(department.id);
      for (const user of userList) {
        userMap.set(user.userid, user);
      }
    }
    return Array.from(userMap.values());
  }
};
