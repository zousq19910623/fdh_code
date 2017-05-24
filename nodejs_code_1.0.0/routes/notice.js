var express = require("express");
var router = express.Router();

var moment = require('moment');
var async = require("async");

var logger = require("./js/logger.js");
var dbTools = require("./js/dbTools.js");
var redisTools = require("./js/redisTools.js");
var errConfig = require("./js/errConfig.js");
var macro = require("./js/macro.js");
var common = require("./js/common.js");
var toolkit = require("./js/toolkit.js");

/**
 * 用户系统通知
 * @namespace notice
 * @description 系统公告
 */

/**
 * 通知被喜欢帖的发帖者(POST)
 * @function "/notice/noticeLike"
 * @param {Number} userId	自己的ID
 * @param {Number} flagTime 请求的标志时间
 * 
 * @example
 * 
 * 返回值:
 * result = {
 *			"NoticeType" : 1,			//表示被喜欢
 * 			"UserID" : {
 * 							UserID : 1,
 * 							NickName : "XXX"
 * 						},		//标记喜欢帖子的用户信息
 * 			"DynamicID" : {
 * 								usrId : 2345,
 * 								headIconPath : "",		//头像路径
 * 								nickName : "",			//被喜欢用户的昵称
 * 								content : "",			//帖子内容
 * 								picturePath : ""		//图片路径
 * 						  }	
 * 			}
 * 
 * @memberof notice
 * @returns {Object} errCode, errMsg
 */
router.post("/noticeLike", function(req, res, next) {
	var userId = req.body.userId;
	var createTime = req.body.flagTime;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !createTime || isNaN(createTime) || createTime < macro.StartTime.START) {
				logger.error("/noticeLike", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				createTime = moment(createTime * 1000).format('YYYY-MM-DD HH:mm:ss');
				cb(null);
			}
		},

		//查找时间内的喜欢数据
		function(cb) {
			var paramsJSON = {
				"BeNoticeUserID": userId, //指定查询的用户
				"CreateTime": createTime, //查询截止时间
				"NoticeType": macro.NoticeType.FOND //通知类型
			};
			dbTools.selectNotcieByTime(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "noticeLike selectNotcieByTime 查询报错： ", error);
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				} else if(rows.length == 0) {
					cb(errConfig.getError("ERR_NO_FOND_NOTICE"));
				} else {
					cb(null, rows);
				}
			});
		},

		//找出当前时间的喜欢通知信息
		function(noticeInfos, cb) {
			//帖子IDLIST
			var dynamicIdList = toolkit.getColumnValueListStr(noticeInfos, "RelationID", ',');
			var paramsJSON = {
				"dynamicIdList": dynamicIdList == "" ? 0 : dynamicIdList
			};
			dbTools.selectDynamicByIdList(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "查找帖子报错：", error);
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				} else {
					//帖子键值对
					var dynamicMap = {};
					for(var index = 0; index < rows.length; index++) {
						var dynamicId = rows[index].DynamicID;
						dynamicMap[dynamicId] = rows[index];
					}
					//
					for(var index = 0; index < noticeInfos.length; index++) {
						var dynamicId = noticeInfos[index].RelationID;
						var dynamicInfo = dynamicMap[dynamicId];
						noticeInfos[index]["DynamicID"] = (dynamicInfo == null) ? {} : dynamicInfo;
					}
					cb(null, noticeInfos);
				}
			});
		},

		//填充用户信息
		function(noticeInfos, cb) {
			//通知中喜欢过我帖子的用户IDLIST
			var fondUserIdList = toolkit.getColumnValueListStr(noticeInfos, "UserID", ',');
			var paramsJSON = {
				"UserIdList": fondUserIdList == "" ? 0 : fondUserIdList
			};
			dbTools.selectUserInfoByIdList(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "selectUserInfoByIdList 查询报错： ", error);
				} else {
					//用户键值对
					var fondInfoMap = {};
					for(var index = 0; index < rows.length; index++) {
						var noticeUserId = rows[index].UserID;
						fondInfoMap[noticeUserId] = rows[index];
					}

					//将用户数据组装进通知数据
					for(var index = 0; index < noticeInfos.length; index++) {
						var noticeUserId = noticeInfos[index].UserID;
						var fondUserInfo = fondInfoMap[noticeUserId];
						noticeInfos[index]["UserID"] = fondUserInfo == null ? {} : fondUserInfo;
					}
				}
				cb(null, noticeInfos);
			});
		}

	], function(error, result) {
		if(error) {
			toolkit.end(res, error);
		} else {
			toolkit.end(res, result);
		}
	});
});

/**
 * 通知被评论的发帖者(POST)
 * @function "/notice/noticeComment"
 * @param {Number} userId
 * @param {Number} flagTime 请求的标志时间
 * 
 * @example
 * 
 * 返回值:
 * result = {
 *			"noticeType" : 2,			//表示被评论
 * 			"CommentID" : {
 * 								CommentID : 1234,
 * 								CommentContent : "xxx"，
 * 								...
 * 						},		//评论帖子的用户ID
 * 			"BeCommentID" : {
 * 								CommentID : 1234,
 * 								CommentContent : "xxx"，
 * 								...
 * 						},		//评论帖子的用户ID
 * 			"DynamicId" : {
 * 								usrId : 2345,
 * 								headIconPath : "",		//头像路径
 * 								nickName : "",			//被喜欢用户的昵称
 * 								content : "",			//帖子内容
 * 								picturePath : ""		//图片路径
 * 						  }	
 * 			}
 * 
 * @memberof notice
 * @returns {Object} errCode, errMsg
 */
router.post("/noticeComment", function(req, res, next) {
	var userId = req.body.userId;
	var createTime = req.body.flagTime;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !createTime || isNaN(createTime) || createTime < macro.StartTime.START) {
				logger.error("/noticeComment", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				createTime = moment(createTime * 1000).format('YYYY-MM-DD HH:mm:ss');
				cb(null);
			}
		},

		//查找时间内的被评论数据
		function(cb) {
			var paramsJSON = {
				"BeNoticeUserID": userId, //指定查询的用户
				"CreateTime": createTime, //查询截止时间
				"NoticeType": macro.NoticeType.COMMENT //通知类型
			};

			dbTools.selectNotcieByTime(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "noticeComment selectNotcieByTime 查询报错： ", error);
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				} else if(rows.length == 0) {
					cb(errConfig.getError("ERR_NO_COMMENT_NOTICE"));
				} else {
					cb(null, rows);
				}
			});
		},

		//找出当前时间的评论ID
		function(noticeInfos, cb) {
			//评论IDLIST
			var commentIdList = toolkit.getColumnValueListStr(noticeInfos, "RelationID", ',');
			var paramsJSON = {
				"CommentIdList": commentIdList == "" ? 0 : commentIdList
			};
			dbTools.selectCommentByIdList(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "评论通知报错：", error);
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				} else {
					cb(null, noticeInfos, rows);
				}
			});
		},
		
		//查询出用户后填充评论的头像路径
		function(noticeInfos, commentInfos, cb) {
			//评论用户IDLIST
			var commentIdList = toolkit.getColumnValueListStr(commentInfos, "CommentUserID", ',');
			var paramsJSON = {
				"UserIdList": commentIdList == "" ? 0 : commentIdList
			};
			dbTools.selectUserInfoByIdList(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "selectUserInfoByIdList 查询报错： ", error);
				} else {
					//评论用户键值对
					var userInfoMap = {};
					for(var index = 0; index < rows.length; index++) {
						var commentUserId = rows[index].UserID;
						userInfoMap[commentUserId] = rows[index];
					}

					//给评论插入评论用户头像路径
					var commentMap = {};
					for(var index = 0; index < commentInfos.length; index++) {
						//先获取评论的头像ID
						var commentUserId = commentInfos[index].CommentUserID;
						commentInfos[index]["HeadIconPath"] = userInfoMap[commentUserId].HeadIconPath;
						//再将评论组装成MAP
						var commentId = commentInfos[index].CommentID;
						commentMap[commentId] = commentInfos[index];
					}
					
					for(var index = 0; index < noticeInfos.length; index++) {
						var commentId = noticeInfos[index].RelationID;
						var commentInfo = commentMap[commentId];
						noticeInfos[index]["CommentInfo"] = commentInfo == null ? {} : commentInfo;
					}
				}
				cb(null, noticeInfos, commentInfos);
			});
		},

		//找出我评论的内容
		function(noticeInfos, commentInfos, cb) {
			//我评论的评论IDLIST
			var commentIdList = toolkit.getColumnValueListStr(commentInfos, "BeCommentID", ',');
			var paramsJSON = {
				"CommentIdList": commentIdList == "" ? 0 : commentIdList
			};
			dbTools.selectCommentByIdList(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "评论通知报错：", error);
				} else {
					var commentMap = {};
					for(var index = 0; index < rows.length; index++) {
						var commentId = rows[index].CommentID;
						commentMap[commentId] = rows[index];
					}

					for(var index = 0; index < noticeInfos.length; index++) {
						var commentInfo = noticeInfos[index]["CommentInfo"];
						if(commentInfo == null) {
							continue;
						}
						var commentId = commentInfo.BeCommentID;
						var info = commentMap[commentId];
						noticeInfos[index]["SelfCommentInfo"] = info == null ? {} : info;
					}
				}
				cb(null, noticeInfos, commentInfos);
			});
		},

		//填充帖子内容
		function(noticeInfos, commentInfos, cb) {
			//我评论的评论IDLIST
			var dynamicIdList = toolkit.getColumnValueListStr(commentInfos, "DynamicID", ',');
			var paramsJSON = {
				"dynamicIdList": dynamicIdList == "" ? 0 : dynamicIdList
			};
			dbTools.selectDynamicByIdList(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "查找帖子报错：", error);
				} else {
					//帖子键值对
					var dynamicMap = {};
					for(var index = 0; index < rows.length; index++) {
						var dynamicId = rows[index].DynamicID;
						dynamicMap[dynamicId] = rows[index];
					}
					//
					for(var index = 0; index < noticeInfos.length; index++) {
						var commentInfo = noticeInfos[index]["CommentInfo"];
						if(commentInfo == null) {
							continue;
						}
						var dynamicId = commentInfo.DynamicID;
						var dynamicInfo = dynamicMap[dynamicId];
						noticeInfos[index]["DynamicInfo"] = dynamicInfo == null ? {} : dynamicInfo;
					}
				}
				cb(null, noticeInfos);
			});
		}

	], function(error, result) {
		if(error) {
			toolkit.end(res, error);
		} else {
			toolkit.end(res, result);
		}
	});
});

/**
 * 通知被关注者(POST)
 * @function "/notice/noticeFocus"
 * @param {Number} userId	自己的用户ID
 * @param {Number} flagTime 请求的标志时间
 * 
 * @example
 * 
 * 返回值:
 * result = {
 *			"NoticeType" : 3,			//表示被关注
 * 			"UserId" : {
 * 							UserID : 1,
 * 							NickName : "XXX"
 * 							...
 * 						}		//标记喜欢帖子的用户信息
 * 			}
 * @memberof notice
 * @returns {Object} errCode, errMsg
 */
router.post("/noticeFocus", function(req, res, next) {
	var userId = req.body.userId;
	var createTime = req.body.flagTime;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !createTime || isNaN(createTime) || createTime < macro.StartTime.START) {
				logger.error("/noticeFocus", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				createTime = moment(createTime * 1000).format('YYYY-MM-DD HH:mm:ss');
				cb(null);
			}
		},

		//查找时间内的喜欢数据
		function(cb) {
			var paramsJSON = {
				"BeNoticeUserID": userId, //指定查询的用户
				"CreateTime": createTime, //查询截止时间
				"NoticeType": macro.NoticeType.FOCUS //通知类型
			};
			dbTools.selectNotcieByTime(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "noticeFocus selectNotcieByTime 报错", error);
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				} else if(rows.length == 0) {
					cb(errConfig.getError("ERR_NO_FOUCS_NOTICE"));
				} else {
					cb(null, rows);
				}
			});
		},

		//查询出关注过自己的用户
		function(noticeInfos, cb) {
			//通知中关注自己的用户IDLIST
			var fansUserIdList = toolkit.getColumnValueListStr(noticeInfos, "UserID", ',');
			var paramsJSON = {
				"UserIdList": fansUserIdList == "" ? 0 : fansUserIdList
			};
			dbTools.selectUserInfoByIdList(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "selectUserInfoByIdList 查询报错： ", error);
				} else {
					//用户键值对
					var fansInfoMap = {};
					for(var index = 0; index < rows.length; index++) {
						var noticeUserId = rows[index].UserID;
						fansInfoMap[noticeUserId] = rows[index];
					}

					//将用户数据组装进通知数据
					for(var index = 0; index < noticeInfos.length; index++) {
						var noticeUserId = noticeInfos[index].UserID;
						noticeInfos[index]["FansUserInfo"] = fansInfoMap[noticeUserId];
					}
				}
				cb(null, fansUserIdList, noticeInfos, fansInfoMap);
			});
		},

		//查找用户是否关注过粉丝
		function(fansUserIdList, noticeInfos, fansInfoMap, cb) {
			var paramsJSON = {
				"UserID": userId,
				"FindIdList": fansUserIdList
			};
			dbTools.selectFocusInIdList(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "请求关注列表数据报错： ", error);
				} else {
					var focusMap = {};
					for(var index = 0; index < rows.length; index++) {
						//找出的被自己关注过的用户ID
						var focusUserId = rows[index].FindId;
						focusMap[focusUserId] = 1;
					}

					for(var index = 0; index < noticeInfos.length; index++) {
						var fansUserId = noticeInfos[index].UserID;
						//找出用户信息
						var userInfo = noticeInfos[index]["FansUserInfo"];
						if(userInfo == null) {
							continue;
						}

						if(focusMap[fansUserId]) {
							userInfo["HasFocus"] = 1;
						} else {
							userInfo["HasFocus"] = 0;
						}
					}
				}
				cb(null, noticeInfos);
			});
		}

	], function(error, result) {
		if(error) {
			toolkit.end(res, error);
		} else {
			toolkit.end(res, result);
		}
	});
});

/**
 * 系统通知(POST)
 * @function "/notice/noticeSystem"
 * @param {Number} userId	自己的ID
 * @param {Number} flagTime 请求的标志时间
 * 
 * @example
 * 
 * 返回值:
 * result = {
 *			"NoticeType" : 4,			//表示被喜欢
 * 			"UserID" : {
 * 							UserID : 1,
 * 							NickName : "XXX"
 * 						},		//标记喜欢帖子的用户信息
 * 			"DynamicID" : {
 * 								usrId : 2345,
 * 								headIconPath : "",		//头像路径
 * 								nickName : "",			//被喜欢用户的昵称
 * 								content : "",			//帖子内容
 * 								picturePath : ""		//图片路径
 * 						  }	
 * 			}
 * 
 * @memberof notice
 * @returns {Object} errCode, errMsg
 */
router.post("/noticeSystem", function(req, res, next) {
	var userId = req.body.userId;
	var createTime = req.body.flagTime;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !createTime || isNaN(createTime) || createTime < macro.StartTime.START) {
				common.log(__filename, "/noticeSystem", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				createTime = moment(createTime * 1000).format('YYYY-MM-DD HH:mm:ss');
				cb(null);
			}
		},

		//查找时间内的喜欢数据
		function(cb) {
			var paramsJSON = {
				"BeNoticeUserID": userId, //指定查询的用户
				"CreateTime": createTime, //查询截止时间
				"NoticeType": macro.NoticeType.SYSTEM //通知类型
			};

			dbTools.selectNotcieByTime(paramsJSON, function(error, rows) {
				if(error) {
					logger.debug("noticeSystem selectNotcieByTime 报错", error);
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				} else {
					cb(null, rows);
				}
			});
		}

	], function(error, result) {
		if(error) {
			toolkit.end(res, error);
		} else {
			toolkit.end(res, result);
		}
	});
});

/**
 * 删除通知(POST)
 * @function "/notice/deleteNotice"
 * @param {Number} userId	自己的ID
 * @param {String} noticeIdList	需要删除的通知ID字符串，(以,分隔)
 * 
 * @memberof notice
 * @returns {Object} errCode, errMsg
 */
router.post("/deleteNotice", function(req, res, next) {
	var userId = req.body.userId;
	var noticeIdList = req.body.noticeIdList;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !noticeIdList) {
				logger.error("/deleteNotice", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				var noticeIdArr = noticeIdList.split(",");
				var arrLen = noticeIdArr.length;
				common.log(__filename, "删除通知：", arrLen);
				if(noticeIdArr.length == 0 || noticeIdArr[arrLen - 1] == ""){
					logger.error("/deleteNotice", noticeIdList);
					cb(errConfig.getError("ERR_PARAM"));
				} else {
					cb(null);
				}
			}
		},

		function(cb) {
			var paramsJSON = {
				"BeNoticeUserID": userId, //指定查询的用户
				"NoticeIdList": noticeIdList //指定消除列表
			};

			dbTools.deleteNotice(paramsJSON, function(error, result) {
				if(error) {
					cb(errConfig.getError("ERR_MYSQL_DELETE"));
				} else {
					cb(null, errConfig.getError("ERR_SUCCESS"));
				}
			});
		}

	], function(error, result) {
		if(error) {
			toolkit.end(res, error);
		} else {
			toolkit.end(res, result);
		}
	});
});

/**
 * 请求通知列表(POST)
 * @function "/notice/reqNoticeList"
 * @param {Number} userId	自己的ID
 * 
 * @memberof notice
 * @returns {Object} errCode, errMsg
 */
router.post("/reqNoticeList", function(req, res, next) {
	var userId = req.body.userId;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0) {
				logger.error("/reqNoticeList", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				cb(null);
			}
		},

		function(cb) {
			dbTools.selectNoticeList(userId, function(error, rows) {
				if(error) {
					logger.debug("reqNoticeList selectNoticeList 报错：", error);
					cb(errConfig.getError("ERR_MYSQL_DELETE"));
				} else {
					var infos = {};
					for(var index = 0; index < rows.length; index++) {
						infos[rows[index].NoticeType] = rows[index].COUNT;
					}

					for(var key in macro.NoticeType) {
						var value = macro.NoticeType[key];
						if(infos[value] == null) {
							infos[value] = 0;
						}
					}
					cb(null, infos);
				}
			});
		}

	], function(error, result) {
		if(error) {
			toolkit.end(res, error);
		} else {
			toolkit.end(res, result);
		}
	});
});

/**
 * 已读通知(POST)
 * @function "/notice/readNotice"
 * @param {Number} userId	自己的用户ID
 * @param {Number} noticeType	通知类型
 * 
 * @memberof notice
 * @returns {Object} errCode, errMsg
 */
router.post("/readNotice", function(req, res, next) {
	var userId = req.body.userId;
	var noticeType = req.body.noticeType;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !noticeType || isNaN(noticeType) || noticeType <= 0) {
				logger.error("/readNotice", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				cb(null);
			}
		},

		function(cb) {
			var paramsJSON = {
				"IsRead": 1, //标记已读
				"BeNoticeUserID": userId, //指定查询的用户
				"NoticeType": noticeType //消息类型
			};

			dbTools.updateNoticeReadState(paramsJSON, function(error, result) {
				if(error) {
					logger.debug("readNotice updateNoticeReadState", error);
					cb(errConfig.getError("ERR_MYSQL_UPDATE"));
				} else {
					cb(null, errConfig.getError("ERR_SUCCESS"));
				}
			});
		}

	], function(error, result) {
		if(error) {
			toolkit.end(res, error);
		} else {
			toolkit.end(res, result);
		}
	});
});

module.exports = router;