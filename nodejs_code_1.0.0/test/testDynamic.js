var toolkit = require("../routes/js/toolkit.js");
var moment = require("moment");
var assert = require("assert");
var config = require("../routes/js/config.js");
var request = require("request");
var should = require('should');
var async = require("async");
var dbTools = require("../routes/js/dbTools.js");

describe('TestDynamic', function() {
	describe('ReqHomePage', function() {
		it('请求主页数据', function(done) {
			var time = Date.parse(new Date()) / 1000;
			var info = {
				userId: 111,
				flagTime: time,
				refreshType: 1
			};

			toolkit.post("http://192.168.1.66:3001/dynamic/reqData", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					try {
						var obj = JSON.parse(result);
						console.log(obj);
						done();
					} catch(e) {
						console.log(result);
						throw e;
					}
				}
			});
		});
		
		it('请求关注用户帖子数据', function(done) {
			var time = Date.parse(new Date()) / 1000;
			var info = {
				userId: 111,
				flagTime: time,
				refreshType: 1,
				startRow: 1
			};

			toolkit.post("http://192.168.1.66:3001/dynamic/reqFocusUserDynamic", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					try {
						var obj = JSON.parse(result);
						console.log(obj);
						done();
					} catch(e) {
						console.log(result);
						throw e;
					}
				}
			});
		});
	});

	describe('FindDynamic', function() {
		it('查找指定帖子', function(done) {
			var info = {
				userId: 111,
				dynamicId: 325
			};

			toolkit.post("http://192.168.1.66:3001/dynamic/findDynamic", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					try {
						console.log(JSON.parse(result));
						done();
					} catch(e) {
						console.log(result);
						throw e;
					}
				}
			});
		});
	});

	describe.only('PublishDynamic', function() {
		it('发布帖子', function(done) {
			var params = {
				picturePath: '', //帖子图片存放路径
				content: '<img src="images/arclist/0.gif" data-innerhtml="/::)"></img><img src="images/arclist/0.gif" data-innerhtml="/::)"></img>', //帖子内容
				location: '深圳市蛇口创业壹号A205', //发布位置信息(String)
				longitude: 1234.5, //经度
				latitude: 2345.6 //纬度
			};

			var info = {
				userId: 113,
				paramsJSON: JSON.stringify(params)
			};

			toolkit.post("http://192.168.1.66:3001/dynamic/publishDynamic", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					try {
						var obj = JSON.parse(result);
						console.log(obj);
						obj.should.not.have.property("errCode");
						done();
					} catch(e) {
						console.log(result);
						throw e;
					}
				}
			});
		});
	});

	describe('DeleteDynamic', function() {
		it('删除帖子', function(done) {
			var info = {
				userId: 8,
				dynamicId: 174
			};

			toolkit.post("http://192.168.1.66:3001/dynamic/deleteDynamic", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					try {
						var obj = JSON.parse(result);
						//console.log(obj);
						obj.should.have.property("errCode", 0);
						done();
					} catch(e) {
						console.log(result);
						throw e;
					}
				}
			});
		});
	});

	describe('ReadDynamic', function() {
		it('帖子阅读', function(done) {
			var info = {
				userId: 113,
				dynamicId: 325
			};

			toolkit.post("http://192.168.1.66:3001/dynamic/readDynamic", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					try {
						var obj = JSON.parse(result);
						console.log(obj);
						obj.should.not.have.property("errCode");
						done();
					} catch(e) {
						console.log(result);
						throw e;
					}
				}
			});
		});
	});

	describe('CommentDynamic', function() {
		it('评论帖子', function(done) {
			var userId = 113; //配置参数
			var dynamicId = 333; //配置参数
			var content = '<img src="images/arclist/0.gif" data-innerhtml="/::)"></img><img src="images/arclist/0.gif" data-innerhtml="/::)"></img>'; //配置参数
			async.waterfall([
				function(cb) {
					//查找帖子
					var paramsJSON = {
						"dynamicIdList": dynamicId
					};
					dbTools.selectDynamicByIdList(paramsJSON, function(error, rows) {
						if(error) {
							cb(errConfig.getError("ERR_MYSQL_SELECT_RESULT"));
						} else {
							cb(null, rows[0])
						}
					});
				},

				function(dynamicInfo, cb) {
					var params = {
						dynamicId: dynamicInfo.DynamicID, //评论帖子的ID
						beCommentUserId: dynamicInfo.UserID, //被评论用户ID
						beCommentName: dynamicInfo.NickName, //被评论用户昵称
						commentContent: content //评论内容
					};

					var info = {
						userId: userId,
						paramsJSON: JSON.stringify(params)
					};

					toolkit.post("http://192.168.1.66:3001/dynamic/comment", info, function(err, result) {
						if(err) {
							throw err;
						} else {
							try {
								var obj = JSON.parse(result);
								console.log(obj);
								obj.should.have.property("errCode", 0);
								done();
							} catch(e) {
								console.log(result);
								throw e;
							}
						}
					});
				}

			], function(error, result) {
				if(error) {
					console.log(error);
				}
			});

		});
	});

	describe('MarkLikeDynamic', function() {
		it('点赞喜欢帖子', function(done) {
			var userId = 113; //配置参数
			var dynamicId = 325; //配置参数
			var beLike = true; //配置参数
			async.waterfall([
				function(cb) {
					//查找帖子
					var paramsJSON = {
						"dynamicIdList": dynamicId
					};
					dbTools.selectDynamicByIdList(paramsJSON, function(error, rows) {
						if(error) {
							cb(error);
						} else {
							cb(null, rows[0])
						}
					});
				},

				function(dynamicInfo, cb) {
					var params = {
						dynamicId: dynamicInfo.DynamicID, //帖子的ID 
						beLike: beLike, //喜欢(不喜欢) 
						beLikeUserId: dynamicInfo.UserID
					};

					var info = {
						userId: userId,
						paramsJSON: JSON.stringify(params)
					};
					toolkit.post("http://192.168.1.66:3001/dynamic/markLike", info, function(err, result) {
						if(err) {
							throw err;
						} else {
							try {
								var obj = JSON.parse(result);
								console.log(obj);
								obj.should.have.property("errCode");
								done();
							} catch(e) {
								console.log(result);
								throw e;
							}
						}
					});
				}

			], function(error, result) {
				if(error) {
					console.log("点赞喜欢帖子报错", error);
				}
			});
		});
	});

	describe('DeleteComment', function() {
		it('删除评论', function(done) {
			var info = {
				userId: 2, //配置参数
				commentId: -1 //配置参数
			};

			toolkit.post("http://192.168.1.66:3001/dynamic/deleteComment", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					try {
						var obj = JSON.parse(result);
						obj.should.have.property("errCode", 0);
						done();
					} catch(e) {
						console.log(result);
						throw e;
					}
				}
			});
		});
	});

	describe('ReplyComment', function() {
		it('回复评论', function(done) {
			var userId = 8; //配置参数
			var commentId = 148; //配置参数,评论ID
			var content = "用户" + userId + "回复评论" + commentId; //配置参数
			async.waterfall([
				function(cb) {
					dbTools.selectCommentByCommentId(commentId, function(error, rows) {
						if(error) {
							cb(errConfig.getError("ERR_MYSQL_SELECT"));
						} else {
							console.log(rows[0]);
							cb(null, rows[0]);
						}
					});
				},

				function(commentInfo, cb) {
					var params = {
						dynamicId: commentInfo.DynamicID, //帖子ID
						beCommentId: commentId, //被评论的ID
						commentContent: content, //回复内容
						belongCommentID: commentInfo.BelongCommentID == 0 ? commentId : commentInfo.BelongCommentID, //该条回复属于哪条评论
						beCommentUserId: commentInfo.CommentUserID, //被评论用户ID
						beCommentName: commentInfo.CommentName //被评论用户昵称
					};

					var info = {
						userId: userId,
						paramsJSON: JSON.stringify(params)
					};

					toolkit.post("http://192.168.1.66:3001/dynamic/reply", info, function(err, result) {
						if(err) {
							throw err;
						} else {
							try {
								var obj = JSON.parse(result);
								console.log(obj);
								obj.should.have.property("errCode", 0);
								done();
							} catch(e) {
								console.log(result);
								throw e;
							}
						}
					});
				}

			], function(error, result) {
				if(error) {
					console.log(error);
				}
			});
		});
	});
	
	describe('DeleteReply', function() {
		it('删除回复', function(done) {
			var info = {
				userId: 2, //配置参数
				commentId: 23 //配置参数
			};

			toolkit.post("http://192.168.1.66:3001/dynamic/deleteReply", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					try {
						var obj = JSON.parse(result);
						obj.should.have.property("errCode", 0);
						done();
					} catch(e) {
						console.log(result);
						throw e;
					}
				}
			});
		});
	});
	
	describe('FindLike', function() {
		it('查看喜欢的帖子', function(done) {
			//var time = Date.parse(new Date()) / 1000;
			var info = {
				userId: 113,
				flagTime: Date.parse(new Date()) / 1000
			};

			toolkit.post("http://192.168.1.66:3001/dynamic/findLike", info, function(err, result) {
				if(err) {
					throw err
				} else {
					try {
						var obj = JSON.parse(result);
						console.log(obj);
						//obj.should.have.property("errCode", 0);
						done();
					} catch(e) {
						console.log(result);
						throw e;
					}
				}
			});
		});
	});
	
	describe('FindComment', function() {
		it('查找我评论的', function(done) {
			//var time = Date.parse(new Date()) / 1000;
			var info = {
				userId: 113,
				flagTime: Date.parse(new Date()) / 1000
			};

			toolkit.post("http://192.168.1.66:3001/dynamic/findComment", info, function(err, result) {
				if(err) {
					throw err
				} else {
					try {
						var obj = JSON.parse(result);
						console.log(obj);
						//obj.should.have.property("errCode", 0);
						done();
					} catch(e) {
						console.log(result);
						throw e;
					}
				}
			});
		});
	});
	
	describe('MyPublishDynamic', function() {
		it('查找我发布过的帖子', function(done) {
			//var time = Date.parse(new Date()) / 1000;
			var info = {
				userId: 111,
				flagTime: Date.parse(new Date()) / 1000
			};

			toolkit.post("http://192.168.1.66:3001/dynamic/myPublishDynamic", info, function(err, result) {
				if(err) {
					throw err
				} else {
					try {
						var obj = JSON.parse(result);
						console.log(obj);
						//obj.should.have.property("errCode", 0);
						done();
					} catch(e) {
						console.log(result);
						throw e;
					}
				}
			});
		});
	});
	
	describe('ShareDynamic', function() {
		it('分享帖子', function(done) {
			var info = {
				userId: 2,
				dynamicId: 56
			};

			toolkit.post("http://192.168.1.66:3001/dynamic/shareDynamic", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					try {
						var obj = JSON.parse(result);
						console.log(obj);
						obj.should.have.property("errCode", 0);
						done();
					} catch(e) {
						console.log(result);
						throw e;
					}
				}
			});
		});
	});
	
	describe('ReqFondUserList', function() {
		it('请求喜欢帖子的用户列表', function(done) {
			var info = {
				dynamicId: 325,
				flagTime: Date.parse(new Date()) / 1000
			};

			toolkit.post("http://192.168.1.66:3001/dynamic/fondUserList", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					try {
						var obj = JSON.parse(result);
						console.log(obj);
						obj.should.not.have.property("errCode");
						done();
					} catch(e) {
						console.log(result);
						throw e;
					}
				}
			});
		});
	});
	
	describe('ReqZoneData', function() {
		it('请求地区的帖子', function(done) {
			var params = {
				position: "深圳",
				flagTime: Date.parse(new Date()) / 1000,
				refreshType: 1
			};

			var info = {
				userId: 8,
				paramsJSON: JSON.stringify(params)
			};

			toolkit.post("http://192.168.1.66:3001/dynamic/reqZoneData", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					try {
						var obj = JSON.parse(result);
						console.log(obj);
						done();
					} catch(e) {
						console.log(result);
						throw e;
					}
				}
			});
		});
	});
	
	describe('ReqHotList', function() {
		it('请求热门帖子数据', function(done) {

			var info = {
				startRow: 1,
				reqType: 1
			};

			toolkit.post("http://192.168.1.66:3001/dynamic/reqHotList", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					try {
						var obj = JSON.parse(result);
						console.log(obj);
						obj.should.not.have.property("errCode");
						done();
					} catch(e) {
						console.log(result);
						throw e;
					}
				}
			});
		});
	});
});