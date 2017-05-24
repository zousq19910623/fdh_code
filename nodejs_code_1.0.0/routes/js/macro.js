/**
 * @constructor Macro
 * @description 宏(公共定义类)
 * @example var dbTools = require('./js/macro.js');
 * @since version 0.1
 * @property {Object} Interval 时间间隔
 */

module.exports = {

	/**
	 * @property {Object} Interval 定时间隔时间，单位为毫秒
	 */
	Interval: {
		ONE_SEC: 1000, //一秒
		TWO_SEC: 2000, //两秒
		FIVE_SEC: 5000, //五秒
		ONE_MIN: 60000, //一分钟
		FIVE_MIN: 300000, //五分钟
		TEN_MIN: 600000 //十分钟
	},

	/**
	 * @property {Object} TableName 所有表的名称
	 */
	TableName: {
		T_USERINFO: "UserInfo",
		T_DYNAMIC: "Dynamic",
		T_COMMENT: "Comment",
		T_FOCUS: "Focus",
		T_FONDDYNAMIC: "FondDynamic",
		T_REPORT: "Report",
		T_USER_ACTIVE_TIMES: "UserActiveTimes",
		T_DYNAMIC_TIMES: "DynamicTimes"
	},

	/**
	 * @property {Object} PreKey 模块键的前缀，用于REDIS中的KEY前缀
	 */
	PreKey: {
		PRE_FOND_KEY: "FondKey_",
		PRE_COMMENT_KEY: "CommentKey_",
		PRE_FOCUS_KEY: "FocusKey_",
		PRE_USER_KEY: "UserKey_",
		PRE_DYNAMIC_KEY: "DynamicKey_",
		PRE_USERACTIVETIMES_KEY: "UserActiveTimesKey_",
		PRE_DYNAMICTIMES_KEY: "DynamicTimesKey_"
	},

	/**
	 * @property {Object} NoticeType 公告通知类型
	 */
	NoticeType: {
		FOND: 1, //通知被喜欢
		COMMENT: 2, //被评论
		FOCUS: 3, //被关注
		SYSTEM: 4 //系统公告
	},

	ReportType: {
		DYNAMIC: 1, //举报帖子
		COMMENT: 2, //举报评论
		USER: 3 //用户
	},

	/**
	 * @property {Object} StartTime 系统最初时间
	 */
	StartTime: {
		START: 1490976000 //2017-04-01 00:00:00
	},

	/**
	 * @property {Object} TimesChangeType 每次数据改变的单位数据
	 */
	TimesChangeType: {
		ADD_ONE: 1, //加1
		SUB_ONE: -1 //减1
	},

	/**
	 * @property {Object} Sex 用户性别
	 */
	Sex: {
		MALE: 1, //男
		FEMALE: 2, //女
	},

	RefreshType: {
		LOAD: 1, //上拉加载
		REFRESH: 2 //下拉刷新
	},

	/**
	 * @property {Object} Page 每次分页的页最大数据量
	 */
	Page: {
		FIVE_ROW: 5,
		TEN_ROW: 10, //一页10行
		FIFTY_ROW: 50
	},

	/**
	 * @property {Object} HotDynamic 热门帖子最大请求数量
	 */
	HotDynamic: {
		MAX_ROW: 50 //热门帖子能查看的最大数量
	}
};