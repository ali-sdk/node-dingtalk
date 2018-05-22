'use strict';

const assert = require('power-assert');
const Mock = require('mockjs');

const DingTalk = require('../../../lib/dingtalk');
const options = require('./../../fixtures/test.config');
if (!process.env.TRAVIS) {
  // Fixme: ci 环境报 500，其他环境可以调通
  describe('test/lib/api/extcontact.test.js', () => {
    let dingtalk;

    before(function* () {
      dingtalk = new DingTalk(options);
    });

    function getRandomMobile() {
      return '134444' + Mock.mock('@string("number", 5)');
    }

    function* createExt() {
      const users = yield dingtalk.user.list('1');
      const user_id = users.userlist[0].userid;
      const result = yield dingtalk.extcontact.create({
        name: 'a',
        mobile: getRandomMobile(),
        label_ids: [ 1 ],
        follower_user_id: user_id,
      });
      return result;
    }

    it('create', function* () {
      const result = yield createExt();
      console.log('%j', result);
      assert(result);
      assert(result.userid);
      yield dingtalk.extcontact.delete(result.userid);
    });

    it('delete', function* () {
      const result = yield createExt();
      const res = yield dingtalk.extcontact.delete(result.userid);
      console.log('%j', res);
      assert(res.errcode === 0);
    });

    it('list', function* () {
      const result = yield createExt();
      const list = yield dingtalk.extcontact.list();
      console.log('%j', list);
      assert(list);
      assert(list.length > 0);
      yield dingtalk.extcontact.delete(result.userid);
    });

    it('listAll', function* () {
      const result = yield createExt();
      const list = yield dingtalk.extcontact.listAll();
      console.log('%j', list);
      assert(list);
      assert(list.length > 0);
      yield dingtalk.extcontact.delete(result.userid);
    });

    it('get', function* () {
      const result = yield createExt();
      const ext = yield dingtalk.extcontact.get(result.userid);
      console.log('%j', ext);
      assert(ext);
      assert(ext.userid === result.userid);
      yield dingtalk.extcontact.delete(result.userid);
    });

    it('update', function* () {
      const result = yield createExt();
      const res = yield dingtalk.extcontact.update({
        user_id: result.userid,
        name: 'b',
        label_ids: [ 2 ],
        follower_user_id: '111111',
      });
      console.log('%j', res);
      assert(res);
      assert(res.errcode === 0);
      const ext = yield dingtalk.extcontact.get(result.userid);
      assert(ext.userid === result.userid);
      assert(ext.name === 'b');
      assert(ext.follower_user_id === '111111');
      yield dingtalk.extcontact.delete(result.userid);
    });

    it('listlabelgroups', function* () {
      const list = yield dingtalk.extcontact.listlabelgroups();
      console.log('%j', list);
      assert(list);
      assert(list.length > 0);
    });
  });
}
