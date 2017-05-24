var querystring = require("querystring");
var request = require('request');
var moment = require('moment');
var async = require("async");

var logger = require("./logger.js");
var dbTools = require("./dbTools.js");
//console.log(dbTools);
//for(var key in dbTools){
//	console.log(key + ":" + dbTools[key]);
//}
var redisTools = require("./redisTools.js");
var errConfig = require("./errConfig.js");
var macro = require("./macro.js");
var config = require("./config.js");
var toolkit = require("./toolkit.js");

/**
 * @Class Common
 * @classdesc 公共方法,高频率使用方法移植到这里
 * @constructor Common
 * @example var eventManager = require('./js/Common.js');
 * @since version 0.1
 */
function Common() {
	
}

/**
 * 查询用户数据
 * @param {Number} userId 用户ID
 * @param {Object} callback 回调函数
 */
Common.prototype.getUserInfo = function(userId, callback) {
	if(!callback) {
		return;
	}

	var user_key = macro.PreKey.PRE_USER_KEY + userId;
	redisTools.getValueByKey(user_key, function(error, result) {
		//如果报错或者值为空则从数据库取数据
		if(error || result == null) {
			var paramsJSON = {
				"UserIdList": userId
			};
			dbTools.selectUserInfoByIdList(paramsJSON, function(error, rows) {
				if(error) {
					Common.prototype.log(__filename, "getUserInfo selectUserInfoById 查询报错： ", error);
					callback(errConfig.getError("ERR_USER_NOT_EXIST"));
				} else {
					try {
						if(rows.length > 0) {
							var temp = JSON.stringify(rows[0]);
							Common.prototype.log(__filename, ": getUserInfo ==> ", temp);

							//将数据存入内存
							redisTools.setValueByKey(user_key, temp);
							redisTools.pexpireByKey(user_key, macro.Interval.TEN_MIN);

							callback(null, JSON.parse(temp));
						} else {
							callback(null, null);
						}
					} catch(e) {
						console.log(e);
					}
				}
			});
		} else {
			try {
				Common.prototype.log(__filename, "REDIS KEY:[" + user_key + "]的查询结果==> ", result);
				callback(null, JSON.parse(result));
			} catch(e) {
				console.log(e);
			}
		}
	});
};

/**
 * 更新用户信息
 * @param {Object} userInfo 一条具体的用户内容
 * @param {Object} columnsJSON 需要更新的键值对
 * @param {Object} callback
 */
Common.prototype.updateUserInfo = function(userInfo, columnsJSON, callback) {
	if(!userInfo || !columnsJSON) {
		logger.debug("更新新的用户数据参数错误：", userInfo, "列参数：", columnsJSON);
		return;
	}

	var user_key = macro.PreKey.PRE_USER_KEY + userInfo.UserID;
	try {
		var userInfoStr = JSON.stringify(userInfo);
		Common.prototype.log(__filename, "更新新的用户数据 ==> ", userInfoStr);

		//重新赋值新的内容到REDIS
		redisTools.setValueByKey(user_key, userInfoStr);

		//更新数据库
		dbTools.updateUserInfo(userInfo.UserID, columnsJSON, function(error, result) {
			if(callback) {
				if(error) {
					logger.debug(__filename + ": updateUserInfo: ", error);
					callback(error);
				} else {
					callback(null, result);
				}
			}
		});
	} catch(e) {
		console.log(e);
	}
};

/**
 * 查询用户次数数据
 * @param {Number} userId 用户ID
 * @param {Object} callback 回调函数
 */
Common.prototype.getUserActiveTimes = function(userId, callback) {
	if(!callback) {
		return;
	}

	var user_key = macro.PreKey.PRE_USERACTIVETIMES_KEY + userId;
	redisTools.getValueByKey(user_key, function(error, result) {
		//如果报错或者值为空则从数据库取数据
		if(error || result == null) {
			dbTools.selectUserActiveTimes(userId, function(error, rows) {
				if(error) {
					logger.debug("getUserActiveTimes selectUserActiveTimes 查询报错： ", error);
					callback(errConfig.getError("ERR_USER_NOT_EXIST"));
				} else {
					try {
						if(rows.length > 0) {
							var temp = JSON.stringify(rows[0]);
							Common.prototype.log(__filename, ": getUserActiveTimes ==> ", temp);

							//将数据存入内存
							redisTools.setValueByKey(user_key, temp);
							redisTools.pexpireByKey(user_key, macro.Interval.TEN_MIN);

							callback(null, JSON.parse(temp));
						} else {
							callback(null, null);
						}
					} catch(e) {
						console.log(e);
					}
				}
			});
		} else {
			try {
				Common.prototype.log(__filename, "REDIS KEY:[" + user_key + "]的查询结果==> ", result);
				callback(null, JSON.parse(result));
			} catch(e) {
				console.log(e);
			}
		}
	});
};

/**
 * 更新用户次数信息
 * @param {Object} userInfo 一条具体的用户内容
 * @param {Object} columnsJSON 需要更新的键值对
 * @param {Object} callback
 */
Common.prototype.updateUserActiveTimes = function(userActiveTimes, columnsJSON, callback) {
	if(!userActiveTimes || !columnsJSON) {
		logger.debug("updateUserActiveTimes 参数错误：", userActiveTimes, "列参数：", columnsJSON);
		return;
	}

	var user_key = macro.PreKey.PRE_USERACTIVETIMES_KEY + userActiveTimes.UserID;
	try {
		var userActiveTimesStr = JSON.stringify(userActiveTimes);
		Common.prototype.log(__filename, "更新新的用户次数数据 ==> ", userActiveTimesStr);

		//重新赋值新的内容到REDIS
		redisTools.setValueByKey(user_key, userActiveTimesStr);

		//更新数据库
		dbTools.updateUserActiveTimes(userActiveTimes.UserID, columnsJSON, function(error, result) {
			if(callback) {
				if(error) {
					logger.debug(__filename, ": updateUserActiveTimes: ", error);
					callback(error);
				} else {
					callback(null, result);
				}
			}
		});
	} catch(e) {
		console.log(e);
	}
};

/**
 * 更新用户次数信息(公共的)
 * @param {Number} userId 帖子ID
 * @param {Object} columnsJSON 需要更新的键值对
 * @param {Object} cb
 */
Common.prototype.updateUserActiveTimesEntri = function(userId, columnsJSON, callback) {
	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !columnsJSON) {
				logger.error("updateUserActiveTimesEntri参数错误：" + userId + "columnsJSON: ", columnsJSON);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				cb(null);
			}
		},

		//首先获取具体数据
		function(cb) {
			Common.prototype.getUserActiveTimes(userId, function(error, result) {
				if(error) {
					Common.prototype.log(__filename, " :getUserActiveTimes 报错：  ", result);
					cb(error);
				} else if(result == null) {
					cb(errConfig.getError("ERR_DYNAMIC_NOT_EXIST"));
				} else {
					cb(null, result);
				}
			});
		},

		//更新字段值
		function(userActiveTimes, cb) {
			for(var key in columnsJSON) {
				//首先修改原始数据
				userActiveTimes[key] = userActiveTimes[key] + columnsJSON[key];
				//再修改某个列的数据
				columnsJSON[key] = userActiveTimes[key];
			}

			Common.prototype.updateUserActiveTimes(userActiveTimes, columnsJSON, function(error, result) {
				if(error) {
					Common.prototype.log(__filename, " :updateUserActiveTimes 报错：  ", result);
					cb(error);
				} else {
					cb(null, result);
				}
			});
		}

	], function(error, result) {
		if(callback) {
			if(error) {
				callback(error);
			} else {
				callback(null, result);
			}
		}
	});
};

/**
 * 查询帖子数据
 * @param {Number} dynamicId 根据帖子ID找到帖子信息
 * @param {Object} callback 回调函数
 */
Common.prototype.getDynamicInfo = function(dynamicId, callback) {
	if(!callback) {
		return;
	}

	var dynamic_key = macro.PreKey.PRE_DYNAMIC_KEY + dynamicId;
	redisTools.getValueByKey(dynamic_key, function(error, result) {
		//如果报错或者值为空则从数据库取数据
		if(error || result == null) {
			var paramsJSON = {
				"dynamicIdList": dynamicId
			};
			dbTools.selectDynamicByIdList(paramsJSON, function(error, rows) {
				if(error) {
					console.log(error);
					callback(errConfig.getError("ERR_SELECT_DYNAMIC"));
				} else {
					try {
						if(rows.length > 0) {
							var temp = JSON.stringify(rows[0]);
							Common.prototype.log(__filename, ": getDynamicInfo ==> ", temp);

							//将数据存入内存
							redisTools.setValueByKey(dynamic_key, temp);
							redisTools.pexpireByKey(dynamic_key, macro.Interval.TEN_MIN);

							callback(null, JSON.parse(temp));
						} else {
							callback(null, null);
						}
					} catch(e) {
						console.log(e);
					}
				}
			});
		} else {
			try {
				Common.prototype.log(__filename, "REDIS KEY:[" + dynamic_key + "]的查询结果==> ", result);

				callback(null, JSON.parse(result));
			} catch(e) {
				console.log(e);
			}
		}
	});
};

/**
 * 更新帖子信息
 * @param {Object} dynamicInfo 一条具体的帖子内容
 * @param {Object} columnsJSON 帖子需要更新的键值对
 * @param {Object} callback
 */
Common.prototype.updateDynamicInfo = function(dynamicInfo, columnsJSON, callback) {
	if(!dynamicInfo || !columnsJSON) {
		logger.debug("updateDynamicInfo 参数错误：", dynamicInfo, "列参数：", columnsJSON);
		return;
	}

	var dynamic_key = macro.PreKey.PRE_DYNAMIC_KEY + dynamicInfo.DynamicID;
	try {
		var dynamicInfoStr = JSON.stringify(dynamicInfo);
		Common.prototype.log(__filename, "更新新的帖子数据 ==> ", dynamicInfoStr);

		//重新赋值新的内容到REDIS
		redisTools.setValueByKey(dynamic_key, dynamicInfoStr);

		//更新数据库
		dbTools.updateDynamicInfo(dynamicInfo.DynamicID, columnsJSON, function(error, result) {
			if(callback) {
				if(error) {
					logger.debug(__filename + ": updateDynamicInfo: ", error);
					callback(error);
				} else {
					callback(null, result);
				}
			}
		});
	} catch(e) {
		console.log(e);
	}
};

/**
 * 查询帖子次数数据
 * @param {Number} userId 用户ID
 * @param {Object} callback 回调函数
 */
Common.prototype.getDynamicTimes = function(dynamicId, callback) {
	if(!callback) {
		return;
	}

	var dynamic_key = macro.PreKey.PRE_DYNAMICTIMES_KEY + dynamicId;
	redisTools.getValueByKey(dynamic_key, function(error, result) {
		//如果报错或者值为空则从数据库取数据
		if(error || result == null) {
			dbTools.selectDynamicTimes(dynamicId, function(error, rows) {
				if(error) {
					logger.debug("getDynamicTimes selectDynamicTimes 查询报错： ", error);
					callback(errConfig.getError("ERR_USER_NOT_EXIST"));
				} else {
					try {
						if(rows.length > 0) {
							var temp = JSON.stringify(rows[0]);
							Common.prototype.log(__filename, ": getDynamicTimes ==> ", temp);

							//将数据存入内存
							redisTools.setValueByKey(dynamic_key, temp);
							redisTools.pexpireByKey(dynamic_key, macro.Interval.TEN_MIN);

							callback(null, JSON.parse(temp));
						} else {
							callback(null, null);
						}
					} catch(e) {
						console.log(e);
					}
				}
			});
		} else {
			try {
				Common.prototype.log(__filename, "REDIS KEY:[" + dynamic_key + "]的查询结果==> ", result);
				callback(null, JSON.parse(result));
			} catch(e) {
				console.log(e);
			}
		}
	});
};

/**
 * 更新帖子次数信息(私有的)
 * @param {Object} dyanmicTimes 帖子的次数数据
 * @param {Object} columnsJSON 需要更新的键值对
 * @param {Object} callback
 */
Common.prototype.updateDynamicTimes = function(dyanmicTimes, columnsJSON, callback) {
	if(!dyanmicTimes || !columnsJSON) {
		logger.debug("updateDynamicTimes 参数错误：", dyanmicTimes, "列参数：", columnsJSON);
		return;
	}

	var dynamic_key = macro.PreKey.PRE_DYNAMICTIMES_KEY + dyanmicTimes.DynamicID;
	try {
		var dynamicTimesStr = JSON.stringify(dyanmicTimes);
		Common.prototype.log(__filename, "更新新的帖子次数数据 ==> ", dynamicTimesStr);

		//重新赋值新的内容到REDIS
		redisTools.setValueByKey(dynamic_key, dynamicTimesStr);

		//更新数据库
		dbTools.updateDynamicTimes(dyanmicTimes.DynamicID, columnsJSON, function(error, result) {
			if(callback) {
				if(error) {
					logger.debug(__filename + ": updateDynamicTimes: ", error);
					callback(error);
				} else {
					callback(null, result);
				}
			}
		});
	} catch(e) {
		console.log(e);
	}
};

/**
 * 更新帖子次数信息(公共的)
 * @param {Number} dynamicId 帖子ID
 * @param {Object} columnsJSON 需要更新的键值对
 * @param {Object} cb
 */
Common.prototype.updateDynamicTimesEntri = function(dynamicId, columnsJSON, callback) {
	async.waterfall([
		function(cb) {
			if(!dynamicId || isNaN(dynamicId) || dynamicId <= 0 || !columnsJSON) {
				logger.error("updateDynamicTimesEntri：", dynamicId, "columnsJSON: ", columnsJSON);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				cb(null);
			}
		},

		//首先获取具体数据
		function(cb) {
			Common.prototype.getDynamicTimes(dynamicId, function(error, result) {
				if(error) {
					Common.prototype.log(__filename, " :getDynamicTimes 报错：  ", result);
					cb(error);
				} else if(result == null) {
					cb(errConfig.getError("ERR_DYNAMIC_NOT_EXIST"));
				} else {
					cb(null, result);
				}
			});
		},

		//更新字段值
		function(dynamicTimes, cb) {
			for(var key in columnsJSON) {
				//首先修改原始数据
				dynamicTimes[key] = dynamicTimes[key] + columnsJSON[key];
				//再修改某个列的数据
				columnsJSON[key] = dynamicTimes[key];
			}

			Common.prototype.updateDynamicTimes(dynamicTimes, columnsJSON, function(error, result) {
				if(error) {
					Common.prototype.log(__filename, " :updateDynamicTimes 报错：  ", result);
					cb(error);
				} else {
					cb(null, result);
				}
			});
		}

	], function(error, result) {
		if(callback) {
			if(error) {
				callback(error);
			} else {
				callback(null, result);
			}
		}
	});
};

/**
 * 填充帖子數據(公共的)
 * @param {Number} userId 请求用户的ID
 * @param {Object} dynamices 需要更新的键值对
 * @param {Object} cb
 */
Common.prototype.fillDynamicInfo = function(userId, dynamices, callback) {
	if(!userId || userId <= 0 || !dynamices) {
		Common.prototype.log(__filename, "fillDynamicInfo 填充参数错误 userId: " + userId, dynamices);
		if(callback) {
			callback(errConfig.getError("ERR_INNER_PARAMS"));
		}
		return;
	}

	//遍历每条帖子
	async.eachSeries(dynamices, function(dynamic, valuecb) {
		async.waterfall([
			//填充评论
			function(cb) {
				dbTools.selectCommentByDynamicId(dynamic.DynamicID, function(error, rows) {
					var lastComment = {}; //最近一条评论
					var firstReply = {}; //最近一条评论的第一条回复

					//var result = dynamic;
					if(error == null && rows.length != 0) {
						//最近的一条评论
						lastComment = rows[0];
						var beCommentId = lastComment.CommentID;

						//找出最近一条评论的第一条回复
						var minTime = moment().format("YYYY-MM-DD HH:mm:ss");
						for(var index = 0; index < rows.length; index++) {
							if(rows[index].BeCommentID != beCommentId)
								continue;

							if(minTime > rows[index].CommentTime) {
								minTime = rows[index].CommentTime;
								firstReply = rows[index];
							}
						}
					}
					dynamic["LastComment"] = lastComment;
					dynamic["FirstReply"] = firstReply;
					cb(null, dynamic);
				});
			},

			function(dynamicInfo, cb) {
				var paramsJSON = { //参数顺序不能改变
					"UserID": userId,
					"DynamicUserID": dynamicInfo.UserID,
					"DynamicID": dynamic.DynamicID
				};
				dbTools.execDynamicOpProc(paramsJSON, function(error, result) {
					if(error) {
						logger.debug("/fillDynamicInfo 执行存储过程 报错：", error);
					} else {
						//logger.debug("存储过程结果：", result[0]);
						dynamicInfo["HasFond"] = result[0][0].hasFond;
						dynamicInfo["HasCollect"] = result[0][0].hasCollect;
						dynamicInfo["HasReport"] = result[0][0].hasReport;
						dynamicInfo["HasFocus"] = result[0][0].hasFocus;
					}
					cb(null, dynamicInfo);
				});
			},

			//填充帖子次数数据
			function(dynamicInfo, cb) {
				Common.prototype.getDynamicTimes(dynamicInfo.DynamicID, function(error, value) {
					if(error) {
						logger.debug("/fillDynamicInfo 获取帖子次数数据 报错：", error);
					} else {
						dynamicInfo["DynamicTimes"] = value;
						//logger.info("帖子次数信息1：", dynamicInfo["DynamicTimes"]);
					}
					cb(null, dynamicInfo);
				});
			}

		], function(error, result) {
			if(error) {
				valuecb(error);
			} else {
				valuecb(null);
			}
		});

	}, function(error) {
		if(callback)
			callback(null, dynamices);
	});
};

/**
 * 获取指定区域的热门帖子(公共的)
 * @param {Number} userId 请求用户的ID
 * @param {Object} dynamices 需要更新的键值对
 * @param {Object} callback
 */
Common.prototype.getHotDynamic = function(startRow, endRow, callback) {
	if(!callback) {
		return;
	}

	if(isNaN(startRow) || isNaN(endRow) || startRow < 0) {
		logger.debug("startRow: ", startRow, " endRow: ", endRow);
		//callback(errConfig.getError("ERR_INNER_PARAMS"));
		return;
	}

	async.waterfall([
		function(cb) {
			dbTools.selectHotDynamic(startRow, endRow, function(error, rows) {
				if(error) {
					logger.debug("查找热门帖子报错：", error);
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				} else {
					cb(null, rows);
				}
			});
		},

		function(dynamicTimesInfos, cb) {
			//帖子IDLIST
			var dynamicIdList = toolkit.getColumnValueListStr(dynamicTimesInfos, "DynamicID", ',');
			if(dynamicIdList == "") {
				cb(null, []);
			} else {
				var paramsJSON = {
					"dynamicIdList": dynamicIdList
				};
				dbTools.selectDynamicByIdList(paramsJSON, function(error, rows) {
					if(error) {
						Common.prototype.log(__filename, "查找帖子报错：", error);
						cb(errConfig.getError("ERR_MYSQL_SELECT"));
					} else {
						//帖子键值对
						var dynamicMap = {};
						for(var index = 0; index < rows.length; index++) {
							var dynamicId = rows[index].DynamicID;
							dynamicMap[dynamicId] = rows[index];
						}
						//将帖子放入到一个数组
						var dynamicArr = [];
						for(var index = 0; index < dynamicTimesInfos.length; index++) {
							var dynamicId = dynamicTimesInfos[index].DynamicID;
							if(dynamicMap[dynamicId]) {
								dynamicArr.push(dynamicMap[dynamicId]);
							}
						}

						cb(null, dynamicArr);
					}
				});
			}
		}

	], function(error, result) {
		if(error) {
			callback(error);
		} else {
			callback(null, result);
		}
	});
};

/**
 * 通过帖子ID获取评论，并用根据用户ID填充是否举报过帖子(公共的)
 * @param {Number} userId 请求用户ID
 * @param {Number} dynamicId 帖子ID
 * @param {Object} callback
 */
Common.prototype.getCommentByDynamicId = function(userId, dynamicId, callback) {
	if(!callback) {
		Common.prototype.log(__filename, "getCommentByDynamicId 没有回调函数");
		return;
	}

	if(isNaN(userId) || isNaN(dynamicId) || dynamicId < 0) {
		Common.prototype.log(__filename, "getCommentByDynamicId 参数错误：", dynamicId);
		return;
	}

	async.waterfall([
		function(cb) {
			dbTools.selectCommentByDynamicIdTimeAsc(dynamicId, function(error, rows) {
				if(error) {
					Common.log(__filename, "/findDynamic selectCommentByDynamicIdTimeAsc 报错：", error);
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				} else {
					cb(null, rows);
				}
			});
		},

		function(commentInfos, cb) {
			var commentIdList = toolkit.getColumnValueListStr(commentInfos, "CommentID", ',');
			var paramsJSON = {
				"ReporterID": userId,
				"ReportType": macro.ReportType.COMMENT,
				"RelationIdList": commentIdList == "" ? 0 : commentIdList
			};
			dbTools.getReportList(paramsJSON, function(error, rows) {
				var beCommentIdMap = {};
				for(var index = 0; index < rows.length; index++) {
					var commentId = rows[index].RelationID;
					beCommentIdMap[commentId] = 1;
				}

				for(var index = 0; index < commentInfos.length; index++) {
					var commentId = commentInfos[index].CommentID;
					if(beCommentIdMap[commentId]) {
						commentInfos[index]["HasReport"] = 1;
					} else {
						commentInfos[index]["HasReport"] = 0;
					}
				}
				cb(null, commentInfos);
			});
		}

	], function(error, result) {
		if(error) {
			callback(error);
		} else {
			callback(null, result);
		}
	});
};

/**
 * 带文件名打印日志
 * @param {Object} fileName
 * @param {Object} msg1
 * @param {Object} msg2
 */
Common.prototype.log = function(fileName, msg1, msg2) {
	var arr = fileName.split("/");
	var name = arr[arr.length - 1];
	logger.debug("[" + name + "]: " + msg1, msg2 == null ? "" : msg2);
};

Common.prototype.testLog = function() {
	var logStr = "";
	for(var index = 0; index < arguments.length; index++) {
		var msg = arguments[index];
		if(index == 0) {
			var arr = msg.split("/");
			msg = "[" + arr[arr.length - 1] + "]: ";
		}
		logStr = logStr + msg;
	}
	logger.debug(logStr);
};

module.exports = new Common();