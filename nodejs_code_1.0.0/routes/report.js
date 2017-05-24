var express = require("express");
var router = express.Router();

var moment = require("moment");
var async = require("async");
var async = require("async");

var logger = require("./js/logger.js");
var dbTools = require("./js/dbTools.js");
var redisTools = require("./js/redisTools.js");
var errConfig = require("./js/errConfig.js");
var macro = require("./js/macro.js");
var common = require("./js/common.js");
var toolkit = require("./js/toolkit.js");

/**
 * 帖子举报模块
 * @namespace report
 * @description 帖子举报
 */

/**
 * 举报帖子(POST)
 * @function "/report/reportDynamic"
 * @param {Number} userId 用户ID
 * @param {Number} dynamicId 帖子ID
 * @param {String} content 举报内容
 * @memberof report
 * @returns {Object} errCode, errMsg
 */
router.post("/reportDynamic", function(req, res, next) {
	var userId = req.body.userId;
	var dynamicId = req.body.dynamicId;
	var content = req.body.content;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || !dynamicId || isNaN(dynamicId) || !content) {
				logger.error("/reportDynamic", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			}
			else {
				cb(null);
			}
		},
		
		//更新帖子被举报次数
		function(cb) {
			var columnJSON = {
				"ReportTimes": macro.TimesChangeType.ADD_ONE
			};
			common.updateDynamicTimesEntri(dynamicId, columnJSON, function(error, result) {
				if(error) {
					common.log(__filename, "查询帖子次数数据报错： ", error);
					cb(error);
				}
				cb(null);
			});
		},

		//举报某篇帖子或者评论
		function(cb) {
			var createTime = moment.format("YYYY-MM-DD HH:mm:ss");
			var paramsJSON = {
				"ReporterID": userId,
				"RelationID": dynamicId,
				"ReportReason": content,
				"ReportType": macro.ReportType.DYNAMIC,
				"CreateTime": createTime
			};
			dbTools.createReport(paramsJSON, function(error, result) {
				if(error) {
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				}
				else {
					logger.debug("添加举报插入主键 insertId=" + result.insertId + "UserId: " + userId + "DynamicId " + dynamicId);

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
 * 举报评论(POST)
 * @function "/report/reportComment"
 * @param {Number} userId 用户ID
 * @param {Number} commentId 帖子ID
 * @param {String} content 举报内容
 * @memberof report
 * @returns {Object} errCode, errMsg
 */
router.post("/reportComment", function(req, res, next) {
	var userId = req.body.userId;
	var commentId = req.body.commentId;
	var content = req.body.content;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || !commentId || isNaN(commentId) || !content) {
				logger.error("/reportComment", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			}
			else {
				cb(null);
			}
		},

		//举报某篇帖子或者评论
		function(cb) {
			var createTime = moment.format("YYYY-MM-DD HH:mm:ss");
			var paramsJSON = {
				"ReporterID": userId,
				"RelationID": commentId,
				"ReportReason": content,
				"ReportType": macro.ReportType.COMMENT,
				"CreateTime": createTime
			};
			dbTools.createReport(paramsJSON, function(error, result) {
				if(error) {
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				}
				else {
					logger.debug("添加举报插入主键 insertId=", result.insertId, " UserId: ", userId, " CommentId ", commentId);

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
 * 举报用户(POST)
 * @function "/report/reportUser"
 * @param {Number} userId 用户ID
 * @param {Number} beReprotUserId 帖子ID
 * @param {String} content 举报内容
 * @memberof report
 * @returns {Object} errCode, errMsg
 */
router.post("/reportUser", function(req, res, next) {
	var userId = req.body.userId;
	var beReprotUserId = req.body.beReprotUserId;
	var content = req.body.content;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || !beReprotUserId || isNaN(beReprotUserId) || !content) {
				logger.error("/reportUser", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			}
			else {
				cb(null);
			}
		},

		//举报某篇帖子或者评论
		function(cb) {
			var createTime = moment.format("YYYY-MM-DD HH:mm:ss");
			var paramsJSON = {
				"ReporterID": userId,
				"RelationID": beReprotUserId,
				"ReportReason": content,
				"ReportType": macro.ReportType.USER,
				"CreateTime": createTime
			};
			dbTools.createReport(paramsJSON, function(error, result) {
				if(error) {
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				}
				else {
					logger.debug("添加举报插入主键 insertId=", result.insertId, " UserId: ", userId, " BeReprotUserId ", beReprotUserId);

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