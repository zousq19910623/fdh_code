// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");
	var count = 0;
	var self = null;
	var userId;
	var myId = localStorage.getItem("myId") * 1;
	var noticeIdList = "";

	function MessageSystem() {
		self = this;
		this.init();
		this.bindEvent();
	}

	MessageSystem.prototype.init = function() {

		mui.ready(function() {

			/**
			 * mui初始化
			 */
			mui.init({
				pullRefresh: {
					container: '#pullrefresh',
					up: {
						auto: true,
						contentrefresh: '正在加载...',
						callback: self.pullupRefresh
					}
				}
			});

		});

	}

	/**
	 * 事件绑定
	 */
	MessageSystem.prototype.bindEvent = function() {
		//点击清空事件响应
		mui("body").on("tap", "#clear-all", function() {
			var info = {
				userId: myId,
				noticeIdList: noticeIdList
			}
			toolkit.sendPost(config.fdhUrl + "/notice/deleteNotice", info, function(err, result) {
				if(err) {
					throw err
				} else {
					var obj = JSON.parse(result);
					console.log(obj);
					if(obj.errCode) {
						throw obj.errMsg;
					} else {
						document.getElementById("pullrefresh").style.display = "none";
						document.getElementById("system-empty").style.display = "block";
					}
				}
			});
		})
	}

	/**
	 * 上拉加载具体业务实现
	 */
	time = Date.parse(new Date()) / 1000;
	MessageSystem.prototype.pullupRefresh = function() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //参数为true代表没有更多数据了。
			var info = {
				userId: myId,
				flagTime: time
			}
			var table = document.body.querySelector('.mui-table-view');
			var cells = document.body.querySelectorAll('.mui-table-view-cell');
			toolkit.sendPost(config.fdhUrl + "/notice/noticeSystem", info, function(err, result) {
				if(err) {
					throw err
				} else {
					var obj = JSON.parse(result);
					console.log(obj);
					if(obj.errCode) {
						throw obj.errMsg;
					} else {
						for(var i = 0; i < obj.length; i++) {
							noticeIdList += obj[i].NoticeID + ",";
							var li = document.createElement('li');
							li.className = 'mui-table-view-cell';
							li.innerHTML = '' +
								'<div class="notice_li_head">' +
								'<img class="notice_li_head_img" src="images/Logo about_V6.png" />' +
								'<span class="system-notice">系统通知</span>' +
								'<span class="notice-date">08-17  15:10</span>' +
								'</div>' +
								'<div id="" class="notice-content">' +
								'<span id="" class="notice-text">您的帖子“XXXX”因违反“<a class="standard">xxxx</a>”被多人举报，已被系统自动删除。若您有疑问，请拨打房东利器客服电话XXXX-XXXX-XXX</span>' +
								'</div>'
							table.appendChild(li);

							if(i == obj.length - 1) {
								time = Date.parse(obj[i].CreateTime) / 1000;
							}

						}
						noticeIdList = noticeIdList.substr(0, (noticeIdList.length - 1));
					}
				}
			});

		}, 1500);
	}
	module.exports = new MessageSystem();
});