var express = require("express");
var router = express.Router();

var moment = require("moment");
var async = require("async");

var logger = require("./js/logger.js");
var dbTools = require("./js/dbTools.js");
var redisTools = require("./js/redisTools.js");
var errConfig = require("./js/errConfig.js");
var macro = require("./js/macro.js");
var common = require("./js/common.js");
var toolkit = require("./js/toolkit.js");

/**
 * 用户的关注与粉丝管理模块
 * @namespace relation
 * @description 关注其它用户，被关注，查看粉丝等接口
 */

/**
 * 请求关注列表(POST)
 * @function "/relation/reqFocusData"
 * @param {Number} userId 用户ID
 * @param {Number} flagTime 请求的标志时间
 * @example
 * 
 * 
 * 返回值:
 * 	{
 * 		"focusList" : [userId1, userId2]
 * 	}
 * 
 * 
 * @memberof relation
 * @returns {Object} errCode, errMsg
 */
router.post("/reqFocusData", function(req, res, next) {
	var userId = req.body.userId;
	var createTime = req.body.flagTime;

	console.log(req.body);

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !createTime || isNaN(createTime) || createTime < macro.StartTime.START) {
				logger.error("/reqFocusData", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			}
			else {
				createTime = moment(createTime * 1000).format("YYYY-MM-DD HH:mm:ss");
				common.log(__filename, "查询时间: " + createTime);
				cb(null);
			}
		},

		//查询近期关注的列表
		function(cb) {
			var paramsJSON = {
				"UserID": userId,
				"CreateTime": createTime
			};

			dbTools.selectFocusListByTime(paramsJSON, function(error, rows) {
				if(error) {
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				}
				else {
					cb(null, rows);
				}
			});
		},

		//查找用户列表
		function(focusInfos, cb) {
			var userIdList = toolkit.getColumnValueListStr(focusInfos, "FocusUserID", ",");
			if(userIdList != "") {
				var paramsJSON = {
					"UserIdList": userIdList
				};
				dbTools.selectUserInfoByIdList(paramsJSON, function(error, rows) {
					if(error) {
						common.log(__filename, "请求关注数据 查找用户报错： ", error);
						cb(errConfig.getError("ERR_MYSQL_SELECT"));
					}
					else {
						var userMap = {};
						//将查找出来的用户数据组装成键值对
						for(var index = 0; index < rows.length; index++) {
							var beFocusUserId = rows[index].UserID;
							userMap[beFocusUserId] = rows[index];
						}

						//通过用户ID做为key，将用户信息与关注信息绑定
						for(var index = 0; index < focusInfos.length; index++) {
							var beFocusUserId = focusInfos[index].FocusUserID;
							var befocusUserInfo = userMap[beFocusUserId];
							focusInfos[index]["FocusUserInfo"] = (befocusUserInfo == null) ? {} : befocusUserInfo;
						}

						cb(null, focusInfos);
					}
				});
			}
			else {
				cb(errConfig.getError("ERR_NOT_EXIST_FOCUS"));
			}
		}

	], function(error, result) {
		if(error) {
			toolkit.end(res, error);
		}
		else {
			toolkit.end(res, result);
		}
	});
});

/**
 * 请求粉丝列表(POST)
 * @function "/relation/reqFansData"
 * @param {Number} userId 用户ID
 * @param {Number} flagTime 请求的标志时间
 * @example
 * 
 * 
 * 返回值:
 * 	{
 * 		"focusList" : [userId1, userId2]
 * 	}
 * 
 * @memberof relation
 * @returns {Object} errCode, errMsg
 */
router.post("/reqFansData", function(req, res, next) {
	var userId = req.body.userId;
	var createTime = req.body.flagTime;

	console.log(req.body);

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || !createTime || isNaN(createTime)) {
				logger.error("/reqFansData参数错误：", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			}
			else {
				createTime = moment(createTime * 1000).format("YYYY-MM-DD HH:mm:ss");
				cb(null);
			}
		},

		//查询近期粉丝的列表
		function(cb) {
			//查询数据
			var paramsJSON = {
				"FocusUserID": userId,
				"CreateTime": createTime
			};
			dbTools.selectFansListByTime(paramsJSON, function(error, rows) {
				if(error) {
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				}
				else {
					//拼装查询出来的粉丝用户ID
					var str = "";
					var fansInfoMap = {};
					for(var index = 0; index < rows.length; index++) {
						var fansUserId = rows[index].UserID;
						str = str + fansUserId + ",";
						//将粉丝用户ID与关系表数据组成键值对
						fansInfoMap[fansUserId] = rows[index];
					}
					str = str.substr(0, str.length - 1);

					cb(null, str, fansInfoMap);
				}
			});
		},

		//查找用户列表中的用户
		function(fansUserIdList, fansInfoMap, cb) {
			if(fansUserIdList != "") {
				var paramsJSON = {
					"UserIdList": fansUserIdList
				};
				dbTools.selectUserInfoByIdList(paramsJSON, function(error, rows) {
					if(error) {
						common.log(__filename, "请求粉丝数据报错： ", error);
						cb(errConfig.getError("ERR_MYSQL_SELECT"));
					}
					else {
						//将喜欢的数据与粉丝用户数据拼装
						var existFansInfoMap = {};
						for(var index = 0; index < rows.length; index++) {
							//粉丝的用户ID
							var fansUserId = rows[index].UserID;
							existFansInfoMap[fansUserId] = rows[index];
						}
						
						//过滤已经被删掉的用户
						var newFansInfoMap = {};
						for(var fansUserId in fansInfoMap){
							if(existFansInfoMap[fansUserId]){
								newFansInfoMap[fansUserId] = fansInfoMap[fansUserId];
								newFansInfoMap[fansUserId]["FansUserInfo"] = existFansInfoMap[fansUserId];
							}
						}
						cb(null, fansUserIdList, newFansInfoMap);
					}
				});
			}
			else {
				cb(errConfig.getError("ERR_NOT_EXIST_FANS"));
			}
		},

		//查找用户是否关注过粉丝
		function(fansUserIdList, fansInfoMap, cb) {
			var paramsJSON = {
				"UserID": userId,
				"FindIdList": fansUserIdList
			};
			dbTools.selectFocusInIdList(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "请求关注列表数据报错： ", error);
					cb(null, fansInfoMap);
				}
				else {
					var focusMap = {};
					for(var index = 0; index < rows.length; index++) {
						//找出的被自己关注过的用户ID
						var focusUserId = rows[index].FindId;
						focusMap[focusUserId] = 1;
					}
					//用来保存结果
					var resultList = [];
					for(var fansUserId in fansInfoMap) {
						//一条粉丝数据
						var focusInfo = fansInfoMap[fansUserId];
						if(focusMap[fansUserId]) {
							focusInfo["HasFocus"] = 1;
						}
						else {
							focusInfo["HasFocus"] = 0;
						}
						resultList.push(focusInfo);
					}
					cb(null, resultList);
				}
			});
		}

	], function(error, result) {
		if(error) {
			toolkit.end(res, error);
		}
		else {
			toolkit.end(res, result);
		}
	});
});

/**
 * 加关注(POST)
 * @function "/relation/focusUser"
 * @param {Number} userId 用户ID
 * @param {Number} beFocusUserId 被关注用户ID
 * 
 * @memberof relation
 * @returns {Object} errCode, errMsg
 */
router.post("/focusUser", function(req, res, next) {
	var userId = req.body.userId;
	var beFocusUserId = req.body.beFocusUserId;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !beFocusUserId || isNaN(beFocusUserId) || beFocusUserId <= 0) {
				logger.error("/focusUser", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			}
			else {
				cb(null);
			}
		},

		//判断是否已经喜欢
		function(cb) {
			dbTools.isExistFocus(userId, beFocusUserId, function(err, result) {
				if(err) {
					cb(err);
				}
				else {
					if(result > 0) {
						cb(errConfig.getError("ERR_HAS_FOCUS"));
					}
					else {
						cb(null);
					}
				}
			});
		},

		//关注用户
		function(cb) {
			var createTime = moment().format("YYYY-MM-DD HH:mm:ss");
			var paramsJSON = {
				"UserID": userId,
				"FocusUserID": beFocusUserId,
				"CreateTime": createTime
			};
			dbTools.createFocus(paramsJSON, function(error, result) {
				if(error) {
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				}
				else {
					cb(null, result.insertId);
				}
			});
		},

		//记录被回复消息到通知表
		function(focusId, cb) {
			try {
				if(typeof focusId == "number" && focusId != 0) {
					//添加参数
					var paramsJSON = {
						UserID: userId,
						BeNoticeUserID: beFocusUserId,
						NoticeType: macro.NoticeType.FOCUS,
						RelationID: focusId,
						CreateTime: moment().format("YYYY-MM-DD HH:mm:ss")
					};
					dbTools.createNotice(paramsJSON, function(error, result) {
					});
				}
				cb(errConfig.getError("ERR_SUCCESS"));
			}
			catch(e) {
				console.log(e);
			}
		}

	], function(error, result) {
		if(error) {
			toolkit.end(res, error);
		}
		else {
			toolkit.end(res, result);
		}
	});
});

/**
 * 取消关注(POST)
 * @function "/relation/cancelFocus"
 * @param {Number} userId 用户ID
 * @param {Number} cancelUserId 被取消关注用户ID
 * 
 * @memberof relation
 * @returns {Object} errCode, errMsg
 */
router.post("/cancelFocus", function(req, res, next) {
	var userId = req.body.userId;
	var cancelUserId = req.body.cancelUserId;

	console.log(req.body);

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !cancelUserId || isNaN(cancelUserId) || cancelUserId <= 0) {
				logger.error("/cancelFocus", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			}
			else {
				cb(null);
			}
		},

		//删除关注的数据
		function(cb) {
			var paramsJSON = {
				"UserID": userId,
				"FocusUserID": cancelUserId
			};
			dbTools.deleteFocus(paramsJSON, function(error, rows) {
				if(error) {
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				}
				else {
					cb(errConfig.getError("ERR_SUCCESS"));
				}
			});
		}

	], function(error, result) {
		if(error) {
			toolkit.end(res, error);
		}
		else {
			toolkit.end(res, result);
		}
	});
});

/**
 * 查找关系用户(POST)
 * @function "/relation/findUser"
 * @param {Number} userId 用户ID
 * @param {String} findName 用户名
 * @param {Number} findFlag (1、查找关注，2、查找粉丝)
 * 
 * @memberof relation
 * @returns {Object} errCode, errMsg
 */
router.post("/findUser", function(req, res, next) {
	var userId = req.body.userId;
	var findName = req.body.findName;
	var findFlag = req.body.findFlag;

	console.log(req.body);

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !findName || !findFlag || isNaN(findFlag) || (findFlag != 1 && findFlag != 2)) {
				logger.error("/findUser", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			}
			else {
				cb(null);
			}
		},

		//查找数据
		function(cb) {
			var paramsJSON = {
				"NickName": findName
			};
			dbTools.selectUserInfoByName(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "用户名查找报错：", error);
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				}
				else {
					var str = "";
					var userInfoMap = {};
					for(var index = 0; index < rows.length; index++) {
						var findUserId = rows[index].UserID;
						if(!userInfoMap[findUserId]) {
							str = str + rows[index].UserID + ",";
							userInfoMap[findUserId] = rows[index];
						}
					}
					str = str.substr(0, str.length - 1);
					common.log(__filename, "用户列表：" + str);
					cb(null, str, userInfoMap);
				}
			});
		},

		//在关注表中查找是否存在
		function(findIdList, userInfoMap, cb) {
			if(findIdList == "") {
				cb(null, []);
			}
			else {
				var paramsJSON = {
					"UserID": userId,
					"FindIdList": findIdList
				};
				if(findFlag == 1) { //查找关注
					dbTools.selectFocusInIdList(paramsJSON, function(error, rows) {
						if(error) {
							common.log(__filename, "查找关注报错：", error);
							cb(errConfig.getError("ERR_MYSQL_SELECT"));
						}
						else {
							var resultList = [];
							for(var index = 0; index < rows.length; index++) {
								var entryKey = rows[index].FindId;
								var result = rows[index];
								result["FocusUserInfo"] = userInfoMap[entryKey];
								resultList.push(result);
							}
							console.log(rows);
							cb(null, resultList);
						}
					});
				}
				else if(findFlag == 2) { //查找粉丝
					dbTools.selectFansInIdList(paramsJSON, function(error, rows) {
						if(error) {
							common.log(__filename, "查找粉丝报错：", error);
							cb(errConfig.getError("ERR_MYSQL_SELECT"));
						}
						else {
							var resultList = [];
							for(var index = 0; index < rows.length; index++) {
								var entryKey = rows[index].FindId;
								var result = rows[index];
								result["FansUserInfo"] = userInfoMap[entryKey];
								resultList.push(result);
							}
							console.log(rows);
							cb(null, resultList);
						}
					});
				}
			}
		}

	], function(error, result) {
		if(error) {
			toolkit.end(res, error);
		}
		else {
			toolkit.end(res, result);
		}
	});
});

/**
 * 推荐关注(POST)
 * @function "/relation/recommendUser"
 * @memberof relation
 * @returns {Object} errCode,errMsg
 */
router.post("/recommendUser", function(req, res, next) {
	async.waterfall([
		//请求推荐用户数据
		function(cb) {
			dbTools.selectActiveUser(function(error, rows) {
				if(error) {
					common.log(__filename, "推荐关注 selectActiveUser: ", error);
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				}
				else {
					var findIdList = toolkit.getColumnValueListStr(rows, "UserID", ",");
					common.log(__filename, "用户列表：", findIdList);
					cb(null, findIdList);
				}
			});
		},

		//查找用户发给前端
		function(findIdList, cb) {
			if(findIdList == "") {
				cb(errConfig.getError("ERR_NOT_RECOMMEND"));
			}
			else {
				var paramsJSON = {
					"UserIdList": findIdList
				};
				//填充用户信息
				dbTools.selectUserInfoByIdList(paramsJSON, function(error, rows) {
					if(error) {
						common.log(__filename, "请求推荐数据 查找用户报错： ", error);
						cb(errConfig.getError("ERR_MYSQL_SELECT"));
					}
					else {
						cb(null, rows);
					}
				});
			}
		}

	], function(error, result) {
		if(error) {
			toolkit.end(res, error);
		}
		else {
			toolkit.end(res, result);
		}
	});
});

module.exports = router;