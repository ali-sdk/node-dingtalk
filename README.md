# node-dingtalk - [钉钉SDK](https://open-doc.dingtalk.com)

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/node-dingtalk.svg?style=flat-square
[npm-url]: https://npmjs.org/package/node-dingtalk
[travis-image]: https://img.shields.io/travis/ali-sdk/node-dingtalk.svg?style=flat-square
[travis-url]: https://travis-ci.org/ali-sdk/node-dingtalk
[codecov-image]: https://img.shields.io/codecov/c/github/ali-sdk/node-dingtalk.svg?style=flat-square
[codecov-url]: https://codecov.io/github/ali-sdk/node-dingtalk?branch=master
[david-image]: https://img.shields.io/david/ali-sdk/node-dingtalk.svg?style=flat-square
[david-url]: https://david-dm.org/ali-sdk/node-dingtalk
[snyk-image]: https://snyk.io/test/npm/node-dingtalk/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/node-dingtalk
[download-image]: https://img.shields.io/npm/dm/node-dingtalk.svg?style=flat-square
[download-url]: https://npmjs.org/package/node-dingtalk

## Install

```shell
$ npm i node-dingtalk --save
```

## Usage

```js
const DingTalk = require('node-dingtalk');
const dingtalk = new DingTalk({
  corpid: '',
  corpsecret: '',
});

const deparment = dingtalk.department.get('1');
console.log(deparment);
```

### Cache example

> cluster 下换成 Redis 等外部存储从而降低获取 AccessToken 频率

```js
const CACHE = {};
const cache = {
  get(key) {
    if (CACHE[key] && (CACHE[key].expired > Date.now())) {
      return CACHE[key].value;
    } else {
      return null;
    }
  },
  set(key, value, maxAge) {
    const obj = {
      expired: maxAge,
      value,
    };
    CACHE[key] = obj;
    return obj;
  },
};

// const redis = new Redis();
// const cache = {
//   async get(key) {
//     return redis.get(key)
//   },
//   async set(key, value, maxAge) {
//     return redis.set(key, value, 'PX', maxAge - Date.now());
//   },
// };

const DingTalk = require('node-dingtalk');
const dingtalk = new DingTalk({
  corpid: '',
  corpsecret: '',
  cache,
});
```

## Api

官方文档: https://open-doc.dingtalk.com/

### Client

#### client.getAccessToken()
获取 AccessToken, 并在有效期内自动缓存, `gettoken`

#### client.getJSApiTicket()
获取 jsapi_ticket, 并在有效期内自动缓存, `get_jsapi_ticket`

#### client.getJSApiConfig()
获取 js api 接入时需要的配置数据以及签名

#### client.request/get/post/upload
辅助方法, 参见 `npm urllib`


### Department

https://open-doc.dingtalk.com/doc2/detail.htm?treeId=172&articleId=104979&docType=1

#### department.list([opts])

获取部门列表 `department/list`

#### department.get(id)

获取部门详情 `department/get`

#### department.create({ name, parentid, … })

创建部门 `department/create`

#### department.update({ id, … })

更新部门 `department/update`

#### department.delete(id)

 删除部门 `department/delete`



### User

https://open-doc.dingtalk.com/doc2/detail.htm?treeId=172&articleId=104979&docType=1

#### user.list(departmentId, [isSimple], [opts])

- 获取部门成员 `user/simplelist`
- 获取部门成员(详情) `user/list`

分页查询参数放到 opts

#### user.listAll([departmentId], [isSimple], [opts])

自动遍历分页查询
- 查询所有的成员 (departmentId 为空时)
- 查询该部门所有成员

#### user.get(id, [opts])

获取成员详情 `user/get`

id 对应于 userid, 参数, 其他参数放到 opts

#### user.create({ userid, name, department[], mobile, … })

创建成员  `user/create`

#### user.update({ userid, name, … })

更新成员 `user/update`

#### user.delete(id/id[])

- 删除成员 `user/delete`
- 批量删除成员 `user/batchdelete`

#### user.getUseridByUnionid(openId)

根据 unionid 获取成员的 userid,  `user/getUseridByUnionid`

此处的 unionid 即为 user.openId

#### user.getByMobile(mobile)

根据手机号获取成员 userid,  `user/get_by_mobile`


### Message

#### message.send({ touser, toparty, msgtype, ... })
发送企业消息, `message/send`

### message.listMessageStatus(messageId)
获取企业会话消息已读未读状态, `message/list_message_status`


### Media

#### media.upload(type, filePath)
上传媒体文件 `media/upload`

#### media.download(id, targetDir, [fileName])
下载媒体文件 `media/downloadFile`


### Auth

https://open-doc.dingtalk.com/docs/doc.htm?treeId=385&articleId=106091&docType=1

#### auth.scopes([opts])

获取授权范围 `auth/scopes`


### Extcontact

https://open-doc.dingtalk.com/microapp/serverapi2/nb93oa

#### extcontact.list({offset, size}, opts)
获取外部联系人列表 `topapi/extcontact/list`

#### extcontact.listAll(opts)
获取所有外部联系人列表

#### extcontact.get(user_id, opts)
通过 userid 获取外部联系人信息 `topapi/extcontact/get`

#### extcontact.create({name, mobile, label_ids, follower_user_id}, opts)
添加外部联系人 `topapi/extcontact/create`

#### extcontact.update({user_id, name, label_ids, follower_user_id}, opts)
更新外部联系人 `topapi/extcontact/update`

#### extcontact.delete(user_id, opts)
删除外部联系人 `topapi/extcontact/delete`

#### extcontact.listlabelgroups({offset, size}, opts)
获取外部联系人标签 `topapi/extcontact/listlabelgroups`


## Questions & Suggestions

Please open an issue [here](https://github.com/atian25/node-dingtalk/issues).

## License

[MIT](LICENSE)
