var toolkit = require("../routes/js/toolkit.js");
var moment = require("moment");
var assert = require("assert");
var config = require("../routes/js/config.js");
var request = require("request");
var should = require('should');

describe('TestFdhMgr', function() {
	describe('DeleteDynamic', function() {
		it('后台删除帖子', function(done) {
			var info = {
				managerId: 99,
				dynamicId: 198,
				reason: "我是管理员我是管理员"
			};

			toolkit.post("http://192.168.1.66:3001/fdhmgr/deleteDynamic", info, function(err, result) {
				if(err) {
					throw err
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
});