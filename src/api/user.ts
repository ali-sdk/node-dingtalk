import { Client } from './client';
import { Language } from '../interfaces';
import { Department } from './department';
import assert = require('assert');

export interface User {
	userid: string;	// 员工唯一标识ID（不可修改）
	name: string;	// 成员名称
}
export interface UserDetail {
	userid: string;	//	员工唯一标识ID（不可修改）
	order: number;	//	表示人员在此部门中的排序，列表是按order的倒序排列输出的，即从大到小排列输出的
	dingId: string;	//	钉钉ID
	mobile: string;	//	手机号（ISV不可见）
	tel: string;	//	分机号（ISV不可见）
	workPlace: string;	//	办公地点（ISV不可见）
	remark: string;	//	备注（ISV不可见）
	isAdmin: boolean;	//	是否是企业的管理员, true表示是, false表示不是
	isBoss: boolean;	//	是否为企业的老板, true表示是, false表示不是
	isHide: boolean;	//	是否隐藏号码, true表示是, false表示不是
	isLeader: boolean;	//	是否是部门的主管, true表示是, false表示不是
	name: string;	//	成员名称
	active: boolean;	// 表示该用户是否激活了钉钉
	department: number;	// 成员所属部门id列表
	position: string;	// 职位信息
	email: string;	// 员工的邮箱
	orgEmail: string;	// 员工的企业邮箱
	avatar: string;	// 头像url
	jobnumber: string;	// 员工工号
	extattr: any;	// 扩展属性，可以设置多种属性(但手机上最多只能显示10个扩展属性，具体显示哪些属性，请到OA管理后台->设置->通讯录信息设置和OA管理后台->设置->手机端显示信息设置)
}

export interface ListOptions {
	lang?: Language;	//	通讯录语言(默认zh_CN另外支持en_US)
	offset?: number;	//	支持分页查询，与size参数同时设置时才生效，此参数代表偏移量
	size?: number;	//	支持分页查询，与offset参数同时设置时才生效，此参数代表分页大小，最大100
	order?: string;	//	支持分页查询，部门成员的排序规则，默认不传是按自定义排序；entry_asc代表按照进入部门的时间升序，entry_desc代表按照进入部门的时间降序，modify_asc代表按照部门信息修改时间升序，modify_desc代表按照部门信息修改时间降序，custom代表用户定义(未定义时按照拼音)排序
}

export interface ListAllOption {
	lang?: Language;	//	通讯录语言(默认zh_CN另外支持en_US)
	order?: string;	//	支持分页查询，部门成员的排序规则，默认不传是按自定义排序；entry_asc代表按照进入部门的时间升序，entry_desc代表按照进入部门的时间降序，modify_asc代表按照部门信息修改时间升序，modify_desc代表按照部门信息修改时间降序，custom代表用户定义(未定义时按照拼音)排序
}

/**
 * 成员相关 API
 * @type {User}
 */
export class UserHelper {
	client: Client;
	constructor(client: Client) {
		this.client = client;
	}

	/**
	 * 获取部门的成员, 分页
	 *   - user/simplelist
	 *   - user/list
	 * @param {String} departmentId - 部门 ID
	 * @param {Object} [opts] - 其他扩展参数
	 * @return {Array} 成员列表 { userlist: [] }
	 * @see https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.J2t4fQ&treeId=172&articleId=104979&docType=1#s12
	 */
	list(departmentId: number, opts?: ListOptions) {
		const api = 'user/list';
		return this.client.get(api, Object.assign({}, { department_id: departmentId }, opts)) as Promise<{
			hasMore: boolean;
			userlist: UserDetail[];
		} & Response>;
	}

	/**
	 * 获取部门的成员, 分页
	 *   - user/simplelist
	 *   - user/list
	 * @param {String} departmentId - 部门 ID
	 * @param {Object} [opts] - 其他扩展参数
	 * @return {Array} 成员列表 { userlist: [] }
	 * @see https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.J2t4fQ&treeId=172&articleId=104979&docType=1#s11
	 */
	simplelist(departmentId: number, opts?: ListOptions) {
		const api = 'user/simplelist';
		return this.client.get(api, Object.assign({}, { department_id: departmentId }, opts)) as Promise<{
			hasMore: boolean;
			userlist: User[];
		} & Response>;
	}

	/**
	 * 获取部门的全部成员
	 * @param {String} [departmentId] - 部门 ID, 为空则查询全部部门
	 * @param {Object} [opts] - 其他扩展参数
	 *  - concurrency {Number} 并发请求数, 默认为 5
	 * @return {Object} 成员列表 { userlist: [], queryCount }
	 */
	simpleListAll(departmentId?: number, opts?: ListAllOption) {
		return this.list_all(departmentId, true, opts);
	}

	/**
	 * 获取部门的全部成员
	 * @param {String} [departmentId] - 部门 ID, 为空则查询全部部门
	 * @param {Object} [opts] - 其他扩展参数
	 *  - concurrency {Number} 并发请求数, 默认为 5
	 * @return {Object} 成员列表 { userlist: [], queryCount }
	 */
	listAll(departmentId?: number, opts?: ListAllOption) {
		return this.list_all(departmentId, false, opts);
	}

	async list_all<T extends User>(departmentId?: number, simple?: boolean, opts?: ListAllOption) {
		opts = opts || {};
		let queryCount = 0;

		// find departmentId
		let departmentIdList: number[];
		if (departmentId) {
			departmentIdList = [departmentId];
		} else {
			const departmentList = await this.client.get('department/list') as any as {
				department: Department[];
			} & Response;
			departmentIdList = departmentList.department.map(item => item.id);
			queryCount++;
		}

		// 并发请求
		const result = await Promise.all(departmentIdList.map(async (departmentId) => {
			let queryCount = 0;
			let result = [] as T[];
			let hasMore = true;
			let offset = 0;
			while (hasMore) {
				queryCount++;
				const response = simple ? await this.simplelist(departmentId, Object.assign({ size: 100 }, opts, { offset })) : await this.list(departmentId, Object.assign({ size: 100 }, opts, { offset }));
				const userList = (response.userlist || []) as T[];
				hasMore = response.hasMore && userList.length > 0;
				offset += userList.length;
				result = result.concat(userList);
			}
			return { queryCount, userList: result };
		}));

		// 去重
		const userMap = result.reduce((userMap, item) => {
			queryCount += item.queryCount;
			for (const user of item.userList) {
				userMap.set(user.userid, user);
			}
			return userMap;
		}, new Map<string, T>());

		return {
			errcode: 0,
			errmsg: 'ok',
			queryCount,
			userlist: Array.from(userMap.values()),
		};
	}

	/**
	 * 获取成员详情
	 *  - user/get
	 * @param {String} id - 成员 userid
	 * @param {Object} [opts] - 其他扩展参数
	 * @return {Object} 成员信息, 不存在时返回 undefined
	 */
	get(id: string, opts?: {
		lang?: Language;
	}) {
		return this.client.get('user/get', Object.assign({ userid: id }, opts)) as Promise<UserDetail & Response>;
	}

	/**
	 * 创建成员
	 *  - user/create
	 * @param {Object} opts 成员信息, { name, mobile, userid, department, ... }
	 * @return {Object} 操作结果 { userid }
	 */
	create(opts: {
		name: string;	// 成员名称。长度为1~64个字符
		mobile: string;	//	手机号码。企业内必须唯一
		department: number[];	//	数组类型，数组里面值为整型，成员所属部门id列表
		orderInDepts?: { [departmentid: string]: number };	//	在对应的部门中的排序, Map结构的json字符串, key是部门的Id, value是人员在这个部门的排序值
		position?: string;	//	职位信息。长度为0~64个字符
		tel?: string;	//	分机号，长度为0~50个字符
		workPlace?: string;	//	办公地点，长度为0~50个字符
		remark?: string;	//	备注，长度为0~1000个字符
		email?: string;	//	邮箱。长度为0~64个字符。企业内必须唯一
		jobnumber?: string;	//	员工工号。对应显示到OA后台和客户端个人资料的工号栏目。长度为0~64个字符
		isHide?: boolean;	//	是否号码隐藏, true表示隐藏, false表示不隐藏。隐藏手机号后，手机号在个人资料页隐藏，但仍可对其发DING、发起钉钉免费商务电话。
		isSenior?: boolean;	//	是否高管模式，true表示是，false表示不是。开启后，手机号码对所有员工隐藏。普通员工无法对其发DING、发起钉钉免费商务电话。高管之间不受影响。
		extattr?: any;	//	扩展属性，可以设置多种属性(但手机上最多只能显示10个扩展属性，具体显示哪些属性，请到OA管理后台->设置->通讯录信息设置和OA管理后台->设置->手机端显示信息设置)
	}) {
		assert(opts.name, 'options.name required');
		assert(opts.mobile, 'options.mobile required');
		assert(opts.department, 'options.department required, Array<Number>');
		return this.client.post('user/create', opts) as Promise<{
			userid: string;
		} & Response>;
	}

	/**
	 * 更新成员
	 *  - user/update
	 * @param {Object} opts 成员信息 { name, userid, ... }
	 * @return {Object} 操作结果
	 */
	update(opts: {
		userid: string;	// 员工唯一标识ID（不可修改），企业内必须唯一。长度为1~64个字符，如果不传，服务器将自动生成一个userid
		name: string;	// 成员名称。长度为1~64个字符
		mobile?: string;	//	手机号码。企业内必须唯一
		department?: number[];	//	数组类型，数组里面值为整型，成员所属部门id列表
		orderInDepts?: { [departmentid: string]: number };	//	在对应的部门中的排序, Map结构的json字符串, key是部门的Id, value是人员在这个部门的排序值
		position?: string;	//	职位信息。长度为0~64个字符
		tel?: string;	//	分机号，长度为0~50个字符
		workPlace?: string;	//	办公地点，长度为0~50个字符
		remark?: string;	//	备注，长度为0~1000个字符
		email?: string;	//	邮箱。长度为0~64个字符。企业内必须唯一
		jobnumber?: string;	//	员工工号。对应显示到OA后台和客户端个人资料的工号栏目。长度为0~64个字符
		isHide?: boolean;	//	是否号码隐藏, true表示隐藏, false表示不隐藏。隐藏手机号后，手机号在个人资料页隐藏，但仍可对其发DING、发起钉钉免费商务电话。
		isSenior?: boolean;	//	是否高管模式，true表示是，false表示不是。开启后，手机号码对所有员工隐藏。普通员工无法对其发DING、发起钉钉免费商务电话。高管之间不受影响。
		extattr?: any;	//	扩展属性，可以设置多种属性(但手机上最多只能显示10个扩展属性，具体显示哪些属性，请到OA管理后台->设置->通讯录信息设置和OA管理后台->设置->手机端显示信息设置)
	}) {
		assert(opts.userid, 'options.userid required');
		assert(opts.name, 'options.name required');
		return this.client.post('user/update', opts);
	}

	/**
	 * 删除成员
	 *  - user/delete
	 *  - user/batchdelete
	 * @param {String/Array} id - 成员 userid, 支持批量删除
	 * @return {Object} 操作结果
	 */
	delete(id: string | string[]) {
		assert(id, 'user id required');
		if (Array.isArray(id)) {
			// 原子化, 一个失败则全部都不会删除
			return this.client.post('user/batchdelete', { useridlist: id });
		} else {
			return this.client.get('user/delete', { userid: id });
		}
	}

	/**
	 * 根据 unionid 获取成员的 userid
	 *  - user/getUseridByUnionid
	 * @param {String} unionid - 即 user.openId
	 * @return {Object} 返回 { userid }
	 */
	getUseridByUnionid(unionid: string) {
		return this.client.get('user/getUseridByUnionid', { unionid }) as Promise<{
			userid: string;
		} & Response>;
	}

	/**
	 * 免登服务, 通过CODE换取用户身份 user/getuserinfo
	 * @param {String} code - 调用 js 获得的 code
	 * @return {Object} 成员信息 { userid, deviceId, ... }
	 * @see https://open-doc.dingtalk.com/doc2/detail.htm?treeId=172&articleId=104969&docType=1
	 */
	getUserInfoByCode(code: string) {
		return this.client.get('user/getuserinfo', { code }) as Promise<{
			userid: string;		// 员工在企业内的UserID
			deviceId: string;	// 手机设备号,由钉钉在安装时随机产生
			is_sys: boolean;	// 是否是管理员
			sys_level: 0 | 1 | 2 | 100;	// 级别，0：非管理员 1：超级管理员（主管理员） 2：普通管理员（子管理员） 100：老板
		} & Response>;
	}

	/**
	 * 根据手机号获取成员 userid
	 * @param {String} mobile 手机号
	 * @return {Object} 成员信息 { userid }
	 * @see https://open-doc.dingtalk.com/doc2/detail.htm?treeId=172&articleId=105418&docType=1
	 */
	getByMobile(mobile: string) {
		return this.client.get('user/get_by_mobile', { mobile }) as Promise<{
			userid: string;
		} & Response>;
	}
}
