// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");
	var count = 0;
	var self = null;
	var userId, time;
	var myId = localStorage.getItem("myId") * 1;

	function MyComments() {
		self = this;
		this.init();
	}

	MyComments.prototype.init = function() {
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
		this.bindEvent();
	}
	/**
	 * 事件绑定
	 */
	MyComments.prototype.bindEvent = function() {
		mui.plusReady(function() {
			var detailcomment = null;
			//点击帖子正文跳转到详情页
			mui("body").on('tap', ".person_text", self.goDetailComment);
			mui("body").on('tap', ".report_content_li_txt2", self.goDetailComment);
			mui("body").on('tap', ".reply-text1", self.goDetailComment);
			mui("body").on('tap', ".reply-text", self.goDetailComment);
			
		})
		//点击用户头像跳转到个人主页
		mui("body").on("tap", '.notice_li_head_img', function() {
			localStorage.setItem("myId", myId);
			mui.openWindow({
				url: 'homepage.html',
			});
		});
		//点击用户名跳转到个人主页
		mui("body").on("tap", '.system-notice', function() {
			localStorage.setItem("myId", myId);
			mui.openWindow({
				url: 'homepage.html',
			});
		});
		//点击用户名跳转到个人主页
		mui("body").on("tap", '.my-name', function() {
			myId = this.getAttribute("id");
			localStorage.setItem("myId", myId);
			mui.openWindow({
				url: 'homepage.html',
			});
		});
		//点击用户名跳转到个人主页
		mui("body").on("tap", '.post-name', function() {
			myId = this.getAttribute("id");
			localStorage.setItem("myId", myId);
			mui.openWindow({
				url: 'homepage.html',
			});
		});
		//回复点击事件
		mui("body").on("tap", '.reply', function() {
			var commentid = this.getAttribute("commentid");
			var userid = this.getAttribute("userid");
			var belongcommentid = this.getAttribute("belongcommentid");
			var commentname = this.getAttribute("commentname");
			var dynamicid = this.getAttribute("dynamicid");
			var commentInfo = {
				commentId: commentid,
				userId: userid,
				belongCommentId: belongcommentid,
				commentName: commentname,
				dynamicId: dynamicid
			}
			localStorage.setItem("commentInfo", JSON.stringify(commentInfo));
			mui.openWindow({
				url: 'invitationcomment.html',
			});
		});
		//删除点击事件
		mui("body").on("tap", '.delete', function() {
			var self1 = this;
			var commentId = this.parentNode.parentNode.getAttribute("id");
			var info = {
				userId: myId,
				commentId: commentId
			}
			toolkit.sendPost(config.fdhUrl + "/dynamic/deleteComment", info, function(err, result) {
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
	MyComments.prototype.goDetailComment = function () {
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
	MyComments.prototype.pullupRefresh = function() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //参数为true代表没有更多数据了。
			var info = {
				userId: myId,
				flagTime: time
			}
			var table = document.body.querySelector('.mui-table-view');
			var cells = document.body.querySelectorAll('.mui-table-view-cell');
			toolkit.sendPost(config.fdhUrl + "/dynamic/findComment", info, function(err, result) {
				if(err) {
					throw err
				} else {
					var obj = JSON.parse(result);
					console.log(obj);
					if(obj.errCode) {
						throw obj.errMsg;
					} else {
						for(var i = 0; i < obj.length; i++) {
							var li = document.createElement('li');
							li.id = obj[i].CommentID;
							li.className = 'mui-table-view-cell';
							li.innerHTML = '' +
								'<div class="notice_li_head">' +
								'<img class="notice_li_head_img" src="' + obj[i].HeadIconPath + '" />' +
								'<span class="system-notice">' + obj[i].CommentName + '</span>' +
								'<span class="notice-date">' + toolkit.getDateDiff(Date.parse(obj[i].CommentTime)) + '</span>'
							if(JSON.stringify(obj[i].DynamicInfo) == "{}") {
								li.innerHTML +=
									'<button id="reply" commentId="' + obj[i].CommentID + '" userId="' + obj[i].CommentUserID + '" belongCommentId="' + obj[i].BelongCommentID + '" commentName="' + obj[i].CommentName + '" dynamicID = "' + obj[i].DynamicID + '" type="button" class="mui-btn mui-btn-blue reply">回复</button>'
							}
							if(obj[i].PreComment != undefined) {
								li.innerHTML +=
									'<p class="like-text mui-ellipsis">我的回复:<span class="comment-content">' + obj[i].CommentContent + '</span></p>' +
									'</div>'
							} else {
								li.innerHTML +=
									'<p class="like-text mui-ellipsis">我的评论:<span class="comment-content">' + obj[i].CommentContent + '</span></p>' +
									'</div>'
							}
							if(obj[i].PreComment != undefined) {
								if(obj[i].DynamicInfo.PicturePath) {
									li.innerHTML +=
										'<div id="' + obj[i].DynamicInfo.DynamicID + '" class="invitation_comment_li">' +
										'<p id="' + obj[i].PreComment.CommentUserID + '" class="my-name">' + obj[i].PreComment.CommentName + ':<span class="comment-content">' + obj[i].PreComment.CommentContent + '</span></p>' +
										'<div class="comment-img-area">' +
										'<p id="' + obj[i].DynamicInfo.UserID + '" class="post-name">' + obj[i].PreComment.BeCommentName + ':</p>' +
										'<img src="' + JSON.parse(obj[i].DynamicInfo.PicturePath)[0].picUrl + '" />' +
										'<span id="' + obj[i].DynamicInfo.DynamicID + '" class="reply-text mui-ellipsis">' + obj[i].DynamicInfo.Content + '</span>' +
										'</div>' +
										'</div>'
								} else {
									li.innerHTML +=
										'<div id="' + obj[i].DynamicInfo.DynamicID + '" class="invitation_comment_li">' +
										'<p id="' + obj[i].PreComment.CommentUserID + '" class="my-name">' + obj[i].PreComment.CommentName + ':<span class="comment-content">' + obj[i].PreComment.CommentContent + '</span></p>' +
										'<div class="comment-img-area">' +
										'<p id="' + obj[i].DynamicInfo.UserID + '" class="post-name">' + obj[i].PreComment.BeCommentName + ':</p>' +
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
							toolkit.setImageSize();
							if(i == obj.length - 1) {
								time = Date.parse(obj[i].CommentTime) / 1000;
							}
						}
					}
				}
			});

		}, 500);
	}
	module.exports = new MyComments();
});