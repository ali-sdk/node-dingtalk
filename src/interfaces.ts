export type Language = 'zh_CN' | 'en_US';

export interface Options {
	host?: string;	// default 'https://oapi.dingtalk.com'
	corpid: string;
	corpsecret: string;
	requestOpts?: {
		[key: string]: any;
	};
	urllib?: any;
}
