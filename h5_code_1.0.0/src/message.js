// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");

	var self = null;
	var count = 0;
	var count_love, button_id;
	var isClick = false;
	var index_li_foot_love = document.querySelector(".index_li_foot_love");
	var li_love = document.querySelector(".li_love");
	var index_total = document.querySelector("#index_total");
	var index_attention = document.querySelector("#index_attention");
	var myId = localStorage.getItem("myId");
	var love = document.querySelector(".love");
	var message_comment = document.querySelector(".comment");
	var fans = document.querySelector(".fans");
	var system_notice = document.querySelector(".system_notice");

	function Message() {

		self = this;
		this.init();

	}

	Message.prototype.init = function() {
		mui.plusReady(function() {

			myId = localStorage.getItem("myId");
			var info = {
				"userId": myId,

			};
			toolkit.sendPost(config.serverBaseUrl + "/notice/reqNoticeList", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					var obj = JSON.parse(result);
					if(obj.errCode) {
						console.log(obj.errMsg);
					} else {
						var obj = JSON.parse(result);
						result_array = obj;
						if(window.localStorage) {
							//localStorage.post_detail = result;
							localStorage.setItem('result_array', JSON.stringify(result_array));
						} else {
							mui.alert("不支持本地存储");
						}

						console.log(obj);
						if(obj[1] > 0) {
							love.style.display = "block";
							love.innerText = obj[1];
						}

						if(obj[2] > 0) {
							message_comment.style.display = "block";
							message_comment.innerText = obj[2];
						}
						if(obj[3] > 0) {
							fans.style.display = "block";
							fans.innerText = obj[3];
						}
						if(obj[4] > 0) {
							system_notice.style.display = "block";
							system_notice.innerText = obj[4];
						}

						//console.log(obj.length);

					}
				}
			});

			/*document.getElementById("index_publish").addEventListener("tap", function() {

				mui.openWindow({
					url: 'invitation.html',
					id: 'invitation'
				});

			});
			*/

			//跳转messageLove
			document.getElementById("messageLove").addEventListener("tap", function() {
				localStorage.setItem("myId", myId);
				mui.openWindow({
					url: 'messageLove.html',
					id: 'messageLove'
				});

			});

			//跳转messageComment
			document.getElementById("messageComment").addEventListener("tap", function() {
				localStorage.setItem("myId", myId);
				mui.openWindow({
					url: 'messageComment.html',
					id: 'messageComment'
				});

			});

			//跳转messageFas
			document.getElementById("messageFas").addEventListener("tap", function() {
				localStorage.setItem("myId", myId);
				mui.openWindow({
					url: 'messageFas.html',
					id: 'messageFas'
				});

			});

			//跳转messageFas
			document.getElementById("messageSystem").addEventListener("tap", function() {
				localStorage.setItem("myId", myId);
				mui.openWindow({
					url: 'messageSystem.html',
					id: 'messageSystem'
				});

			});

		});

	}

	module.exports = new Message();

});