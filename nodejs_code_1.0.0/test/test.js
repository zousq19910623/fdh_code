var toolkit = require("../routes/js/toolkit.js");
var moment = require("moment");
var assert = require("assert");
var config = require("../routes/js/config.js");
var request = require("request");
var should = require('should');
var async = require("async");
var dbTools = require("../routes/js/dbTools.js");
var logger = require("../routes/js/logger.js");
var binaryTree = require("../routes/js/binaryTree.js");
var common = require("../routes/js/common.js");
var util = require("util");
var tc = require('text-censor')

describe('TestPerformance', function() {
	describe('BinaryTree', function() {
		it('测试二叉树', function(done) {
			binaryTree.insert(1);
			binaryTree.insert(10);
			binaryTree.insert(8);
			binaryTree.insert(1);
			binaryTree.insert(12);
			binaryTree.insert(11);
			binaryTree.insert(21);
			binaryTree.insert(101);
			binaryTree.insert(81);
			binaryTree.insert(121);
			binaryTree.insert(1123);
			binaryTree.insert(10);
			binaryTree.insert(89);
			binaryTree.insert(13);

			console.log(binaryTree);

			done();
		});
	});

	describe('TestUpdate', function() {
		it('测试更新数据库性能', function(done) {
			var dynamicId = 56; //配置参数
			var startTime = 0;
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
					startTime = Date.parse(new Date());
					var count = 0;
					async.whilst(
						function() {
							return count < 1000;
						},

						function(cb) {
							//dynamicInfo.ReadTimes = count;
							//dbTools.updateDynamicInfo(dynamicId, dynamicInfo, function(error, result) {
							var tempJSON = {
								"FondTimes": count
							};
							dbTools.updateDynamicInfo(dynamicId, tempJSON, function(error, result) {
								if(error) {
									logger.debug(__filename + ": updateDynamicInfo: ", error);
								} else {
									count++;
								}
								cb(null);
							});
						},

						function(err) {
							if(!err) {
								console.log("完成时间： ", Date.parse(new Date()) - startTime);
								done();
							} else {
								console.log(err);
							}
						}
					);
				}

			], function(error, result) {
				if(error) {
					console.log(error);
				}
			});

		});
	});

	describe('TestConnection', function() {
		it('测试连接数据库性能', function(done) {
			var startTime = Date.parse(new Date());
			var endTime = 0;
			var count = 0;

			for(var i = 0; i < 10000; i++) {
				dbTools.isExist(1, function(error, result) {
					if(error) {
						logger.debug(__filename + ": updateDynamicInfo: ", error);
					} else {
						count++;
					}
				});
			}
			endTime = Date.parse(new Date());
			console.log("开始时间：", startTime);
			console.log("完成时间: ", endTime);
			console.log("消耗时间：", endTime - startTime);
			done();

			//			async.whilst(
			//				function() {
			//					return count < 10000;
			//				},
			//
			//				function(cb) {
			//					dbTools.isExist(1, function(error, result) {
			//						if(error) {
			//							logger.debug(__filename + ": updateDynamicInfo: ", error);
			//						} else {
			//							count++;
			//						}
			//						cb(null);
			//					});
			//				},
			//
			//				function(err) {
			//					if(!err) {
			//						endTime = Date.parse(new Date());
			//						console.log("开始时间：", startTime);
			//						console.log("完成时间: ", endTime);
			//						console.log("消耗时间：", endTime - startTime);
			//						done();
			//					} else {
			//						console.log(err);
			//					}
			//				}
			//			);

		});
	});

	describe('TestProc', function() {
		it('测试存储过程', function(done) {
			var paramsJSON = {
				UserId: 1,
				BeCommentUserID: 1,
				DynamicID: 99,
				Content: "\"评论内容评论内容\""
			}
			var startTime = Date.parse(new Date());
			dbTools.execCommentProc(paramsJSON, function(error, result) {
				if(error) {
					logger.debug(__filename + ": updateDynamicInfo: ", error);
				} else {
					endTime = Date.parse(new Date());
					console.log("开始时间：", startTime);
					console.log("完成时间: ", endTime);
					console.log("消耗时间：", endTime - startTime);
					done();
				}
			});
		});
	});

	describe('TestGlobal', function() {
		it('测试全局变量', function(done) {
			var str = "暗香浮动月黄昏!123";
			var tempCh = "月";
			for(var index = 0; index < str.length; index++) {
				var ch = util.format("第%d个字符: %s, unicode码：%d, 十六进制：%s", index + 1, str[index], str.charCodeAt(index), str.charCodeAt(index).toString(16));

				if(tempCh == str[index]) {
					//console.log("找到匹配字符");
				}
				console.log(ch);
			}

			done();
		});
	});

	describe.only('WordFilter', function() {
		it('敏感词过滤', function(done) {
			var text = "台湾成人骚b哈哈哈 呵呆回来是；江泽民斯柯达塔顶开机激情交友FuckYou";
			tc.filter(text, function(error, censored) {
				console.log(censored) // 'Ur so ***y babe!'
			})
		});
	});
});