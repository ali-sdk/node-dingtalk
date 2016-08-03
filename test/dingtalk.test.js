'use strict';

const request = require('supertest');
const assert = require('power-assert');

describe('test/dingtalk.test.js', () => {

  let app;
  before(function* () {
    app = mm.app({
      baseDir: 'dingtalk',
      plugin: true,
    });
    yield app.ready();
  });

  afterEach(mm.restore);

  it('app.dingtalk', function* () {
    expect(app.dingtalk).to.exist;
  });

  describe('client', () => {
    it('getAccessToken', function* () {
      const token = yield app.dingtalk.client.getAccessToken();
      const expireTime = app.dingtalk.accessTokenExpireTime;
      expect(token).to.not.be.undefined;
      expect(expireTime <= Date.now());

      const token2 = yield app.dingtalk.client.getAccessToken();
      expect(token).to.equal(token2);
      expect(expireTime).to.equal(app.dingtalk.accessTokenExpireTime);
    });

    it('getJSApiTicket', function* () {
      const token = yield app.dingtalk.client.getJSApiTicket();
      const expireTime = app.dingtalk.jsapiTicketExpireTime;
      expect(token).to.not.be.undefined;
      expect(app.dingtalk.jsapiTicketExpireTime <= Date.now());

      const token2 = yield app.dingtalk.client.getJSApiTicket();
      expect(token).to.equal(token2);
      expect(expireTime).to.equal(app.dingtalk.jsapiTicketExpireTime);
    });
  });

  describe('api', () => {
    it('.getAllUserList', function* () {
      const userList = yield app.dingtalk.getAllUserList();
      expect(userList).to.have.length.least(1);
    });

    it('.department', function* () {
      const parentId = 1;
      const name = 'department-unittest-' + Date.now();
      let result;

      // create
      const department = yield app.dingtalk.department.create({
        parentid: parentId,
        name,
      });
      expect(department.id).to.not.be.undefined;

      // list
      const departmentList = yield app.dingtalk.department.list();
      const hasId = departmentList.department.some(item => item.id === department.id);
      expect(hasId).to.be.true;

      // update
      result = yield app.dingtalk.department.update({
        id: department.id,
        name: name + '_test',
      });
      expect(result.errcode).to.equal(0);

      // detail
      const deparmentInfo = yield app.dingtalk.department.get(department.id);
      expect(deparmentInfo).to.have.property('name', name + '_test');
      expect(deparmentInfo).to.have.property('parentid', parentId);

      // delete
      result = yield app.dingtalk.department.delete(department.id);
      expect(result.errcode).to.equal(0);
    });

    it.only('.user', function* () {
      let result;
      let userInfo;
      const name = 'user-unittest-' + Date.now();
      const mobile = '13178833042';

      // create
      const user = yield app.dingtalk.user.create({
        name,
        mobile,
        department: [ 1 ],
      });
      assert(user.userid || user.errcode === 60104);

      // list
      const userList = yield app.dingtalk.user.list(1);
      assert(userList.errcode === 0);
      assert(userList.userlist.length > 0);

      userInfo = userList.userlist.find(item => item.mobile === mobile);
      assert(userInfo);

      // update
      result = yield app.dingtalk.user.update({
        userid: userInfo.userid,
        name: name + '-test',
      });
      assert(result.errcode === 0);

      // get
      userInfo = yield app.dingtalk.user.get(userInfo.userid);
      assert(userInfo.errcode === 0);
      assert(userInfo.name === name + '-test');

      // delete
      result = yield app.dingtalk.user.delete(userInfo.userid);
      assert(result.errcode === 0);

      // simple list
      const simpleList = yield app.dingtalk.user.list(1, true);
      assert(simpleList.errcode === 0);
      assert(simpleList.userlist.length <= userList.userlist.length - 1);
      userInfo = simpleList.userlist.find(item => item.userid === userInfo.userid);
      assert(userInfo === undefined);
    });
  });
});
