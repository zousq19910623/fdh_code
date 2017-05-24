// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");

	var skip1 = document.getElementById("skip1");
	var next_button = document.getElementById("next_button");
	var title_img = document.querySelector(".title_img");
	var name = document.querySelector(".name");

	function Welcome() {
		self = this;
		this.init();
	}

	Welcome.prototype.init = function() {
		if(window.localStorage) {
			title_img.src = localStorage.getItem("myHead");
			name.innerText = localStorage.getItem("myName");

		} else {
			mui.alert("不支持本地存储");
		}

		var availHeight = document.body.clientHeight;

		//document.querySelector(".title").style.marginTop = availHeight * 0.058 + "px";

		skip1.addEventListener("tap", function() {
			plus.webview.currentWebview().loadURL("index.html");
		})

		next_button.addEventListener("tap", function() {
			plus.webview.currentWebview().loadURL("welcome2.html");
		});
	}
	module.exports = new Welcome();
});