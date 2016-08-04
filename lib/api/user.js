'use strict';

const assert = require('assert');
const parallel = require('co-parallel');

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
  * list(departmentId, isSimple, opts) {
    const api = isSimple ? 'user/simplelist' : 'user/list';
    return yield this.client.get(api, Object.assign({}, { department_id: departmentId }, opts));
  }

  /**
   * 获取部门的全部成员
   * @param {String} [departmentId] - 部门 ID, 为空则查询全部部门
   * @param {Boolean} [isSimple] - 是否只返回简单信息
   * @param {Object} [opts] - 其他扩展参数
   *  - concurrency {Number} 并发请求数, 默认为 5
   * @return {Object} 成员列表 { userlist: [], queryCount }
   */
  * listAll(departmentId, isSimple, opts) {
    let queryCount = 0;

    // find departmentId
    let departmentIdList;
    if (departmentId) {
      departmentIdList = [ departmentId ];
    } else {
      const departmentList = yield this.client.get('department/list');
      departmentIdList = departmentList.department.map(item => item.id);
      queryCount++;
    }

    // 并发请求
    const threads = departmentIdList.map(departmentId => {
      const self = this;
      return function* () {
        let queryCount = 0;
        let result = [];
        let hasMore = true;
        let offset = 0;
        while (hasMore) {
          queryCount++;
          const response = yield self.list(departmentId, isSimple, Object.assign({ size: 100 }, opts, { offset }));
          const userList = response.userlist || [];
          hasMore = response.hasMore && userList.length > 0;
          offset += userList.length;
          result = result.concat(userList);
        }
        return { queryCount, userList: result };
      };
    });

    const result = yield parallel(threads, opts.concurrency || 5);

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
  * get(id, opts) {
    const user = yield this.client.get('user/get', Object.assign({ userid: id, ignoreError: true }, opts));
    return user.errcode === 0 ? user : undefined;
  }

  /**
   * 创建成员
   *  - user/create
   * @param {Object} opts 成员信息, { name, mobile, userid, department, ... }
   * @return {Object} 操作结果 { userid }
   */
  * create(opts) {
    assert(opts.name, 'options.name required');
    assert(opts.mobile, 'options.mobile required');
    assert(opts.department, 'options.department required, Array<Number>');
    return yield this.client.post('user/create', opts);
  }

  /**
   * 更新成员
   *  - user/update
   * @param {Object} opts 成员信息 { name, userid, ... }
   * @return {Object} 操作结果
   */
  * update(opts) {
    assert(opts.userid, 'options.userid required');
    assert(opts.name, 'options.name required');
    return yield this.client.post('user/update', opts);
  }

  /**
   * 删除成员
   *  - user/delete
   *  - user/batchdelete
   * @param {String/Array} id - 成员 userid, 支持批量删除
   * @return {Object} 操作结果
   */
  * delete(id) {
    assert(id, 'user id required');
    if (Array.isArray(id)) {
      // 原子化, 一个失败则全部都不会删除
      return yield this.client.post('user/batchdelete', { useridlist: id });
    } else {
      return yield this.client.get('user/delete', { userid: id });
    }
  }

  /**
   * 根据 unionid 获取成员的 userid
   *  - user/getUseridByUnionid
   * @param {String} unionid - 即 user.openId
   * @return {Object} 返回 { userid }
   */
  * getUseridByUnionid(unionid) {
    return yield this.client.get('user/getUseridByUnionid', { unionid });
  }
};
