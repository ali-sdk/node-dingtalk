import assert = require('assert');
import { Client } from './client';

/**
 * 企业消息相关 API
 * @type {Message}
 */
export class Message {
	client: Client;
	constructor(client: Client) {
		this.client = client;
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
	send(opts: {
		touser?: string;	// 员工id列表（消息接收者，多个接收者用|分隔）
		toparty?: string;	// 部门id列表，多个接收者用|分隔。touser或者toparty 二者有一个必填
		agentid: string;	// 企业应用id，这个值代表以哪个应用的名义发送消息
		msgtype: 'text' | 'image' | 'voice' | 'file' | 'link';
		text?: {
			content: string;
		};
		image?: {
			media_id: string;
		};
		voice?: {
			media_id: string;
			duration: number;
		};
		file?: {
			media_id: string;
		};
		link?: {
			messageUrl: string;
			picUrl: string;
			title: string;
			text: string;
		};
	}) {
		assert(opts.touser || opts.toparty, 'options touser or toparty required');
		assert(opts.msgtype, 'options.msgtype required');
		assert(opts.agentid, 'options.agentid required');
		assert(opts[opts.msgtype], `options.${opts.msgtype} required`);
		return this.client.post('message/send', opts) as Promise<{
			receiver: string;	// "UserID1|UserID2"
		} & Response>;
	}

	/**
	 * 获取企业会话消息已读未读状态
	 *  - message/list_message_status
	 *
	 * @param {String} messageId - 消息ID
	 * @return {Object} 消息状态 { read: [userid, ...], unread: [] }
	 */
	listMessageStatus(messageId: string) {
		assert(messageId, 'messageId required');
		return this.client.post('message/list_message_status', { messageId }) as Promise<{
			read: string[];
			unread: string[];
		} & Response>;
	}
}
