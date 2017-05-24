// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");
	var count = 0;
	var self = null;
	var json_list, length1
	var myId = localStorage.getItem("myId") * 1;
	var userId;
	var noticeIdList = "";
	var reqtimes = 1;

	function MessageFas() {
		self = this;
		this.init();
		this.bindEvent();
	}

	MessageFas.prototype.init = function() {

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
			//点击其他用户的头像
			mui(".mui-table-view").on('tap', '.attetion_img', self.topHead);
			//点击用户名
			mui(".mui-table-view").on('tap', '.attetion_text1', self.topHead);
			//关注事件
			mui(".mui-table-view").on('tap', '.attention', self.addFocusAndCancelFocus);
		});

	}
	/**
	 * 事件绑定
	 */
	MessageFas.prototype.bindEvent = function() {
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
						document.getElementById("fans-empty").style.display = "block";
					}
				}
			});
		})
	}

	/**
	 * 上拉加载具体业务实现
	 */
	time = Date.parse(new Date()) / 1000;
	MessageFas.prototype.pullupRefresh = function() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //参数为true代表没有更多数据了。
			var info = {
				userId: myId,
				flagTime: time
			}
			var table = document.body.querySelector('.mui-table-view');
			var cells = document.body.querySelectorAll('.mui-table-view-cell');
			toolkit.sendPost(config.fdhUrl + "/notice/noticeFocus", info, function(err, result) {
				if(err) {
					throw err
				} else {
					var obj = JSON.parse(result);
					console.log(obj);
					if(obj.errCode == 1020 && reqtimes == 1) {
						document.getElementById("pullrefresh").style.display = "none";
						document.getElementById("fans-empty").style.display = "block";
					} else {
						for(var i = 0; i < obj.length; i++) {
							noticeIdList += obj[i].NoticeID + ",";
							var li = document.createElement('li');
							li.className = 'mui-table-view-cell';
							li.id = obj[i].FansUserInfo.UserID;
							li.innerHTML = '' +
								'<div style="position:relative;">' +
								'<img  class="attetion_img" src="' + obj[i].HeadIconPath + '" />' +
								'<span class="attetion_text1">' + obj[i].FansUserInfo.NickName + '</span>' +
								'<span class="attetion_text3">' + toolkit.getDateDiff(Date.parse(obj[i].CreateTime)) + '</span>' +
								'<span class="attetion_text2">关注了你</span>'
							if(obj[i].FansUserInfo.HasFocus) {
								li.innerHTML +=
									'<div class="attention">' +
									'<span class="mui-icon iconfont icon-attention_y"></span>' +
									'<p class="content text">已关注</p>' +
									'</div>' +
									'</div>'
							} else {
								li.innerHTML +=
									'<div class="attention">' +
									'<span class="mui-icon iconfont icon-attention_n"></span>' +
									'<p class="content1 text">加关注</p>' +
									'</div>' +
									'</div>'
							}

							table.appendChild(li);
							if(i == obj.length - 1) {
								time = Date.parse(obj[i].CreateTime) / 1000;
							}
						}
						reqtimes++;
						noticeIdList = noticeIdList.substr(0, (noticeIdList.length - 1));
					}
				}
			});

		}, 1500);
	}
	/**
	 * 加关注取消关注事件响应
	 */
	MessageFas.prototype.addFocusAndCancelFocus = function() {
		var self = this;
		var a = this.lastElementChild;
		var b = this.firstElementChild;
		var c = this.previousElementSibling.lastElementChild;
		var d = this.previousElementSibling.lastElementChild.previousElementSibling;
		var fansId = this.parentNode.getAttribute("id");
		if(a.innerText === "加关注") {
			var info = {
				userId: myId,
				beFocusUserId: fansId
			}
			toolkit.sendPost(config.fdhUrl + "/relation/focusUser", info, function(err, result) {
				if(err) {
					throw err
				} else {
					var obj = JSON.parse(result);
					console.log(obj);
					if(obj.errCode == 0) {
						a.className = "content";
						a.innerText = "已关注";
						b.className = "mui-icon iconfont icon-attention_y";
						c.className = "attetion_text2";
						d.className = "attetion_text3";
					} else {
						throw err
					}
				}
			});
		} else {
			//var btnArray = ['否', '是'];
			mui.confirm('确认取消关注吗?', function(e) {
				if(e.index == 1) {
					var info = {
						userId: myId,
						cancelUserId: fansId
					}
					toolkit.sendPost(config.fdhUrl + "/relation/cancelFocus", info, function(err, result) {
						if(err) {
							throw err
						} else {
							var obj = JSON.parse(result);
							console.log(obj);
							if(obj.errCode == 0) {
								a.className = "content1";
								a.innerText = "加关注";
								b.className = "mui-icon iconfont icon-attention_n";
								c.className = "attetion_text4";
								d.className = "attetion_text2";
							} else {

							}
						}
					});
				}
			})
		}
	}
	/**
	 * 点击关注用户的头像
	 */
	MessageFas.prototype.topHead = function() {
		userId = this.parentNode.parentNode.getAttribute("id");
		localStorage.setItem("userId", userId);
		mui.openWindow({
			url: 'homepage.html',
			id: 'homepage'
		});
	}
	module.exports = new MessageFas();
});