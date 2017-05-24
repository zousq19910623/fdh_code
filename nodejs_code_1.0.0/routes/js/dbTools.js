"use strict";

var config = require("./config.js");
var mysql = require("mysql");
var async = require("async");
var logger = require("./logger.js");
var moment = require("moment");
var toolkit = require("./toolkit.js");
var macro = require("./macro.js");

/**
 * @Class Toolkit
 * @classdesc 数据库查询服务类
 * @constructor DBTools
 * @example var dbTools = require('./js/dbTools.js');
 * @since version 0.1
 */
function DBTools() {
	this.name = "DBTools";
}

var pool = mysql.createPool({
	host: config.fdhDB.host,
	port: config.fdhDB.port,
	user: config.fdhDB.user,
	password: config.fdhDB.pass,
	debug: false,
	database: config.fdhDB.database,
	charset: "utf8"
});

/**
 * 事务：注册用户
 * @param {Object} paramsJSON
 * @param {Object} cbTrans
 */
DBTools.prototype.execTransRegUser = function(paramsJSON, cbTrans) {
	pool.getConnection(function(error, connection) {
		if(error) {
			logger.debug("execTransRegUser 获取连接报错：", error);
			if(cbTrans)
				cbTrans(error);
			return;
		}

		// 开始事务
		connection.beginTransaction(function(error) {
			if(error) {
				logger.debug("beginTransaction 开始事务报错：", error);
				if(cbTrans) {
					cbTrans(error);
				}
				connection.release();
				return;
			}

			async.waterfall([
				function(cb) {
					var sql_str = "insert into UserInfo(TokenID, NickName, HeadIconPath, BirthDay, Sex, CreateTime) values(?,?,?,?,?,?);";
					var paramArray = [paramsJSON.TokenID, paramsJSON.NickName, paramsJSON.HeadIconPath, paramsJSON.BirthDay, paramsJSON.Sex, paramsJSON.CreateTime];

					connection.query(sql_str, paramArray, function(error, result) {
						if(error) {
							cb(error);
						}
						else {
							cb(null, result.insertId);
						}
					});
				},

				function(userId, cb) {
					var paramsJSON = {
						"UserId": userId
					};
					var sql_str_begin = "INSERT INTO UserActiveTimes(";
					var sql_str_end = " VALUES(";
					var paramArray = [];

					for(var key in paramsJSON) {
						sql_str_begin = sql_str_begin + key + ",";
						sql_str_end = sql_str_end + "?,";
						paramArray.push(paramsJSON[key]);
					}

					sql_str_begin = sql_str_begin.substr(0, sql_str_begin.length - 1) + ")"; //INSERT INTO UserTimes(UserID)
					sql_str_end = sql_str_end.substr(0, sql_str_end.length - 1) + ");"; //VALUES(?);
					var sql_str = sql_str_begin + sql_str_end;

					connection.query(sql_str, paramArray, function(error, result) {
						if(error) {
							cb(error);
						}
						else {
							cb(null);
						}
					});
				}

			], function(error, result) {
				if(error) {
					connection.rollback(function(rollError) {
						if(rollError) {
							console.log(rollError);
						}
						connection.release();
						if(cbTrans) {
							cbTrans(error);
						}
					});
				}
				else {
					connection.commit(function(commitError, info) {
						if(commitError) {
							connection.rollback(function() {
								logger.debug("提交时报错: ", commitError);
								connection.release();
								if(cbTrans) {
									cbTrans(commitError);
								}
							});
						}
						else {
							connection.release();
							if(cbTrans) {
								cbTrans(null, info);
							}
						}
					});
				}
			});
		});
	});
};

/**
 * 事务：发布帖子
 * @param {Object} paramsJSON
 * @param {Object} cbTrans
 */
DBTools.prototype.execTransPublishDynamic = function(paramsJSON, cbTrans) {
	pool.getConnection(function(error, connection) {
		if(error) {
			logger.debug("execTransPublishDynamic 获取连接报错：", error);
			if(cbTrans)
				cbTrans(error);
			return;
		}

		// 开始事务
		connection.beginTransaction(function(error) {
			if(error) {
				logger.debug("beginTransaction 开始事务报错：", error);
				if(cbTrans) {
					cbTrans(error);
				}
				connection.release();
				return;
			}

			async.waterfall([
				function(cb) {
					var sql_str_begin = "INSERT INTO Dynamic(";
					var sql_str_end = " VALUES(";
					var paramArray = [];

					for(var key in paramsJSON) {
						sql_str_begin = sql_str_begin + key + ",";
						sql_str_end = sql_str_end + "?,";
						var tempValue = paramsJSON[key] == null ? "\'\'" : paramsJSON[key];
						paramArray.push(tempValue);
					}

					sql_str_begin = sql_str_begin.substr(0, sql_str_begin.length - 1) + ")"; //INSERT INTO Dynamic(DynamicID)
					sql_str_end = sql_str_end.substr(0, sql_str_end.length - 1) + ");"; //VALUES(?);
					var sql_str = sql_str_begin + sql_str_end;

					//console.log(sql_str);

					connection.query(sql_str, paramArray, function(error, result) {
						if(error) {
							cb(error);
						}
						else {
							cb(null, result.insertId);
						}
					});
				},

				function(dynamicId, cb) {
					var paramsJSON = {
						"DynamicID": dynamicId
					};

					var sql_str_begin = "INSERT INTO DynamicTimes(";
					var sql_str_end = " VALUES(";
					var paramArray = [];

					for(var key in paramsJSON) {
						sql_str_begin = sql_str_begin + key + ",";
						sql_str_end = sql_str_end + "?,";
						paramArray.push(paramsJSON[key]);
					}

					sql_str_begin = sql_str_begin.substr(0, sql_str_begin.length - 1) + ")"; //INSERT INTO DynamicTimes(DynamicID)
					sql_str_end = sql_str_end.substr(0, sql_str_end.length - 1) + ");"; //VALUES(?);
					var sql_str = sql_str_begin + sql_str_end;

					console.log(sql_str);
					logger.debug(sql_str);

					connection.query(sql_str, paramArray, function(error, result) {
						if(error) {
							cb(error);
						}
						else {
							cb(null, dynamicId);
						}
					});
				}

			], function(err, result) {
				if(err) {
					connection.rollback(function(err) {
						if(err) {
							console.log(err);
						}
						connection.release();
						if(cbTrans) {
							cbTrans(err);
						}
					});
				}
				else {
					connection.commit(function(err, info) {
						if(err) {
							connection.rollback(function() {
								logger.debug("提交时报错: ", err);
								connection.release();
								if(cbTrans) {
									cbTrans(err);
								}
							});
						}
						else {
							connection.release();
							if(cbTrans) {
								console.log(info);
								cbTrans(null, result);
							}
						}
					});
				}
			});
		});
	});
};

/**
 * 查询用户是否已经存在(publish)
 * @param {String} tokenId
 */
DBTools.prototype.isExist = function(tokenId, cb) {
	pool.query("select count(1) as count from UserInfo where TokenID = ?; ", [tokenId], function(err, rows) {
		if(err) {
			console.log("isExist ERROR " + err);
			cb(err);
		}
		else {
			cb(null, rows[0].count);
		}
	});
};


/**
 * 查询用户是否已经喜欢过帖子(unused)
 * @param {Number} userId
 * @param {Number} dynamicId
 */
DBTools.prototype.isExistFond = function(userId, dynamicId, cb) {
	pool.query("select count(1) as count from FondDynamic where UserID = ? and FondDynamicID = ?;", [userId, dynamicId], function(err, rows) {
		if(err) {
			cb(err);
		}
		else {
			cb(null, rows[0].count);
		}
	});
};

/**
 * 查询用户是否已经关注过其它用户(unused)
 * @param {Number} userId
 * @param {Number} beFocusUserId
 */
DBTools.prototype.isExistFocus = function(userId, beFocusUserId, cb) {
	pool.query("select count(1) as count from Focus where UserID = ? and FocusUserID = ?;", [userId, beFocusUserId], function(err, rows) {
		if(err) {
			cb(err);
		}
		else {
			cb(null, rows[0].count);
		}
	});
};

/**
 * 查询用户是否已经收藏过帖子(unused)
 * @param {Number} userId
 * @param {Number} dynamicId
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.isExistCollect = function(userId, dynamicId, cb) {
	pool.query("select count(1) as count from Collect where UserID = ? and DynamicID = ?;", [userId, dynamicId], function(err, rows) {
		if(err) {
			cb(err);
		}
		else {
			cb(null, rows[0].count);
		}
	});
};

/**
 * 查询用户是否举报过某内容(publish)
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.getReportList = function(paramsJSON, cb) {
	var sql_str = "select RelationID from Report where ReporterID = ? and ReportType = ? and RelationID in (" + paramsJSON.RelationIdList + ");";
	var paramArray = [paramsJSON.ReporterID, paramsJSON.ReportType];
	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 查询用户是否对帖子进行过某些操作(publish)
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.execDynamicOpProc = function(paramsJSON, cb) {
	var sql_str = "CALL select_dynamic_op(";

	for(var key in paramsJSON) {
		sql_str = sql_str + paramsJSON[key] + ",";
	}
	sql_str = sql_str.substr(0, sql_str.length - 1) + ");";

	logger.debug("查询对帖子操作标志：", sql_str);

	pool.query(sql_str, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};


/**
 * 执行评论的存储过程
 * @param {Object} paramsJSON
 * @param {Object} cb
 */
DBTools.prototype.execCommentProc = function(paramsJSON, cb){
	var sql_str = "CALL publish_comment(";

	for(var key in paramsJSON) {
		sql_str = sql_str + paramsJSON[key] + ",";
	}
	sql_str = sql_str.substr(0, sql_str.length - 1) + ");";

	logger.debug("发表评论：", sql_str);

	pool.query(sql_str, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 创建用户信息(publish)
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.createUserInfo = function(paramsJSON, cb) {
	var sql_str = "insert into UserInfo(UserID, NickName, HeadIconPath, CreateTime) values(?,?,?,?);";
	var paramArray = [paramsJSON.UserID, paramsJSON.NickName, paramsJSON.HeadIconPath, paramsJSON.CreateTime];

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 更新用户信息(publish)
 * @param {Number} userId
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.updateUserInfo = function(userId, paramsJSON, cb) {
	var sql_str = "update UserInfo set ";
	var paramArray = [];

	for(var key in paramsJSON) {
		sql_str = sql_str + key + " = ?,";
		paramArray.push(paramsJSON[key]);
	}
	sql_str = sql_str.substr(0, sql_str.length - 1) + " where UserID = " + userId;
	console.log(sql_str);
	console.log(paramArray);

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 通过TOKENID查找用户信息
 * @param {Object} paramsJSON
 * @param {Object} cb
 */
DBTools.prototype.selectUserInfoByTokenId = function(paramsJSON, cb) {
	var sql_str = "select * from UserInfo where TokenID = ?;";
	var paramArray = [paramsJSON.TokenID];

	logger.debug("TOKENID查询语句: ", sql_str, " 参数：", paramArray);

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 查询用户（列表）信息(publish)
 * @param {Object} paramsJSON 参数集合
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectUserInfoByIdList = function(paramsJSON, cb) {
	var sql_str = "select * from UserInfo where UserID in (" + paramsJSON.UserIdList + ");";
	var paramArray = [];

	logger.debug("查询用户（列表）信息: ", sql_str);

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 通过名字查询用户信息
 * @param {Object} paramsJSON 参数集合
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectUserInfoByName = function(paramsJSON, cb) {
	var sql_str = "select * from UserInfo where NickName like \"%" + paramsJSON.NickName + "%\";";
	var paramArray = [];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 查询用户次数信息,包含关注，喜欢，收藏，喜欢次数等(publish)
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.execUserTimesProc = function(paramsJSON, cb) {
	var sql_str = "CALL select_user_times(" + paramsJSON.UserID + ");";

	console.log(sql_str);

	pool.query(sql_str, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 插入一条帖子信息
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.createDynamic = function(paramsJSON, cb) {
	var sql_str_begin = "INSERT INTO Dynamic(";
	var sql_str_end = " VALUES(";
	var paramArray = [];

	for(var key in paramsJSON) {
		sql_str_begin = sql_str_begin + key + ",";
		sql_str_end = sql_str_end + "?,";
		var tempValue = paramsJSON[key] == null ? "\'\'" : paramsJSON[key];
		paramArray.push(tempValue);
	}

	sql_str_begin = sql_str_begin.substr(0, sql_str_begin.length - 1) + ")"; //INSERT INTO Dynamic(DynamicID)
	sql_str_end = sql_str_end.substr(0, sql_str_end.length - 1) + ");"; //VALUES(?);
	var sql_str = sql_str_begin + sql_str_end;

	//console.log(sql_str);

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 更新帖子信息
 * @param {Number} dynamicId
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.updateDynamicInfo = function(dynamicId, paramsJSON, cb) {
	var sql_str = "UPDATE Dynamic SET ";
	var paramArray = [];

	for(var key in paramsJSON) {
		sql_str = sql_str + key + " = ?,";
		paramArray.push(paramsJSON[key]);
	}
	sql_str = sql_str.substr(0, sql_str.length - 1) + " WHERE DynamicID = " + dynamicId + ";";

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 删除帖子(publish)
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.deleteDynamic = function(paramsJSON, cb) {
	if(paramsJSON.UserID < 0 || paramsJSON.DynamicID <= 0) {
		logger.debug("DBTools deleteDynamic 参数错误：");
		return;
	}

	var sql_str = "CALL delete_dynamic(" + paramsJSON.UserID + ", " + paramsJSON.DynamicID + ", @result);";

	console.log(sql_str);

	pool.query(sql_str, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 更新帖子补喜欢的次数()
 * @param {Number} dynamicId
 * @param {Number} flag(1、喜欢，2、消除喜欢)
 * @param {Object} cb
 */
DBTools.prototype.updateFondTimes = function(dynamicId, flag, cb) {
	var sql_str = "UPDATE Dynamic SET FondTimes = if(?, FondTimes + 1, if(FondTimes - 1 < 0, 0, FondTimes - 1)) where dynamicId = ?;";
	var paramArray = [flag, dynamicId];

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 用户发布的帖子数(unused)
 * @param {Number} userId
 * @param {Object} cb
 */
DBTools.prototype.selectPublishCount = function(userId, cb) {
	var sql_str = "select count(1) as COUNT from Dynamic where UserID = ?;";
	var paramArray = [userId];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/** 通过ID查询帖子
 * @param {Number} dynamicId 参数集合
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectDynamicById = function(dynamicId, cb) {
	var sql_str = "select * from Dynamic where DynamicID = ?";
	var paramArray = [dynamicId];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 通过USERID列表和时间查询上拉加载的帖子(publish)
 * @param {Object} paramsJSON 参数集合
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectDynamicByTimeLoad = function(paramsJSON, cb) {
	var sql_str = "select * from Dynamic where UserID in (" + paramsJSON.UserIdList + ") and CreateTime < ? ORDER BY CreateTime desc limit 10";
	var paramArray = [paramsJSON.CreateTime];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 通过USERID列表和时间查询下拉刷新的帖子(publish)
 * @param {Object} paramsJSON 参数集合
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectDynamicByTimeRefresh = function(paramsJSON, cb) {
	var sql_str = "select * from Dynamic where UserID in (" + paramsJSON.UserIdList + ") and CreateTime > ? ORDER BY CreateTime asc limit 10";
	var paramArray = [paramsJSON.CreateTime];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 通过时间查询上拉加载所有的帖子(publish)
 * @param {Object} paramsJSON 参数集合
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectAllDynamicByTimeLoad = function(paramsJSON, cb) {
	var sql_str = "select * from Dynamic where CreateTime < ? ORDER BY CreateTime desc limit 10";
	var paramArray = [paramsJSON.CreateTime];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 通过时间查询下拉刷新所有的帖子(publish)
 * @param {Object} paramsJSON 参数集合
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectAllDynamicByTimeRefresh = function(paramsJSON, cb) {
	var sql_str = "select * from Dynamic where CreateTime > ? ORDER BY CreateTime asc limit 10";
	var paramArray = [paramsJSON.CreateTime];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 通过地址查找帖子，上拉(publish)
 * @param {Object} paramsJSON 参数集合
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectDynamicListByPosLoad = function(paramsJSON, cb) {
	var sql_str = "select * from Dynamic where Location like \"%" + paramsJSON.Position + "%\" and CreateTime < ? ORDER BY CreateTime desc limit 10;";
	var paramArray = [paramsJSON.CreateTime];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 通过地址查找帖子，下拉(publish)
 * @param {Object} paramsJSON 参数集合
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectDynamicListByPosRefresh = function(paramsJSON, cb) {
	var sql_str = "select * from Dynamic where Location like \"%" + paramsJSON.Position + "%\" and CreateTime > ? ORDER BY CreateTime asc limit 10;";
	var paramArray = [paramsJSON.CreateTime];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 通过dynamicId列表找出所有帖子
 * @param {Object} paramsJSON 参数集合
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectDynamicByIdList = function(paramsJSON, cb) {
	var sql_str = "select * from Dynamic where DynamicID in (" + paramsJSON.dynamicIdList + ") ORDER BY CreateTime desc limit 10;";
	var paramArray = [];

	logger.debug("selectDynamicByIdList: ", sql_str);

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 根据时间查询粉丝(publish)
 * @param {Object} paramsJSON
 * @param {Object} cb
 */
DBTools.prototype.selectFansListByTime = function(paramsJSON, cb) {
	var sql_str = "select * from Focus where FocusUserID = ? and CreateTime < ? ORDER BY CreateTime desc limit 50";
	var paramArray = [paramsJSON.FocusUserID, paramsJSON.CreateTime];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 查询用户关注的用户总数(unused)
 * @param {Number} userId
 * @param {Object} cb
 */
DBTools.prototype.selectFocusCount = function(userId, cb) {
	var sql_str = "select count(1) as COUNT from Focus where UserID = ?;";
	var paramArray = [userId];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 *查询用户的粉丝数(unused)
 * @param {Number} userId
 * @param {Object} cb
 */
DBTools.prototype.selectFansCount = function(userId, cb) {
	var sql_str = "select count(1) as COUNT from Focus where FocusUserID = ?;";
	var paramArray = [userId];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 查询用户关注的用户(publish)
 * @param {Object} paramsJSON
 * @param {Object} cb
 */
DBTools.prototype.selectFocusListById = function(paramsJSON, cb) {
	var sql_str = "select * from Focus where UserID = ?";
	var paramArray = [paramsJSON.UserID];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 根据时间查询关注玩家
 * @param {Object} paramsJSON
 * @param {Object} cb
 */
DBTools.prototype.selectFocusListByTime = function(paramsJSON, cb) {
	var sql_str = "select * from Focus where UserID = ? and CreateTime < ? ORDER BY CreateTime desc limit 50";
	var paramArray = [paramsJSON.UserID, paramsJSON.CreateTime];
	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 查找用户是否在userid的关注列表中，存在则返回(publish)
 * @param {Object} paramsJSON
 * @param {Object} cb
 */
DBTools.prototype.selectFocusInIdList = function(paramsJSON, cb) {
	var sql_str = "select FocusUserID as FindId from Focus where UserID = ? and FocusUserID in (" + paramsJSON.FindIdList + ");";
	var paramArray = [paramsJSON.UserID];
	
	logger.log("查找关注列表：", sql_str);

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 查找用户是否在userid的粉丝列表中，存在则返回
 * @param {Object} paramsJSON
 * @param {Object} cb
 */
DBTools.prototype.selectFansInIdList = function(paramsJSON, cb) {
	var sql_str = "select UserID as FindId from Focus where FocusUserID = ? and UserID in (" + paramsJSON.FindIdList + ");";
	var paramArray = [paramsJSON.UserID];
	
	logger.log("查找粉丝列表：", sql_str);

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 关注玩家
 * @param {Object} paramsJSON
 * @param {Object} cb
 */
DBTools.prototype.createFocus = function(paramsJSON, cb) {
	var sql_str_begin = "INSERT INTO Focus(";
	var sql_str_end = "VALUES(";
	var paramArray = [];

	for(var key in paramsJSON) {
		sql_str_begin = sql_str_begin + key + ",";
		sql_str_end = sql_str_end + "?,";
		paramArray.push(paramsJSON[key]);
	}

	sql_str_begin = sql_str_begin.substr(0, sql_str_begin.length - 1) + ")"; //INSERT INTO Focus(FocusUserID)
	sql_str_end = sql_str_end.substr(0, sql_str_end.length - 1) + ");"; //VALUES(?);
	var sql_str = sql_str_begin + sql_str_end;

	console.log(sql_str);

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 取消关注
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.deleteFocus = function(paramsJSON, cb) {
	var sql_str = "DELETE FROM Focus WHERE FocusUserID = ? and UserID = ?";
	var paramArray = [paramsJSON.FocusUserID, paramsJSON.UserID];

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 插入一条评论
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 * 
 */
DBTools.prototype.createComment = function(paramsJSON, cb) {
	var sql_str_begin = "INSERT INTO Comment(";
	var sql_str_end = "VALUES(";
	var paramArray = [];

	for(var key in paramsJSON) {
		sql_str_begin = sql_str_begin + key + ",";
		sql_str_end = sql_str_end + "?,";
		paramArray.push(paramsJSON[key]);
	}

	sql_str_begin = sql_str_begin.substr(0, sql_str_begin.length - 1) + ")"; //INSERT INTO Comment(DynamicID)
	sql_str_end = sql_str_end.substr(0, sql_str_end.length - 1) + ");"; //VALUES(?);
	var sql_str = sql_str_begin + sql_str_end;

	console.log(sql_str);

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 删除评论
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 * paramsJSON = {
 *				userId : 4321,		//操作者ID
 * 				commentId : 5678, 	//评论ID
 * }
 */
DBTools.prototype.deleteComment = function(paramsJSON, cb) {
	var sql_str = "DELETE FROM Comment WHERE CommentID = ? and CommentUserID = ?;";
	var paramArray = [paramsJSON.CommentID, paramsJSON.CommentUserID];

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 删除某一个帖子的所有评论
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 * }
 */
DBTools.prototype.deleteCommentByDynamicId = function(paramsJSON, cb) {
	var sql_str = "DELETE FROM Comment WHERE DynamicID = ?;";
	var paramArray = [paramsJSON.DynamicID];

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 通过帖子ID查询它的所有评论与回复
 * @param {Number} dynamicId
 * @param {Object} cb
 */
DBTools.prototype.selectCommentByDynamicId = function(dynamicId, cb) {
	var sql_str = "select * from Comment where DynamicID = ? order by BelongCommentID asc, CommentTime desc;";
	var paramArray = [dynamicId];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 通过帖子ID查询它的所有评论与回复时间升序
 * @param {Number} dynamicId
 * @param {Object} cb
 */
DBTools.prototype.selectCommentByDynamicIdTimeAsc = function(dynamicId, cb) {
	var sql_str = "select * from Comment where DynamicID = ? order by BelongCommentID asc, CommentTime asc;";
	var paramArray = [dynamicId];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 查找帖子最近的一条评论
 * @param {Number} dynamicId
 * @param {Object} cb
 */
DBTools.prototype.selectLastCommentInDynamic = function(dynamicId, cb) {
	var sql_str = "select * from Comment where DynamicID = ? and BeCommentID = 0 order by CommentTime desc limit 1;";
	var paramArray = [dynamicId];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 查询评论
 * @param {Number} commentId
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectCommentByCommentId = function(commentId, cb) {
	var sql_str = "select * from Comment where CommentID = ?;";
	var paramArray = [commentId];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 通过ID列表查询评论内容(publish)
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectCommentByIdList = function(paramsJSON, cb) {
	var sql_str = "select * from Comment where CommentID in (" + paramsJSON.CommentIdList + ")";
	var paramArray = [];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 根据userid查找评论
 * @param {Object} paramsJSON
 * @param {Object} cb
 */
DBTools.prototype.selectUserCommentByTime = function(paramsJSON, cb) {
	var sql_str = "select * from Comment where CommentUserID = ? and CommentTime < ? ORDER BY CommentTime desc limit 10;";
	var paramArray = [paramsJSON.CommentUserID, paramsJSON.CommentTime];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 标记帖子为喜欢
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 * 
 */
DBTools.prototype.createFondDynamic = function(paramsJSON, cb) {
	var sql_str_begin = "INSERT INTO FondDynamic(";
	var sql_str_end = "VALUES(";
	var paramArray = [];

	for(var key in paramsJSON) {
		sql_str_begin = sql_str_begin + key + ",";
		sql_str_end = sql_str_end + "?,";
		paramArray.push(paramsJSON[key]);
	}

	sql_str_begin = sql_str_begin.substr(0, sql_str_begin.length - 1) + ")"; //INSERT INTO FondDynamic(FondDynamicID)
	sql_str_end = sql_str_end.substr(0, sql_str_end.length - 1) + ");"; //VALUES(?);
	var sql_str = sql_str_begin + sql_str_end;

	console.log(sql_str);

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 不喜欢帖子(删除该条数据)
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.deleteFondDynamic = function(paramsJSON, cb) {
	var sql_str = "DELETE FROM FondDynamic WHERE FondDynamicID = ? and UserID = ?";
	var paramArray = [paramsJSON.FondDynamicID, paramsJSON.UserID];

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 根据userId查找喜欢的帖子(publish)
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectFondByTime = function(paramsJSON, cb) {
	var sql_str = "select * from FondDynamic where UserID = ? and CreateTime < ? ORDER BY CreateTime desc limit 10;";
	var paramArray = [paramsJSON.UserID, paramsJSON.CreateTime];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 *查询用户喜欢的帖子数(unused)
 * @param {Number} userId
 * @param {Object} cb
 */
DBTools.prototype.selectFondCount = function(userId, cb) {
	var sql_str = "select count(1) as COUNT from FondDynamic where UserID = ?;";
	var paramArray = [userId];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 查询喜欢某个帖子的用户ID
 * @param {Object} paramsJSON 参数(dynamic, time);
 * @param {Function} cb
 */
DBTools.prototype.selectFondInfoByTime = function(paramsJSON, cb) {
	var sql_str = "select * from FondDynamic where FondDynamicID = ? and CreateTime < ? ORDER BY CreateTime desc limit " + paramsJSON.Limit;
	var paramArray = [paramsJSON.FondDynamicID, paramsJSON.CreateTime];

	logger.debug("selectFondInfoByTime: ", sql_str);

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 通过名字查询用户信息
 * @param {Object} paramsJSON 参数集合
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectUserInfoByName = function(paramsJSON, cb) {
	var sql_str = "select * from UserInfo where NickName like \"%" + paramsJSON.NickName + "%\";";
	var paramArray = [];

	console.log(sql_str);

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 记录通告内容
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 * 
 */
DBTools.prototype.createNotice = function(paramsJSON, cb) {
	var sql_str_begin = "INSERT INTO Notice(";
	var sql_str_end = "VALUES(";
	var paramArray = [];

	for(var key in paramsJSON) {
		sql_str_begin = sql_str_begin + key + ",";
		sql_str_end = sql_str_end + "?,";
		paramArray.push(paramsJSON[key]);
	}

	sql_str_begin = sql_str_begin.substr(0, sql_str_begin.length - 1) + ")"; //INSERT INTO Notice(UserID)
	sql_str_end = sql_str_end.substr(0, sql_str_end.length - 1) + ");"; //VALUES(?);
	var sql_str = sql_str_begin + sql_str_end;

	logger.debug(sql_str);
	logger.debug("createNotice参数: ", paramArray);

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 删除通知消息(publish)
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.deleteNotice = function(paramsJSON, cb) {
	var sql_str = "DELETE FROM Notice WHERE BeNoticeUserID = ? AND NoticeID in (" + paramsJSON.NoticeIdList + ");";
	var paramArray = [paramsJSON.BeNoticeUserID];
	
	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 查找指定用户的通知消息
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectNotcieByTime = function(paramsJSON, cb) {
	var sql_str = "select * from Notice where BeNoticeUserID = ? and NoticeType = ? and CreateTime < ? ORDER BY CreateTime desc limit 10;";
	var paramArray = [paramsJSON.BeNoticeUserID, paramsJSON.NoticeType, paramsJSON.CreateTime];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 查找用户的被通知的列表
 * @param {Number} beNoticeUserId
 * @param {Object} cb
 */
DBTools.prototype.selectNoticeList = function(beNoticeUserId, cb) {
	var sql_str = "select BeNoticeUserID, NoticeType, count(1) as COUNT from Notice where BeNoticeUserID = ? and IsRead = 0 GROUP BY NoticeType;";
	var paramArray = [beNoticeUserId];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 查找用户的被通知的列表
 * @param {Object} paramsJSON
 * @param {Object} cb
 */
DBTools.prototype.updateNoticeReadState = function(paramsJSON, cb) {
	var sql_str = "update Notice set IsRead = ? where BeNoticeUserID = ? and NoticeType = ? and IsRead = 0;";
	var paramArray = [paramsJSON.IsRead, paramsJSON.BeNoticeUserID, paramsJSON.NoticeType];

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 插入收藏信息
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 * 
 */
DBTools.prototype.createCollect = function(paramsJSON, cb) {
	var sql_str_begin = "INSERT INTO Collect(";
	var sql_str_end = "VALUES(";
	var paramArray = [];

	for(var key in paramsJSON) {
		sql_str_begin = sql_str_begin + key + ",";
		sql_str_end = sql_str_end + "?,";
		paramArray.push(paramsJSON[key]);
	}

	sql_str_begin = sql_str_begin.substr(0, sql_str_begin.length - 1) + ")"; //INSERT INTO Collect(UserID)
	sql_str_end = sql_str_end.substr(0, sql_str_end.length - 1) + ");"; //VALUES(?);
	var sql_str = sql_str_begin + sql_str_end;

	console.log(sql_str);
	logger.debug(sql_str);

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 删除用户收藏的帖子
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.deleteCollect = function(paramsJSON, cb) {
	var sql_str = "DELETE FROM Collect WHERE UserID = ? AND DynamicID = ?;";
	var paramArray = [paramsJSON.UserID, paramsJSON.DynamicID];

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 查找用户收藏的帖子
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectCollectByTime = function(paramsJSON, cb) {
	var sql_str = "select * from Collect where UserID = ? and CollectTime < ? ORDER BY CollectTime desc limit 10;";
	var paramArray = [paramsJSON.UserID, paramsJSON.CollectTime];

	logger.debug("selectCollectByTime SQL: ", sql_str);

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 用户收藏的帖子数(unused)
 * @param {Number} userId
 * @param {Function} cb
 */
DBTools.prototype.selectCollectCount = function(userId, cb) {
	var sql_str = "select count(1) as COUNT from Collect where UserID = ?;";
	var paramArray = [userId];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 插入举报信息
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 * 
 */
DBTools.prototype.createReport = function(paramsJSON, cb) {
	var sql_str_begin = "INSERT INTO Report(";
	var sql_str_end = "VALUES(";
	var paramArray = [];

	for(var key in paramsJSON) {
		sql_str_begin = sql_str_begin + key + ", ";
		sql_str_end = sql_str_end + "?, ";
		paramArray.push(paramsJSON[key]);
	}

	sql_str_begin = sql_str_begin.substr(0, sql_str_begin.length - 1) + ")"; //INSERT INTO Report(DynamicID)
	sql_str_end = sql_str_end.substr(0, sql_str_end.length - 1) + ");"; //VALUES(?);
	var sql_str = sql_str_begin + sql_str_end;

	console.log(sql_str);
	logger.debug(sql_str);

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 插入帖子相关次数数据
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 * 
 */
DBTools.prototype.createDynamicTimes = function(paramsJSON, cb) {
	var sql_str_begin = "INSERT INTO DynamicTimes(";
	var sql_str_end = "VALUES(";
	var paramArray = [];

	for(var key in paramsJSON) {
		sql_str_begin = sql_str_begin + key + ",";
		sql_str_end = sql_str_end + "?,";
		paramArray.push(paramsJSON[key]);
	}

	sql_str_begin = sql_str_begin.substr(0, sql_str_begin.length - 1) + ")"; //INSERT INTO DynamicTimes(DynamicID)
	sql_str_end = sql_str_end.substr(0, sql_str_end.length - 1) + ");"; //VALUES(?);
	var sql_str = sql_str_begin + sql_str_end;

	console.log(sql_str);
	logger.debug(sql_str);

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 删除帖子次数数据
 * @param {Number} dynamicId
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.deleteDynamicTimes = function(dynamicId, cb) {
	var sql_str = "DELETE FROM DynamicTimes WHERE DynamicID = ?;";
	var paramArray = [dynamicId];

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 查找帖子次数数据
 * @param {Number} dynamicId
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectDynamicTimes = function(dynamicId, cb) {
	var sql_str = "select * from DynamicTimes where DynamicID = ?;";
	var paramArray = [dynamicId];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 更新帖子次数信息
 * @param {Number} dynamicId
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.updateDynamicTimes = function(dynamicId, paramsJSON, cb) {
	var sql_str = "UPDATE DynamicTimes SET ";
	var paramArray = [];

	for(var key in paramsJSON) {
		sql_str = sql_str + key + " = ?,";
		paramArray.push(paramsJSON[key]);
	}
	sql_str = sql_str.substr(0, sql_str.length - 1) + " WHERE DynamicID = " + dynamicId + ";";

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 插入用户相关次数数据(publish)
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 * 
 */
DBTools.prototype.createUserTimes = function(paramsJSON, cb) {
	var sql_str_begin = "INSERT INTO UserTimes(";
	var sql_str_end = "VALUES(";
	var paramArray = [];

	for(var key in paramsJSON) {
		sql_str_begin = sql_str_begin + key + ",";
		sql_str_end = sql_str_end + "?,";
		paramArray.push(paramsJSON[key]);
	}

	sql_str_begin = sql_str_begin.substr(0, sql_str_begin.length - 1) + ")"; //INSERT INTO UserTimes(UserID)
	sql_str_end = sql_str_end.substr(0, sql_str_end.length - 1) + ");"; //VALUES(?);
	var sql_str = sql_str_begin + sql_str_end;

	console.log(sql_str);
	logger.debug(sql_str);

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 删除用户活跃次数数据(publish)
 * @param {Number} dynamicId
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.deleteUserActiveTimes = function(userId, cb) {
	var sql_str = "DELETE FROM UserActiveTimes WHERE UserID = ?;";
	var paramArray = [userId];

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 查找用户活跃次数数据(publish)
 * @param {Number} userId
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectUserActiveTimes = function(userId, cb) {
	var sql_str = "select * from UserActiveTimes where UserId = ?;";
	var paramArray = [userId];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 更新用户活跃次数信息(publish)
 * @param {Number} userId
 * @param {Object} paramsJSON
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.updateUserActiveTimes = function(userId, paramsJSON, cb) {
	var sql_str = "UPDATE UserActiveTimes SET ";
	var paramArray = [];

	for(var key in paramsJSON) {
		sql_str = sql_str + key + " = ?,";
		paramArray.push(paramsJSON[key]);
	}
	sql_str = sql_str.substr(0, sql_str.length - 1) + " WHERE UserID = " + userId + ";";

	pool.query(sql_str, paramArray, function(error, result) {
		toolkit.modifyCB(error, result, cb);
	});
};

/**
 * 查找活跃用户数据(publish)
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectActiveUser = function(cb) {
	var sql_str = "select * from UserActiveTimes order by PublishTimes desc, ReadTimes desc limit 50;";
	var paramArray = [];

	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

/**
 * 查找热门帖子数据(publish)
 * @param {Number} startRow 起始行
 * @param {Number} endRow 结束行
 * @param {Function} cb 回调函数()
 */
DBTools.prototype.selectHotDynamic = function(startRow, endRow, cb) {
	var sql_str = "select * from DynamicTimes ORDER BY ReadTimes desc, ShareTimes desc limit ?, ?;";
	var paramArray = [startRow, endRow];
	
	pool.query(sql_str, paramArray, function(error, rows) {
		toolkit.selectCB(error, rows, cb);
	});
};

module.exports = new DBTools();