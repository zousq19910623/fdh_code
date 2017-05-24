var toolkit = require("../routes/js/toolkit.js");
var moment = require("moment");
var assert = require("assert");
var config = require("../routes/js/config.js");
var request = require("request");
var should = require('should');

describe('TestRelation', function() {
	describe('ReqFansData', function() {
		it('请求粉丝数据', function(done) {
			var time = Date.parse(new Date()) / 1000;
			var info = {
				userId: 1,
				flagTime: time
			};

			toolkit.post("http://192.168.1.66:3001/relation/reqFansData", info, function(err, result) {
				if(err) {
					throw err
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
	
	describe('ReqFocusData', function() {
		it('请求关注的用户', function(done) {
			//var time = Date.parse(new Date()) / 1000;
			var info = {
				userId: 1,
				flagTime: Date.parse(new Date()) / 1000
			};

			toolkit.post("http://192.168.1.66:3001/relation/reqFocusData", info, function(err, result) {
				if(err) {
					throw err
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
	
	describe('FocusUser', function() {
		it('关注用户', function(done) {
			var info = {
				userId: 1,
				beFocusUserId: 5
			};

			toolkit.post("http://192.168.1.66:3001/relation/focusUser", info, function(err, result) {
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
	
	describe('CancelFocus', function() {
		it('取消关注用户', function(done) {
			var info = {
				userId: 1,
				cancelUserId: 4
			};

			toolkit.post("http://192.168.1.66:3001/relation/cancelFocus", info, function(err, result) {
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
	
	describe('FindUser', function() {
		it('查找关注用户或粉丝', function(done) {
			var info = {
				userId: 1,
				findName: "我",
				findFlag: 1
			};

			toolkit.post("http://192.168.1.66:3001/relation/findUser", info, function(err, result) {
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
	
	describe.only('RecommendUser', function() {
		it('推荐用户', function(done) {
			toolkit.post("http://192.168.1.66:3001/relation/recommendUser", {}, function(err, result) {
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
});