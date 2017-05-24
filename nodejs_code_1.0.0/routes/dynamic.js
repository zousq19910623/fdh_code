var express = require("express");
var router = express.Router();

var moment = require("moment");
var async = require("async");
var util = require("util");
var wordFilter = require("./js/wordFilter.js");

var logger = require("./js/logger.js");
var dbTools = require("./js/dbTools.js");

var redisTools = require("./js/redisTools.js");
var errConfig = require("./js/errConfig.js");
var macro = require("./js/macro.js");
var common = require("./js/common.js");
var toolkit = require("./js/toolkit.js");

/**
 * 用户帖子管理
 * @namespace dynamic
 * @description 用户发帖，评论，回复，标志喜欢
 */

/**
 * 请求帖子数据,用于用户打开界面时拉取所有帖子数据(POST)
 * @function "/dynamic/reqData"
 * @param {Number} userId 用户ID
 * @param {Number} refreshType 刷新类型(1、上拉， 2、下拉)
 * @param {Number} flagTime 请求的标志时间
 *
 * @example
 *  { DynamicID: 345,
 *    UserID: 111,
 *    HeadIconPath: 'http://landlord-10005195.image.myqcloud.com/0c3bee2f-93f7-4a1b-af8f-440d8fd156a8', //头像ID
 *    NickName: 'duanoldfive', //昵称
 *    Content: '六角恐龙', //帖子内容
 *    CreateTime: '2017-05-09T06:54:20.000Z',
 *    Location: '', //发帖位置
 *    PicturePath: '', //帖子图片路径
 *    Longitude: 1234.5,
 *    Latitude: 2345.6,
 *    LastComment: {}, //最近一条评论
 *    FirstReply: {}, //第一条回复内容
 *    HasFond: 0, //是否喜欢过这个帖子
 *    HasCollect: 0, //是否收集过
 *    HasReport: 0, //是否举报过
 *    HasFocus: 0, //是否关注过帖子用户
 *    DynamicTimes:  //帖子次数相关数据
 *     { DynamicID: 345, //
 *       FondTimes: 1, //被喜欢次数
 *       ReadTimes: 1, //被阅读次数
 *       ShareTimes: 0, //被分享次数
 *       CommentTimes: 0, //被评论次数
 *       ReportTimes: 0, //被举报次数
 *       CollectTimes: 0 //被收集次数 } }
 * 
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/reqData", function(req, res, next) {
	var userId = req.body.userId;
	var createTime = req.body.flagTime;
	var refreshType = req.body.refreshType;
	console.log(req.body);

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !createTime || isNaN(createTime) || createTime < macro.StartTime.START ||
				(refreshType != macro.RefreshType.REFRESH && refreshType != macro.RefreshType.LOAD)) {
				logger.error("/reqData: ", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				createTime = moment(createTime * 1000).format("YYYY-MM-DD HH:mm:ss");
				cb(null);
			}
		},

		//查找指定时间之前所有的帖子集合
		function(cb) {
			var paramsJSON = {
				"CreateTime": createTime
			};
			if(refreshType == macro.RefreshType.LOAD) {
				dbTools.selectAllDynamicByTimeLoad(paramsJSON, function(error, rows) {
					if(error) {
						cb(errConfig.getError("ERR_MYSQL_SELECT"));
					} else {
						cb(null, rows);
					}
				});
			} else {
				dbTools.selectAllDynamicByTimeRefresh(paramsJSON, function(error, rows) {
					if(error) {
						cb(errConfig.getError("ERR_MYSQL_SELECT"));
					} else {
						cb(null, rows);
					}
				});
			}
		},

		//组装每个帖子与它最近的一条评论
		function(dynamices, cb) {
			common.fillDynamicInfo(userId, dynamices, function(error, result) {
				if(error) {
					cb(error);
				} else {
					//console.log("所有帖子数据：", result);
					cb(null, result);
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
 * 请求帖子数据,用于用户拉取所有关注数据(POST)
 * @function "/dynamic/reqFocusUserDynamic"
 * @param {Number} userId 用户ID
 * @param {Number} refreshType 刷新类型(1、上拉， 2、下拉)
 * @param {Number} startRow 每次请求时的起始行（递增）
 * @param {Number} flagTime 请求的标志时间
 * 
 *  @example
 *  { DynamicID: 345,
 *    UserID: 111,
 *    HeadIconPath: 'http://landlord-10005195.image.myqcloud.com/0c3bee2f-93f7-4a1b-af8f-440d8fd156a8', //头像ID
 *    NickName: 'duanoldfive', //昵称
 *    Content: '六角恐龙', //帖子内容
 *    CreateTime: '2017-05-09T06:54:20.000Z',
 *    Location: '', //发帖位置
 *    PicturePath: '', //帖子图片路径
 *    Longitude: 1234.5,
 *    Latitude: 2345.6,
 *    LastComment: {}, //最近一条评论
 *    FirstReply: {}, //第一条回复内容
 *    HasFond: 0, //是否喜欢过这个帖子
 *    HasCollect: 0, //是否收集过
 *    HasReport: 0, //是否举报过
 *    HasFocus: 0, //是否关注过帖子用户
 *    DynamicTimes:  //帖子次数相关数据
 *     { DynamicID: 345, //
 *       FondTimes: 1, //被喜欢次数
 *       ReadTimes: 1, //被阅读次数
 *       ShareTimes: 0, //被分享次数
 *       CommentTimes: 0, //被评论次数
 *       ReportTimes: 0, //被举报次数
 *       CollectTimes: 0 //被收集次数 } }
 * 
 * 
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/reqFocusUserDynamic", function(req, res, next) {
	var userId = req.body.userId;
	var createTime = req.body.flagTime;
	var refreshType = req.body.refreshType;
	var startRow = req.body.startRow;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !createTime || isNaN(createTime) || createTime < macro.StartTime.START ||
				(refreshType != macro.RefreshType.REFRESH && refreshType != macro.RefreshType.LOAD) || !startRow || isNaN(startRow) || startRow < 0) {
				logger.error("/reqFocusUserDynamic", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				createTime = moment(createTime * 1000).format("YYYY-MM-DD HH:mm:ss");
				cb(null);
			}
		},

		function(cb) {
			//先从内存获取数据
			var focusKey = "FocusList_" + userId;
			redisTools.getValueByKey(focusKey, function(error, result) {
				if(result != null && typeof result == "string") {
					//有数据直接调用
					cb(null, result);
				} else {
					//查询所有关注用户
					var paramsJSON = {
						"UserID": userId
					};
					//没数据从数据库取
					dbTools.selectFocusListById(paramsJSON, function(error, rows) {
						if(error) {
							logger.debug("reqHomePage 获取关注列表报错： ", error);
							cb(errConfig.getError("ERR_MYSQL_SELECT"));
						} else {
							//找出所有关注的用户列表并且将自己的合并
							var str = "";
							for(var index = 0; index < rows.length; index++) {
								str = str + rows[index].FocusUserID + ",";
							}
							str = str.substr(0, str.length - 1);

							//将数据存入内存并设置过期时间
							redisTools.setValueByKey(focusKey, str);
							redisTools.pexpireByKey(focusKey, macro.Interval.TEN_MIN);
							cb(null, str);
						}
					});
				}
			});
		},

		//查找指定时间之前，关注用户最近发布过的帖子集合
		function(focusUserIdList, cb) {
			if(focusUserIdList == "") {
				if(startRow > macro.HotDynamic.MAX_ROW) {
					cb(errConfig.getError("ERR_NOT_MORE_HOT"));
				} else {
					startRow = startRow <= 0 ? 0 : startRow - 1;
					var endRow = startRow + macro.Page.TEN_ROW > macro.HotDynamic.MAX_ROW ? macro.HotDynamic.MAX_ROW : startRow + macro.Page.TEN_ROW;
					common.getHotDynamic(startRow, endRow, function(error, result) {
						if(error) {
							cb(error);
						} else {
							cb(null, result);
						}
					});
				}
			} else {
				common.log(__filename, "关注用户帖子数据： ", focusUserIdList);
				var paramsJSON = {
					"UserIdList": focusUserIdList,
					"CreateTime": createTime
				};
				if(refreshType == macro.RefreshType.LOAD) {
					dbTools.selectDynamicByTimeLoad(paramsJSON, function(error, rows) {
						if(error) {
							cb(errConfig.getError("ERR_MYSQL_SELECT"));
						} else {
							cb(null, rows);
						}
					});
				} else {
					dbTools.selectDynamicByTimeRefresh(paramsJSON, function(error, rows) {
						if(error) {
							cb(errConfig.getError("ERR_MYSQL_SELECT"));
						} else {
							cb(null, rows);
						}
					});
				}
			}
		},

		//组装每个帖子与它最近的一条评论
		function(dynamices, cb) {
			common.fillDynamicInfo(userId, dynamices, function(error, result) {
				if(error) {
					cb(error);
				} else {
					cb(null, result);
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
 * 查找指定帖子(POST)
 * @function "/dynamic/findDynamic"
 * @param {Number} userId 用户ID
 * @param {Number} dynamicId 帖子ID
 * 
 * @example
 * { DynamicID: 325,
 *  UserID: 108,
 *  HeadIconPath: '',
 *  NickName: '昵称',
 *  Content: '大海<img src="images/arclist/0.gif" data-innerhtml="/::)"><img src="images/arclist/0.gif" data-innerhtml="/::)"></img>',
 *  CreateTime: '2017-05-05T06:36:03.000Z',
 *  Location: '',
 *  PicturePath: '[{"picStatus":0,"picUrl":"http://landload-10011569.image.myqcloud.com/be311b92-3b48-466b-9391-b13aa39f879b"}]', //图片路径
 *  Longitude: 1234.5,
 *  Latitude: 2345.6,
 *  AllComment: [], //所有评论
 *  FondUserList: //部分喜欢这个帖子的用户列表
 *   [ { UserID: 108,
 *       TokenID: 'd9ecb906e331867d7425c9c810177c6e',
 *       NickName: '昵称',
 *       Sex: 1,
 *       BirthDay: '0000-00-00',
 *       CreateTime: '2017-05-04T10:09:51.000Z',
 *       HeadIconPath: '',
 *       PhoneNum: '',
 *       LogoutTime: '0000-00-00',
 *       Country: '中国',
 *       Province: '',
 *       City: '',
 *       Address: '广东 深圳',
 *       Signature: '保存' } ],
 *  HasFond: 0, //是否喜欢
 *  HasCollect: 0, //是否收集
 *  HasReport: 0, //是否举报
 *  HasFocus: 0  //是否关注过帖子用户}
 * 
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/findDynamic", function(req, res, next) {
	var userId = req.body.userId;
	var dynamicId = req.body.dynamicId;
	var dynamicUserId = 0;

	async.waterfall([
		//判断参数
		function(cb) {
			if(!userId || isNaN(userId) || !dynamicId || isNaN(dynamicId) || dynamicId <= 0) {
				logger.error("/findDynamic", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				cb(null);
			}
		},

		//查询指定帖子
		function(cb) {
			common.getDynamicInfo(dynamicId, function(error, result) {
				if(error) {
					cb(error);
				} else if(result == null || result.DynamicID == null) {
					cb(errConfig.getError("ERR_DYNAMIC_NOT_EXIST"));
				} else {
					dynamicUserId = result.UserID;
					cb(null, result);
				}
			});
		},

		//查询帖子的所有评论
		function(dynamicInfo, cb) {
			common.getCommentByDynamicId(0, dynamicId, function(error, result) {
				if(error) {
					common.log(__filename, "getCommentByDynamicId 查找评论时报错：", error);
					cb(error);
				} else {
					cb(null, dynamicInfo, result);
				}
			});
		},

		//查询出用户后填充评论的头像路径
		function(dynamicInfo, commentInfos, cb) {
			//评论用户IDLIST
			var commentIdList = toolkit.getColumnValueListStr(commentInfos, "CommentUserID", ",");

			//common.testLog(__filename, "测试TESTLOG commentIdList: ", commentIdList, "帖子的所有评论 commentInfos: ", commentInfos);
			//logger.debug("帖子的所有评论 commentInfos: ", commentInfos);

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
					for(var index = 0; index < commentInfos; index++) {
						var commentUserId = commentInfos[index].CommentUserID;
						commentInfos[index]["HeadIconPath"] = userInfoMap[commentUserId].HeadIconPath;
					}

					dynamicInfo["AllComment"] = commentInfos;
				}
				cb(null, dynamicInfo);
			});
		},

		//获取喜欢该帖子的部分用户列表
		function(dynamicInfo, cb) {
			var paramsJSON = {
				"FondDynamicID": dynamicId,
				"CreateTime": moment().format("YYYY-MM-DD HH:mm:ss"),
				"Limit": 10
			};
			dbTools.selectFondInfoByTime(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "阅读帖子时请求帖子喜欢的用户列表报错： ", error);
				}
				cb(null, dynamicInfo, rows);
			});
		},

		//填充帖子部分喜欢用户的数据
		function(dynamicInfo, fondInfos, cb) {
			//点赞喜欢用户IDLIST
			var fondUserIdList = toolkit.getColumnValueListStr(fondInfos, "UserID", ",");
			var paramsJSON = {
				"UserIdList": fondUserIdList == "" ? 0 : fondUserIdList
			};
			dbTools.selectUserInfoByIdList(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "selectUserInfoByIdList 查询报错： ", error);
				} else {
					dynamicInfo["FondUserList"] = rows;
				}
				cb(null, dynamicInfo);
			});
		},

		//更新帖子被阅读次数数据		
		function(dynamicInfo, cb) {
			var columnJSON = {
				"ReadTimes": macro.TimesChangeType.ADD_ONE
			};
			common.updateDynamicTimesEntri(dynamicInfo.DynamicID, columnJSON, function(error, result) {
				if(error) {
					common.log(__filename, "更新帖子次数数据报错： ", error);
				}
				cb(null, dynamicInfo);
			});
		},

		function(dynamicInfo, cb) {
			var paramsJSON = { //参数顺序不能改变
				"UserID": userId,
				"DynamicUserID": dynamicInfo.UserID,
				"DynamicID": dynamicInfo.DynamicID
			};
			dbTools.execDynamicOpProc(paramsJSON, function(error, result) {
				if(error) {
					logger.debug("/fillDynamicInfo 执行存储过程 报错：", error);
				} else {
					dynamicInfo["HasFond"] = result[0][0].hasFond;
					dynamicInfo["HasCollect"] = result[0][0].hasCollect;
					dynamicInfo["HasReport"] = result[0][0].hasReport;
					dynamicInfo["HasFocus"] = result[0][0].hasFocus;
				}
				cb(null, dynamicInfo);
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
 * 用户发布帖子(POST)
 * @function "/dynamic/publishDynamic"
 * @param {Number} userId 用户ID
 * @param {String} paramsJSON 参数列表 
 * 
 * @example
 * paramsJSON = {
 * 				picturePath : '', 	//帖子图片存放路径
 * 				content : '', 		//帖子内容
 * 				location : '',		//发布位置信息(String)
 * 				longitude : 1234.5,	//经度
 * 				latitude : 2345.6	//纬度
 * }
 * 
 * result = { DynamicID: 477,
 *  UserID: 113,
 *  HeadIconPath: 'http://landlord-10005195.image.myqcloud.com/0c3bee2f-93f7-4a1b-af8f-440d8fd156a8',//发帖人头像路径
 *  NickName: 'fengyue01',//发帖人昵称
 *  Content: '<img src="images/arclist/0.gif" data-innerhtml="/::)"></img><img src="images/arclist/0.gif" data-innerhtml="/::)"></img>',
 *  CreateTime: '2017-05-12T01:19:02.000Z',
 *  Location: '深圳市蛇口创业壹号A205',
 *  PicturePath: '',
 *  Longitude: 1234.5,
 *  Latitude: 2345.6,
 *  AllComment: [],//所有评论
 *  FondUserList: [],//喜欢该条帖子的部分用户信息
 *  HasFond: 0,//
 *  HasCollect: 0,
 *  HasReport: 0,
 *  HasFocus: 0 }
 * 
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/publishDynamic", function(req, res, next) {
	var userId = req.body.userId;
	var params = req.body.paramsJSON;

	async.waterfall([
		//判断参数
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !params) {
				logger.error("/publishDynamic", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				try {
					params = JSON.parse(params);
					common.log(__filename, "这是publishDynamic的参数：\r\n ", params);
					cb(null);
				} catch(e) {
					logger.debug("publishDynamic parse error:", e);
				}
			}
		},

		//查询用户
		function(cb) {
			common.getUserInfo(userId, function(error, result) {
				if(error) {
					cb(error);
				} else {
					cb(null, result);
				}
			});
		},

		//插入一条帖子数据
		function(userInfo, cb) {
			try {
				if(userInfo == null) {
					cb(errConfig.getError("ERR_USER_NOT_EXIST"));
				} else {
					//添加参数
					var paramsJSON = params;
					paramsJSON["UserID"] = userId;
					paramsJSON["HeadIconPath"] = userInfo.HeadIconPath;
					paramsJSON["NickName"] = userInfo.NickName;
					paramsJSON["CreateTime"] = moment().format("YYYY-MM-DD HH:mm:ss");

					dbTools.execTransPublishDynamic(paramsJSON, function(error, result) {
						if(error) {
							cb(error);
						} else {
							cb(null, result);
						}
					});
				}
			} catch(e) {
				common.log(__filename, "publishDynamic parse error:", e);
			}
		},

		//更新用户发表帖子次数
		function(dynamicId, cb) {
			var columnJSON = {
				"PublishTimes": macro.TimesChangeType.ADD_ONE
			};
			common.updateUserActiveTimesEntri(userId, columnJSON, function(error, result) {
				if(error) {
					common.log(__filename, "更新用户次数数据报错： ", error);
				}
				cb(null, dynamicId);
			});
		},
		
		//查询指定帖子
		function(dynamicId, cb) {
			common.getDynamicInfo(dynamicId, function(error, result) {
				if(error) {
					cb(error);
				} else if(result == null || result.DynamicID == null) {
					cb(errConfig.getError("ERR_DYNAMIC_NOT_EXIST"));
				} else {
					cb(null, result);
				}
			});
		},
		
		//查询帖子的所有评论
		function(dynamicInfo, cb) {
			common.getCommentByDynamicId(0, dynamicInfo["DynamicID"], function(error, result) {
				if(error) {
					common.log(__filename, "getCommentByDynamicId 查找评论时报错：", error);
					cb(error);
				} else {
					cb(null, dynamicInfo, result);
				}
			});
		},

		//查询出用户后填充评论的头像路径
		function(dynamicInfo, commentInfos, cb) {
			//评论用户IDLIST
			var commentIdList = toolkit.getColumnValueListStr(commentInfos, "CommentUserID", ",");
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
					for(var index = 0; index < commentInfos; index++) {
						var commentUserId = commentInfos[index].CommentUserID;
						commentInfos[index]["HeadIconPath"] = userInfoMap[commentUserId].HeadIconPath;
					}

					dynamicInfo["AllComment"] = commentInfos;
				}
				cb(null, dynamicInfo);
			});
		},

		//获取喜欢该帖子的部分用户列表
		function(dynamicInfo, cb) {
			var paramsJSON = {
				"FondDynamicID": dynamicInfo["DynamicID"],
				"CreateTime": moment().format("YYYY-MM-DD HH:mm:ss"),
				"Limit": 10
			};
			dbTools.selectFondInfoByTime(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "阅读帖子时请求帖子喜欢的用户列表报错： ", error);
				}
				cb(null, dynamicInfo, rows);
			});
		},

		//填充帖子部分喜欢用户的数据
		function(dynamicInfo, fondInfos, cb) {
			//点赞喜欢用户IDLIST
			var fondUserIdList = toolkit.getColumnValueListStr(fondInfos, "UserID", ",");
			var paramsJSON = {
				"UserIdList": fondUserIdList == "" ? 0 : fondUserIdList
			};
			dbTools.selectUserInfoByIdList(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "selectUserInfoByIdList 查询报错： ", error);
				} else {
					dynamicInfo["FondUserList"] = rows;
				}
				cb(null, dynamicInfo);
			});
		}, 
		
		function(dynamicInfo, cb) {
			var paramsJSON = { //参数顺序不能改变
				"UserID": userId,
				"DynamicUserID": dynamicInfo.UserID,
				"DynamicID": dynamicInfo.DynamicID
			};
			dbTools.execDynamicOpProc(paramsJSON, function(error, result) {
				if(error) {
					logger.debug("/fillDynamicInfo 执行存储过程 报错：", error);
				} else {
					dynamicInfo["HasFond"] = result[0][0].hasFond;
					dynamicInfo["HasCollect"] = result[0][0].hasCollect;
					dynamicInfo["HasReport"] = result[0][0].hasReport;
					dynamicInfo["HasFocus"] = result[0][0].hasFocus;
				}
				cb(null, dynamicInfo);
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
 * 删除用户自己的指定的帖子(POST)
 * @function "/dynamic/deleteDynamic"
 * @param {Number} userId 用户ID
 * @param {Number} dynamicId 帖子ID
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/deleteDynamic", function(req, res, next) {
	var userId = req.body.userId;
	var dynamicId = req.body.dynamicId;

	async.waterfall([
		//判断参数
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !dynamicId || isNaN(dynamicId) || dynamicId <= 0) {
				common.log(__filename, "/deleteDynamic", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				cb(null);
			}
		},

		//判断帖子是否是自己发布的
		function(cb) {
			common.getDynamicInfo(dynamicId, function(error, result) {
				if(error) {
					cb(error);
				} else if(result == null) {
					cb(errConfig.getError("ERR_DYNAMIC_NOT_EXIST"));
				} else {
					if(result.UserID == userId) {
						cb(null);
					} else {
						cb(errConfig.getError("ERR_CANNOT_DELETE_DYNAMIC"));
					}
				}
			});
		},

		//删除帖子操作
		function(cb) {
			var paramsJSON = {
				"UserID": userId,
				"DynamicID": dynamicId
			};
			dbTools.deleteDynamic(paramsJSON, function(error, result) {
				if(error) {
					common.log(__filename, "事务删除帖子报错：", error);
					cb(error);
				} else {
					common.log(__filename, "事务删除帖子结果：", result[0][0].result);
					if(result[0][0].result == 0) {
						cb(null);
					} else {
						cb(errConfig.getError("ERR_MYSQL_DELETE"));
					}
				}
			});
		},

		//更新REDIS数据
		function(cb) {
			var dynamicKey = macro.PreKey.PRE_DYNAMIC_KEY + dynamicId;
			redisTools.deleteByKey(dynamicKey);

			var dynamicTimesKey = macro.PreKey.PRE_DYNAMICTIMES_KEY + dynamicId;
			redisTools.deleteByKey(dynamicTimesKey);

			cb(errConfig.getError("ERR_SUCCESS"));
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
 * 阅读帖子(POST)
 * @function "/dynamic/readDynamic"
 * @param {Number} userId 用户ID
 * @param {Number} dynamicId 帖子ID
 * 
 * @example
 * { DynamicId: '325',
 *  AllComment: [], //所有评论
 *  FondUserList: 
 *   [ { UserID: 108,
 *       TokenID: 'd9ecb906e331867d7425c9c810177c6e',
 *       NickName: '昵称',
 *       Sex: 1,
 *       BirthDay: '0000-00-00',
 *       CreateTime: '2017-05-04T10:09:51.000Z',
 *       HeadIconPath: '',
 *       PhoneNum: '',
 *       LogoutTime: '0000-00-00',
 *       Country: '中国',
 *       Province: '',
 *       City: '',
 *       Address: '广东 深圳',
 *       Signature: '保存' } ],
 *  HasFocus: 0 }
 * 
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/readDynamic", function(req, res, next) {
	var userId = req.body.userId;
	var dynamicId = req.body.dynamicId;
	var dynamicUserId = 0;

	async.waterfall([
		//判断参数
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !dynamicId || isNaN(dynamicId) || dynamicId <= 0) {
				logger.error("/readDynamic", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				cb(null);
			}
		},

		//查询帖子信息
		function(cb) {
			common.getDynamicInfo(dynamicId, function(error, dynamicInfo) {
				if(error) {
					logger.error("查找帖子报错：", error);
				} else if(dynamicInfo == null || dynamicInfo.DynamicID == null) {
					cb(errConfig.getError("ERR_DYNAMIC_NOT_EXIST"));
				} else {
					dynamicUserId = dynamicInfo.UserID;
					cb(null);
				}
			});
		},

		//更新用户阅读次数信息
		function(cb) {
			var columnJSON = {
				"ReadTimes": macro.TimesChangeType.ADD_ONE
			};
			common.updateUserActiveTimesEntri(userId, columnJSON, function(error, result) {
				if(error) {
					common.log(__filename, "更新用户次数数据报错： ", error);
				}
				cb(null);
			});
		},

		//更新帖子被阅读次数数据		
		function(cb) {
			var columnJSON = {
				"ReadTimes": macro.TimesChangeType.ADD_ONE
			};
			common.updateDynamicTimesEntri(dynamicId, columnJSON, function(error, result) {
				if(error) {
					common.log(__filename, "更新帖子次数数据报错： ", error);
				}
				cb(null);
			});
		},

		//查询帖子的所有评论
		function(cb) {
			var result = {
				DynamicId: dynamicId
			};
			common.getCommentByDynamicId(userId, dynamicId, function(error, commentInfos) {
				if(error) {
					common.log(__filename, "getCommentByDynamicId 查找评论时报错：", error);
					cb(error);
				} else {
					cb(null, result, commentInfos);
				}
			});
		},

		//查询出用户后填充评论的头像路径
		function(result, commentInfos, cb) {
			//评论用户IDLIST
			var commentIdList = toolkit.getColumnValueListStr(commentInfos, "CommentUserID", ",");
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
					for(var index = 0; index < commentInfos; index++) {
						var commentUserId = commentInfos[index].CommentUserID;
						commentInfos[index]["HeadIconPath"] = userInfoMap[commentUserId].HeadIconPath;
					}

					result["AllComment"] = commentInfos;
				}
				cb(null, result);
			});
		},

		//获取喜欢该帖子的部分用户列表
		function(result, cb) {
			var paramsJSON = {
				"FondDynamicID": dynamicId,
				"CreateTime": moment().format("YYYY-MM-DD HH:mm:ss"),
				"Limit": 10
			};
			dbTools.selectFondInfoByTime(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "阅读帖子时请求帖子喜欢的用户列表报错： ", error);
				}
				cb(null, result, rows);
			});
		},

		//填充帖子部分喜欢用户的数据
		function(result, fondInfos, cb) {
			//点赞喜欢用户IDLIST
			var fondUserIdList = toolkit.getColumnValueListStr(fondInfos, "UserID", ",");
			var paramsJSON = {
				"UserIdList": fondUserIdList == "" ? 0 : fondUserIdList
			};
			dbTools.selectUserInfoByIdList(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "selectUserInfoByIdList 查询报错： ", error);
				} else {
					result["FondUserList"] = rows;
				}
				cb(null, result);
			});
		},

		//是否关注过帖子用户
		function(result, cb) {
			dbTools.isExistFocus(userId, dynamicUserId, function(error, hasFocus) {
				if(error) {
					logger.error("查找关注报错是：", error);
				} else {
					result["HasFocus"] = hasFocus;
					cb(null, result);
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
 * 用户评论(POST)
 * @function "/dynamic/comment"
 * @param {Number} userId 用户ID
 * @param {String} paramsJSON 参数列表
 * @example
 * paramsJSON = {
 * 				dynamicId : 1234, 			//评论帖子的ID
 * 				beCommentUserId : 2345,		//被评论用户ID
 * 				beCommentName : "房东汇",	//被评论用户昵称
 * 				commentContent : ''			//评论内容
 * }
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/comment", function(req, res, next) {
	var userId = req.body.userId;
	var params = req.body.paramsJSON;

	async.waterfall([
		//判断参数
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !params) {
				logger.error("/comment", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				try {
					params = JSON.parse(req.body.paramsJSON);
					if(isNaN(params.dynamicId) || params.dynamicId <= 0 || isNaN(params.beCommentUserId) || params.beCommentUserId <= 0) {
						logger.error("/comment params参数错误", req.body.paramsJSON);
						cb(errConfig.getError("ERR_PARAM"));
					} else {
						cb(null);
					}
				} catch(e) {
					logger.error("comment parse error:", e);
				}
			}
		},

		//查询评论用户的信息
		function(cb) {
			common.getUserInfo(userId, function(error, value) {
				if(error) {
					cb(error);
				} else if(value == null) {
					cb(errConfig.getError("ERR_USER_NOT_EXIST"));
				} else {
					cb(null);
				}
			});
		},

		//插入评论数据
		function(cb) {
			var paramsJSON = { //字段顺序不能改
				"CommentUserID": userId,
				"BeCommentUserId": params.beCommentUserId,
				"DynamicID": params.dynamicId,
				"CommentContent": "\"" + params.commentContent.replace(/"/g, "\\\"") + "\"",
				"CommentTime": "\"" + moment().format("YYYY-MM-DD HH:mm:ss") + "\""
			};
			dbTools.execCommentProc(paramsJSON, function(error, result) {
				if(error) {
					common.log(__filename, "执行插入评论存储过程报错：", error);
					cb(errConfig.getError("ERR_MYSQL_INSERT"));
				} else {
					console.log("RESULT: ", result);
					if(result[1][0].error == 0) {
						cb(null);
					} else {
						cb(errConfig.getError("ERR_COMMENT_FAILED"));
					}
				}
			});
		},

		//更新帖子评论次数
		function(cb) {
			var columnJSON = {
				"CommentTimes": macro.TimesChangeType.ADD_ONE
			};
			common.updateDynamicTimesEntri(params.dynamicId, columnJSON, function(error, result) {
				if(error) {
					common.log(__filename, "更新帖子次数数据报错： ", error);
					cb(error);
				} else {
					cb(errConfig.getError("ERR_SUCCESS"));
				}
			});
		}

	], function(error, result) {
		logger.info("ERROR: ", error, "RESULT: ", result);
		if(error) {
			toolkit.end(res, error);
		} else {
			toolkit.end(res, result);
		}
	});
});

/**
 * 标记帖子状态为喜欢(POST)
 * @function "/dynamic/markLike"
 * @param {Number} userId 用户ID
 * @param {String} paramsJSON 参数列表
 * @example
 * paramsJSON = {
 * 				dynamicId : 1234, 		//帖子的ID
 * 				beLike : true(false), 	//喜欢(不喜欢)
 * 				beLikeUserId : 2345		//被喜欢帖子所属的用户ID
 * }
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/markLike", function(req, res, next) {
	var userId = req.body.userId;
	var params = req.body.paramsJSON;

	async.waterfall([
		//判断参数
		function(cb) {
			if(!userId || isNaN(userId) || !params) {
				logger.error("/markLike", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				try {
					params = JSON.parse(req.body.paramsJSON);
					if(isNaN(params.dynamicId) || params.dynamicId <= 0) {
						logger.error("/markLike params错误", req.body.paramsJSON);
						cb(errConfig.getError("ERR_PARAM"));
					} else {
						cb(null);
					}
				} catch(e) {
					logger.error("markLike parse error:", e);
				}
			}
		},

		//判断是否已经喜欢
		function(cb) {
			dbTools.isExistFond(userId, params.dynamicId, function(err, result) {
				if(err) {
					cb(err);
				} else {
					if(result > 0) {
						cb(null, true);
					} else {
						cb(null, false);
					}
				}
			});
		},

		//更新帖子的喜欢次数
		function(isExist, cb) {
			var canExec = true;
			var value = 0;
			if(params.beLike == true && isExist == false) {
				value = macro.TimesChangeType.ADD_ONE;
			} else if(params.beLike == false && isExist == true) {
				value = macro.TimesChangeType.SUB_ONE;
			} else {
				canExec = false;
				cb(errConfig.getError("ERR_FOND_EXIST_STATE"));
			}

			if(canExec) {
				//填充需要更改的字段
				var columnJSON = {
					"FondTimes": value
				};
				common.updateDynamicTimesEntri(params.dynamicId, columnJSON, function(error, result) {
					if(error) {
						common.log(__filename, "更新帖子次数数据报错： ", error);
						cb(error);
					} else {
						cb(null, isExist);
					}
				});
			}
		},

		//修改喜欢数据
		function(isExist, cb) {
			if(params.beLike == true && isExist == false) {
				//如果为喜欢，则将保留数据
				var paramsJSON = {
					"UserID": userId,
					"FondDynamicID": params.dynamicId,
					"CreateTime": moment().format("YYYY-MM-DD HH:mm:ss")
				};
				dbTools.createFondDynamic(paramsJSON, function(error, result) {
					if(error) {
						cb(errConfig.getError("ERR_MYSQL_SELECT"));
					} else {
						logger.info("用户 " + paramsJSON.UserID + "喜欢了帖子" + paramsJSON.FondDynamicID);
						//将喜欢的ID传入通知表
						cb(null, result.insertId);
					}
				});
			} else if(params.beLike == false && isExist == true) {
				//删除喜欢的帖子数据
				var paramsJSON = {
					"UserID": userId,
					"FondDynamicID": params.dynamicId
				};
				dbTools.deleteFondDynamic(paramsJSON, function(error, result) {
					if(error) {
						common.log(__filename, "删除喜欢的帖子操作报错： ", error);
						cb(errConfig.getError("ERR_MYSQL_SELECT"));
					} else {
						logger.info("用户 " + paramsJSON.UserID + "删除了喜欢的帖子" + paramsJSON.FondDynamicID);
						cb(errConfig.getError("ERR_CANCEL_FOND_SUCCESS"));
					}
				});
			} else {
				cb(errConfig.getError("ERR_FOND_EXIST_STATE"));
			}
		},

		//记录被喜欢通知
		function(fondId, cb) {
			if(typeof fondId == "number" && fondId != 0) {
				//初始化参数
				var paramsJSON = {
					"UserId": userId,
					"BeNoticeUserID": params.beLikeUserId,
					"NoticeType": macro.NoticeType.FOND,
					"RelationID": params.dynamicId,
					"CreateTime": moment().format("YYYY-MM-DD HH:mm:ss")
				};
				//插入数据
				dbTools.createNotice(paramsJSON, function(error, result) {
					cb(errConfig.getError("ERR_ADD_FOND_SUCCESS"));
				});
			} else {
				cb(errConfig.getError("ERR_MYSQL_SELECT"));
			}
		}

	], function(err, result) {
		if(err) {
			toolkit.end(res, err);
		} else {
			toolkit.end(res, result);
		}
	});
});

/**
 * 删除评论(POST)
 * @function "/dynamic/deleteComment"
 * @param {Number} userId 用户ID
 * @param {Number} commentId 评论ID
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/deleteComment", function(req, res, next) {
	var userId = req.body.userId;
	var commentId = req.body.commentId;

	async.waterfall([
		//判断参数
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !commentId || isNaN(commentId) || commentId <= 0) {
				logger.error("/deleteComment", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				cb(null);
			}
		},

		//删除评论
		function(cb) {
			//添加参数
			var paramsJSON = {
				"CommentID": commentId,
				"CommentUserID": userId
			};

			dbTools.deleteComment(paramsJSON, function(error, result) {
				if(error) {
					common.log(__filename, "删除评论报错: ", error);
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				} else {
					cb(errConfig.getError("ERR_SUCCESS"));
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
 * 用户回复评论(POST)
 * @function "/dynamic/reply"
 * @param {Number} userId 用户ID
 * @param {String} paramsJSON 参数列表
 * 
 * @example
 * 
 * paramsJSON = {
 *				dynamicId : 1234,			//帖子ID
 * 				beCommentId : 1234, 		//被评论的ID
 * 				commentContent : "哈哈哈", 	//回复内容
 * 				belongCommentID : 2345		//该条回复属于哪条评论
 * 				beCommentUserId : 2345,		//被评论用户ID
 * 				beCommentName : "房东汇",	//被评论用户昵称
 * }
 * 
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/reply", function(req, res, next) {
	var userId = req.body.userId;
	var params = req.body.paramsJSON;

	async.waterfall([
		//判断参数
		function(cb) {
			if(!userId || isNaN(userId) || !params) {
				logger.error("/reply", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				try {
					params = JSON.parse(req.body.paramsJSON);
					if(isNaN(params.dynamicId) || isNaN(params.beCommentId) || isNaN(params.beCommentUserId) || isNaN(params.belongCommentID) ||
						params.dynamicId <= 0 || params.beCommentId < 0 || params.beCommentUserId <= 0 || params.belongCommentID < 0) {
						logger.error("/reply 参数错误: ", req.body.paramsJSON);
						cb(errConfig.getError("ERR_PARAM"));
					} else {
						cb(null);
					}
				} catch(e) {
					logger.error("reply parse error: ", e);
				}
			}
		},

		//查询评论用户信息
		function(cb) {
			common.getUserInfo(userId, function(error, value) {
				if(error) {
					common.log(__filename, "获得用户信息报错：", error);
					cb(error);
				} else {
					cb(null, value);
				}
			});
		},

		//插入回复数据(与评论同一张表)
		function(userInfo, cb) {
			if(typeof userInfo != "object") {
				cb(errConfig.getError("ERR_USER_NOT_EXIST"));
			} else {
				//添加参数
				var paramsJSON = params;
				paramsJSON["CommentUserID"] = userId;
				paramsJSON["CommentName"] = userInfo.NickName;
				paramsJSON["CommentTime"] = moment().format("YYYY-MM-DD HH:mm:ss");

				dbTools.createComment(paramsJSON, function(error, result) {
					if(error) {
						common.log(__filename, "添加回复报错：", error);
						cb(errConfig.getError("ERR_MYSQL_INSERT"));
					} else {
						cb(null, result.insertId);
					}
				});
			}
		},

		//记录被回复评论到通知表
		function(commentId, cb) {
			if(typeof commentId == "number" && commentId != 0) {
				//初始化参数
				var paramsJSON = {
					"UserID": userId,
					"BeNoticeUserID": params.beCommentUserId,
					"NoticeType": macro.NoticeType.COMMENT,
					"RelationID": commentId,
					"CreateTime": moment().format("YYYY-MM-DD HH:mm:ss")
				};
				dbTools.createNotice(paramsJSON, function(error, result) {
					cb(null);
				});
			}
		},

		//更新帖子评论次数
		function(cb) {
			var columnJSON = {
				"CommentTimes": macro.TimesChangeType.ADD_ONE
			};
			common.updateDynamicTimesEntri(params.dynamicId, columnJSON, function(error, result) {
				if(error) {
					common.log(__filename, "回复时更新帖子次数数据报错： ", error);
				}
				cb(errConfig.getError("ERR_SUCCESS"));
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
 * 删除回复数据(POST)
 * @function "/dynamic/deleteReply"
 * @param {Number} userId 用户ID
 * @param {Number} commentId 回复ID(与评论ID共用)
 * 
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/deleteReply", function(req, res, next) {
	var userId = req.body.userId;
	var commentId = req.body.commentId;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || !commentId || isNaN(commentId)) {
				logger.error("/deleteReply", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				cb(null);
			}
		},

		//删除回复数据
		function(cb) {
			var paramsJSON = {
				"CommentID": commentId,
				"CommentUserID": userId
			};
			dbTools.deleteComment(paramsJSON, function(error, result) {
				if(error) {
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				} else {
					cb(errConfig.getError("ERR_SUCCESS"));
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
 * 查找我标记为喜欢的帖子(POST)
 * @function "/dynamic/findLike"
 * @param {Number} userId 用户ID
 * @param {Number} flagTime 请求的标志时间
 * 
 * @example
 *  { DynamicID: 345,
 *    UserID: 111,
 *    HeadIconPath: 'http://landlord-10005195.image.myqcloud.com/0c3bee2f-93f7-4a1b-af8f-440d8fd156a8', //头像ID
 *    NickName: 'duanoldfive', //昵称
 *    Content: '六角恐龙', //帖子内容
 *    CreateTime: '2017-05-09T06:54:20.000Z',
 *    Location: '', //发帖位置
 *    PicturePath: '', //帖子图片路径
 *    Longitude: 1234.5,
 *    Latitude: 2345.6,
 *    LastComment: {}, //最近一条评论
 *    FirstReply: {}, //第一条回复内容
 *    HasFond: 0, //是否喜欢过这个帖子
 *    HasCollect: 0, //是否收集过
 *    HasReport: 0, //是否举报过
 *    HasFocus: 0, //是否关注过帖子用户
 *    DynamicTimes:  //帖子次数相关数据
 *     { DynamicID: 345, //
 *       FondTimes: 1, //被喜欢次数
 *       ReadTimes: 1, //被阅读次数
 *       ShareTimes: 0, //被分享次数
 *       CommentTimes: 0, //被评论次数
 *       ReportTimes: 0, //被举报次数
 *       CollectTimes: 0 //被收集次数 } }
 * 
 * 
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/findLike", function(req, res, next) {
	var userId = req.body.userId;
	var createTime = req.body.flagTime;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !createTime || isNaN(createTime) || createTime < macro.StartTime.START) {
				logger.error("/findLike", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				createTime = moment(createTime * 1000).format("YYYY-MM-DD HH:mm:ss");
				common.log(__filename, "查询时间: ", createTime);
				cb(null);
			}
		},

		//查找并拼接用户指定时间之前喜欢的帖子ID
		function(cb) {
			var paramsJSON = {
				"UserID": userId,
				"CreateTime": createTime
			};
			dbTools.selectFondByTime(paramsJSON, function(error, rows) {
				if(error) {
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				} else {
					cb(null, rows);
				}
			});
		},

		//找出帖子
		function(fondInfos, cb) {
			//通知中关注自己的用户IDLIST
			var fondDynamicIdList = toolkit.getColumnValueListStr(fondInfos, "FondDynamicID", ",");
			var paramsJSON = {
				"dynamicIdList": fondDynamicIdList == "" ? 0 : fondDynamicIdList
			};
			dbTools.selectDynamicByIdList(paramsJSON, function(error, result) {
				if(error) {
					common.log(__filaname, "查找帖子报错：", error);
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				} else {
					cb(null, result);
				}
			});
		},

		//组装每个帖子与它最近的一条评论
		function(dynamices, cb) {
			common.fillDynamicInfo(userId, dynamices, function(error, result) {
				if(error) {
					cb(error);
				} else {
					cb(null, result);
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
 * 查找我评论过的帖子和评论(POST)
 * @function "/dynamic/findComment"
 * @param {Number} userId 用户ID
 * @param {Number} flagTime 请求的标志时间
 * 
 * @example
 * [ { CommentID: 355, //评论ID
 *    DynamicID: 333, //帖子ID
 *    CommentUserID: 113, // 评论用户ID
 *    CommentName: '水清浅', //评论用户昵称
 *    CommentContent: '<img src="images/arclist/0.gif" data-innerhtml="/::)"></img><img src="images/arclist/0.gif" data-innerhtml="/::)"></img>', //评论内容
 *    CommentTime: '2017-05-09T09:00:04.000Z',
 *    BeCommentUserID: 108, //被评论用户ID
 *    BeCommentName: '昵称', //被评论用户昵称
 *    BeCommentID: 0, //被评论的那条评论的ID
 *    BelongCommentID: 0, //属于哪一个评论组
 *    DynamicInfo:  //该条评论对应的帖子数据
 *     { DynamicID: 333,
 *       UserID: 108,
 *       HeadIconPath: '',
 *       NickName: '昵称',
 *       Content: '呀呀',
 *       CreateTime: '2017-05-08T10:33:21.000Z',
 *       Location: '',
 *       PicturePath: '[{"picStatus":0,"picUrl":"http://landload-10011569.image.myqcloud.com/c42f777a-a9f9-4c69-bcc1-34738d168d2b"}]',
 *       Longitude: 1234.5,
 *       Latitude: 2345.6 } } ]
 * 
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/findComment", function(req, res, next) {
	var userId = req.body.userId;
	var createTime = req.body.flagTime;
	
	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !createTime || isNaN(createTime) || createTime <= macro.StartTime.START) {
				logger.error("/findComment", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				createTime = moment(createTime * 1000).format("YYYY-MM-DD HH:mm:ss");
				cb(null);
			}
		},

		//查找指定时间之前用户的评论
		function(cb) {
			var paramsJSON = {
				"CommentUserID": userId,
				"CommentTime": createTime
			};
			dbTools.selectUserCommentByTime(paramsJSON, function(error, rows) {
				if(error) {
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				} else {
					var dynamicIdListStr = ""; //帖子ID
					var beCommentIdListStr = ""; //被回复的評論ID
					var dynamicObj = {}; //将查询出来的帖子ID去重
					for(var index = 0; index < rows.length; index++) {
						//合并被评论的评论ID
						var beCommentId = rows[index].BeCommentID;
						if(beCommentId && beCommentId > 0) {
							beCommentIdListStr = beCommentIdListStr + beCommentId + ",";
						}

						//将去重的帖子ID合并
						var dynamicId = rows[index].DynamicID;
						if(!dynamicObj[dynamicId]) {
							dynamicIdListStr = dynamicIdListStr + rows[index].DynamicID + ",";
							dynamicObj[dynamicId] = 1;
						}
					}
					dynamicIdListStr = dynamicIdListStr.substr(0, dynamicIdListStr.length - 1);
					beCommentIdListStr = beCommentIdListStr.substr(0, beCommentIdListStr.length - 1);

					cb(null, dynamicIdListStr, beCommentIdListStr, rows);
				}
			});
		},

		//查找被用户评论的那条评论内容
		function(dynamicIdList, beCommentIdList, allComments, cb) {
			if(beCommentIdList != "") {
				var paramsJSON = {
					"CommentIdList": beCommentIdList
				};
				dbTools.selectCommentByIdList(paramsJSON, function(error, rows) {
					//首先确定被评论的ID与内容的键值对
					var allBeComments = {};
					for(var index = 0; index < rows.length; index++) {
						var beCommentId = rows[index].CommentID;
						allBeComments[beCommentId] = rows[index];
					}

					//匹配评论内容与被评论内容
					for(var index = 0; index < allComments.length; index++) {
						var beCommentId = allComments[index].BeCommentID;
						//不管是评论还是回复，都要添加字段
						allComments[index]["PreComment"] = allBeComments[beCommentId];
					}

					//调用下一个函数
					cb(null, dynamicIdList, allComments);
				});
			} else {
				cb(null, dynamicIdList, allComments);
			}
		},

		//通过查找出的帖子ID找出帖子
		function(dynamicIdList, allComments, cb) {
			if(dynamicIdList != "") {
				var paramsJSON = {
					"dynamicIdList": dynamicIdList
				};
				dbTools.selectDynamicByIdList(paramsJSON, function(error, rows) {
					if(error) {
						cb(errConfig.getError("ERR_MYSQL_SELECT"));
					} else {
						var dynamicObj = {};
						//将查找出来的帖子组装成键值对
						for(var index = 0; index < rows.length; index++) {
							var dynamicId = rows[index].DynamicID;
							dynamicObj[dynamicId] = rows[index];
						}

						//通过帖子ID找出对应帖子内容并且组合进上个函数返回的评论内容中，然后做为结果返回
						for(var index = 0; index < allComments.length; index++) {
							var dynamicId = allComments[index].DynamicID;
							allComments[index]["DynamicInfo"] = dynamicObj[dynamicId];
						}
						cb(null, allComments);
					}
				});
			} else {
				common.log(__filename, "/findComment 查询的评论没有帖子，数据有问题");
				//cb([]);
				cb(null, allComments);
			}
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
 * 我发布的所有帖子(POST)
 * @function "/dynamic/myPublishDynamic"
 * @param {Number} userId 用户ID
 * @param {Number} flagTime 请求的标志时间
 * 
 *  @example
 *  { DynamicID: 345,
 *    UserID: 111,
 *    HeadIconPath: 'http://landlord-10005195.image.myqcloud.com/0c3bee2f-93f7-4a1b-af8f-440d8fd156a8', //头像ID
 *    NickName: 'duanoldfive', //昵称
 *    Content: '六角恐龙', //帖子内容
 *    CreateTime: '2017-05-09T06:54:20.000Z',
 *    Location: '', //发帖位置
 *    PicturePath: '', //帖子图片路径
 *    Longitude: 1234.5,
 *    Latitude: 2345.6,
 *    LastComment: {}, //最近一条评论
 *    FirstReply: {}, //第一条回复内容
 *    HasFond: 0, //是否喜欢过这个帖子
 *    HasCollect: 0, //是否收集过
 *    HasReport: 0, //是否举报过
 *    HasFocus: 0, //是否关注过帖子用户
 *    DynamicTimes:  //帖子次数相关数据
 *     { DynamicID: 345, //
 *       FondTimes: 1, //被喜欢次数
 *       ReadTimes: 1, //被阅读次数
 *       ShareTimes: 0, //被分享次数
 *       CommentTimes: 0, //被评论次数
 *       ReportTimes: 0, //被举报次数
 *       CollectTimes: 0 //被收集次数 } }
 * 
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/myPublishDynamic", function(req, res, next) {
	var userId = req.body.userId;
	var createTime = req.body.flagTime;
	
	console.log("我发布的帖子：", req.body);

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !createTime || isNaN(createTime) || createTime < macro.StartTime.START) {
				logger.error("/myPublishDynamic", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				createTime = moment(createTime * 1000).format("YYYY-MM-DD HH:mm:ss");
				cb(null);
			}
		},

		//查询相关的帖子
		function(cb) {
			//查询数据
			var paramsJSON = {
				"UserIdList": userId,
				"CreateTime": createTime
			};
			dbTools.selectDynamicByTimeLoad(paramsJSON, function(error, rows) {
				if(error) {
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				} else {
					cb(null, rows);
				}
			});
		},

		//组装每个帖子与它最近的一条评论
		function(dynamices, cb) {
			common.fillDynamicInfo(userId, dynamices, function(error, result) {
				if(error) {
					cb(error);
				} else {
					cb(null, result);
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
 * 分享帖子(POST)
 * @function "/dynamic/shareDynamic"
 * @param {Number} userId 用户ID
 * @param {Number} dynamicId 帖子ID
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/shareDynamic", function(req, res, next) {
	var userId = req.body.userId;
	var dynamicId = req.body.dynamicId;

	async.waterfall([
		//判断参数
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !dynamicId || isNaN(dynamicId) || dynamicId <= 0) {
				logger.error("/shareDynamic", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				cb(null);
			}
		},

		//更新帖子的分享次数
		function(cb) {
			var columnJSON = {
				"ShareTimes": macro.TimesChangeType.ADD_ONE
			};
			common.updateDynamicTimesEntri(dynamicId, columnJSON, function(error, result) {
				if(error) {
					common.log(__filename, "更新帖子次数数据报错： ", error);
				}
				cb(errConfig.getError("ERR_SUCCESS"));
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
 * 请求喜欢帖子的用户列表(POST)
 * @function "/dynamic/fondUserList"
 * @param {Number} dynamicId 帖子ID
 * @param {Number} flagTime 请求的标志时间
 * 
 * @example
 * { FondID: 760,
 *    UserID: 108, //喜欢该条帖子的用户ID
 *    FondDynamicID: 325, //该条帖子ID
 *    CreateTime: '2017-05-05T10:14:36.000Z',
 *    UserInfo:  //喜欢该条帖子的用户信息
 *     { UserID: 108,
 *       TokenID: 'd9ecb906e331867d7425c9c810177c6e',
 *       NickName: '昵称',
 *       Sex: 1,
 *       BirthDay: '0000-00-00',
 *       CreateTime: '2017-05-04T10:09:51.000Z',
 *       HeadIconPath: '',
 *       PhoneNum: '',
 *       LogoutTime: '0000-00-00',
 *       Country: '中国',
 *       Province: '',
 *       City: '',
 *       Address: '广东 深圳',
 *       Signature: '保存' } } ]
 * 
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/fondUserList", function(req, res, next) {
	var dynamicId = req.body.dynamicId;
	var createTime = req.body.flagTime;

	async.waterfall([
		//判断参数
		function(cb) {
			if(!createTime || isNaN(createTime) || createTime <= macro.StartTime.START || !dynamicId || isNaN(dynamicId) || dynamicId <= 0) {
				logger.error("/fondUserList", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				createTime = moment(createTime * 1000).format("YYYY-MM-DD HH:mm:ss");
				cb(null);
			}
		},

		//获取用户列表
		function(cb) {
			var paramsJSON = {
				"FondDynamicID": dynamicId,
				"CreateTime": createTime,
				"Limit": 50
			};
			dbTools.selectFondInfoByTime(paramsJSON, function(error, rows) {
				if(error) {
					common.log(__filename, "请求帖子喜欢的用户列表报错： ", error);
					cb(errConfig.getError("ERR_MYSQL_SELECT"));
				} else {
					cb(null, rows);
				}
			});
		},

		//填充每个用户信息
		function(fondInfos, cb) {
			//通知中喜欢过我帖子的用户IDLIST
			var fondUserIdList = toolkit.getColumnValueListStr(fondInfos, "UserID", ",");
			if(fondUserIdList == "") {
				cb(null, []); //没有喜欢过的帖子
			} else {
				var paramsJSON = {
					"UserIdList": fondUserIdList
				};
				dbTools.selectUserInfoByIdList(paramsJSON, function(error, rows) {
					if(error) {
						common.log(__filename, "selectUserInfoByIdList 查询报错： ", error);
						cb(null, []);
					} else {
						//用户键值对
						var fondInfoMap = {};
						for(var index = 0; index < rows.length; index++) {
							var fondUserId = rows[index].UserID;
							fondInfoMap[fondUserId] = rows[index];
						}

						//将用户数据组装进通知数据
						for(var index = 0; index < fondInfos.length; index++) {
							var fondUserId = fondInfos[index].UserID;
							var fondUserInfo = fondInfoMap[fondUserId];
							fondInfos[index]["UserInfo"] = (fondUserInfo == null) ? {} : fondUserInfo;
						}
						cb(null, fondInfos);
					}
				});
			}
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
 * 请求帖子数据,用于用户打开界面时拉取所有关注数据(POST)
 * @function "/dynamic/reqZoneData"
 * @param {Number} userId 自己的用户ID
 * @param {String} paramsJSON 参数列表 
 * 
 * @example
 * 
 * paramsJSON: {
 * 		position: "深圳", //位置
 * 		refreshType: 1, //刷新类型(1、上拉， 2、下拉)
 * 		flagTime: 1234567 //请求的标志时间
 * }
 * 
 *  @example
 *  { DynamicID: 345,
 *    UserID: 111,
 *    HeadIconPath: 'http://landlord-10005195.image.myqcloud.com/0c3bee2f-93f7-4a1b-af8f-440d8fd156a8', //头像ID
 *    NickName: 'duanoldfive', //昵称
 *    Content: '六角恐龙', //帖子内容
 *    CreateTime: '2017-05-09T06:54:20.000Z',
 *    Location: '', //发帖位置
 *    PicturePath: '', //帖子图片路径
 *    Longitude: 1234.5,
 *    Latitude: 2345.6,
 *    LastComment: {}, //最近一条评论
 *    FirstReply: {}, //第一条回复内容
 *    HasFond: 0, //是否喜欢过这个帖子
 *    HasCollect: 0, //是否收集过
 *    HasReport: 0, //是否举报过
 *    HasFocus: 0, //是否关注过帖子用户
 *    DynamicTimes:  //帖子次数相关数据
 *     { DynamicID: 345, //
 *       FondTimes: 1, //被喜欢次数
 *       ReadTimes: 1, //被阅读次数
 *       ShareTimes: 0, //被分享次数
 *       CommentTimes: 0, //被评论次数
 *       ReportTimes: 0, //被举报次数
 *       CollectTimes: 0 //被收集次数 } }
 * 
 * 
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/reqZoneData", function(req, res, next) {
	var userId = req.body.userId;
	var params = req.body.paramsJSON;

	var position = "";
	var createTime = macro.StartTime.START;
	var refreshType = 1;

	async.waterfall([
		function(cb) {
			if(!userId || isNaN(userId) || userId <= 0 || !params) {
				logger.error("/reqZoneData", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				try {
					var paramsJSON = JSON.parse(params);
					position = paramsJSON.position;
					createTime = paramsJSON.flagTime;
					refreshType = paramsJSON.refreshType;

					if(!position || position == "" || !createTime || isNaN(createTime) || createTime < macro.StartTime.START ||
						(refreshType != macro.RefreshType.REFRESH && refreshType != macro.RefreshType.LOAD)) {
						cb(errConfig.getError("ERR_PARAM"));
					} else {
						createTime = moment(createTime * 1000).format("YYYY-MM-DD HH:mm:ss");
						cb(null);
					}
				} catch(e) {
					logger.debug("reqZoneData异常： ", e);
				}
			}
		},

		function(cb) {
			var paramsJSON = {
				"Position": position,
				"CreateTime": createTime
			};
			if(refreshType == 1) {
				dbTools.selectDynamicListByPosLoad(paramsJSON, function(error, rows) {
					if(error) {
						cb(errConfig.getError("ERR_MYSQL_SELECT"));
					} else {
						cb(null, rows);
					}
				});
			} else {
				dbTools.selectDynamicListByPosRefresh(paramsJSON, function(error, rows) {
					if(error) {
						cb(errConfig.getError("ERR_MYSQL_SELECT"));
					} else {
						cb(null, rows);
					}
				});
			}
		},

		//组装每个帖子与它最近的一条评论
		function(dynamices, cb) {
			common.fillDynamicInfo(userId, dynamices, function(error, result) {
				if(error) {
					cb(error);
				} else {
					cb(null, result);
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
 * 请求热门帖子列表(POST)
 * @function "/dynamic/reqHotList"
 * @param {Number} reqType 请求类型(1、分享页概要， 2、请求详情)
 * @param {Number} startRow 每次请求时的起始行（递增）
 * 
 * @example
 * 
 *  { DynamicID: 330,
 *   UserID: 108,
 *    HeadIconPath: '',
 *    NickName: '昵称',
 *    Content: '159',
 *    CreateTime: '2017-05-05T07:38:44.000Z',
 *    Location: '',
 *    PicturePath: '[{"picStatus":0,"picUrl":"http://landload-10011569.image.myqcloud.com/7328db42-2be6-4017-88c2-d6066f2aa668"}]',
 *    Longitude: 1234.5,
 *    Latitude: 2345.6 }
 * 
 * @memberof dynamic
 * @returns {Object} errCode, errMsg
 */
router.post("/reqHotList", function(req, res, next) {
	var startRow = req.body.startRow;
	var reqType = req.body.reqType;

	async.waterfall([
		function(cb) {
			if(!startRow || isNaN(startRow) || startRow < 0 || !reqType || isNaN(reqType)) {
				logger.error("/reqHotList: ", req.body);
				cb(errConfig.getError("ERR_PARAM"));
			} else {
				cb(null);
			}
		},

		function(cb) {
			var addPage = (reqType == 1) ? macro.Page.FIVE_ROW : macro.Page.TEN_ROW;
			startRow -= 1;
			var endRow = startRow + addPage > macro.HotDynamic.MAX_ROW ? macro.HotDynamic.MAX_ROW : startRow + addPage;
			common.getHotDynamic(startRow, endRow, function(error, result) {
				if(error) {
					cb(error);
				} else {
					cb(null, result);
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