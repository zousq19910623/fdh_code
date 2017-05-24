// 所有模块都通过 define 来定义
define(function(require, exports, module) {
//	var line = require("./lineChart");
	var toolkit = require("./toolkit");
	var config = require("./config");
	(function($, doc) {
		$.init();
		/**
		 * 选择年龄
		 */
		$.ready(function() {
			var userPicker = new $.PopPicker();
			var age = [];
			for(var i=1;i<=100;i++){
				age.push(i)
			};
			userPicker.setData(age);
			var showUserPickerButton = doc.getElementById('showUserPicker');
			var userResult = doc.getElementById('userResult');
			showUserPickerButton.addEventListener('tap', function(event) {
				userPicker.show(function(items) {
					userResult.innerText = JSON.stringify(items[0]);
					//返回 false 可以阻止选择框的关闭
					//return false;
				});
			}, false);
		});
		
	})(mui, document);
});