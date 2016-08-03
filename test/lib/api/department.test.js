'use strict';

const assert = require('power-assert');
const urllib = require('urllib');

const DingTalk = require('../../../lib/dingtalk');
const options = require('./../../fixtures/test.config.json');

describe('test/lib/api/department.test.js', () => {
  let dingtalk;

  before(function* () {
    dingtalk = new DingTalk(Object.assign(options, { urllib }));
  });

  function* createDepartment() {
    const name = 'department-test';
    yield dingtalk.department.create({ parentid: 1, name });
    const result = yield dingtalk.department.list();
    return result.department.find(item => item.name === name);
  }

  it('list', function* () {
    const result = yield dingtalk.department.list();
    console.log('%j', result);
    assert(result.department.length > 0);
  });

  it('create', function* () {
    const name = 'department-test';
    const department = yield dingtalk.department.create({
      parentid: 1,
      name,
    });
    assert(department.id || department.errcode === 60008);
    console.log('%j', department);

    const result = yield dingtalk.department.delete(department.id);
    console.log('%j', result);
  });

  it('get', function* () {
    const department = yield dingtalk.department.get('1');
    assert(department.id);
  });

  it('update', function* () {
    let department = yield createDepartment();

    const name = department.name + '-test';
    const result = yield dingtalk.department.update({
      id: department.id,
      name,
    });
    assert(result.errcode === 0);
    console.log('%j', result);

    department = yield dingtalk.department.get(department.id);
    assert(department.name === name);
    yield dingtalk.department.delete(department.id);
  });

  it('delete', function* () {
    const department = yield createDepartment();
    assert(department);
    console.log('%j', department);

    let result = yield dingtalk.department.delete(department.id);
    assert(result.errcode === 0);
    console.log('%j', result);

    result = yield dingtalk.department.get(department.id);
    assert(result.errcode === 60003);
  });
});
