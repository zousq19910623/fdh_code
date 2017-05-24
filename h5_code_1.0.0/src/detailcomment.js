define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");
	var count = 0;
	var dynamicId = "";
	var myId = localStorage.getItem("myId");
	var userId;
	var like;
	var time = new Date().getTime();
	var post;
	var index = 0;
	var self;
	var likeTable = mui(".logoList")[0];
	var commentList = {};
	var topList = [];
	var commentinfo = {};
	var table = mui("#data-list")[0];
	var allLike;
	var data = JSON.parse(localStorage.getItem("result_array"));

	function DetailComment() {
		self = this;
		this.init();
	}

	/**
	 * mui初始化
	 */
	DetailComment.prototype.init = function() {
		self = this;
		(function($) {
			mui.init({
				pullRefresh: {
					container: "#pullrefresh",
					down: {
						callback: self.pulldownRefresh
					},
					up: {
						contentrefresh: "正在加载...",
						callback: self.pullupRefresh
					}
				},
				beforeback: self.clear,
				preloadPages: [{
					id: 'invitationcomment',
					url: 'invitationcomment.html'
				}]
			});
			
			window.addEventListener("dynamicId", self.clickDynamicId);

			//关注
			mui(".mui-card").on("tap", ".follow", self.ClickFollow);
			//喜欢
			mui(".footerNav").on("tap", ".likeBtn", self.ClicklikeBtn);
			//点击评论
			mui("body").on("tap", ".commentBtn", self.ClickCommentBtn);

			//点击分享
			//分享到微信
			document.getElementById("share-1").addEventListener("tap", self.sharePost);
			//分享到朋友圈
			document.getElementById("share-2").addEventListener("tap", self.sharePost);
			//分享到QQ
			document.getElementById("share-3").addEventListener("tap", self.sharePost);
			//分享到QQ空间
			document.getElementById("share-4").addEventListener("tap", self.sharePost);

			//点击进入喜欢列表页面
			mui("body").on("tap", ".logoList", self.clickLogoList);
			//点击头像
			//mui("body").on("tap", ".logo", self.clickLogo);
			//评论展开
			mui("body").on("tap", ".btnMore", self.clickBtnMore);
			//评论收起
			mui("body").on("tap", ".collapse", self.clickCollapse);
			
			//点击昵称进入起其主页
			mui(".mui-card").on("tap", ".title_name", self.clickTitle_name);
			//点击头像进入起其主页
			mui(".mui-card").on("tap", ".title_logo", self.clickTitle_logo);
			//点击评论用户昵称进入起其主页
			mui("#data-list").on("tap", ".user-name", self.clickUserName);
			//点击评论用户头像进入起其主页
			mui("#data-list").on("tap", ".user-logo", self.clickUserLogo);
			//点击评论发表评论
			mui(".footerNav").on("tap", ".commentBtn", self.clickCommentBtn);
			//点击某人评论进行回复
			mui("#data-list").on("tap", ".comment_txt", self.clickComment_txt);

			//点击收藏
			mui(".mui-table-view").on("tap", ".collect", self.clickCollect);
			//点击举报
			mui(".mui-table-view").on("tap", ".report", self.clickReport);
			//点击删除
			mui(".mui-table-view").on("tap", ".delete", self.clickDelete);
		})(mui);
	};

	/**
	 * 点击删除
	 */
	DetailComment.prototype.clickDelete = function() {
		self.clickDeleteBtn();
	};

	/**
	 * 点击举报
	 */
	DetailComment.prototype.clickReport = function() {
		var info = {
			"userId": myId, //用户的ID
			"dynamicId": dynamicId, //帖子的ID
			"content": mui(".mui-scroll > .mui-card > .mui-card-content")[0].innerText
		};
		if(report == false) {
			toolkit.sendPost(config.serverBaseUrl + "/report/reportDynamic", info, function(err, result) {
				if(err) {
					throw err;
				}
				else {
					var obj = JSON.parse(result);
					console.log(obj.errCode + "===" + obj.errMsg);
					mui.openWindow({
						url: "report.html",
						id: "report.html"
					});
					post.HasReport = 1;
					if(window.localStorage) {
						localStorage.result_array = JSON.stringify(data);
					}
					else {
						mui.alert("不支持本地存储");
					}
					report = true;
					return false;
				}
			});
		}
		else {
			mui(".re-report")[0].style.display = "block";
			setTimeout("mui('.re-report')[0].style.display = 'none'", 2000);
		}
	};

	/**
	 * 点击收藏
	 */
	DetailComment.prototype.clickCollect = function() {
		var self2 = this;
		var info = {
			"userId": myId, //用户的ID
			"dynamicId": dynamicId //帖子的ID
		};
		if(mui(".collect")[0].innerText == "收藏") {
			toolkit.sendPost(config.serverBaseUrl + "/collect/addCollect", info, function(err, result) {
				if(err) {
					throw err;
				}
				else {
					var obj = JSON.parse(result);
					console.log(obj.errCode + "===" + obj.errMsg);
					mui.toast("已收藏");
					self2.innerText = "已收藏";
					post.HasCollect = 1;
					if(window.localStorage) {
						localStorage.result_array = JSON.stringify(data);
					}
					else {
						mui.alert("不支持本地存储");
					}
					return;
				}
			});
		}
		else {
			toolkit.sendPost(config.serverBaseUrl + "/collect/cancelCollect", info, function(err, result) {
				if(err) {
					throw err;
				}
				else {
					var obj = JSON.parse(result);
					console.log(obj.errCode + "===" + obj.errMsg);
					mui.toast("已取消收藏");
					self2.innerText = "收藏";
					post.HasCollect = 0;
					if(window.localStorage) {
						localStorage.result_array = JSON.stringify(data);
					}
					else {
						mui.alert("不支持本地存储");
					}
					return;
				}
			});
		}
	};
	/**
	 * 点击某人评论进行回复
	 */
	DetailComment.prototype.clickComment_txt = function(e) {
		var self = this;
		var UserID = this.getAttribute("userId");
		var BeCommentName = this.getAttribute("commentName");
		var BelongCommentID = this.getAttribute("belongCommentId");
		var BeCommentID = this.getAttribute("commentId");
		var HasReport = this.getAttribute("HasReport");
		if(e.target == this) {
			if(UserID == myId) {
				document.getElementById("myComment").className = "mui-popover mui-popover-action mui-popover-bottom mui-active";
				document.getElementById("mask").style.visibility = "visible";
			}
			else if(userId == myId) {
				document.getElementById("myDynamicId").className = "mui-popover mui-popover-action mui-popover-bottom mui-active";
				document.getElementById("mask").style.visibility = "visible";
			}
			else {
				document.getElementById("otherComment").className = "mui-popover mui-popover-action mui-popover-bottom mui-active";
				document.getElementById("mask").style.visibility = "visible";
			}
		}
		mui("body").on("tap", ".answer", function() {
			commentinfo = {
				dynamicId: dynamicId,
				beCommentId: BeCommentID,
				beCommentUserId: UserID,
				beCommentName: BeCommentName
			};
			if(BelongCommentID == 0) {
				commentinfo.belongCommentID = BeCommentID;
			}
			else {
				commentinfo.belongCommentID = BelongCommentID;
			}
			localStorage.setItem("commentInfo", JSON.stringify(commentinfo));
			mui.openWindow({
				url: 'invitationcomment.html',
				id: 'invitationcomment'
			});
		});
		mui("body").on("tap", ".deleteComment", function() {
			toolkit.sendPost(config.serverBaseUrl + "/dynamic/deleteComment", {
				"userId": UserID,
				"commentId": BeCommentID
			}, function(err, result) {
				if(err) {
					throw err;
				}
				else {
					var obj = JSON.parse(result);
					console.log(obj.errCode + "===" + obj.errMsg);
					if(BelongCommentID == 0) {
						table.removeChild(self.parentNode.parentNode);
					}
					else {
						table.removeChild(self.parentNode);
					}
				}
			});
		});
		mui("#data-list").on("tap", ".reportComment", function() {
			toolkit.sendPost(config.serverBaseUrl + "/report/reportComment", {
				"userId": UserID,
				"commentId": BeCommentID,
				"content": self.innerHTML
			}, function(err, result) {
				if(err) {
					throw err;
				}
				else {
					var obj = JSON.parse(result);
					console.log(obj.errCode + "===" + obj.errMsg);
					if(self.HasReport == 1) {
						mui.toast("您已经举报过该帖子了哦");
						return;
					}
					else {
						mui.openWindow({
							url: "report.html",
							id: "report.html"
						});
					}
				}
			});
		});
		mui("body").on("tap", ".cancel", function() {
			document.getElementById("mask").style.visibility = "hidden";
		});
	};

	/**
	 * 点击评论发表评论
	 */
	DetailComment.prototype.clickCommentBtn = function() {
		commentinfo = {
			dynamicId: dynamicId,
			beCommentUserId: userId,
			beCommentName: post.NickName
		};
		localStorage.setItem("commentInfo", JSON.stringify(commentinfo));
		mui.openWindow({
			url: "invitationcomment.html",
			id: "invitationcomment"
		});
	};

	/**
	 * 点击评论用户昵称进入起其主页
	 */
	DetailComment.prototype.clickUserLogo = function() {
		var UserID = this.getAttribute("id");
		localStorage.setItem("userId", UserID);
		mui.openWindow({
			url: "homePage.html"
		});
	};
	/**
	 * 点击评论用户昵称进入起其主页
	 */
	DetailComment.prototype.clickUserName = function() {
		var UserID = this.getAttribute("id");
		localStorage.setItem("userId", UserID);
		mui.openWindow({
			url: "homePage.html"
		});
	};

	/**
	 * 点击昵称进入起其主页
	 */
	DetailComment.prototype.clickTitle_logo = function() {
		var UserID = this.getAttribute("id");
		localStorage.setItem("userId", UserID);
		mui.openWindow({
			url: "homePage.html"
		});
	};
	/**
	 * 点击昵称进入起其主页
	 */
	DetailComment.prototype.clickTitle_name = function() {
		var UserID = this.getAttribute("id");
		localStorage.setItem("userId", UserID);
		mui.openWindow({
			url: "homePage.html"
		});
	};
	/**
	 * 评论收起
	 */
	DetailComment.prototype.clickCollapse = function() {
		this.style.display = "none";
		mui(".moreDiv")[0].style.display = "none";
		mui(".btnMore")[0].style.display = "block";
	};

	/**
	 * 评论展开
	 */
	DetailComment.prototype.clickBtnMore = function() {
		this.style.display = "none";
		mui(".moreDiv")[0].style.display = "block";
		mui(".collapse")[0].style.display = "block";
	};

	/**
	 * 点击头像
	 */
	DetailComment.prototype.clickLogo = function() {
		var UserID = this.getAttribute("userId");
		localStorage.setItem("userId", UserID);
		mui.openWindow({
			url: "homePage.html"
		});
	};

	/**
	 * 点击进入喜欢列表页面
	 */
	DetailComment.prototype.clickLogoList = function() {
		localStorage.setItem("likeList", JSON.stringify(allLike));
		mui.openWindow({
			url: "detaillike.html",
			id: "detaillike.html"
		});
	};

	/**
	 * 点击评论
	 */
	DetailComment.prototype.ClickCommentBtn = function() {
		var dynamicId = post.DynamicID;
		var beCommentUserId = post.UserID;
		var beCommentName = post.NickName;
		var commentInfo = {
			beCommentUserId: beCommentUserId,
			beCommentName: beCommentName,
			dynamicId: dynamicId
		};
		localStorage.setItem("commentInfo", JSON.stringify(commentInfo));
		mui.openWindow({
			url: "invitationcomment.html",
			id: "invitationcomment"
		});
	};

	/**
	 * 喜欢
	 */
	DetailComment.prototype.ClicklikeBtn = function() {
		if(like == true) {
			toolkit.sendPost(config.serverBaseUrl + "/dynamic/markLike", {
				"userId": myId, //用户ID
				"paramsJSON": JSON.stringify({
					dynamicId: dynamicId, //帖子的ID
					beLike: true, //喜欢
					beLikeUserId: userId //被喜欢帖子所属的用户ID
				})
			}, function(err, result) {
				if(err) {
					throw err;
				}
				else {
					var obj = JSON.parse(result);
					console.log(obj.errCode + "===" + obj.errMsg);
					mui(".icon-like")[0].className = "mui-icon iconfont icon-like_y";
					mui(".icon-like_y")[0].style.color = "red";
					like = false;
					post.HasFond = 1;
					if(window.localStorage) {
						localStorage.result_array = JSON.stringify(data);
					}
					else {
						mui.alert("不支持本地存储");
					}
					return;
				}
			});
		}
		if(like == false) {
			toolkit.sendPost(config.serverBaseUrl + "/dynamic/markLike", {
				"userId": myId, //用户ID
				"paramsJSON": JSON.stringify({
					dynamicId: dynamicId, //帖子的ID
					beLike: false, //喜欢
					beLikeUserId: userId //被喜欢帖子所属的用户ID
				})
			}, function(err, result) {
				if(err) {
					throw err;
				}
				else {
					var obj = JSON.parse(result);
					console.log(obj.errCode + "===" + obj.errMsg);
					mui(".icon-like_y")[0].className = "mui-icon iconfont icon-like";
					mui(".icon-like")[0].style.color = "#999";
					like = true;
					post.HasFond = 0;
					if(window.localStorage) {
						localStorage.result_array = JSON.stringify(data);
					}
					else {
						mui.alert("不支持本地存储");
					}
					return;
				}
			});
		}
	};

	/**
	 * 关注
	 */
	DetailComment.prototype.ClickFollow = function() {
		if(mui(".follow")[0].innerText == "关注") {
			var info = {
				"userId": myId, //用户ID
				"beFocusUserId": userId //被关注用户ID
			};
			toolkit.sendPost(config.serverBaseUrl + "/relation/focusUser", info, function(err, result) {
				if(err) {
					throw err;
				}
				else {
					var obj = JSON.parse(result);
					console.log(obj.errCode + "===" + obj.errMsg);
					mui(".follow")[0].innerText = "已关注";
					mui(".follow")[0].style.width = "65px";
					post.HasFocus = 1;
					if(window.localStorage) {
						localStorage.result_array = JSON.stringify(data);
					}
					else {
						mui.alert("不支持本地存储");
					}
					return;
				}
			});
		}
		else {
			var info = {
				"userId": myId, //用户ID
				"cancelUserId": userId //被取消关注用户ID
			};
			toolkit.sendPost(config.serverBaseUrl + "/relation/cancelFocus", info, function(err, result) {
				if(err) {
					throw err;
				}
				else {
					var obj = JSON.parse(result);
					console.log(obj.errCode + "===" + obj.errMsg);
					mui(".follow")[0].innerText = "关注";
					mui(".follow")[0].style.width = "55px";
					post.HasFocus = 0;
					if(window.localStorage) {
						localStorage.result_array = JSON.stringify(data);
					}
					else {
						mui.alert("不支持本地存储");
					}
					return;
				}
			});
		}
	};

	DetailComment.prototype.clickDynamicId = function(event) {
		//获得事件参数
		dynamicId = event.detail.id;
		
		if(!dynamicId){
			console.error(event.detail);
			return;
		}
		
		//根据id向服务器请求新闻详情
		if(mui.os.plus) {
			mui.plusReady(function() {
				//全部帖子第一次加载
				self.onReady();
			});
		}
		else {
			self.onReady();
		}
	};

	DetailComment.prototype.readyAgain = function() {
		//深度遍历，生成DOM控件
		var i;
		for(i = 0; i < 4 && index + i < topList.length; i++) {
			var comment = commentList[topList[i + index]];
			var dom = self.createCommentDom(comment, [], 1);
			table.appendChild(dom);
		}
		index += i;
	};
	/**
	 * 分享帖子
	 */
	DetailComment.prototype.sharePost = function() {
		var dynamicId = post.DynamicID;
		var info = {
			userId: myId,
			dynamicId: dynamicId
		};
		toolkit.sendPost(config.fdhUrl + "/dynamic/shareDynamic", info, function(err, result) {
			if(err) {
				throw err;
			}
			else {
				var obj = JSON.parse(result);
				if(obj.errCode == 0) {
					mui.toast("分享成功");
					mui("#share").popover("toggle");
				}
			}
		});
	};
	/**
	 * 下拉刷新具体业务实现
	 */
	DetailComment.prototype.pulldownRefresh = function() {
		self.readyAgain();
		mui("#pullrefresh").pullRefresh().endPulldownToRefresh(index >= topList.length); //refresh completed
	};

	/**
	 * 上拉加载具体业务实现
	 */
	DetailComment.prototype.pullupRefresh = function() {
		self.readyAgain();
		mui("#pullrefresh").pullRefresh().endPullupToRefresh((index >= topList.length)); //参数为true代表没有更多数据了。
	};

	//设置非行间样式
	DetailComment.prototype.setCss = function(obj, attr, value) {
		if(arguments.length == 2) { //arguments参数数组，当参数数组长度为2时表示获取css样式
			return getStyle(obj, attr); //返回对象的非行间样式用上面的getStyle函数
		}
		else {
			if(arguments.length == 3) { //当传三个参数的时候为设置对象的某个值
				obj.style[attr] = value;
			};
		};
	};

	/**
	 * 点击删除
	 */
	DetailComment.prototype.clickDeleteBtn = function() {
		mui("#topPopover").popover("toggle");
		localStorage.setItem("dynamicId", dynamicId);
		localStorage.setItem("myId", myId);

		var btnArray = [{
			title: "删除信息",
			style: "destructive"
		}];

		plus.nativeUI.actionSheet({
			cancel: "取消",
			buttons: btnArray
		}, function(e) {
			var index = e.index;
			var text = "你刚点击了\"";
			switch(index) {
			case 0:
				break;
			case 1:
				var info = {
					"userId": myId,
					"dynamicId": dynamicId
				};

				toolkit.sendPost(config.serverBaseUrl + "/dynamic/deleteDynamic", info, function(err, result) {
					if(err) {
						throw err;
					}
					else {
						var obj = JSON.parse(result);
						if(obj.errCode == 0) {
							document.getElementById("tab1_" + dynamicId).style.display = "none";
						}
						else {
							mui.alert("删除失败！");
						}
					}
				});
				break;
			}
		});
	};
	
	/**
	 * 清除数据
	 */
	DetailComment.prototype.clear = function(){
		mui("#content")[0].innerHTML = "";
		mui(".title_logo")[0].src = "";
		mui(".title_time")[0].innerText = "";
		mui(".title_name")[0].innerText = "";
		mui(".title_logo")[0].style.src = "";
		mui(".location")[0].innerText = "";
		mui(".commentNum")[0].innerText = "";
		document.getElementById("index_li_img").innerHTML = "";
		var likeDom = mui(".icon-like")[0] || mui(".icon-like_y")[0]
		likeDom.className = "mui-icon iconfont icon-like";
		
		while(table.lastChild)   
	    {  
	        table.removeChild(table.lastChild);  
	    }
	    
	    while(likeTable.lastChild)   
	    {  
	        likeTable.removeChild(likeTable.lastChild);  
	    }
	    
		return true;
	}

	/**
	 * 加载数据
	 */
	DetailComment.prototype.onReady = function() {
		if(!dynamicId) {
			return;
		}

		var info = {
			"userId": myId,
			"dynamicId": dynamicId
		};
		toolkit.sendPost(config.serverBaseUrl + "/dynamic/findDynamic", info, function(err, result) {
			if(err) {
				throw err;
			}
			else {
				var obj = JSON.parse(result);
				console.log(obj);
				if(obj.errCode) {
					alert(obj.errMsg);
				}
				else {
					post = obj;
					userId = obj.UserID;
					mui("#content")[0].innerHTML = post.Content;
					if(mui("#comment img").length == 1) {
						mui("#comment img").className = "one";
					}
					mui(".title_time")[0].innerText = toolkit.getDateDiff(Date.parse(post.CreateTime));
					mui(".title_name")[0].innerText = post.NickName;
					mui(".title_logo")[0].style.src = post.HeadIconPath;
					mui(".location")[0].innerText = post.Location;
					mui(".commentNum")[0].innerText = post.CreateTime;
					mui(".title_name")[0].setAttribute("id", myId);
					mui(".title_logo")[0].setAttribute("id", myId);
					//渲染图片
					if(obj.PicturePath) {
						var PicturePath_arr = JSON.parse(obj.PicturePath);
						var div = document.getElementById("index_li_img");
						for(var j = 0; j < PicturePath_arr.length; j++) {
							div.innerHTML +=
								"<img class=\"index_li_img_son\" src=\"" + PicturePath_arr[j].picUrl + "\" data-preview-src=\"\" data-preview-group=\"1\" />";
						}
						toolkit.setImageSize();
						mui.previewImage();
					}
					if(post.HasCollect == 0) {
						mui(".collect")[0].innerText = "收藏";
					}
					else {
						mui(".collect")[0].innerText = "已收藏";
					}
					var likeDom = mui(".icon-like")[0] || mui(".icon-like_y")[0];
					if(post.HasFond == 1) {
						likeDom.className = "mui-icon iconfont icon-like_y";
						likeDom.style.color = "red";
						like = false;
					}
					else {
						likeDom.style.color = "#999";
						like = true;
					}
					if(post.HasReport == 0) {
						report = false;
					}
					else {
						report = true;
					}
					if(post.HasFocus == 0) {
						mui(".follow")[0].innerText = "关注";
					}
					else {
						mui(".follow")[0].innerText = "已关注";
					}
					allLike = obj.FondUserList;
					var allComment = obj.AllComment;
					//遍历，根据帖子ID存储
					for(var i = 0; i < allComment.length; i++) {
						var comment = allComment[i];
						comment.children = [];
						commentList[comment.CommentID] = comment;
					}
					//遍历，组织父子关系
					for(var i = 0; i < allComment.length; i++) {
						var comment = allComment[i];
						if(comment.BelongCommentID == 0) {
							topList.push(comment.CommentID);
							//comment.group = [];
						}
						else if(comment.BeCommentID && commentList[comment.BeCommentID]) {
							//如果被评论的ID在评论列表中，把被评论的评论作为该评论的父评论
							commentList[comment.BeCommentID].children.push(comment.CommentID);
							//commentList[comment.BelongCommentID].group.push(comment.CommentID);
						}
					}

					mui("#comment span")[0].innerText = allComment.length;
					//顶级评论，是最近的在最上边
					topList.sort(function(a, b) {
						var result = 0;
						var aTime = commentList[a].CommentTime;
						var bTime = commentList[b].CommentTime;
						if(aTime > bTime) {
							result = -1;
						}
						else if(aTime < bTime) {
							result = 1;
						}
						return result;
					});
					
					var count = allLike.length > 5 ? 5 : allLike.length;
					for(var i = 0; i < count; i++) {
						var li = document.createElement("li");
						li.className = "logo";
						li.userId = allLike[i].UserID;
						li.innerHTML = "<img src=\"" + allLike[i].HeadIconPath + "\"/>";
						likeTable.appendChild(li);
					}
					if(count > 5){
						var li = document.createElement("li");
						li.className = "logoMore";
						li.innerHTML = "<img src=\"images/likeIconMore.png\"/>";
						likeTable.appendChild(li);
					}
					
					mui(".likeNum span")[0].innerText = allLike.length;
				}
				self.readyAgain();
			}
		});
	};

	/**
	 * 创建评论的Dom控件
	 * @param {Object} commentInfo
	 */
	DetailComment.prototype.createCommentDom = function(commentInfo, ctrls, spaceNum) {
		var spaceStr = "";
		for(var i = 0; i < spaceNum; i++) {
			spaceStr = "&nbsp;&nbsp;&nbsp;&nbsp;";
		}
		//二三级评论的顺序
		commentInfo.children.sort(function(a, b) {
			var result = 0;
			var aTime = commentList[a].CommentTime;
			var bTime = commentList[b].CommentTime;
			if(aTime > bTime) {
				result = 1;
			}
			else if(aTime < bTime) {
				result = -1;
			}
			return result;
		});

		//顶级评论
		if(commentInfo.BelongCommentID == 0) {
			var li = document.createElement("li");
			li.className = "mui-table-view-cell mui-card";
			li.innerHTML = "<div class=\"mui-card-header mui-card-media\">" +
				"<img class=\"user-logo\" src=\"" + (commentInfo.HeadIconPath ? commentInfo.HeadIconPath : "") + "\" id=\"" + commentInfo.CommentUserID + "\" />" +
				"<div class=\"mui-media-body\">" +
				"<span class=\"user-name\" id=\"" + commentInfo.CommentUserID + "\">" + commentInfo.CommentName + "</span>" +
				"<p class=\"time\">" + toolkit.getDateDiff(Date.parse(commentInfo.CreateTime)) + "</p>" +
				"</div></div>" +
				"<div class=\"mui-card-content chats\">" +
				"<p class=\"comment_txt\" commentId=\"" + commentInfo.CommentID + "\" userId=\"" + commentInfo.CommentUserID + "\" reportState=\"" + commentInfo.HasReport + "\" belongCommentId=\"" + commentInfo.BelongCommentID + "\" commentName=\"" + commentInfo.CommentName + "\">" + commentInfo.CommentContent + "</p>" +
				"</div>";
			var chat = li.getElementsByClassName("chats")[0];

			if(commentInfo.children.length > 0) {
				var reply = document.createElement("div");
				reply.className = "reply";
				chat.appendChild(reply);
				var commCtrls = [];

				var commentNum = commentInfo.children.length;

				//遍历子回复
				for(var i = 0; i < commentNum; i++) {
					var child = commentList[commentInfo.children[i]];
					self.createCommentDom(child, commCtrls, 1);
				}

				var moreDiv = null;
				//添加子回复
				for(var i = commCtrls.length; i > 0; i--) {
					if(commCtrls.length - i < 2) {
						reply.appendChild(commCtrls[i - 1]);
					}
					else {
						if(commCtrls.length - i == 2) {
							moreDiv = document.createElement("div");
							moreDiv.className = "moreDiv";
							reply.appendChild(moreDiv);
							moreDiv.style.display = "none";
							var btnText = document.createElement("div");
							btnText.className = "btnMore";
							btnText.innerHTML = "共" + commCtrls.length + "条回复 &nbsp;<span>&gt;</span>";
							reply.appendChild(btnText);
						}
						moreDiv.appendChild(commCtrls[i - 1]);
					}
				}
				if(commCtrls.length > 2) {
					var collapse = document.createElement("div");
					collapse.className = "collapse";
					collapse.innerHTML = "&and;";
					collapse.style.display = "none";
					reply.appendChild(collapse);
				}
			}
			return li;
		}
		else {
			//子级评论
			var div = document.createElement("div");
			if(commentInfo.BeCommentID == commentInfo.BelongCommentID) {
				//二级评论
				div.innerHTML = "<span id=\"" + commentInfo.CommentUserID + "\">" + commentInfo.CommentName + "</span>:&nbsp;<span class=\"comment_txt\" commentId=\"" + commentInfo.CommentID + "\" reportState=\"" + commentInfo.HasReport + "\" userId=\"" + commentInfo.CommentUserID + "\" belongCommentId=\"" + commentInfo.BelongCommentID + "\" commentName=\"" + commentInfo.CommentName + "\">" + commentInfo.CommentContent + "</span>";
			}
			else {
				div.innerHTML = spaceStr + "<span id=\"" + commentInfo.CommentUserID + "\">" + commentInfo.CommentName + "</span>回复<span>@" + commentInfo.BeCommentName + "</span>:&nbsp;<span class=\"comment_txt\" commentId=\"" + commentInfo.CommentID + "\" userId=\"" + commentInfo.CommentUserID + "\" belongCommentId=\"" + commentInfo.BelongCommentID + "\" commentName=\"" + commentInfo.CommentName + "\">" + commentInfo.CommentContent + "</span>";
			}

			for(var i = 0; i < commentInfo.children.length; i++) {
				var child = commentList[commentInfo.children[i]];
				self.createCommentDom(child, ctrls, spaceNum + 1);
			}
			ctrls.push(div);
		}
	};

	module.exports = new DetailComment();
});
