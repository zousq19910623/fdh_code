// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");

	function First() {
		self = this;
		document.addEventListener("plusready", this.init,true);
	}

	First.prototype.init = function() {
		var result = plus.FLJPlugin.GetUserInfo();
		if(result != null) {
			if(window.localStorage) {
				localStorage.setItem("FirstmyId", result.id);
				localStorage.setItem("myHead", result.head);
				localStorage.setItem("myName", result.name);
			} else {
				mui.alert("不支持本地存储");
			}
		}

		//初始化信息
		var info = {
			"tokenId": result.id
		};
		toolkit.sendPost(config.serverBaseUrl + "/usermanager/reqData", info, function(err, result) {
			if(err) {
				throw err;
			} else {
				var obj = JSON.parse(result);
				//obj.errCode = 1007;
				if(obj.errCode == 1007) {
					plus.webview.currentWebview().loadURL("welcome.html");
				} else {
					var obj = JSON.parse(result);
					localStorage.setItem("myId", obj.UserID);
					localStorage.setItem("HeadIconPath", obj.HeadIconPath);
                    //plus.webview.currentWebview().loadURL("welcome.html");
					plus.webview.currentWebview().loadURL("index.html");
				}
			}
		});
	}

	module.exports = new First();
});