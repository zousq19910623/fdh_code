/**
 * @constructor Config
 * @description 服务器配置类
 * @example var dbTools = require('./js/config.js');
 * @since version 0.1
 * @property {Object} Server 服务器配置
 * @property {Object} SessionDB Session Mysql存储配置（改用Redis）
 * @property {Object} redis Redis数据库配置
 */

module.exports = {
	/**
	 * @property {Object} Server 服务器配置
	 */
	Server: {
		port: "3001",
		isCluster: false,
		logLevel: "DEBUG"
	},
	/**
	 * @property {Object} SessionDB Session Mysql存储配置（改用Redis）
	 */
	SessionDB: {
		host: "127.0.0.1",
		port: 3306,
		user: "pay",
		pass: "FangLiJu2016",
		database: "paySessionDB"
	},
	/**
	 * @property {Object} payDB 支付数据库配置
	 */
	fdhDB: {
		host: "127.0.0.1",
		port: 3306,
		user: "root",
		pass: "",
		database: "fdhDB"
	},
	/**
	 * @property {Object} redis Redis数据库配置
	 */
	redis: {
		port: 6379, //端口号
		host: "127.0.0.1", //服务器IP
		pass: ""
	},
	/**
	 * @property {Object} test 测试配置
	 */
	test: {
		baseUrl: "http://pay.fangliju.com"
		//baseUrl: "http://pm.fangliju.com"
	},
	/**
	 * @property {Object} appServer APP服务器的相关配置
	 */
	appServer: {
		baseUrl: "http://183.15.90.72:9110",
		//baseUrl: "http://127.0.0.1:8000",
		//key: "h8jp22xBuYFLiRbi"
		key: "pKgZwsQyDWaEi7NkHkz99mGdme1dBs8q"
	},
	/**
	 * @property {Object} piwik 统计信息配置
	 */
	piwik:{
		url: "http://pay.fangliju.com/piwik/",
		token: "dda1437e2116bbe36d9b69cc074494b6"
	}
};
