var querystring = require("querystring");
var url = require("url");
var http = require("http");
var https = require("https");
var md5 = require("MD5");
var config = require("./config.js");
var request = require('request');
var fs = require('fs');

/**
 * @Class Toolkit
 * @classdesc 工具类
 * @constructor Toolkit
 * @example var eventManager = require('./js/toolkit.js');
 * @since version 0.1
 */
function Toolkit() {

}
var parseCookie = function(cookie) {
	var cookies = {};
	if(!cookie) return cookies;
	var list = cookie.split(";");
	for(var i = 0; i < list.length; i++) {
		var pair = list[i].split("=");
		cookies[pair[0].trim()] = pair[1];
	}
	return cookies;
};

/**
 * Post 服务(5秒超时)
 * @param {String} urlStr 网址
 * @param {Object} data 参数
 * @param {Function} cb 回调函数
 * @param {Object} option HTTP请求选项
 */
Toolkit.prototype.post = function(urlStr, data, cb, option) {
	function realSend(callback) {
		request.post({
			url: urlStr,
			form: data,
			headers: [{
				name: 'content-type',
				value: 'application/x-www-form-urlencoded'
			}],
			timeout: 5000
		}, function(err, response, body) {
			callback(err, body);
		});
	}
	//如果直接发送
	if(!option || !option.times || option.times <= 1) {
		realSend(cb);
	} else {
		//如果是多次尝试
		var times = option.times;
		realSend(cb);
	}

	//return;

	//	var contentStr = querystring.stringify(data);
	//	var contentLen = Buffer.byteLength(contentStr, "utf8");
	//	var urlData = url.parse(urlStr);
	//	var retryTimes = 1;
	//	//var delayTimes = [60000, 30000, 20000, 10000, 5000];
	//	var delayTimes = [1000, 1000, 1000, 1000, 1000];
	//	var timeHandle = null;
	//	//HTTP请求选项
	//	var opt = {
	//		host: urlData.hostname,
	//		port: urlData.port,
	//		path: urlData.path,
	//		method: "POST",
	//		headers: {
	//			"Content-Type": "application/x-www-form-urlencoded",
	//			"Content-Length": contentLen
	//		}
	//	};
	//
	//	if(option) {
	//		for(var key in option) {
	//			//console.log("Set header[" + key + "]=" + option[key]);
	//			if(key == "times") {
	//				retryTimes = option[key] > 5 ? 5 : option[key];
	//			} else {
	//				opt.headers[key] = option[key];
	//			}
	//		}
	//	}
	//
	//	//POST
	//	//处理事件回调
	//	var hp = http;
	//	if(/^\s*https\:/i.test(urlStr)) {
	//		hp = https;
	//	}
	//	var req = null;
	//	var cbCalled = false;
	//	function realSendOld() {
	//		retryTimes--;
	//		if(req) {
	//			//结束上次的
	//			req.abort();
	//			//console.log("取消 request");
	//		}
	//
	//		if(retryTimes >= 0) {
	//			req = hp.request(opt, function(httpRes) {
	//				//console.log("清除Timeout调用");
	//				clearTimeout(timeHandle);
	//				var res = httpRes;
	//				//res.setEncoding("utf8");
	//				var headers = res.headers;
	//
	//				var cookieArr = headers["set-cookie"];
	//				var cookies = null;
	//				if(cookieArr && cookieArr.length) {
	//					cookies = parseCookie(cookieArr[0]);
	//				}
	//
	//				var buffers = [];
	//				httpRes.on("data", function(chunk) {
	//					buffers.push(chunk);
	//				});
	//
	//				httpRes.on("end", function(chunk) {
	//					var wholeData = Buffer.concat(buffers);
	//					var dataStr = wholeData.toString("utf8");
	//					if(!cbCalled){
	//						cb(null, dataStr, cookies);
	//						cbCalled = true;
	//					}
	//				});
	//			}).on("error", function(err) {
	//				if(!cbCalled){
	//					cb(err);
	//					cbCalled = true;
	//				}
	//			});
	//
	//			//写入数据，完成发送
	//			req.write(contentStr);
	//			req.end();
	//			//console.log("发送 request");
	//			timeHandle = setTimeout(realSend, delayTimes[retryTimes]);
	//		} else {
	//			//console.log("彻底错误");
	//			if(!cbCalled){
	//				cb("timeout");
	//				cbCalled = true;
	//			}
	//		}
	//	}
	//
	//	timeHandle = setTimeout(realSend, 0);
};

/**
 * 从微信的服务器，获得用户资料
 * @param {Object} data
 * @param {Object} cb
 */
Toolkit.prototype.get = function(urlStr, cb) {
	var hp = http;
	if(/^\s*https\:/i.test(urlStr)) {
		hp = https;
	}
	hp.get(urlStr, function(respond) {
		var html = "";
		respond.on("data", function(data) {
			html += data;
		});
		respond.on("end", function() {
			var data = JSON.parse(html);
			if(data.errcode) {
				cb(data.errmsg);
			} else {
				cb(null, data);
			}
		});
	}).on("error", function(e) {
		console.log("获取数据失败:", e.message);
		cb(e.message);
	});
};

/**
 * 发送消息封装
 * @param {Object} res 响应对象
 * @param {Object} data 要发送的数据
 */
Toolkit.prototype.end = function(res, data) {
	res.end(JSON.stringify(data));
};

/**
 * 签名算法
 * @param {Object} key
 * @param {Object} data
 */
Toolkit.prototype.sign = function(param, key) {
	key = key || config.appServer.key;
	var querystring = Object.keys(param).filter(function(key) {
		return param[key] !== undefined && param[key] !== "" && ["pfx", "partner_key", "sign", "key"].indexOf(key) < 0;
	}).sort().map(function(key) {
		return key + "=" + param[key];
	}).join("&") + "&key=" + key;

	return md5(querystring).toUpperCase();
};

/**
 * 获得参数字符串
 * @param {Object} param
 */
Toolkit.prototype.getParamStr = function(param) {
	var querystring = Object.keys(param).filter(function(key) {
		return param[key] !== undefined && param[key] !== '';
	}).sort().map(function(key) {
		return key + '=' + param[key];
	}).join("&");

	return querystring;
}

//制保留x位小数，如：2，会在后面补上00.即2.00    
Toolkit.prototype.toDecimal = function(x, num) {
	num = num || 2;
	var f = parseFloat(x);
	if(isNaN(f)) {
		return "";
	}
	var f = Math.round(x * 100) / 100;
	var s = f.toString();
	var rs = s.indexOf('.');
	if(rs < 0) {
		rs = s.length;
		s += '.';
	}
	while(s.length <= rs + num) {
		s += '0';
	}
	return s;
}

Toolkit.prototype.download = function(uri, filename, callback) {
	request.head(uri, function(err, res, body) {
		try {
			request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
		} catch(e) {
			callback(JSON.stringify(e));
		}
	});
};

/**
 * 数据库查询回调函数
 * @param {Object} error
 * @param {Object} rows
 * @param {Object} callback
 */
Toolkit.prototype.selectCB = function(error, rows, callback) {
	if(callback) {
		if(error) {
			callback(error);
		} else {
			callback(error, rows);
		}
	}
};

/**
 * 数据库修改回调函数
 * @param {Object} error
 * @param {Object} result
 * @param {Object} callback
 */
Toolkit.prototype.modifyCB = function(error, result, callback) {
	if(callback) {
		if(error) {
			callback(error);
		} else {
			callback(error, result);
		}
	}
};

/**
 * 通用的拼接值的接口
 * @param {Object} rowList 数组
 * @param {String} columnName  数组元素的某个键名
 * @param {String} separate 自己用到的分隔符
 */
Toolkit.prototype.getColumnValueListStr = function(rowList, columnName, separate) {
	if(rowList == null || rowList.length == 0){
		return "";
	}
	
	var str = "";
	var valueMap = {};
	//console.log("长度：", rowList.length);
	for(var index = 0; index < rowList.length; index++) {
		var value = rowList[index][columnName];
		if(valueMap[value] == null){
			str = str + rowList[index][columnName] + separate;
			valueMap[value] = 1;
		}
	}
	return str.substr(0, str.length - 1);
};

/**
 * 替换字符串某个位置的值
 * @param {Object} rowList 数组
 * @param {String} columnName  数组元素的某个键名
 * @param {String} separate 自己用到的分隔符
 */
Toolkit.prototype.replaceChat = function(source, pos, newChar){  
     if(pos<0 || pos >= source.length || source.length == 0){  
         return "invalid parameters...";  
     }  
     
     var iBeginPos= 0, iEndPos=source.length;  
     var sFrontPart=source.substr(iBeginPos,pos);  
     var sTailPart=source.substr(pos+1,source.length);  
     var sRet=sFrontPart+newChar+sTailPart;  
     
     return sRet;  
};

module.exports = new Toolkit();