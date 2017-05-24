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
 * 房东汇后台管理模块
 * @namespace fdhMgr
 * @description 管理员调用接口
 */

/**
 * 管理员删除指定帖子(POST)
 * @function "/fdhggr/deleteDynamic"
 * @param {Number} managerId 管理员ID
 * @param {Number} dynamicId 帖子ID
 * @param {String} reason 删帖原因
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/deleteDynamic", function(req, res, next) {
	var managerId = req.body.managerId;
	var dynamicId = req.body.dynamicId;
	var reason = req.body.reason;
	var userId = 0;

	async.waterfall([
		//判断参数
		function(cb) {
			if(!managerId || isNaN(managerId) || managerId <= 0 || !dynamicId || isNaN(dynamicId) || dynamicId <= 0 || !reason) {
				logger.error("/deleteDynamic", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			}
			else {
				cb(null);
			}
		},
		
		//查找帖子
		function(cb) {
			common.getDynamicInfo(dynamicId, function(error, result) {
				if(error) {
					cb(error);
				}
				else if(result == null) {
					cb(errConfig.getError("ERR_DYNAMIC_NOT_EXIST"));
				}
				else {
					userId = result.UserID;
					cb(null);
				}
			});
		},

		//删除帖子操作
		function(cb) {
			console.log("21111111111");
			var paramsJSON = {
				"UserID": 0,//管理员删除默认为0
				"DynamicID": dynamicId
			};
			dbTools.deleteDynamic(paramsJSON, function(error, result) {
				if(error) {
					common.log(__filename, "事务删除帖子报错：", error);
					cb(error);
				}
				else {
					common.log(__filename, "事务删除帖子结果：", result[0][0].result);
					if(result[0][0].result == 0) {
						cb(null);
					}
					else {
						cb(errConfig.getError("ERR_MYSQL_DELETE"));
					}
				}
			});
		},

		//更新REDIS数据
		function(cb) {
			console.log("2222222");
			var dynamicKey = macro.PreKey.PRE_DYNAMIC_KEY + dynamicId;
			redisTools.deleteByKey(dynamicKey);

			var dynamicTimesKey = macro.PreKey.PRE_DYNAMICTIMES_KEY + dynamicId;
			redisTools.deleteByKey(dynamicTimesKey);

			cb(null);
		},

		//记录被被通知消息到通知表
		function(cb) {
			try {
				//添加参数
				var paramsJSON = {
					UserID: managerId,
					BeNoticeUserID: userId,
					NoticeType: macro.NoticeType.SYSTEM,
					RelationID: 0,
					SystemContent: reason,
					CreateTime: moment().format("YYYY-MM-DD HH:mm:ss")
				};

				dbTools.createNotice(paramsJSON, function(error, result) {
					common.log(__filename, "插入通知表结果: " + JSON.stringify(result));
				});
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

module.exports = router;