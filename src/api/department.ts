import assert = require('assert');
import { Client } from './client';
import { Language } from '../interfaces';

export interface Department {
	id: number;
	name: string;
	parentid: number;
	createDeptGroup: boolean;
	autoAddUser: boolean;
}

export interface DepartmentDetail {
	id: number;
	name: string;
	order: number;
	parentid: number;
	createDeptGroup: boolean;
	autoAddUser: boolean;
	deptHiding: boolean;
	deptPerimits: string;
	userPerimits: string;
	outerDept: boolean;
	outerPermitDepts: string;
	outerPermitUsers: string;
	orgDeptOwner: string;
	deptManagerUseridList: string;
}

/**
 * 部门相关 API
 * @type {Department}
 */
export class DepartmentHelper {
	client: Client;
	constructor(client: Client) {
		this.client = client;
	}

	/**
	 * 获取部门列表
	 *  - department/list
	 * @param {Object} [opts] - 其他参数
	 * @return {Object} 部门列表 { department: [] }
	 * @see https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.J2t4fQ&treeId=172&articleId=104979&docType=1#s0
	 */
	list(opts?: any) {
		return this.client.get('department/list', opts) as any as Promise<{
			department: Department[];	// error TS2352
		} & Response>;
	}

	/**
	 * 获取部门详情
	 *  - department/get
	 * @param {String} id 部门ID
	 * @param {Object} [opts] - 其他参数
	 * @return {Object} 部门信息, 不存在时返回 undefined
	 * @see https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.J2t4fQ&treeId=172&articleId=104979&docType=1#s1
	 */
	get(id: string, opts?: any) {
		assert(id, 'department id required');
		return this.client.get('department/get', Object.assign({ id }, opts)) as Promise<DepartmentDetail & Response>;
	}

	/**
	 * 创建部门
	 *  - department/create
	 * @param {Object} opts 部门信息, { name, parentId, ... }
	 * @return {Object} 操作结果, { id }
	 */
	create(opts: {
		name: string;
		parentid: number;
		order?: number;
		createDeptGroup?: boolean;
		autoAddUser?: boolean;
		deptHiding?: boolean;
		deptPerimits?: string;
		userPerimits?: string;
		outerDept?: boolean;
		outerPermitDepts?: string;
		outerPermitUsers?: string;
	}) {
		assert(opts.name, 'options.name required');
		assert(opts.parentid, 'options.parentid required, root is 1');
		return this.client.post('department/create', opts) as Promise<{
			id: number;
		} & Response>;
	}

	/**
	 * 更新部门
	 *  - department/update
	 * @param {Object} opts 部门信息, { id, ... }
	 * @return {Object} 操作结果
	 */
	update(opts: {
		id: number;
		lang?: Language;
		name?: string;
		parentid?: number;
		order?: number;
		createDeptGroup?: boolean;
		autoAddUser?: boolean;
		deptManagerUseridList?: string;
		deptHiding?: boolean;
		deptPerimits?: string;
		userPerimits?: string;
		outerDept?: boolean;
		outerPermitDepts?: string;
		outerPermitUsers?: string;
		orgDeptOwner?: string;
	}) {
		assert(opts.id, 'options.id required');
		return this.client.post('department/update', opts) as Promise<Response>;
	}

	/**
	 * 删除部门
	 *  - department/delete
	 * @param {String} id 部门ID
	 * @return {Object} 操作结果
	 */
	delete(id: string) {
		assert(id, 'department id required');
		return this.client.get('department/delete', { id });
	}
}
