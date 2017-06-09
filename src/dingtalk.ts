import { Client } from './api/client';
import { DepartmentHelper } from './api/department';
import { UserHelper } from './api/user';
import { Message } from './api/message';
import { Media } from './api/media';
import { Options } from './interfaces';
/**
 * 钉钉 SDK
 * @type {DingTalk}
 */
export class DingTalk {
	public media: Media;
	public message: Message;
	public user: UserHelper;
	public department: DepartmentHelper;
	private client: Client;
	constructor(options: Options) {
		options.host = options.host || 'https://oapi.dingtalk.com';
		this.client = new Client(options);
		this.department = new DepartmentHelper(this.client);
		this.user = new UserHelper(this.client);
		this.message = new Message(this.client);
		this.media = new Media(this.client, options.host);
	}
}

export default DingTalk;
