var events = require("events");
var util = require("util");

/**
 * @Class EventManager
 * @classdesc 事件管理服务类
 * @author 段会锋
 * @constructor EventManager
 * @see 联系作者 <a href="duanoldfive@sohu.com">段会锋</a>.
 * @example var eventManager = require('./js/eventManager.js');
 * @since version 0.1
 */
var EventManager = function() {

};

util.inherits(EventManager, events.EventEmitter);

/**
 * 添加侦听函数
 * @param {String} ev 事件名
 * @param {Function} handle 响应函数
 */
EventManager.prototype.addEventListener = function(ev, handle) {
	this.on(ev, handle);
};

/**
 * 移除侦听函数
 * @param {String} ev 事件名
 * @param {Function} handle 响应函数
 */
EventManager.prototype.removeEventListener = function(ev, handle) {
	this.removeListener(ev, handle);
};

/**
 * 移除所有侦听函数
 * @param {String} ev 事件名
 */
EventManager.prototype.removeAllEventListener = function(ev) {
	this.removeAllListeners(ev);
};

/**
 * 添加一次性响应函数(响应一次后即被移除)
 * @param {String} ev 事件名
 * @param {Function} handle 响应函数
 */
EventManager.prototype.addEventOnceListener = function(ev, handle) {
	this.once(ev, handle);
};

module.exports = new EventManager();
