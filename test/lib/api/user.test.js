'use strict';

const Mock = require('mockjs');
const assert = require('power-assert');

const DingTalk = require('../../../dist/dingtalk');
const options = require('./../../fixtures/test.config.json');

describe('test/dist/api/user.test.js', () => {
  let dingtalk;

  before(function* () {
    dingtalk = new DingTalk(options);
  });

  function getRandomMobile() {
    return '134444' + Mock.mock('@string("number", 5)');
  }

  function* createUser(mobile) {
    const userId = mobile || getRandomMobile();
    yield dingtalk.user.create({
      userid: userId,
      name: 'user-' + userId,
      mobile: userId,
      department: [ 1 ],
    });
    return yield dingtalk.user.get(userId);
  }

  it('create', function* () {
    const mobile = getRandomMobile();
    const user = yield dingtalk.user.create({
      userid: mobile,
      name: 'user-' + mobile,
      mobile,
      department: [ 1 ],
    });
    assert(user.userid);
    console.log('%j', user);

    yield dingtalk.user.delete(mobile);
  });

  it('update', function* () {
    let user = yield createUser();
    const userId = user.userid;

    const result = yield dingtalk.user.update({
      userid: userId,
      name: 'user-test-' + userId,
    });
    assert(result.errcode === 0);
    console.log('%j', result);

    user = yield dingtalk.user.get(userId);
    assert(user.name === 'user-test-' + userId);
    console.log('%j', user);

    yield dingtalk.user.delete(userId);
  });

  it('get', function* () {
    let user = yield createUser();
    const userId = user.userid;

    user = yield dingtalk.user.get(userId);
    assert(user.userid);
    console.log('%j', user);

    yield dingtalk.user.delete(userId);
  });

  it('get undefined when not exist', function* () {
    const user = yield dingtalk.user.get('$#abc');
    console.log('%j', user);
    assert(!user);
  });

  it('list', function* () {
    const userList = yield dingtalk.user.list('1');
    console.log('%j', userList);
    assert(userList.errcode === 0);
    assert(userList.userlist.length > 0);
  });

  it('list simple', function* () {
    const userList = yield dingtalk.user.simplelist('1');
    console.log('%j', userList);
    assert(userList.errcode === 0);
    assert(userList.userlist.length > 0);
    assert(Object.keys(userList.userlist[0]).join(',') === 'name,userid');
  });

  it('delete', function* () {
    let user = yield createUser();
    const userId = user.userid;

    const result = yield dingtalk.user.delete(userId);
    console.log('%j', result);
    assert(result.errcode === 0);

    user = yield dingtalk.user.get(userId);
    assert(!user);
  });

  it('batch delete', function* () {
    const mobileList = [ getRandomMobile(), getRandomMobile() ];
    for (const mobile of mobileList) {
      yield createUser(mobile);
    }

    const result = yield dingtalk.user.delete(mobileList);
    console.log('%j', result);
    assert(result.errcode === 0);

    const userList = yield dingtalk.user.list(1);
    const userIds = userList.userlist.map(item => item.userid);
    assert(userIds.indexOf(mobileList[0]) === -1);
    assert(userIds.indexOf(mobileList[1]) === -1);
    console.log('%j', userList);
  });

  it('getUseridByUnionid', function* () {
    const user = (yield dingtalk.user.list('1', false, { size: 1 })).userlist[0];
    const result = yield dingtalk.user.getUseridByUnionid(user.openId);
    assert(result.userid === user.userid);
  });

  it('list all user at special department', function* () {
    this.timeout(1000 * 60 * 2);
    const mobileList = [ getRandomMobile(), getRandomMobile() ];
    for (const mobile of mobileList) {
      yield createUser(mobile);
    }

    const result = yield dingtalk.user.simpleListAll('1', { size: 1 });
    const userIds = result.userlist.map(item => item.userid);
    assert(result.queryCount >= 3);
    assert(userIds.indexOf(mobileList[0]) !== -1);
    assert(userIds.indexOf(mobileList[1]) !== -1);

    yield dingtalk.user.delete(mobileList);
  });

  it('list all user', function* () {
    this.timeout(1000 * 60 * 2);
    const mobileList = [ getRandomMobile(), getRandomMobile() ];
    for (const mobile of mobileList) {
      yield createUser(mobile);
    }

    const result = yield dingtalk.user.simpleListAll(undefined, { size: 1 });
    const userIds = result.userlist.map(item => item.userid);
    assert(result.queryCount >= 3);
    assert(userIds.indexOf(mobileList[0]) !== -1);
    assert(userIds.indexOf(mobileList[1]) !== -1);

    yield dingtalk.user.delete(mobileList);
  });

  it('getUserInfoByCode', function* () {
    try {
      yield dingtalk.user.getUserInfoByCode('abc');
    } catch (err) {
      assert(err.data.errcode === 40078);
    }
  });

  it('getByMobile', function* () {
    const userList = yield dingtalk.user.list('1');
    console.log('%j', userList);

    try {
      const userInfo = yield dingtalk.user.getByMobile(userList.userlist[0].mobile);
      console.log('%j', userInfo);
      assert(userInfo.userid === userList.userlist[0].userid);
    } catch (err) {
      assert(err.data.errcode === 60011);
    }
  });
});
