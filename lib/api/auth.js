'use strict';

/**
 * 授权相关 API
 * @type {Auth}
 */
module.exports = class Auth {
  constructor(client, options) {
    this.client = client;
    this.options = options;
  }

  /**
   * 获取授权部门
   *  - auth/scopes
   * @param {Object} [opts] - 其他参数
   * @return {Object} 授权结果
    {
      "errcode": 0,
      "errmsg": "created",
      "auth_user_field": ["name","email"],
      "condition_field":["contact_call"],
      "auth_org_scopes":{
        "authed_dept":[1,2,3],
        "authed_user":["user1","user"],
      }
    }
   */
  async scopes(opts) {
    return this.client.get('auth/scopes', opts);
  }
};
