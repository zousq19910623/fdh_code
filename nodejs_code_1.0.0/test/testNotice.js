var toolkit = require("../routes/js/toolkit.js");
var moment = require("moment");
var assert = require("assert");
var config = require("../routes/js/config.js");
var request = require("request");
var should = require('should');

describe('TestNotice', function() {
	describe('NoticeLike', function() {
		it('通知帖子被喜欢', function(done) {
			var info = {
				userId: 1,
				flagTime: Date.parse(new Date()) / 1000
			};

			toolkit.post("http://192.168.1.66:3001/notice/noticeLike", info, function(err, result) {
				if(err) {
					throw err
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
	
	describe.only('NoticeComment', function() {
		it('通知被评论', function(done) {
			var info = {
				userId: 1,
				flagTime: Date.parse(new Date()) / 1000
			};

			toolkit.post("http://192.168.1.66:3001/notice/noticeComment", info, function(err, result) {
				if(err) {
					throw err
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
	
	describe('NoticeFocus', function() {
		it('通知被关注', function(done) {
			var info = {
				userId: 1,
				flagTime: Date.parse(new Date()) / 1000
			};

			toolkit.post("http://192.168.1.66:3001/notice/noticeFocus", info, function(err, result) {
				if(err) {
					throw err
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
	
	describe('NoticeSystem', function() {
		it('系统通知', function(done) {
			var info = {
				userId: 8,
				flagTime: Date.parse(new Date()) / 1000
			};

			toolkit.post("http://192.168.1.66:3001/notice/noticeSystem", info, function(err, result) {
				if(err) {
					throw err
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
	
	describe('DeleteNotice', function() {
		it('删除通知', function(done) {
			var info = {
				userId: 1,
				noticeIdList: "21,69"
			};

			toolkit.post("http://192.168.1.66:3001/notice/deleteNotice", info, function(err, result) {
				if(err) {
					throw err
				} else {
					try {
						var obj = JSON.parse(result);
						console.log(result);
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
	
	describe('ReqNoticeList', function() {
		it('请求通知主页面', function(done) {
			var info = {
				userId: 2
			};

			toolkit.post("http://192.168.1.66:3001/notice/reqNoticeList", info, function(err, result) {
				if(err) {
					throw err
				} else {
					try {
						var obj = JSON.parse(result);
						console.log(result);
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
	
	describe('ReadNotice', function() {
		it('已阅通知', function(done) {
			var info = {
				userId: 2,
				noticeType: 3
			};

			toolkit.post("http://192.168.1.66:3001/notice/readNotice", info, function(err, result) {
				if(err) {
					throw err
				} else {
					try {
						var obj = JSON.parse(result);
						console.log(result);
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
});