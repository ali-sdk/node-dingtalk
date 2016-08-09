'use strict';

const assert = require('assert');

/**
 * 部门相关 API
 * @type {Department}
 */
module.exports = class Department {
  constructor(client, options) {
    this.client = client;
    this.options = options;
  }

  /**
   * 获取部门列表
   *  - department/list
   * @param {Object} [opts] - 其他参数
   * @return {Object} 部门列表 { department: [] }
   */
  * list(opts) {
    return yield this.client.get('department/list', opts);
  }

  /**
   * 获取部门详情
   *  - department/get
   * @param {String} id 部门ID
   * @param {Object} [opts] - 其他参数
   * @return {Object} 部门信息, 不存在时返回 undefined
   */
  * get(id, opts) {
    assert(id, 'department id required');
    try {
      return yield this.client.get('department/get', Object.assign({ id }, opts));
    } catch (err) {
      return undefined;
    }
  }

  /**
   * 创建部门
   *  - department/create
   * @param {Object} opts 部门信息, { name, parentId, ... }
   * @return {Object} 操作结果, { id }
   */
  * create(opts) {
    assert(opts.name, 'options.name required');
    assert(opts.parentid, 'options.parentid required, root is 1');
    return yield this.client.post('department/create', opts);
  }

  /**
   * 更新部门
   *  - department/update
   * @param {Object} opts 部门信息, { id, ... }
   * @return {Object} 操作结果
   */
  * update(opts) {
    assert(opts.id, 'options.id required');
    return yield this.client.post('department/update', opts);
  }

  /**
   * 删除部门
   *  - department/delete
   * @param {String} id 部门ID
   * @return {Object} 操作结果
   */
  * delete(id) {
    assert(id, 'department id required');
    return yield this.client.get('department/delete', { id });
  }
};
