'use strict';

const assert = require('assert');

module.exports = class Message {
  constructor(client, options) {
    this.client = client;
    this.options = options;
  }

  /**
   * 发送企业消息
   *  - message/send
   *
   * @param {Object} opts - 消息内容 { touser, toparty, msgtype, ... }
   *  - touser {String} 目标用户, 多个用 | 分隔, 全部用 `@all`
   *  - toparty {String} 目标部门, 多个用 | 分隔
   *  - msgtype {String} 消息类型
   *  - text/image/voice/file/link/oa {Object} 对应的消息体
   * @return {Object} 操作结果 { messageId, ... }
   *
   * @see https://open-doc.dingtalk.com/doc2/detail.htm?treeId=172&articleId=104973&docType=1
   * @see https://open-doc.dingtalk.com/doc2/detail.htm?treeId=172&articleId=104972&docType=1
   */
  * send(opts) {
    assert(opts.touser || opts.toparty, 'options touser or toparty required');
    assert(opts.msgtype, 'options.msgtype required');
    assert(opts.agentid, 'options.agentid required');
    assert(opts[opts.msgtype], `options.${opts.msgtype} required`);
    return yield this.client.post('message/send', opts);
  }

  /**
   * 获取企业会话消息已读未读状态
   *  - message/list_message_status
   *
   * @param {String} messageId - 消息ID
   * @return {Object} 消息状态 { read: [userid, ...], unread: [] }
   */
  * listMessageStatus(messageId) {
    assert(messageId, 'messageId required');
    return yield this.client.post('message/list_message_status', { messageId });
  }
};
