'use strict';

const path = require('path');
const assert = require('power-assert');

const DingTalk = require('../../../lib/dingtalk');
const options = require('./../../fixtures/test.config.json');

describe('test/lib/api/media.test.js', () => {
  let dingtalk;

  before(function* () {
    dingtalk = new DingTalk(options);
  });

  it('upload', function* () {
    const result = yield dingtalk.media.upload('image', path.join(__dirname, '../../fixtures/dingtalk.png'));
    console.log('%j', result);
  });
});
