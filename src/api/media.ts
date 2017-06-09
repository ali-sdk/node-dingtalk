import assert = require('assert');
import { Client } from './client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 媒体相关 API
 * @see https://open-doc.dingtalk.com/doc2/detail.htm?articleId=104971&docType=1
 * @type {Media}
 */
export class Media {
	private client: Client;
	private host: string;
	constructor(client: Client, host: string) {
		this.client = client;
		this.host = host;
	}

	/**
	 * 上传媒体文件
	 *  - media/upload
	 * @param {String} type 媒体文件类型, image/voice/file
	 * @param {String} filePath 文件路径
	 * @return {Object} 操作结果, { media_id, type, created_at }
	 */
	async upload(type: 'image' | 'voice' | 'file', filePath: string) {
		assert(type, 'type required');
		assert(filePath, 'filePath required');

		const accessToken = await this.client.getAccessToken();
		const url = `${this.host}/media/upload?access_token=${accessToken}&type=${type}`;
		return await this.client.upload(url, { field: 'media', path: filePath }) as {
			media_id: string;
			type: 'image' | 'voice' | 'file';
			created_at: number;
		} & Response;
	}

	/**
	 * 获取媒体文件
	 * 注意: 资源不存在时, 钉钉返回的是 200 和 空内容, 而不是文档描述的 json
	 * 图片缩放参见: https://open-doc.dingtalk.com/doc2/detail.htm?treeId=176&articleId=104948&docType=1
	 * @param {String} id - 资源ID
	 * @return {String} 资源下载地址
	 */
	async get(id: string) {
		const response = await this.client.get('media/get', { media_id: id });
		if (response.status === 301 || response.status === 302) {
			return response.headers.get('location');
		}
	}

	/**
	 * 下载媒体文件
	 * @param {String} id - 资源ID
	 * @param {String} targetDir - 下载的目录, 目录必须存在.
	 * @param {String} [fileName] - 文件名, 为空时直接使用服务器上的文件名
	 * @return {String} 本地文件地址
	 */
	async download(id: string, targetDir: string, fileName?: string) {
		const url = await this.get(id) || '';
		const filePath = path.join(targetDir, fileName ? fileName : path.basename(url));
		if (url) {
			await this.client.get_urllib().request(url, {
				writeStream: fs.createWriteStream(filePath),
				timeout: 20000,
			});
			return filePath;
		}
	}
}
