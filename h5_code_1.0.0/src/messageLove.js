// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");
	var count = 0;
	var self = null;
	var userId;
	var myId = localStorage.getItem("myId") * 1;
	var noticeIdList = "";
	var reqtimes = 1;

	function MessageLove() {
		self = this;
		this.init();
		this.bindEvent();
	}

	MessageLove.prototype.init = function() {

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
				},
				preloadPages: [{
					id: 'detailcomment',
					url: 'detailcomment.html'
				}]
			});
			//设置图片宽高
			toolkit.setImageSize();
		});

	}
	/**
	 * 事件绑定
	 */
	MessageLove.prototype.bindEvent = function() {
		mui.plusReady(function() {
			var detailcomment = null;
			//点击帖子正文跳转到详情页
			mui("body").on('tap', ".report_content_li", self.goDetailComment);
			mui("body").on('tap', ".invitation_comment_li", self.goDetailComment);
			mui("body").on('tap', ".report_content_picture_txt", self.goDetailComment);
		})
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
						document.getElementById("love-empty").style.display = "block";
					}
				}
			});
		})
		//点击用户头像跳转到个人主页
		mui("body").on("tap", '.notice_li_head_img', function() {
			localStorage.setItem("myId", myId);
			mui.openWindow({
				url: 'homepage.html',
				id: 'homepage'
			});
		})
		//点击用户名跳转到个人主页
		mui("body").on("tap", '.system-notice', function() {
			localStorage.setItem("myId", myId);
			mui.openWindow({
				url: 'homepage.html',
				id: 'homepage'
			});
		})
		//删除按钮点击事件
		mui("body").on('tap', ".li_head_detele", function() {
			var self1 = this;
			noticeIdList = this.getAttribute("id");
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
						self1.parentElement.parentElement.remove();
					}
				}
			});
		});
	}
	/**
	 * 点击跳转至帖子详情页面
	 */
	MessageLove.prototype.goDetailComment = function () {
		var detailcomment = null;
		var dynamicId = this.getAttribute("id");
		localStorage.setItem("myId", myId);
		localStorage.setItem("dynamicId", dynamicId);
		//获得详情页面
		if(!detailcomment) {
			detailcomment = plus.webview.getWebviewById('detailcomment');
		}

		//触发详情页面的newsId事件
		mui.fire(detailcomment, 'dynamicId', {
			id: dynamicId
		});
		//打开详情页面          
		mui.openWindow({
			id: 'detailcomment',
		});
	}

	/**
	 * 上拉加载具体业务实现
	 */
	time = Date.parse(new Date()) / 1000;
	MessageLove.prototype.pullupRefresh = function() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //参数为true代表没有更多数据了。
			var info = {
				userId: myId,
				flagTime: time
			}
			var table = document.body.querySelector('.mui-table-view');
			var cells = document.body.querySelectorAll('.mui-table-view-cell');
			toolkit.sendPost(config.fdhUrl + "/notice/noticeLike", info, function(err, result) {
				if(err) {
					throw err
				} else {
					var obj = JSON.parse(result);
					console.log(obj);
					if(obj.errCode == 1022 && reqtimes == 1) {
						document.getElementById("pullrefresh").style.display = "none";
						document.getElementById("love-empty").style.display = "block";
					} else {
						for(var i = 0; i < obj.length; i++) {
							noticeIdList += obj[i].NoticeID + ",";
							var li = document.createElement('li');
							li.className = 'mui-table-view-cell';
							li.id = obj[i].UserID.UserID;
							if(JSON.stringify(obj[i].DynamicID) != "{}") {
								li.innerHTML +=
									'<div class="notice_li_head">' +
									'<img class="notice_li_head_img" src="' + obj[i].HeadIconPath + '" />' +
									'<span class="system-notice">' + obj[i].UserID.NickName + '</span>' +
									'<span class="notice-date">' + toolkit.getDateDiff(Date.parse(obj[i].CreateTime)) + '</span>' +
									'<p class="like-text">喜欢了你的帖子<span class="mui-icon iconfont icon-like_y"></span></p>' +
									'</div>'
								if(obj[i].DynamicID.PicturePath) {
									li.innerHTML +=
										'<div id="' + obj[i].DynamicID.DynamicID + '" class="report_content_picture_txt">' +
										'<span class="report_content_li_img2"><img src="' + JSON.parse(obj[i].DynamicID.PicturePath)[0].picUrl + '"></span>' +
										'<span class="report_content_li_txt2 mui-ellipsis">' + obj[i].DynamicID.Content + '</span>' +
										'</div>'
								} else {
									li.innerHTML +=
										'<div id="' + obj[i].DynamicID.DynamicID + '" class="report_content_li">' +
										'<p class="person_text mui-ellipsis">' + obj[i].DynamicID.Content + '</p>' +
										'</div>'
								}
							} else {
								li.innerHTML = '' +
									'<div class="notice_li_head">' +
									'<img class="notice_li_head_img" src="' + obj[i].HeadIconPath + '" />' +
									'<span class="system-notice">' + obj[i].UserID.NickName + '</span>' +
									'<span class="notice-date">' + toolkit.getDateDiff(Date.parse(obj[i].CreateTime)) + '</span>' +
									'<button id="' + obj[i].NoticeID + '" type="button" class="mui-btn mui-btn-blue li_head_detele">删除</button>' +
									'<p class="like-text">喜欢了你的帖子<span class="mui-icon iconfont icon-like_y"></span></p>' +
									'</div>'
								li.innerHTML +=
									'<div class="report_content_li">' +
									'<p class="person_text mui-ellipsis">原帖已删除</p>' +
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

		}, 500);
	}
	module.exports = new MessageLove();
});