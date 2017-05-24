var toolkit = require("../routes/js/toolkit.js");
var moment = require("moment");
var assert = require("assert");
var config = require("../routes/js/config.js");
var request = require("request");
var should = require('should');

describe('TestCollect', function() {
	describe.only('ReqCollectData', function() {
		it('请求我的收藏', function(done) {
			var info = {
				userId: 1,
				flagTime: Date.parse(new Date()) / 1000
			};

			toolkit.post("http://192.168.1.66:3001/collect/reqData", info, function(err, result) {
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
	
	describe('AddCollect', function() {
		it('收藏帖子', function(done) {
			var info = {
				userId: 1,
				dynamicId: 55
			};

			toolkit.post("http://192.168.1.66:3001/collect/addCollect", info, function(err, result) {
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
	
	describe('CancelCollect', function() {
		it('取消收藏', function(done) {
			var info = {
				userId: 1,
				dynamicId: 55
			};

			toolkit.post("http://192.168.1.66:3001/collect/cancelCollect", info, function(err, result) {
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