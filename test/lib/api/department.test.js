'use strict';

const assert = require('power-assert');

const DingTalk = require('../../../lib/dingtalk');
const options = require('./../../fixtures/test.config');

describe('test/lib/api/department.test.js', () => {
  let dingtalk;

  before(function* () {
    dingtalk = new DingTalk(options);
  });

  /**
   * createDepartment
   * @see https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7386797.0.0.JrgnK8&source=search&treeId=371&articleId=106817&docType=1#s2
   * @return {Object} 部门
   **/
  function* createDepartment() {
    const name = 'department_test_' + Date.now();
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
    const name = 'department_test_' + Date.now();
    const department = yield dingtalk.department.create({
      parentid: 1,
      name,
    });
    assert(department.id);
    console.log('%j', department);

    yield dingtalk.department.delete(department.id);
  });

  it('listSubDepartmentIds', function* () {
    const name = 'department_listSubDepartmentIds_' + Date.now();
    const parent = yield dingtalk.department.create({
      parentid: 1,
      name,
    });
    assert(parent.id);
    const c1 = yield dingtalk.department.create({
      parentid: parent.id,
      name: name + '_child1',
    });
    const c2 = yield dingtalk.department.create({
      parentid: parent.id,
      name: name + '_child2',
    });
    const result = yield dingtalk.department.listSubDepartmentIds(parent.id);
    assert.deepEqual(result.sub_dept_id_list.sort(), [ c2.id, c1.id ].sort());
    assert(result.errcode === 0);
    assert(result.errmsg === 'ok');
  });

  it('listParentDepartmentIds', function* () {
    const name = 'department_listParentDepartmentIds_' + Date.now();
    const parent = yield dingtalk.department.create({
      parentid: 1,
      name,
    });
    assert(parent.id);
    const c1 = yield dingtalk.department.create({
      parentid: parent.id,
      name: name + '_child1',
    });
    const c12 = yield dingtalk.department.create({
      parentid: c1.id,
      name: name + '_child1_child2',
    });
    const result = yield dingtalk.department.listParentDepartmentIds(c12.id);
    assert.deepEqual(result.parentIds, [ c12.id, c1.id, parent.id, 1 ]);
  });

  it('get', function* () {
    const department = yield dingtalk.department.get('1');
    assert(department.id);
  });

  it('get undefined when not exist', function* () {
    const department = yield dingtalk.department.get('abc');
    assert(!department);
  });

  it('update', function* () {
    let department = yield createDepartment();

    const name = department.name + '_test';
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
    assert(department.id);
    console.log('%j', department);

    let result = yield dingtalk.department.delete(department.id);
    assert(result.errcode === 0);
    console.log('%j', result);

    result = yield dingtalk.department.get(department.id);
    assert(!result);
  });
});
