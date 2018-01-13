'use strict';

const Mock = require('mockjs');
const assert = require('power-assert');

const DingTalk = require('../../../lib/dingtalk');
const options = require('./../../fixtures/test.config');

describe('test/lib/api/message.test.js', () => {
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

  it('send', function* () {
    const user = yield createUser();

    const result = yield dingtalk.message.send({
      touser: user.userid,
      agentid: options.agentid,
      msgtype: 'text',
      text: {
        content: 'just a test',
      },
    });

    console.log('%j', result);
    assert(!result.invaliduser);

    yield dingtalk.user.delete(user.userid);
  });

  it('send not exist', function* () {
    const result = yield dingtalk.message.send({
      toparty: '123',
      agentid: options.agentid,
      msgtype: 'text',
      text: {
        content: 'just a test',
      },
    });

    console.log('%j', result);
    assert(result.invalidparty === '123');
  });

  it('listMessageStatus', function* () {
    const user = yield createUser();

    const result = yield dingtalk.message.send({
      touser: user.userid,
      agentid: options.agentid,
      msgtype: 'text',
      text: {
        content: 'just a test',
      },
    });

    console.log('%j', result);

    const statusResult = yield dingtalk.message.listMessageStatus(result.messageId);
    assert(statusResult.unread.indexOf(user.userid) !== -1);
    console.log('%j', statusResult);

    yield dingtalk.user.delete(user.userid);
  });
});
