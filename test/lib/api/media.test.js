'use strict';

const path = require('path');
const os = require('os');
const assert = require('power-assert');

const DingTalk = require('../../../lib/dingtalk');
const options = require('./../../fixtures/test.config');

describe('test/lib/api/media.test.js', () => {
  let dingtalk;

  before(function* () {
    dingtalk = new DingTalk(options);
  });

  it('upload', function* () {
    const result = yield dingtalk.media.upload('image', path.join(__dirname, '../../fixtures/dingtalk.png'));
    console.log('%j', result);
  });

  it('download', function* () {
    const result = yield dingtalk.media.upload('image', path.join(__dirname, '../../fixtures/dingtalk.png'));
    console.log('%j', result);

    const localPath = yield dingtalk.media.download(result.media_id, os.tmpdir());
    assert(path.basename(localPath).indexOf(result.media_id.substring(1)) !== -1);
    console.log(localPath);
  });

  it('download with special fileName', function* () {
    const result = yield dingtalk.media.upload('image', path.join(__dirname, '../../fixtures/dingtalk.png'));
    console.log('%j', result);

    const localPath = yield dingtalk.media.download(result.media_id, os.tmpdir(), 'test.png');
    assert(path.basename(localPath).indexOf('test.png') !== -1);
    console.log(localPath);
  });
});
