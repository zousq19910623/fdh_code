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
 * 用户帖子收藏模块
 * @namespace collect
 * @description 帖子收藏相关操作，收藏，取消收藏
 */

/**
 * 请求用户收藏列表信息(POST)
 * @function "/collect/reqData"
 * @param {Number} userId 用户ID
 * @param {Number} flagTime 请求的标志时间
 * @memberof collect
 * @returns {Object} errCode, errMsg
 */
router.post("/reqData", function(req, res, next) {
	var userId = req.body.userId;
	var createTime = req.body.flagTime;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !createTime || isNaN(createTime) || createTime < macro.StartTime.START) {
				logger.error("/reqData", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			}
			else {
				createTime = moment(createTime * 1000).format("YYYY-MM-DD HH:mm:ss");
				cb(null);
			}
		},

		//查找指定时间之前的部分收藏列表
		function(cb) {
			var paramsJSON = {
				"UserID": userId,
				"CollectTime": createTime
			};

			dbTools.selectCollectByTime(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "reqCollect 报错: ", error);
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				}
				else {
					cb(null, rows);
				}
			});
		},

		//根据收藏的帖子ID找出帖子
		function(collectInfos, cb) {
			var dynamicIdList = toolkit.getColumnValueListStr(collectInfos, "DynamicID", ",");
			if(dynamicIdList == "") {
				cb(errConfig.getError("ERR_SUCCESS"));
			}
			else {
				var paramsJSON = {
					"dynamicIdList": dynamicIdList
				};
				dbTools.selectDynamicByIdList(paramsJSON, function(error, result) {
					if(error) {
						cb(errConfig.getError("ERR_MYSQL_SELECT"));
					}
					else {
						cb(null, result, collectInfos);
					}
				});
			}
		},

		//组装每个帖子与它最近的一条评论
		function(dynamices, collectInfos, cb) {
			common.fillDynamicInfo(userId, dynamices, function(error, result) {
				if(error) {
					cb(error);
				}
				else {
					cb(null, result, collectInfos);
				}
			});
		},
		
		//带上收藏信息
		function(dynamices, collectInfos, cb){
			var collectMap = {};
			for(var index = 0; index < collectInfos.length; index++){
				var dynamicId = collectInfos[index].DynamicID;
				collectMap[dynamicId] = collectInfos[index];
			}
			
			for(var index = 0; index < dynamices.length; index++){
				var dynamicId = dynamices[index].DynamicID;
				var collectInfo = collectMap[dynamicId];
				dynamices[index]["CollectTime"] = (collectInfo == null) ? "" : collectInfo.CollectTime;
			}
			
			cb(null, dynamices);
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
 * 加收藏(POST)
 * @function "/collect/addCollect"
 * @param {Number} userId 用户ID
 * @param {Number} dynamicId 帖子ID
 * @memberof collect
 * @returns {Object} errCode, errMsg
 */
router.post("/addCollect", function(req, res, next) {
	var userId = req.body.userId;
	var dynamicId = req.body.dynamicId;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !dynamicId || isNaN(dynamicId) || dynamicId <= 0) {
				logger.error("/addCollect", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			}
			else {
				cb(null);
			}
		},

		//判断是否已经收藏
		function(cb) {
			dbTools.isExistCollect(userId, dynamicId, function(err, result) {
				if(err) {
					cb(err);
				}
				else {
					if(result > 0) {
						cb(errConfig.getError("ERR_HAS_COLLECT"));
					}
					else {
						cb(null);
					}
				}
			});
		},

		//更新帖子被收藏次数
		function(cb) {
			var columnJSON = {
				"CollectTimes": macro.TimesChangeType.ADD_ONE
			};
			common.updateDynamicTimesEntri(dynamicId, columnJSON, function(error, result) {
				if(error) {
					common.log(__filename, "更新帖子次数数据报错： ", error);
					cb(error);
				}
				cb(null);
			});
		},

		//收藏用户帖子
		function(cb) {
			var createTime = moment().format("YYYY-MM-DD HH:mm:ss");
			var paramsJSON = {
				"UserID": userId,
				"DynamicID": dynamicId,
				"CollectTime": createTime
			};
			dbTools.createCollect(paramsJSON, function(error, result) {
				if(error) {
					logger.debug("AddCollect 报错： ", error);
					cb(errConfig.getError("ERR_MYSQL_INSERT"));
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
 * 取消收藏(POST)
 * @function "/collect/cancelCollect"
 * @param {Number} userId 用户ID
 * @param {Number} dynamicId 帖子ID
 * @memberof collect
 * @returns {Object} errCode, errMsg
 */
router.post("/cancelCollect", function(req, res, next) {
	var userId = req.body.userId;
	var dynamicId = req.body.dynamicId;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !dynamicId || isNaN(dynamicId) || dynamicId <= 0) {
				logger.error("/cancelCollect", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			}
			else {
				cb(null);
			}
		},

		//删除收藏的信息
		function(cb) {
			var paramsJSON = {
				"UserID": userId,
				"DynamicID": dynamicId
			};
			dbTools.deleteCollect(paramsJSON, function(error, rows) {
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

module.exports = router;