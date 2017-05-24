define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");
	var count = 0;
	var dynamicId = localStorage.getItem("dynamicId");
	var myId = localStorage.getItem("myId");
	var userId;
	var like;
	ShareToOtherPlatforms.prototype.webview = null;
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
	var data = JSON.parse(localStorage.getItem('result_array'));

	function ShareToOtherPlatforms() {
		self = this;
		this.init();
	}
	/**
	 * mui初始化
	 */
	ShareToOtherPlatforms.prototype.init = function() {
		self = this;
		(function($) {
			mui.plusReady(function() {
				mui('body').on('shown', '.mui-popover', function(e) {
					//console.log('shown', e.detail.id);//detail为当前popover元素
				});
				mui('body').on('hidden', '.mui-popover', function(e) {
					//console.log('hidden', e.detail.id);//detail为当前popover元素
				});
			})

			//mui('body').on('tap', 'a', self.skip);

			//B页面onload从服务器获取列表数据；
			window.onload = function() {
				//从服务器获取数据

				//业务数据获取完毕，并已插入当前页面DOM；

				if(mui.os.plus) {
					$.plusReady(function() {
						//全部帖子第一次加载
						self.onReady();
					});
				} else {
					self.onReady();
				}
			}

			/**
			 * 关注
			 */
			mui(".mui-card").on("tap", ".follow", function() {
				if(mui(".follow")[0].innerText == "关注") {
					var info = {
						"userId": myId, //用户ID
						"beFocusUserId": userId //被关注用户ID
					};
					toolkit.sendPost(config.serverBaseUrl + "/relation/focusUser", info, function(err, result) {
						if(err) {
							throw err;
						} else {
							var obj = JSON.parse(result);
							console.log(obj.errCode + "===" + obj.errMsg);
							mui(".follow")[0].innerText = "已关注";
							mui(".follow")[0].style.width = "65px";
							post.HasFocus = 1;
							if(window.localStorage) {
								localStorage.result_array = JSON.stringify(data);
							} else {
								mui.alert("不支持本地存储");
							}
							return;
						}
					})
				} else {
					var info = {
						"userId": myId, //用户ID
						"cancelUserId": userId //被取消关注用户ID
					};
					toolkit.sendPost(config.serverBaseUrl + "/relation/cancelFocus", info, function(err, result) {
						if(err) {
							throw err;
						} else {
							var obj = JSON.parse(result);
							console.log(obj.errCode + "===" + obj.errMsg);
							mui(".follow")[0].innerText = "关注";
							mui(".follow")[0].style.width = "55px";
							post.HasFocus = 0;
							if(window.localStorage) {
								localStorage.result_array = JSON.stringify(data);
							} else {
								mui.alert("不支持本地存储");
							}
							return;
						}
					})
				}
			})

			/**
			 * 喜欢，评论，分享
			 */
			mui(".footerNav").on("tap", ".likeBtn", function() {

				if(like == true) {
					toolkit.sendPost(config.serverBaseUrl + "/dynamic/markLike", {
						"userId": 1, //用户ID
						"paramsJSON": JSON.stringify({
							dynamicId: dynamicId, //帖子的ID
							beLike: true, //喜欢
							beLikeUserId: userId //被喜欢帖子所属的用户ID
						})
					}, function(err, result) {
						if(err) {
							throw err;
						} else {
							var obj = JSON.parse(result);
							console.log(obj.errCode + "===" + obj.errMsg);
							mui(".icon-like")[0].className = "mui-icon iconfont icon-like_y";
							mui(".icon-like_y")[0].style.color = "red";
							like = false;
							post.HasFond = 1;
							if(window.localStorage) {
								localStorage.result_array = JSON.stringify(data);
							} else {
								mui.alert("不支持本地存储");
							}
							return;
						}
					})
				}
				if(like == false) {
					toolkit.sendPost(config.serverBaseUrl + "/dynamic/markLike", {
						"userId": 1, //用户ID
						"paramsJSON": JSON.stringify({
							dynamicId: dynamicId, //帖子的ID
							beLike: false, //喜欢
							beLikeUserId: userId //被喜欢帖子所属的用户ID
						})
					}, function(err, result) {
						if(err) {
							throw err;
						} else {
							var obj = JSON.parse(result);
							console.log(obj.errCode + "===" + obj.errMsg);
							mui(".icon-like_y")[0].className = "mui-icon iconfont icon-like";
							mui(".icon-like")[
								0].style.color = "#999";
							like = true;
							post.HasFond = 0;
							if(window.localStorage) {
								localStorage.result_array = JSON.stringify(data);
							} else {
								mui.alert("不支持本地存储");
							}
							return;
						}
					})
				}
			})

			/**
			 * 点击进入喜欢列表页面
			 */
			mui("body").on("tap", ".logoList", function() {
				localStorage.setItem("likeList", JSON.stringify(allLike));
				mui.openWindow({
					url: "detaillike.html",
					id: "detaillike.html"
				})
			})
			mui("body").on("tap", ".logo", function() {
				var UserID = this.getAttribute("userId");
				localStorage.setItem("userId", UserID);
				mui.openWindow({
					url: 'homePage.html'
				});
			})

			/**
			 * 评论展开收起
			 */
			mui("body").on("tap", ".btnMore", function() {
				this.style.display = 'none';
				mui(".moreDiv")[0].style.display = "block";
				mui(".collapse")[0].style.display = "block";
			})
			mui("body").on("tap", ".collapse", function() {
				this.style.display = 'none';
				mui(".moreDiv")[0].style.display = "none";
				mui(".btnMore")[0].style.display = "block";
			})

			/**
			 * 点击头像或昵称进入起其主页
			 * 点击评论发表评论
			 * 点击某人评论进行回复
			 */
			mui("body").on("tap", ".title_name", function() {
				var UserID = this.getAttribute("id");
				localStorage.setItem("userId", UserID);
				mui.openWindow({
					url: 'homePage.html'
				});
			})
			mui("body").on("tap", ".title_logo", function() {
				var UserID = this.getAttribute("id");
				localStorage.setItem("userId", UserID);
				mui.openWindow({
					url: 'homePage.html'
				});
			})
			mui("body").on("tap", ".user-name", function() {
				var UserID = this.getAttribute("id");
				localStorage.setItem("userId", UserID);
				mui.openWindow({
					url: 'homePage.html'
				});
			})
			mui("body").on("tap", ".user-logo", function() {
				var UserID = this.getAttribute("id");
				localStorage.setItem("userId", UserID);
				mui.openWindow({
					url: 'homePage.html'
				});
			})
			//点击帖子内容跳转至帖子详情
			mui("body").on('tap', ".post-content", function() {
				var dynamicId = this.parentNode.getAttribute("id");
				localStorage.setItem("dynamicId", dynamicId);
				mui.openWindow({
					url: 'detailcomment.html',
				});
			});
			//点击评论
			mui(".footerNav").on("tap", ".commentBtn", function() {
				commentinfo = {
					dynamicId: dynamicId,
					beCommentUserId: userId,
					beCommentName: post.NickName
				}
				localStorage.setItem("commentInfo", JSON.stringify(commentinfo));
				mui.openWindow({
					url: 'invitationcomment.html',
					id: 'invitationcomment.html'
				});
			})
			//点击查看更多
			document.getElementById("go-hot-post").addEventListener("tap", function () {
				mui.openWindow({
					url: 'hotpost.html',
					id: 'hotpost'
				});
			});
			//点击评论
			mui("#data-list").on("tap", ".comment_txt", function() {
				var UserID = this.getAttribute("userId");
				var BeCommentName = this.getAttribute("commentName");
				var BelongCommentID = this.getAttribute("belongCommentId");
				var BeCommentID = this.getAttribute("commentId");
				commentinfo = {
					dynamicId: dynamicId,
					beCommentId: BeCommentID,
					beCommentUserId: UserID,
					beCommentName: BeCommentName
				}
				if(BelongCommentID == 0) {
					commentinfo.belongCommentID = BeCommentID;
				} else {
					commentinfo.belongCommentID = BelongCommentID;
				}
				localStorage.setItem("commentInfo", JSON.stringify(commentinfo));
				mui.openWindow({
					url: 'invitationcomment.html',
					id: 'invitationcomment.html'
				});
			})

			/**
			 * 收藏，举报，删除
			 */
			mui(".mui-table-view").on("tap", ".collect", function() {
				var self2 = this;
				var info = {
					"userId": myId, //用户的ID
					"dynamicId": dynamicId //帖子的ID
				}
				if(mui(".collect")[0].innerText == "收藏") {
					toolkit.sendPost(config.serverBaseUrl + "/collect/addCollect", info, function(err, result) {
						if(err) {
							throw err;
						} else {
							var obj = JSON.parse(result);
							console.log(obj.errCode + "===" + obj.errMsg);
							mui.toast('已收藏');
							self2.innerText = "已收藏";
							post.HasCollect = 1;
							if(window.localStorage) {
								localStorage.result_array = JSON.stringify(data);
							} else {
								mui.alert("不支持本地存储");
							}
							return;
						}
					})
				} else {
					toolkit.sendPost(config.serverBaseUrl + "/collect/cancelCollect", info, function(err, result) {
						if(err) {
							throw err;
						} else {
							var obj = JSON.parse(result);
							console.log(obj.errCode + "===" + obj.errMsg);
							mui.toast('已取消收藏');
							self2.innerText = "收藏";
							post.HasCollect = 0;
							if(window.localStorage) {
								localStorage.result_array = JSON.stringify(data);
							} else {
								mui.alert("不支持本地存储");
							}
							return;
						}
					})
				}
			})
			mui(".mui-table-view").on("tap", ".report", function() {
				var info = {
					"userId": myId, //用户的ID
					"dynamicId": dynamicId, //帖子的ID
					"content": mui(".mui-scroll > .mui-card > .mui-card-content")[0].innerText
				}
				if(report == false) {
					toolkit.sendPost(config.serverBaseUrl + "/report/report", info, function(err, result) {
						if(err) {
							throw err;
						} else {
							var obj = JSON.parse(result);
							console.log(obj.errCode + "===" + obj.errMsg);
							mui.openWindow({
								url: 'report.html',
								id: 'report.html'
							})
							post.HasReport = 1;
							if(window.localStorage) {
								localStorage.result_array = JSON.stringify(data);
							} else {
								mui.alert("不支持本地存储");
							}
							report = true;
							return false;
						}
					})
				} else {
					mui(".re-report")[0].style.display = "block";
					setTimeout("mui('.re-report')[0].style.display = 'none'", 2000);
				}
			})

			mui(".mui-table-view").on("tap", ".delete", function() {
				toolkit.clickDeleteBtn();
			})

			mui("body").on("tap", ".loadMore", function() {
				self.pullupRefresh();
				if(index >= topList.length) {
					this.innerText = "没有更多数据了";
				}
				return;
			})

			mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);

		})(mui);

	};

	ShareToOtherPlatforms.prototype.readyAgain = function() {
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
	 * 上拉加载具体业务实现
	 */
	ShareToOtherPlatforms.prototype.pullupRefresh = function() {
		self.readyAgain();
	}

	//设置非行间样式
	ShareToOtherPlatforms.prototype.setCss = function(obj, attr, value) {
		if(arguments.length == 2) { //arguments参数数组，当参数数组长度为2时表示获取css样式
			return getStyle(obj, attr); //返回对象的非行间样式用上面的getStyle函数
		} else {
			if(arguments.length == 3) { //当传三个参数的时候为设置对象的某个值
				obj.style[attr] = value;
			};
		};
	}

	//下一个兄弟节点
	ShareToOtherPlatforms.prototype.nextSibling = function(node) {
		var tempLast = node.parentNode.lastChild;
		if(node == tempLast) return null;
		var tempObj = node.nextSibling;
		while(tempObj.nodeType != 1 && tempObj.nextSibling != null) {
			tempObj = tempObj.nextSibling;
		}
		return(tempObj.nodeType == 1) ? tempObj : null;
	}
	//前一个兄弟节点
	ShareToOtherPlatforms.prototype.prevSibling = function(node) {
		var tempFirst = node.parentNode.firstChild;
		if(node == tempFirst) return null;
		var tempObj = node.previousSibling;
		while(tempObj.nodeType != 1 && tempObj.previousSibling != null) {
			tempObj = tempObj.previousSibling;
		}
		return(tempObj.nodeType == 1) ? tempObj : null;
	}
	ShareToOtherPlatforms.prototype.onReady = function() {
		var info = {
			"userId": myId,
			"dynamicId": dynamicId
		};
		toolkit.sendPost(config.serverBaseUrl + "/dynamic/findDynamic", info, function(err, result) {
			if(err) {
				throw err;
			} else {
				var obj = JSON.parse(result);
				if(obj.errCode) {
				    console.log(obj.errMsg);
				} else {
					console.log(obj);
					post = obj;
					mui("#content")[0].innerHTML = obj.Content;
					if(mui("#comment img").length == 1) {
						mui("#comment img").className = "one";
					}
					mui(".title_time")[0].innerText = toolkit.getDateDiff(Date.parse(obj.CreateTime));
					mui(".title_name")[0].innerText = obj.NickName;
					mui(".title_logo")[0].style.src = obj.HeadIconPath;
					mui(".location")[0].innerText = obj.Location;
					mui(".commentNum")[0].innerText = obj.AllComment.length;
					mui(".title_name")[0].setAttribute("id", myId);
					mui(".title_logo")[0].setAttribute("id", myId);
					if(obj.HasCollect == 0) {
						mui(".collect")[0].innerText = "收藏";
					} else {
						mui(".collect")[0].innerText = "已收藏";
					}
					//					if(obj.HasFond == 1) {
					//						mui(".icon-like")[0].className = "mui-icon iconfont icon-like_y";
					//						mui(".icon-like_y")[0].style.color = "red";
					//						like = false;
					//					} else {
					//						mui(".icon-like")[0].style.color = "#999";
					//						like = true;
					//					}
					if(obj.HasReport == 0) {
						report = false;
					} else {
						report = true;
					}
					if(obj.HasFocus == 0) {
						mui(".follow")[0].innerText = "关注";
					} else {
						mui(".follow")[0].innerText = "已关注";
					}
					allLike = obj.FondUserList;
					var allComment = obj.AllComment;
					//					var allComment = obj.AllComment;

					//					BeCommentID:0 						//父评论ID,如果为0，就是原帖
					//					BeCommentName:"fengyue"				//被评论者昵称
					//					BeCommentUserID:1						//被评论者用户ID
					//					BelongCommentID:0						//顶级评论的ID
					//					CommentContent:"我要飞上天，去与太阳肩并肩"	//评论内容
					//					CommentID:2							//评论ID
					//					CommentName:"金缕衣"					//评论者昵称
					//					CommentTime:"2017-04-12T01:49:34.000Z" //评论时间
					//					CommentUserID:2						//评论者ID
					//					DynamicID:15							//帖子ID
					//					HeadIconPath:""				//头像

					//遍历，根据帖子ID存储
					for(var i = 0; i < allComment.length; i++) {
						var comment = allComment[i];
						comment.children = [];
						commentList[comment.CommentID] = comment;
					}
					//遍历，组织父子关系
					for(var i = 0; i < allComment.length; i++) {
						var comment = allComment[i];
						if(comment.BeCommentID && commentList[comment.BeCommentID]) {
							//如果被评论的ID在评论列表中，把被评论的评论作为该评论的父评论
							commentList[comment.BeCommentID].children.push(comment.CommentID);
						} else if(comment.BeCommentID == 0) {
							topList.push(comment.CommentID);
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
						} else if(aTime < bTime) {
							result = 1;
						}
						return result;
					})
					if(allLike.length > 5) {
						for(var i = 0; i < 5; i++) {
							var li = document.createElement("li");
							li.className = "logo";
							li.userId = allLike[i].UserID;
							li.innerHTML = '<img src="' + allLike[i].HeadIconPath + '"/>';
							likeTable.appendChild(li);
						}
					}else{
						for(var i = 0; i < allLike.length; i++) {
							var li = document.createElement("li");
							li.className = "logo";
							li.userId = allLike[i].UserID;
							li.innerHTML = '<img src="' + allLike[i].HeadIconPath + '"/>';
							likeTable.appendChild(li);
						}
					}
					var li = document.createElement("li");
					li.className = "logoMore";
					li.innerHTML = '<img src="images/comment_empty@2x.png"/>';
					likeTable.appendChild(li);
					mui(".likeNum span")[0].innerText = allLike.length;
				}
				self.readyAgain();
			}
		});

		//请求热门帖子函数调用
		self.reqHotPost();
		//关闭等待框
		if(mui.os.plus) {
			plus.nativeUI.closeWaiting();
			//显示当前页面
			mui.currentWebview.show();
		}
	}

	/**
	 * 创建评论的Dom控件
	 * @param {Object} commentInfo
	 */
	ShareToOtherPlatforms.prototype.createCommentDom = function(commentInfo, ctrls, spaceNum) {
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
			} else if(aTime < bTime) {
				result = -1;
			}
			return result;
		})

		//顶级评论
		if(commentInfo.BeCommentID == 0) {
			var li = document.createElement('li');
			li.className = 'mui-table-view-cell mui-card';
			li.innerHTML = '<div class="mui-card-header mui-card-media">' +
				'<img class="user-logo" src="' + commentInfo.HeadIconPath + '" id="' + commentInfo.CommentUserID + '" />' +
				'<div class="mui-media-body">' +
				'<span class="user-name" id="' + commentInfo.CommentUserID + '">' + commentInfo.CommentName + '</span>' +
				'<p class="time">' + toolkit.getDateDiff(Date.parse(commentInfo.CreateTime)) + '</p>' +
				'</div></div>' +
				'<div class="mui-card-content chats">' +
				'<p class="comment_txt" commentId="' + commentInfo.CommentID + '" userId="' + commentInfo.CommentUserID + '" belongCommentId="' + commentInfo.BelongCommentID + '" commentName="' + commentInfo.CommentName + '">' + commentInfo.CommentContent + '</p>' +
				'</div>';
			var chat = li.getElementsByClassName("chats")[0];

			if(commentInfo.children.length > 0) {
				var reply = document.createElement('div');
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
					} else {
						if(commCtrls.length - i == 2) {
							moreDiv = document.createElement('div');
							moreDiv.className = "moreDiv";
							reply.appendChild(moreDiv);
							moreDiv.style.display = 'none';

							var btnText = document.createElement("div");
							btnText.className = "btnMore";
							btnText.innerHTML = '共' + commCtrls.length + "条回复 &nbsp;<span>&gt;</span>";
							reply.appendChild(btnText);
						}
						moreDiv.appendChild(commCtrls[i - 1]);
					}
				}
				if(commCtrls.length > 2) {
					var collapse = document.createElement("div");
					collapse.className = "collapse";
					collapse.innerHTML = "&and;"
					collapse.style.display = "none";
					reply.appendChild(collapse);
				}
			}
			return li;
		} else {
			//子级评论
			var div = document.createElement('div');
			if(commentInfo.BeCommentID == commentInfo.BelongCommentID) {
				//二级评论
				div.innerHTML = '<span id="' + commentInfo.CommentUserID + '">' + commentInfo.CommentName + '</span>:&nbsp;<span class="comment_txt" commentId="' + commentInfo.CommentID + '" userId="' + commentInfo.CommentUserID + '" belongCommentId="' + commentInfo.BelongCommentID + '" commentName="' + commentInfo.CommentName + '">' + commentInfo.CommentContent + '</span>';
			} else {
				div.innerHTML = spaceStr + '<span id="' + commentInfo.CommentUserID + '">' + commentInfo.CommentName + "</span>回复<span>@" + commentInfo.BeCommentName + '</span>:&nbsp;<span class="comment_txt" commentId="' + commentInfo.CommentID + '" userId="' + commentInfo.CommentUserID + '" belongCommentId="' + commentInfo.BelongCommentID + '" commentName="' + commentInfo.CommentName + '">' + commentInfo.CommentContent + '</span>';
			}

			for(var i = 0; i < commentInfo.children.length; i++) {
				var child = commentList[commentInfo.children[i]];
				self.createCommentDom(child, ctrls, spaceNum + 1);
			}
			ctrls.push(div);
		}
	}
	/**
	 * 请求热门帖子
	 */
	ShareToOtherPlatforms.prototype.reqHotPost = function() {
		var info = {
			reqType: 1,
			startRow: 1
		}
		var table = document.getElementById("hot-post");
		toolkit.sendPost(config.fdhUrl + "/dynamic/reqHotList", info, function(err, result) {
			if(err) {
				throw err
			} else {
				var obj = JSON.parse(result);
				result_array = obj;
				console.log(obj);
				if(obj.errCode) {
					throw obj.errMsg;
				} else {
					for(var i = 0; i < obj.length; i++) {
						var div= document.createElement('div');
						div.className = 'mui-card';
						div.id = obj[i].UserID;
						div.innerHTML = '' +
							'<div class="mui-card-header mui-card-media">' +
							'<img id="' + obj[i].UserID + '" class="title_logo" src="images/touxiang01.jpg" />' +
							'<div class="mui-media-body">' +
							'<span id="' + obj[i].UserID + '" class="title_name">' + obj[i].NickName + '</span>' +
							'<p class="title_time">' + toolkit.getDateDiff(Date.parse(obj[i].CreateTime)) + '</p>' +
							'</div>' +
							'</div>' +
							'<div class="mui-card-content" id="' + obj[i].DynamicID + '">' +
							'<span class = "post-content">' + obj[i].Content + '</span>'
						if(obj[i].PicturePath) {
							div.innerHTML +=
								'<img class="one" src="images/yuantiao.jpg"/>' +
								'</div>'
						} else {
							div.innerHTML += '</div>'
						}
						div.innerHTML +=
							'<div class="mui-card-footer">' +
							'<ul>' +
							'<li class="mui-icon iconfont icon-map"></li>' +
							'<li class="location">蛇口创业一号</li>' +
							'</ul>' +
							'</div>' 
						table.appendChild(div);
						toolkit.setImageSize();

					}
				}
			}
		});
	}
	module.exports = new ShareToOtherPlatforms();
});