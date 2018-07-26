'use strict';

const assert = require('assert');
const pall = require('p-all');

/**
 * 成员相关 API
 * @type {User}
 */
module.exports = class User {
  constructor(client, options) {
    this.client = client;
    this.options = options;
  }

  /**
   * 获取部门的成员, 分页
   *   - user/simplelist
   *   - user/list
   * @param {String} departmentId - 部门 ID
   * @param {Boolean} [isSimple] - 是否只返回简单信息
   * @param {Object} [opts] - 其他扩展参数
   * @return {Array} 成员列表 { userlist: [] }
   */
  async list(departmentId, isSimple, opts) {
    const api = isSimple ? 'user/simplelist' : 'user/list';
    return this.client.get(api, Object.assign({}, { department_id: departmentId }, opts));
  }

  /**
   * 获取部门的全部成员
   * @param {String} [departmentId] - 部门 ID, 为空则查询全部部门
   * @param {Boolean} [isSimple] - 是否只返回简单信息
   * @param {Object} [opts] - 其他扩展参数
   *  - concurrency {Number} 并发请求数, 默认为 5
   * @return {Object} 成员列表 { userlist: [], queryCount }
   */
  async listAll(departmentId, isSimple, opts) {
    opts = opts || {};
    let queryCount = 0;

    // find departmentId
    let departmentIdList;
    if (departmentId) {
      departmentIdList = [ departmentId ];
    } else {
      const departmentList = await this.client.get('department/list');
      departmentIdList = departmentList.department.map(item => item.id);
      queryCount++;
    }

    // 并发请求
    const threads = departmentIdList.map(departmentId => {
      const self = this;
      return async function() {
        let queryCount = 0;
        let result = [];
        let hasMore = true;
        let offset = 0;
        while (hasMore) {
          queryCount++;
          const response = await self.list(departmentId, isSimple, Object.assign({ size: 100 }, opts, { offset }));
          const userList = response.userlist || [];
          hasMore = response.hasMore && userList.length > 0;
          offset += userList.length;
          result = result.concat(userList);
        }
        return { queryCount, userList: result };
      };
    });

    const result = await pall(threads, { concurrency: opts.concurrency || 5 });

    // 去重
    const userMap = result.reduce((userMap, item) => {
      queryCount += item.queryCount;
      for (const user of item.userList) {
        userMap.set(user.userid, user);
      }
      return userMap;
    }, new Map());

    return {
      errcode: 0,
      errmsg: 'ok',
      queryCount,
      userlist: Array.from(userMap.values()),
    };
  }

  /**
   * 获取成员详情
   *  - user/get
   * @param {String} id - 成员 userid
   * @param {Object} [opts] - 其他扩展参数
   * @return {Object} 成员信息, 不存在时返回 undefined
   */
  async get(id, opts) {
    try {
      return await this.client.get('user/get', Object.assign({ userid: id }, opts));
    } catch (err) {
      return undefined;
    }
  }

  /**
   * 创建成员
   *  - user/create
   * @param {Object} opts 成员信息, { name, mobile, userid, department, ... }
   * @return {Object} 操作结果 { userid }
   */
  async create(opts) {
    assert(opts.name, 'options.name required');
    assert(opts.mobile, 'options.mobile required');
    assert(opts.department, 'options.department required, Array<Number>');
    return this.client.post('user/create', opts);
  }

  /**
   * 更新成员
   *  - user/update
   * @param {Object} opts 成员信息 { name, userid, ... }
   * @return {Object} 操作结果
   */
  async update(opts) {
    assert(opts.userid, 'options.userid required');
    assert(opts.name, 'options.name required');
    return this.client.post('user/update', opts);
  }

  /**
   * 删除成员
   *  - user/delete
   *  - user/batchdelete
   * @param {String/Array} id - 成员 userid, 支持批量删除
   * @return {Object} 操作结果
   */
  async delete(id) {
    assert(id, 'user id required');
    if (Array.isArray(id)) {
      // 原子化, 一个失败则全部都不会删除
      return this.client.post('user/batchdelete', { useridlist: id });
    } else {
      return this.client.get('user/delete', { userid: id });
    }
  }

  /**
   * 根据 unionid 获取成员的 userid
   *  - user/getUseridByUnionid
   * @param {String} unionid - 即 user.openId
   * @return {Object} 返回 { userid }
   */
  async getUseridByUnionid(unionid) {
    return this.client.get('user/getUseridByUnionid', { unionid });
  }

  /**
   * 免登服务, 通过CODE换取用户身份 user/getuserinfo
   * @param {String} code - 调用 js 获得的 code
   * @return {Object} 成员信息 { userid, deviceId, ... }
   * @see https://open-doc.dingtalk.com/doc2/detail.htm?treeId=172&articleId=104969&docType=1
   */
  async getUserInfoByCode(code) {
    return this.client.get('user/getuserinfo', { code });
  }

  /**
   * 根据手机号获取成员 userid
   * @param {String} mobile 手机号
   * @return {Object} 成员信息 { userid }
   * @see https://open-doc.dingtalk.com/doc2/detail.htm?treeId=172&articleId=105418&docType=1
   */
  async getByMobile(mobile) {
    return this.client.get('user/get_by_mobile', { mobile });
  }
};
