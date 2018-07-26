'use strict';
const assert = require('assert');

/**
 * 外部联系人 API
 * https://open-doc.dingtalk.com/microapp/serverapi2/nb93oa
 * @type {Extcontact}
 */
module.exports = class Extcontact {
  constructor(client, options) {
    this.client = client;
    this.options = options;
  }

  /**
   * 获取外部联系人列表
   * @param {Object} [params] - 业务参数
   * @param {Object} [opts] - 扩展参数
   *  {
        "offset": {Number} 偏移
        "size": {Number} 分页大小
      }
   * @return {Array} 结果
    [
      {
        address: '',
        follower_user_id: '241817752991',
        label_ids: [ 273263332 ],
        mobile: '13434343434',
        name: '小明',
        share_dept_ids: [],
        share_user_ids: [ '2711051171134' ],
        state_code: '86',
        title: '',
        userid: '32213414653820'
      },
    ]
   */
  async list(params = {}, opts) {
    params = Object.assign({
      offset: 0,
      size: 20,
    }, params);

    const res = await this.client.get('topapi/extcontact/list', params, opts);
    return res.results;
  }

  /**
   * 获取全部外部联系人列表
   * @param {Object} [opts] - 扩展参数
   * @return {Array} 结果
   * 参数同 list()
   */
  async listAll(opts) {
    let page = 0;
    let count = 0;
    let all = [];
    const params = {
      offset: 0,
      size: 100,
    };

    do {
      params.offset = params.offset + (100 * page);
      const users = await this.list(params, opts);
      count = users.length;
      page += 1;
      all = all.concat(users);
    } while (count === 100);

    return all;
  }

  /**
   * 添加外部联系人
   * @param {Object} [params] - 联系人信息，必须参数包括：
   * @param {Object} [opts] - 扩展参数
   * {
        follower_user_id: '241817752991',
        label_ids: [ 273263332 ],
        mobile: '13434343434',
        name: '小明',
      },
   * @return {Object} 结果
   * {
   *    errcode: 0,
   *    userid: '1234123434',
   *    request_id: 'iuahwe7f2329f3h2',
   * }
   */
  async create(params, opts) {
    assert(params.name, 'params.name required');
    assert(params.mobile, 'params.mobile required');
    assert(params.label_ids, 'params.label_ids required Array<Number>');
    assert(params.follower_user_id, 'params.follower_user_id required');

    params = Object.assign({ state_code: '86' }, params);

    return this.client.post('topapi/extcontact/create', { contact: params }, opts);
  }

  /**
   * 更新外部联系人
   * @param {Object} [params] - 联系人信息，必须参数包括：
   * @param {Object} [opts] - 扩展参数
   * {
        user_id: '123420013632',
        follower_user_id: '241817752991',
        label_ids: [ 273263332 ],
        name: '小明',
      },
   * @return {Object} 结果
   * {
   *    errcode: 0,
   *    request_id: 'iuahwe7f2329f3h2',
   * }
   */
  async update(params, opts) {
    // Tips: 目前接口使用的是 user_id 和 userid 未统一名称
    assert(params.user_id, 'params.user_id required');
    assert(params.name, 'params.name required');
    assert(params.label_ids, 'params.label_ids required Array<Number>');
    assert(params.follower_user_id, 'params.follower_user_id required');

    return this.client.post('topapi/extcontact/update', { contact: params }, opts);
  }

  /**
   * 获取外部联系人信息
   * @param {Object} [userid] - 联系人userid，必须
   * @param {Object} [opts] - 扩展参数
   * @return {Object} 结果
      {
        address: '',
        follower_user_id: '241817752991',
        label_ids: [ 273263332 ],
        mobile: '13434343434',
        name: '小明',
        share_dept_ids: [],
        share_user_ids: [ '2711051171134' ],
        state_code: '86',
        title: '',
        userid: '32213414653820'
      },
   */
  async get(userid, opts) {
    assert(userid, 'user_id required');
    // Tips: 目前接口使用的是 user_id 和 userid 未统一名称
    const res = await this.client.get('topapi/extcontact/get', { user_id: userid }, opts);
    return res.result;
  }

  /**
   * 删除外部联系人
   * @param {Object} [userid] - 联系人userid，必须
   * @param {Object} [opts] - 扩展参数
   * @return {Object} 结果
   * {
   *    errcode: 0,
   *    request_id: 'iuahwe7f2329f3h2',
   * }
   */
  async delete(userid, opts) {
    assert(userid, 'user_id required');
    // Tips: 目前接口使用的是 user_id 和 userid 未统一名称
    return this.client.post('topapi/extcontact/delete', { user_id: userid }, opts);
  }

  /**
   * 获取外部联系人标签列表
   * @param {Object} [params] - 业务参数
   * @param {Object} [opts] - 扩展参数
   * {
      "offset": {Number} 偏移
      "size": {Number} 分页大小
    }
   * @return {Array} 结果
    [
      {
        "name": "类型",
        "color": -15220075,
        "labels":[
          {
            "name":"客户",
            "id":1026002
          }
        ]
      },
    ]
   */
  async listlabelgroups(params = {}, opts) {
    params = Object.assign({
      offset: 0,
      size: 20,
    }, params);

    const res = await this.client.get('topapi/extcontact/listlabelgroups', params, opts);
    return res.results;
  }
};
