var info = {
	ERR_SUCCESS:[0, "操作成功"],
	ERR_PARAM: [1,"参数错误"],
	ERR_NATIVE: [2,"运行时异常"],
	ERR_DB: [60,"数据库错误"],
	ERR_EMPTY: [61,"数据为空"],
	ERR_NATIVE: [101,"手机号和租约不匹配"],
	ERR_NATIVE: [102,"房东未开通在线支付"],
	ERR_CUSTOM: [999,"自定义错误"],
	ERR_USER_EXIST: [1000, "用户已存在"],
	ERR_MYSQL_SELECT:[1001, "数据库查询错误"],
	ERR_MYSQL_SELECT_RESULT:[1002, "数据库查询结果错误"],
	ERR_MYSQL_UPDATE:[1003, "数据库更新错误"],
	ERR_MYSQL_INSERT:[1004, "数据库插入错误"],
	ERR_MYSQL_DELETE:[1005, "数据库删除失败"],
	ERR_REDIS_DISCONNECT:[1006, "redis未连接"],
	ERR_USER_NOT_EXIST:[1007, "用户不存在"],
	ERR_FOND_EXIST_STATE:[1008, "用户喜欢的帖子状态错误"],
	ERR_HAS_FOCUS:[1009, "已经关注过"],
	ERR_HAS_COLLECT:[1010, "已经收藏"],
	ERR_ADD_FOND_SUCCESS:[1011, "添加喜欢成功"],
	ERR_CANCEL_FOND_SUCCESS:[1012, "取消喜欢成功"],
	ERR_SELECT_DYNAMIC:[1013, "查询帖子错误"],
	ERR_DYNAMIC_NOT_EXIST:[1014, "帖子不存在"],
	ERR_NOT_EXIST_FANS:[1015, "没有关注你的粉丝"],
	ERR_NOT_EXIST_FOCUS:[1016, "你没有关注过用户"],
	ERR_NOT_RECOMMEND:[1017, "没有可推荐的用户"],
	ERR_INNER_PARAMS:[1018, "函数传参错误"],
	ERR_CANNOT_DELETE_DYNAMIC:[1019, "不能删除别人的帖子"],
	ERR_NO_FOUCS_NOTICE:[1020, "没有被关注的通知"],
	ERR_NO_COMMENT_NOTICE:[1021, "没有被评论的通知"],
	ERR_NO_FOND_NOTICE:[1022, "没有被喜欢的通知"],
	ERR_COMMENT_FAILED:[1023, "发表评论失败"]
}

/**
 * 获得错误对象
 * @param {Object} name
 * @param {Object} msg
 */
exports.getError = function(name,msg){
	if(name in info){
		var obj = info[name];
		return {errCode:obj[0], errMsg: (msg || obj[1])};
	}
	else{
		return {errCode:name, errMsg: (msg || "未知错误")};
	}
}
