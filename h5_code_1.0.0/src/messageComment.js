// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");
	var count = 0;
	var self = null;
	var userId, time;
	var myId = localStorage.getItem("myId") * 1;
	var noticeIdList = "";
	var reqtimes = 1;

	function MessageLove() {
		self = this;
		this.init();
		this.bindEvent();
	}

	MessageLove.prototype.init = function() {
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
		//图片预览
		//mui.previewImage();
		//设置图片宽高
		toolkit.setImageSize();
	}
	/**
	 * 事件绑定
	 */
	MessageLove.prototype.bindEvent = function() {
		mui.plusReady(function() {
			var detailcomment = null;
			//点击帖子正文跳转到详情页
			mui("body").on('tap', ".person_text", self.goDetailComment);
			mui("body").on('tap', ".report_content_li_txt2", self.goDetailComment);
			mui("body").on('tap', ".reply-text1", self.goDetailComment);
			mui("body").on('tap', ".reply-text", self.goDetailComment);
			
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
						document.getElementById("comment-empty").style.display = "block";
					}
				}
			});
		})
		//点击用户头像跳转到个人主页
		mui("ul").on("tap", ".notice_li_head_img", function() {
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
		//点击用户名跳转到个人主页
		mui("body").on("tap", '.my-name', function() {
			myId = this.getAttribute("id");
			localStorage.setItem("myId", myId);
			mui.openWindow({
				url: 'homepage.html',
				id: 'homepage'
			});
		})
		//点击用户名跳转到个人主页
		mui("body").on("tap", '.post-name', function() {
			myId = this.getAttribute("id");
			localStorage.setItem("myId", myId);
			mui.openWindow({
				url: 'homepage.html',
				id: 'homepage'
			});
		})
		//回复点击事件
		mui("body").on("tap", '.reply', function() {
			var commentid = this.getAttribute("commentid");
			var userid = this.getAttribute("userid");
			var belongcommentid = this.getAttribute("belongcommentid");
			var commentname = this.getAttribute("commentname");
			var dynamicid = this.getAttribute("dynamicid");
			var commentInfo = {
				beCommentId: commentid,
				beCommentUserId: userid,
				belongCommentID: belongcommentid,
				beCommentName: commentname,
				dynamicId: dynamicid
			}
			localStorage.setItem("commentInfo", JSON.stringify(commentInfo));
			mui.openWindow({
				url: 'invitationcomment.html',
			});
		})
		//删除点击事件
		mui("body").on("tap", '.delete', function() {
			var self1 = this;
			noticeIdList = this.parentNode.parentNode.getAttribute("id");
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
		})

	}
	/**
	 * 点击跳转至帖子详情页面
	 */
	MessageLove.prototype.goDetailComment = function () {
		var detailcomment = null;
		var dynamicId = this.getAttribute("id");
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
			toolkit.sendPost(config.fdhUrl + "/notice/noticeComment", info, function(err, result) {
				if(err) {
					throw err
				} else {
					var obj = JSON.parse(result);
					console.log(obj);
					if(obj.errCode == 1021 && reqtimes == 1) {
						document.getElementById("pullrefresh").style.display = "none";
						document.getElementById("comment-empty").style.display = "block";
					} else {
						for(var i = 0; i < obj.length; i++) {
							var li = document.createElement('li');
							noticeIdList += obj[i].NoticeID + ",";
							li.id = obj[i].NoticeID;
							li.className = 'mui-table-view-cell';
							if(JSON.stringify(obj[i].DynamicInfo) != "{}" && JSON.stringify(obj[i].CommentInfo) != "{}") {
								li.innerHTML = '' +
									'<div class="notice_li_head">' +
									'<img class="notice_li_head_img" src="' + obj[i].HeadIconPath + '" />' +
									'<span class="system-notice">' + obj[i].CommentInfo.CommentName + '</span>' +
									'<span class="notice-date">' + toolkit.getDateDiff(Date.parse(obj[i].CommentTime)) + '</span>' +
									'<button id="reply" commentId="' + obj[i].CommentInfo.CommentID + '" userId="' + obj[i].CommentInfo.CommentUserID + '" belongCommentId="' + obj[i].CommentInfo.BelongCommentID + '" commentName="' + obj[i].CommentInfo.CommentName + '" dynamicID = "' + obj[i].CommentInfo.DynamicID + '" type="button" class="mui-btn mui-btn-blue reply">回复</button>'
								if(JSON.stringify(obj[i].SelfCommentInfo) != "{}") {
									li.innerHTML +=
										'<p class="like-text mui-ellipsis">回复了你:<span class="comment-content">' + obj[i].CommentInfo.CommentContent + '</span></p>' +
										'</div>'
								} else {
									li.innerHTML +=
										'<p class="like-text mui-ellipsis">评论了你:<span class="comment-content">' + obj[i].CommentInfo.CommentContent + '</span></p>' +
										'</div>'
								}
							} else {
								li.innerHTML = '' +
									'<div class="notice_li_head">' +
									'<img class="notice_li_head_img" src="' + obj[i].HeadIconPath + '" />' +
									'<span class="system-notice">' + obj[i].CommentInfo.CommentName + '</span>' +
									'<span class="notice-date">' + toolkit.getDateDiff(Date.parse(obj[i].CommentTime)) + '</span>' +
									'<button id="reply" type="button" class="mui-btn mui-btn-blue delete">删除</button>'
								if(JSON.stringify(obj[i].SelfCommentInfo) != "{}") {
									li.innerHTML +=
										'<p class="like-text mui-ellipsis">回复了你:<span class="comment-content">' + obj[i].CommentInfo.CommentContent + '</span></p>' +
										'</div>'
								} else {
									li.innerHTML +=
										'<p class="like-text mui-ellipsis">评论了你:<span class="comment-content">' + obj[i].CommentInfo.CommentContent + '</span></p>' +
										'</div>'
								}
							}
							if(JSON.stringify(obj[i].SelfCommentInfo) != "{}") {
								if(obj[i].DynamicInfo.PicturePath) {
									li.innerHTML +=
										'<div id="' + obj[i].DynamicInfo.DynamicID + '" class="invitation_comment_li">' +
										'<p id="' + obj[i].SelfCommentInfo.CommentUserID + '" class="my-name">' + obj[i].SelfCommentInfo.CommentName + ':<span class="comment-content">' + obj[i].SelfCommentInfo.CommentContent + '</span></p>' +
										'<div class="comment-img-area">' +
										'<p id="' + obj[i].DynamicInfo.UserID + '" class="post-name">' + obj[i].SelfCommentInfo.BeCommentName + ':</p>' +
										'<img src="' + JSON.parse(obj[i].DynamicInfo.PicturePath)[0].picUrl + '" />' +
										'<span id="' + obj[i].DynamicInfo.DynamicID + '" class="reply-text mui-ellipsis">' + obj[i].DynamicInfo.Content + '</span>' +
										'</div>' +
										'</div>'
								} else {
									li.innerHTML +=
										'<div id="' + obj[i].DynamicInfo.DynamicID + '" class="invitation_comment_li">' +
										'<p id="' + obj[i].SelfCommentInfo.CommentUserID + '" class="my-name">' + obj[i].SelfCommentInfo.CommentName + ':<span class="comment-content">' + obj[i].SelfCommentInfo.CommentContent + '</span></p>' +
										'<div class="comment-img-area">' +
										'<p id="' + obj[i].DynamicInfo.UserID + '" class="post-name">' + obj[i].SelfCommentInfo.BeCommentName + ':</p>' +
										'<span id="' + obj[i].DynamicInfo.DynamicID + '" class="reply-text1 mui-ellipsis">' + obj[i].DynamicInfo.Content + '</span>' +
										'</div>' +
										'</div>'
								}
							} else {
								if(obj[i].DynamicInfo.PicturePath) {
									li.innerHTML +=
										'<div id="' + obj[i].DynamicInfo.DynamicID + '" class="report_content_picture_txt">' +
										'<p id="' + obj[i].DynamicInfo.UserID + '" class="post-name">' + obj[i].DynamicInfo.NickName + ':</p>' +
										'<span class="report_content_li_img2"><img src="' + JSON.parse(obj[i].DynamicInfo.PicturePath)[0].picUrl + '"></span>' +
										'<span id="' + obj[i].DynamicInfo.DynamicID + '" class="report_content_li_txt2 mui-ellipsis">' + obj[i].DynamicInfo.Content + '</span>' +
										'</div>'
								} else {
									li.innerHTML +=
										'<div id="' + obj[i].DynamicInfo.DynamicID + '" class="report_content_li">' +
										'<p id="' + obj[i].DynamicInfo.UserID + '" class="post-name">' + obj[i].DynamicInfo.NickName + ':</p>' +
										'<span id="' + obj[i].DynamicInfo.DynamicID + '" class="person_text mui-ellipsis">' + obj[i].DynamicInfo.Content + '</span>' +
										'</div>'
								}
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