'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

/**
 * 媒体相关 API
 * @see https://open-doc.dingtalk.com/doc2/detail.htm?articleId=104971&docType=1
 * @type {Media}
 */
module.exports = class Media {
  constructor(client, options) {
    this.client = client;
    this.options = options;
  }

  /**
   * 上传媒体文件
   *  - media/upload
   * @param {String} type 媒体文件类型, image/voice/file
   * @param {String} filePath 文件路径
   * @return {Object} 操作结果, { media_id, type, created_at }
   */
  async upload(type, filePath) {
    assert(type, 'type required');
    assert(filePath, 'filePath required');

    const accessToken = await this.client.getAccessToken();
    const url = `${this.options.host}/media/upload?access_token=${accessToken}&type=${type}`;
    return this.client.upload(url, { field: 'media', path: filePath });
  }

  /**
   * 下载媒体文件
   * @param {String} id - 资源ID
   * @param {String} targetDir - 下载的目录, 目录必须存在.
   * @param {String} [fileName] - 文件名, 为空时直接使用服务器上的文件名
   * @return {String} 本地文件地址
   */
  async download(id, targetDir, fileName) {
    const accessToken = await this.client.getAccessToken();
    const filePath = path.join(targetDir, fileName || id);
    const url = `${this.options.host}/media/downloadFile?access_token=${accessToken}&media_id=${id}`;
    await this.client.urllib.request(url, {
      writeStream: fs.createWriteStream(filePath),
      timeout: 20000,
    });
    return filePath;
  }
};
