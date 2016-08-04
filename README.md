# node-dingtalk - [钉钉SDK](https://open-doc.dingtalk.com)

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/node-dingtalk.svg?style=flat-square
[npm-url]: https://npmjs.org/package/node-dingtalk
[travis-image]: https://img.shields.io/travis/eggjs/node-dingtalk.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/node-dingtalk
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/node-dingtalk.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/node-dingtalk?branch=master
[david-image]: https://img.shields.io/david/eggjs/node-dingtalk.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/node-dingtalk
[snyk-image]: https://snyk.io/test/npm/node-dingtalk/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/node-dingtalk
[download-image]: https://img.shields.io/npm/dm/node-dingtalk.svg?style=flat-square
[download-url]: https://npmjs.org/package/node-dingtalk

## Install

```shell
$ npm i node-dingtalk --save
```

## Usage

```javascript
const DingTalk = require('node-dingtalk');
const dingtalk = new DingTalk({
  corpid: '',
  corpsecret: ''
});

const deparment = dingtalk.department.get('1');
console.log(deparment);
```

## Api

官方文档: https://open-doc.dingtalk.com/

### Department

https://open-doc.dingtalk.com/doc2/detail.htm?treeId=172&articleId=104979&docType=1

#### department.list(opts)

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

#### user.list({ departmentId, isSimple, opts })

- 获取部门成员 `user/simplelist`
- 获取部门成员(详情) `user/list`

分页查询参数放到 opts

#### user.listAll({ departmentId, isSimple, opts })

自动遍历分页查询
- 查询所有的成员 (departmentId 为空时)
- 查询该部门所有成员

#### user.get(id, opts)

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



## Questions & Suggestions

Please open an issue [here](https://github.com/atian25/node-dingtalk/issues).

## License

[MIT](LICENSE)
