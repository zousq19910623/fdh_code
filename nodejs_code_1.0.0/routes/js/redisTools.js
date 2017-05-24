"use strict";

var async = require("async");
var redis = require("redis");

var errConfig = require("./errConfig.js");
var config = require("./config.js");
var logger = require("./logger.js");

var client = redis.createClient(config.redis.port, config.redis.host, {
	auth_pass: config.redis.pass
});

//console.log("redis client: ", client);

var redisReady = false;

/**
 * @classdesc 缓存操作
 * @constructor RedisTools
 * @since version 0.1
 */
function RedisTools() {

}

client.on("ready", function(res) {
	redisReady = true;
});

client.on("error", function (err) {
    client.quit()
    logger.error("Error " + err);
    //redisClient = redis.createClient(config.redisAuth);
});

/**
 * 判断Redis数据库是否连接正确
 * @param {Function} cb 回调函数
 * @ignore
 */
function isRedisReady(cb) {
	if(!redisReady) {
		if(cb) {
			console.log("REDIS 断开连接");
		}
		return false;
	}
	return true;
}

/**
 * 获取指定KEY的值
 * @param {String} key
 * @param {Function} cb 回调函数
 */
RedisTools.prototype.getValueByKey = function(key, cb) {
	if(!isRedisReady(cb)) {
		cb(null, null);
	} else {
		client.get(key, function(err, result) {
			if(!err) {
				cb(null, result);
			}
		});
	}
};

/**
 * 设置指定KEY
 * @param {String} key
 * @param {Object} value
 * @param {Function} cb 回调函数
 */
RedisTools.prototype.setValueByKey = function(key, value, cb) {
	if(!isRedisReady(cb)) {
		return;
	}

	client.set(key, value, cb);
};

/**
 * 设置键值过期
 * @param {Object} key
 * @param {Number} expireTime 多长时间后过期(msec为单位)
 * @param {Object} cb
 */
RedisTools.prototype.pexpireByKey = function(key, expireTime, cb) {
	if(!isRedisReady(cb)) {
		return;
	}
	
	client.pexpire(key, expireTime, cb);
};

/**
 *删除键
 * @param {Object} key
 * @param {Object} cb
 */
RedisTools.prototype.deleteByKey = function(key, cb) {
	if(!isRedisReady(cb)) {
		return;
	}
	logger.debug("删除redis键：", key);
	client.del(key, cb);
};

/**
 * 键是否存在
 * @param {Object} key
 * @param {Object} cb
 */
RedisTools.prototype.existsByKey = function(key, cb) {
	if(!isRedisReady(cb)) {
		return;
	}
	
	client.exists(key, cb);
};

/**
 * 集合中添加元素
 * @param {Object} key
 * @param {Object} cb
 */
RedisTools.prototype.saddByKey = function(key, value, cb) {
	if(!isRedisReady(cb)) {
		return;
	}
	
	client.sadd(key, value, cb);
};

/**
 * 获取集合中所有元素
 * @param {Object} key
 * @param {Object} cb
 */
RedisTools.prototype.smembersByKey = function(key, cb) {
	if(!isRedisReady(cb)) {
		return;
	}
	
	client.smembers(key, cb);
};

module.exports = new RedisTools();