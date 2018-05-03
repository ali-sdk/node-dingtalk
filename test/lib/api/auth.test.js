'use strict';

const assert = require('power-assert');

const DingTalk = require('../../../lib/dingtalk');
const options = require('./../../fixtures/test.config');

describe('test/lib/api/auth.test.js', () => {
  let dingtalk;

  before(function* () {
    dingtalk = new DingTalk(options);
  });

  it('scopes', function* () {
    const result = yield dingtalk.auth.scopes();
    assert(result.errcode === 0);
    assert(result.auth_org_scopes);
    assert(result.auth_org_scopes.authed_dept.length > 0);
  });

});
