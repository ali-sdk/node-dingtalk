declare namespace DingTalk {
	interface Reponse {
		errcode: number;
		errmsg: string;
	}

	type Language = 'zh_CN' | 'en_US';

	interface Client {
		getAccessToken(): Promise<string>;
		getJSApiTicket(): Promise<string>;
		getJSApiConfig(): Promise<{
			corpId: string;
			timeStamp: number;
			nonceStr: string;
			signature: string;
		}>;
		getAccessToken(): Promise<string>;
		// request(...args: any[]): any;
		// get(...args: any[]): any;
		// post(...args: any[]): any;
		// upload(...args: any[]): any;
	}

	interface Department {
		id: number;
		name: string;
		parentid: number;
		createDeptGroup: boolean;
		autoAddUser: boolean;
	}

	interface DepartmentDetail {
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

	interface DepartmentHelper {
		list(): Promise<{
			department: Department[];
		} & Reponse>;
		get(id: string): Promise<DepartmentDetail & Response>;
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
		}): Promise<{
			id: number;
		} & Response>;
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
		}): Promise<Response>;
		delete(id: number): Promise<Response>;
	}

	interface User {
		userid: string;	// 员工唯一标识ID（不可修改）
		name: string;	// 成员名称
	}
	interface UserDetail {
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

	interface UserHelper {
		list(departmentId: number, isSimple: true, opts?: {
			lang?: Language;	//	通讯录语言(默认zh_CN另外支持en_US)
			offset?: number;	//	支持分页查询，与size参数同时设置时才生效，此参数代表偏移量
			size?: number;	//	支持分页查询，与offset参数同时设置时才生效，此参数代表分页大小，最大100
			order?: string;	//	支持分页查询，部门成员的排序规则，默认不传是按自定义排序；entry_asc代表按照进入部门的时间升序，entry_desc代表按照进入部门的时间降序，modify_asc代表按照部门信息修改时间升序，modify_desc代表按照部门信息修改时间降序，custom代表用户定义(未定义时按照拼音)排序
		}): Promise<{
			hasMore: boolean;
			userlist: User[];
		} & Response>;
		list(departmentId: number, isSimple?: false, opts?: {
			lang?: Language;	//	通讯录语言(默认zh_CN另外支持en_US)
			offset?: number;	//	支持分页查询，与size参数同时设置时才生效，此参数代表偏移量
			size?: number;	//	支持分页查询，与offset参数同时设置时才生效，此参数代表分页大小，最大100
			order?: string;	//	支持分页查询，部门成员的排序规则，默认不传是按自定义排序；entry_asc代表按照进入部门的时间升序，entry_desc代表按照进入部门的时间降序，modify_asc代表按照部门信息修改时间升序，modify_desc代表按照部门信息修改时间降序，custom代表用户定义(未定义时按照拼音)排序
		}): Promise<{
			hasMore: boolean;
			userlist: UserDetail[];
		} & Response>;
		// tips: 如果要获取全部用户的简单信息，departmentId请传0
		listAll(departmentId: number, isSimple: true, opts?: {
			lang?: Language;	//	通讯录语言(默认zh_CN另外支持en_US)
			offset?: number;	//	支持分页查询，与size参数同时设置时才生效，此参数代表偏移量
			size?: number;	//	支持分页查询，与offset参数同时设置时才生效，此参数代表分页大小，最大100
			order?: string;	//	支持分页查询，部门成员的排序规则，默认不传是按自定义排序；entry_asc代表按照进入部门的时间升序，entry_desc代表按照进入部门的时间降序，modify_asc代表按照部门信息修改时间升序，modify_desc代表按照部门信息修改时间降序，custom代表用户定义(未定义时按照拼音)排序
		}): Promise<{
			queryCount: number;
			userlist: User[];
		} & Response>;
		listAll(departmentId?: number, isSimple?: false, opts?: {
			lang?: Language;	//	通讯录语言(默认zh_CN另外支持en_US)
			offset?: number;	//	支持分页查询，与size参数同时设置时才生效，此参数代表偏移量
			size?: number;	//	支持分页查询，与offset参数同时设置时才生效，此参数代表分页大小，最大100
			order?: string;	//	支持分页查询，部门成员的排序规则，默认不传是按自定义排序；entry_asc代表按照进入部门的时间升序，entry_desc代表按照进入部门的时间降序，modify_asc代表按照部门信息修改时间升序，modify_desc代表按照部门信息修改时间降序，custom代表用户定义(未定义时按照拼音)排序
		}): Promise<{
			queryCount: number;
			userlist: UserDetail[];
		} & Response>;

		get(id: string, opts?: {
			lang?: Language;
		}): Promise<UserDetail & Response>;
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
		}): Promise<{
			userid: string;
		} & Response>;
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
		}): Promise<Response>;
		delete(id: string | string[]): Promise<Response>;
		getUseridByUnionid(openId: string): Promise<{
			userid: string;
		} & Response>;
		getByMobile(mobile: string): Promise<{
			userid: string;
		} & Response>;
	}

	interface Message {
		send(opts: {
			touser?: string;
			toparty?: string;
			msgtype: 'text' | 'image' | 'voice' | 'file' | 'link';
			text?: {
				content: string;
			};
			image?: {
				media_id: string;
			};
			voice?: {
				media_id: string;
				duration: number;
			};
			file?: {
				media_id: string;
			};
			link?: {
				messageUrl: string;
				picUrl: string;
				title: string;
				text: string;
			};
		}): Promise<{
			receiver: string;	// "UserID1|UserID2"
		} & Response>;
		listMessageStatus(messageId: string): Promise<{
			read: string[];
			unread: string[];
		} & Response>;
	}

	interface Media {
		upload(type: 'image' | 'voice' | 'file', filePath: string): Promise<{
			media_id: string;
			type: 'image' | 'voice' | 'file';
			created_at: number;
		} & Response>;
		get(id: string): Promise<string>;
		download(id: string, targetDir: string, fileName: string): Promise<string>;
	}

	interface DingTalkOptions {
		host?: string;	// default 'https://oapi.dingtalk.com'
		corpid: string;
		corpsecret: string;
		requestOpts?: {
			[key: string]: any;
		};
	}
}

interface DingTalk {
	client: DingTalk.Client;
	department: DingTalk.DepartmentHelper;
	user: DingTalk.UserHelper;
	message: DingTalk.Message;
	media: DingTalk.Media;
}

interface DingTalkConstructor {
	new (options: DingTalk.DingTalkOptions): DingTalk;
}

declare const DingTalk: DingTalkConstructor;

export = DingTalk;
