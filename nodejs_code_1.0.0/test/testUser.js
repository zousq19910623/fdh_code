var toolkit = require("../routes/js/toolkit.js");
var moment = require("moment");
var assert = require("assert");
var config = require("../routes/js/config.js");
var request = require("request");
var should = require('should');

describe('TestUser', function() {
	describe('RegUser', function() {
		it('添加一个用户', function(done) {
			var info = {
				tokenId: "cf6f1a666c60356c0be3e6d3cde415f2",
				nickName: "水清浅",
				headIconPath: "",
				birthDay: "1991",
				sex: 2
			};

			toolkit.post("http://192.168.1.66:3001/usermanager/regUser", info, function(err, result) {
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

	describe.only('UpdateUser', function() {
		it('更新用户信息', function(done) {
			var params = {
				nickname: "fengyue01",
				headIconPath: "e/f/g.jpg",
				birthDay: "1991-00-00",
				sex: 2,
				signature: "千金散尽还复来！",
				country: "中国", //国家
				province: '湖南', //省份
				city: '长沙', //城市
				address: '嶽麓'
			};

			var info = {
				userId: 113,
				paramsJSON: JSON.stringify(params)
			};

			toolkit.post("http://192.168.1.66:3001/usermanager/updateUser", info, function(err, result) {
				if(err) {
					throw err
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

	describe.only('ReqUserData', function() {
		it('请求用户数据', function(done) {
			var info = {
				tokenId: "cf6f1a666c60356c0be3e6d3cde415f2"
			};

			toolkit.post("http://192.168.1.66:3001/usermanager/reqData", info, function(err, result) {
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
});