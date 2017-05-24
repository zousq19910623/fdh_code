var logger = require("./logger.js");
var eventManager = require("./eventManager.js");

/**
 * @Class AnalysisHandle
 * @author 段会锋
 * @classdesc 行为分析服务类
 * @constructor AnalysisHandle
 * @see 联系作者 <a href="duanoldfive@sohu.com">段会锋</a>.
 * @example var handle = require('./js/analysisHandle.js');
 * @since version 0.1
 */
function AnalysisHandle() {
	eventManager.addEventListener("SEND_MSM", this.onSendMsm);
}

/**
 *
 * @param {String} telNumber 电话号码
 * @param {String} code 验证码
 */
AnalysisHandle.prototype.onSendMsm = function(telNumber, code) {
	logger.info("Send msg to: " + telNumber + " code: " + code);
};

module.exports = new AnalysisHandle();
