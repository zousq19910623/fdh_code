var express = require("express");
var router = express.Router();

var moment = require("moment");
var async = require("async");

var logger = require("./js/logger.js");
var dbTools = require("./js/dbTools.js");
var redisTools = require("./js/redisTools.js");
var toolkit = require("./js/toolkit.js");
var common = require("./js/common.js");
var errConfig = require("./js/errConfig.js");
var macro = require("./js/macro.js");

/**
 * 房东汇用户管理
 * @namespace userManager
 * @description 当用户设置及查询关于个人信息时调用此模块接口
 */

/**
 * 请求用户个人数据(POST)
 * @function "/usermanager/reqData"
 * @param {String} tokenId 用户tokenId
 * 
 * @example
 *  RESULT:
 *  {
 * 	UserID: 113, //用户ID
 *  TokenID: 'cf6f1a666c60356c0be3e6d3cde415f2', //tokeId来自房东利器
 *  NickName: '水清浅', //昵称
 *  Sex: 2,
 *  BirthDay: '0000-00-00',
 *  CreateTime: '2017-05-09T08:10:01.000Z',
 *  HeadIconPath: '', //头像路径
 *  PhoneNum: '', //电话号码
 *  LogoutTime: '0000-00-00', //退出登录时间
 *  Country: '',
 *  Province: '',
 *  City: '',
 *  Address: '',
 *  Signature: null //签名
 *  FocusCount: 0, //关注次数
 *  FansCount: 0, //粉丝次数
 *  FondCount: 0, //喜欢
 *  CollectCount: 0, //收集
 *  PublishCount: 0, //发布
 *  CommentCount: 0  //评论
 *  }
 * 
 * @memberof userManager
 * @returns {Object} errCode,errMsg
 */
router.post("/reqData", function(req, res, next) {
	var tokenId = req.body.tokenId;

	async.waterfall([
		function(cb) {
			if(!tokenId) {
				logger.error("/reqData", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			}
			else {
				cb(null);
			}
		},

		//查询用户
		function(cb) {
			var paramsJSON = {
				"TokenID": tokenId
			};
			dbTools.selectUserInfoByTokenId(paramsJSON, function(error, rows){
				if(error) {
					cb(error);
				}
				else if(rows.length == 0){
					cb(errConfig.getError("ERR_USER_NOT_EXIST"));
				}
				else {
					console.log("查询用户数据", rows[0]);
					cb(null, rows[0]);
				}
			});
		},
		
		//匹配次数
		function(userInfo, cb) {
			var paramsJSON = {
				"UserID": userInfo.UserID
			};
			dbTools.execUserTimesProc(paramsJSON, function(error, result){
				if(error){
					common.log(__filename, "查询用户次数信息存储过程报错：", error);
					cb(error);
				}
				else {
					userInfo["FocusCount"] = result[0][0].focusTimes;
					userInfo["FansCount"] = result[0][0].fansTimes;
					userInfo["FondCount"] = result[0][0].fondTimes;
					userInfo["CollectCount"] = result[0][0].collectTimes;
					userInfo["PublishCount"] = result[0][0].publishTimes;
					userInfo["CommentCount"] = result[0][0].commentTimes;
					
					cb(null, userInfo);
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
 * 第一次打开界面，注册用户接口(POST)
 * @function "/usermanager/regUser"
 * @param {String} tokenId 用户tokenId
 * @param {String} nickName 昵称
 * @param {String} headIconPath 头像路径
 * @param {Number} sex 性别
 * @param {String} birthDay 生日
 * 
 * @example
 * 	{
 * 	UserID: 113, //用户ID
 *  TokenID: 'cf6f1a666c60356c0be3e6d3cde415f2', //tokeId来自房东利器
 *  NickName: '水清浅', //昵称
 *  Sex: 2,
 *  BirthDay: '0000-00-00',
 *  CreateTime: '2017-05-09T08:10:01.000Z',
 *  HeadIconPath: '', //头像路径
 *  PhoneNum: '', //电话号码
 *  LogoutTime: '0000-00-00', //退出登录时间
 *  Country: '',
 *  Province: '',
 *  City: '',
 *  Address: '',
 *  Signature: null //签名
 *  }
 * 
 * @memberof userManager
 * @returns {Object} errCode,errMsg
 */
router.post("/regUser", function(req, res, next) {
	var tokenId = req.body.tokenId;
	var nickName = req.body.nickName;
	var headIconPath = req.body.headIconPath;
	var sex = req.body.sex;
	var birthDay = req.body.birthDay;

	async.waterfall([
		//首先验证参数
		function(cb) {
			if(!tokenId || !nickName || !sex || (sex != macro.Sex.MALE && sex != macro.Sex.FEMALE) || !birthDay) {
				logger.error("/regUser", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			}
			else {
				cb(null);
			}
		},

		//判断用户是否已经存在
		function(cb) {
			dbTools.isExist(tokenId, function(error, result) {
				if(error) {
					common.log(__filename, "判断用户存在报错", error);
					cb(error);
				}
				else {
					if(result > 0) {
						cb(errConfig.getError("ERR_USER_EXIST"));
					}
					else {
						cb(null);
					}
				}
			});
		},

		//注册用户和相关信息
		function(cb) {
			var paramsJSON = {
				"TokenID": tokenId,
				"NickName": nickName,
				"HeadIconPath": headIconPath,
				"BirthDay": birthDay,
				"Sex": sex,
				"CreateTime": moment().format("YYYY-MM-DD HH:mm:ss")
			};
			dbTools.execTransRegUser(paramsJSON, function(error, result) {
				if(error) {
					common.log(__filename, "插入用户数据报错", error);
					cb(errConfig.getError("ERR_MYSQL_INSERT"));
				}
				else {
					cb(null);
				}
			});
		},
		
		//将用户信息返回
		function(cb){
			var paramsJSON = {
				"TokenID": tokenId
			};
			dbTools.selectUserInfoByTokenId(paramsJSON, function(error, rows){
				if(error) {
					cb(error);
				}
				else if(rows.length == 0){
					cb(errConfig.getError("ERR_USER_NOT_EXIST"));
				}
				else {
					cb(null, rows[0]);
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
 * 更新头像处理(接口暂时不用)(POST)
 * @function "/usermanager/updateHeadIcon"
 * @param {Number} userId 用户ID
 * @param {String} headIconPath 头像路径
 * @memberof userManager
 * @returns {Object} errCode,errMsg
 */
router.post("/updateHeadIcon", function(req, res, next) {
	//TODO 暂时搁浅，与更新个人信息有功能重叠，具体需要时再补充
});

/**
 * 更新个人信息(POST)
 * @function "/usermanager/updateUser"
 * @param {Number} userId 用户ID
 * @param {String} paramsJSON 参数集合
 * @example
 * paramsJSON = {
 *				nickName: '', 昵称
 * 				headIconPath : '', 	//头像路径
 * 				birthDay : '', 	//生日
 * 				sex : '',	//性别(1-男，2-女)
 * 				signature : '', 	//个性签名
 * 				country : '', 	//国家
 * 				province : '',	//省份
 * 				city : '', 	//城市
 * 				address : '', 	//具体地址
 * }
 * @memberof userManager
 * @returns {Object} errCode,errMsg
 */
router.post("/updateUser", function(req, res, next) {
	var userId = req.body.userId;
	var paramsJSON = req.body.paramsJSON;

	async.waterfall([
		function(cb) {
			//判断参数
			if(!userId || isNaN(userId) || !paramsJSON) {
				logger.debug("/updateUser", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			}
			else {
				paramsJSON = JSON.parse(paramsJSON);
				console.log(req.body);

				try {
					var result = {};
					for(var entryKey in paramsJSON) {
						if(entryKey === "sex" && paramsJSON[entryKey] != macro.Sex.MALE && paramsJSON[entryKey] != macro.Sex.FEMALE) {
							result["sex"] = macro.Sex.MALE;
						}
						else if(paramsJSON[entryKey] == null) {
							result[entryKey] = "";
						}
						else {
							result[entryKey] = paramsJSON[entryKey];
						}
					}

					cb(null, result);
				}
				catch(e) {
					common.log(__filename, "publishDynamic parse error:", e);
				}
			}
		},

		//更新数据库
		function(updateParams, cb) {
			dbTools.updateUserInfo(userId, updateParams, function(error, result) {
				if(error) {
					common.log(__filename, "修改更新用户报错: ", error);
					cb(errConfig.getError("ERR_MYSQL_UPDATE"));
				}
				else {
					var userKey = macro.PreKey.PRE_USER_KEY + userId;
					redisTools.deleteByKey(userKey);
					
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
 * 登录接口(POST)
 * @function "/usermanager/login"
 * @param {Number} userId 用户ID
 * @memberof userManager
 * @returns {Object} errCode,errMsg
 */
router.post("/login", function(req, res, next) {
	var userId = req.body.userId;

	async.waterfall([
		//首先验证参数
		function(cb) {
			if(!userId) {
				logger.error("/login", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			}
			else {
				cb(null);
			}
		},

		//处理登录逻辑
		function(cb) {
			cb(null, { state: "OK" });
		}

	], function(err, result) {
		if(err) {
			toolkit.end(res, err);
		}
		else {
			toolkit.end(res, result);
		}
	});
});


module.exports = router;