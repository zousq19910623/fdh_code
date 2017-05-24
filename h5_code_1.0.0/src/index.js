// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");

	var self = null;
	var count = 0;
	var resultArray = new Array();
	var liHtml, userId, count_love, DynamicID, li, DynamicID, UserID, firstTime, lastTime, HasFond, FondTimes, ReadTimes,
		ShareTimes, NickName, DynamicTimes, FirstmyId, HeadIconPath, myHead;
	var isClick = false;
	var fragment = document.createDocumentFragment();
	//var indexLiFootLove = document.querySelector(".index_li_foot_love");
	var liLove = document.querySelector(".li_love");
	var indexTotal = document.querySelector("#index_total");
	var indexAttention = document.querySelector("#index_attention");
	var tab1view = document.querySelector("#tab1view");
	var tab2view = document.querySelector("#mui-table-view2");
	var collection_text = document.getElementById("hint_collection");
	var liDelete = document.getElementById("delete-btn");
	var topPopover = document.getElementById("topPopover");
	var headImg = document.getElementById("index_headLeftImg");

	/**
	 * 构造函数
	 */
	function Index() {
		self = this;
		FirstmyId = localStorage.getItem("FirstmyId");
		myHead = localStorage.getItem("myHead");
		myId = localStorage.getItem("myId");
		HeadIconPath = localStorage.getItem("HeadIconPath");
		window.onload = this.init;

	}

	/**
	 * 初始化
	 */
	Index.prototype.init = function() {
		mui.plusReady(function() {
			var time = Date.parse(new Date()) / 1000;
			headImg.setAttribute("src", myHead);

			var $ = mui;
			$.init({
				preloadPages: [{
					id: 'detailcomment',
					url: 'detailcomment.html'
				},{
					id: 'invitationcomment',
					url: 'invitationcomment.html'
				},]
			});

			//当mui准备好时调用
			$.ready(function() {
				//全部帖子第一次加载(先把请求发出去，等待的时候，做下面的事)
				if(mui.os.plus) {
					$.plusReady(function() {
						self.total_loadData(time);
					});
				} else {
					self.total_loadData(time);
				}

				//阻尼系数
				var deceleration = mui.os.ios ? 0.003 : 0.0009;
				$(".mui-scroll-wrapper").scroll({
					bounce: false,
					indicators: true, //是 否显示滚动条
					deceleration: deceleration
				});
				//阻止选项卡左右切换
				mui(".mui-slider").slider().setStopped(true);
				//图片放大全屏调用
				mui.previewImage();

				//循环初始化所有下拉刷新，上拉加载。
				$.each(document.querySelectorAll(".mui-slider-group .mui-scroll"), function(index, pullRefreshEl) {
					$(pullRefreshEl).pullToRefresh({
						down: {
							callback: function() {
								var self2 = this;
								var ul = self2.element.querySelector(".mui-table-view");
								ul.insertBefore(self.createFragment(ul, index, 30, true), ul.childNodes[0]);
								//ul.appendChild(self.createFragment(ul, index, 100));
								if(index == 0) {
									toolkit.setImageSize();
								} else {
									toolkit.setImageSize2();
								}
								self2.endPullDownToRefresh();
							}
						},
						up: {
							callback: function() {
								var self2 = this;
								var ul = self2.element.querySelector(".mui-table-view");
								ul.appendChild(self.createFragment(ul, index, 100));
								if(index == 0) {
									toolkit.setImageSize();
								} else {
									toolkit.setImageSize2();
								}
								self2.endPullUpToRefresh();
							}
						}
					});
				});
			});

			//设置图片宽高
			toolkit.setImageSize();

			//首页全部关注选择切换
			indexTotal.addEventListener("tap", self.clickIndexTotal);
			indexAttention.addEventListener("tap", self.clickIndexAttention);

			//跳转我的主页
			document.getElementById("index_headLeftImg").addEventListener("tap", self.clickHomepage);
			//点击喜欢按钮
			mui(".mui-table-view").on("tap", ".index_li_foot_love", self.clickLoveSwitch);

			//收藏吐司
			document.getElementById("Collection").addEventListener("tap", self.clickCollection);
			//删除弹出窗口
			document.getElementById("delete-btn").addEventListener("tap", self.clickDeleteBtn);
			//举报事件
			document.getElementById("index_report_li").addEventListener("tap", self.clickReport);

			//分享
			document.getElementById("li_share1").addEventListener("tap", toolkit.clickShareWei);
			document.getElementById("li_share2").addEventListener("tap", toolkit.clickSharePeng);
			document.getElementById("li_share3").addEventListener("tap", toolkit.clickShareQQ);
			document.getElementById("li_share4").addEventListener("tap", toolkit.clickShareQQKong);

			//下拉框点击事件
			mui("body").on("tap", ".index_li_head_img2_a", self.clickA);

			var detailcomment = null;
			//=====全部页面ul li 帖子点击事件================================================================
			mui(".mui-table-view").on("tap", ".index_li_head", function(ev) {
				//事件委托
				var ev = ev || window.event;
				var target = ev.target || ev.srcElement;
				DynamicID = this.parentNode.getAttribute("id");
				DynamicID = DynamicID.match(/\_(\d+)/);
				DynamicID = DynamicID[1];

				UserID = this.children[0].getAttribute("id");
				if(UserID == myId) {
					liDelete.style.display = "block";
					topPopover.style.height = "150px";
				} else {
					liDelete.style.display = "none";
					topPopover.style.height = "100px";
				}

				//点击头像
				if(target.className.toLocaleLowerCase() == "index_li_head_img1") {
					localStorage.setItem("myId", myId);
					localStorage.setItem("FirstmyId", FirstmyId);
					mui.openWindow({
						url: "homepage.html",
						id: UserID,
						show: {
							autoShow: false
						}
					});
					return true;
				}
				
				//点击喜欢
				if(target.id.toLocaleLowerCase() == "li_love") {
					return false;
				}

				//点击分享
				if(target.id.toLocaleLowerCase() == "li_share") {
					return true;
				}
				//收藏
				if(target.nodeName.toLocaleLowerCase() == "a") {
					for(var i = 0; i < resultArray.length; i++) {
						if(resultArray[i].DynamicID == DynamicID) {
							if(resultArray[i].HasCollect == "1") {
								collection_text.innerText = "已收藏";
							}
						}
					}
					return true;
				}

				localStorage.setItem("dynamicId", DynamicID);
				localStorage.setItem("myId", myId);
				
				//获得详情页面
				if(!detailcomment) {
					detailcomment = plus.webview.getWebviewById('detailcomment');
				}

				//触发详情页面的newsId事件
				mui.fire(detailcomment, 'dynamicId', {
					id: DynamicID
				});

				//打开详情页面          
				mui.openWindow({
					id: 'detailcomment',
				});
			
			});
			

			document.getElementById("index_publish").addEventListener("tap", function() {
				mui.openWindow({
					url: "invitation.html",
					id: "invitation"
				});
			});

			document.getElementById("index_headRightImg").addEventListener("tap", function() {
				mui.openWindow({
					url: "message.html",
					id: "message"
				});
			});

			/**
			 * 点击跳转
			 */
			var invitationcomment = null;
			mui(".mui-table-view").on("tap", ".index_li_foot_comment", function(ev) {
				DynamicID = this.parentNode.parentNode.getAttribute("id");
				DynamicID = DynamicID.match(/\_(\d+)/);
				DynamicID = DynamicID[1];
				//获得详情页面
				if(!invitationcomment) {
					invitationcomment = plus.webview.getWebviewById('invitationcomment');
				}
				//触发详情页面的newsId事件
				mui.fire(invitationcomment, 'dynamicId', {
					id: DynamicID
				});

				//打开详情页面          
				mui.openWindow({
					id: 'invitationcomment',
				});
			
				
			});

		});
	};

	/**
	 * 全部帖子第一次加载
	 */
	Index.prototype.total_loadData = function(time) {
		/**
		 * 全部第一次请求
		 */
		var info = {
			"userId": localStorage.getItem("myId"),
			"refreshType": 1,
			"flagTime": time
		};
		
		console.log(info)

		toolkit.sendPost(config.serverBaseUrl + "/dynamic/reqData", info, function(err, result) {
			if(err) {
				throw err;
			} else {
				var obj = JSON.parse(result);
				if(obj.errCode) {
					mui.alert(obj.errCode);
				} else {
					resultArray = obj;
					if(window.localStorage) {
						localStorage.setItem("resultArray", JSON.stringify(resultArray));
					} else {
						mui.alert("不支持本地存储");
					}
                    console.log(obj)
					for(var i = 0; i < obj.length; i++) {
						self.addDynamic(tab1view, "up", obj[i]);
					}

					if(obj.length > 0) {
						firstTime = Date.parse(obj[0].CreateTime) / 1000;
						lastTime = Date.parse(obj[obj.length - 1].CreateTime) / 1000;
					}
				}
			}
		});

		/**
		 * 关注第一次请求
		 */
		var info = {
			"userId": localStorage.getItem("myId"),
			"refreshType": 1,
			"startRow": 0,
			"flagTime": time
		};

		toolkit.sendPost(config.serverBaseUrl + "/dynamic/reqFocusUserDynamic", info, function(err, result) {
			if(err) {
				throw err;
			} else {
				var obj = JSON.parse(result);
				if(obj.errCode) {
						throw err;
				} else {
					var obj = JSON.parse(result);
					resultArray = toolkit.unique(resultArray.concat(obj));

					if(window.localStorage) {
						localStorage.setItem("resultArray", JSON.stringify(resultArray));
					} else {
						mui.alert("不支持本地存储");
					}

					for(var i = 0; i < obj.length; i++) {
						self.addDynamic(tab2view, "up", obj[i]);
					}

				}
			}
		});
	};

	/**
	 * 创建帖子
	 * @parent {Object} parent
	 * @param {Object} dynamicInfo
	 */
	Index.prototype.addDynamic = function(parent, upOrDown, dynamicInfo) {
		var obj = dynamicInfo;
		var liHtml = "";
		var li = document.createElement("li");
		li.className = "mui-table-view-cell cell_lick";
		var DynamicID = dynamicInfo.DynamicID;
		var HasFond = dynamicInfo.HasFond;
		li.id = "tab1_" + DynamicID;
		var UserID = dynamicInfo.UserID;
		var DynamicTimes = dynamicInfo.DynamicTimes;

		liHtml += "<div class=\"index_li_head\">" +
			"<img   id=" + UserID + " class=\"index_li_head_img1\" src=\"" + dynamicInfo.HeadIconPath + "\" />" +
			"<span class=\"index_li_head_span1 li_link\">" + dynamicInfo.NickName + "</span>" +
			"<span class=\"index_li_head_span2 li_link_time\">" + toolkit.getDateDiff(Date.parse(dynamicInfo.CreateTime)) + "</span>" +
			"<a  id=" + DynamicID + " class=\"index_li_head_img2_a mui-icon mui-icon-arrowdown\" href=\"#topPopover\"></a>" +
			"</div>" +
			"<div class=\"index_li_title li_link\">" + dynamicInfo.Content + "</div>";

		//如果帖子含有图片
		try{
			if(dynamicInfo.PicturePath != "") {
				var PicturePath_arr = JSON.parse(dynamicInfo.PicturePath);
				/*if(PicturePath_arr.length == 1) {
					liHtml += "<div>";
					imgReady(PicturePath_arr[0].picUrl, function() {
						if(this.width >= this.height) {
						   liHtml += 	"<img class=\"index_li_img_one\" src=\"" + PicturePath_arr[0].picUrl + "\" data-preview-src=\"\" data-preview-group=\"" + DynamicID + "\" />";
						}
						else{
						    liHtml += 	"<img class=\"index_li_img_one_vertical\" src=\"" + PicturePath_arr[0].picUrl + "\" data-preview-src=\"\" data-preview-group=\"" + DynamicID + "\" />";
						}
					});
				}
				else{*/
				liHtml += "<div id=\"index_li_img\" class=\"index_li_img li_link\">";
				for(var j = 0; j < PicturePath_arr.length; j++) {
					liHtml += "<img class=\"index_li_img_son\" src=\"" + PicturePath_arr[j].picUrl + "\" data-preview-src=\"\" data-preview-group=\"" + dynamicInfo.DynamicID + "\" />";
				}
				//}
			}
		}
		catch(e){
			console.error("Parse picture path error:");
			console.error(dynamicInfo.PicturePath);
		}

		liHtml += "</div>" +
			"<div class=\"index_li_location\">" +
			"<span class=\"mui-icon iconfont icon-like icon-map\"></span>" +
			"<span>蛇口创业壹号</span>" +
			"</div>" +
			"<div class=\"index_li_foot\" >";

		if(HasFond == 1) {
			liHtml += "<button id=\"li_love\" type=\"button\" class=\"mui-icon iconfont  icon-like index_li_foot_love icon-like_y\"  style=\"color:red;\"> <span class=\"li_love\">" + dynamicInfo.DynamicTimes.FondTimes + "</span></button>";
		} else {
			liHtml += "<button  id=\"li_love\" type=\"button\" class=\"mui-icon iconfont  icon-like index_li_foot_love\"> <span class=\"li_love\">" + dynamicInfo.DynamicTimes.FondTimes + "</span></button>";
		}

		liHtml += "<button type=\"button\" class=\"mui-icon iconfont icon-comment index_li_foot_comment\"> " + dynamicInfo.DynamicTimes.CommentTimes + "</button>" +
			"<a href=\"#index_share\"> <button id=\"li_share\" type=\"button\" class=\"mui-icon iconfont icon-Share index_li_foot_share\"> " + dynamicInfo.DynamicTimes.ShareTimes + "</button></a>" +
			"</div>";

		li.innerHTML = liHtml;

		if(upOrDown == "up") {
			parent.appendChild(li);
		} else {
			parent.insertBefore(li, parent.childNodes[0]);
		}

	};

	/**
	 *追加信息
	 */
	Index.prototype.createFragment = function(ul, index, count, reverse) {
		//全部列表
		if(index == 0) {
			//全部下拉刷新
			if(reverse == true) {
				var info = {
					"userId": myId,
					"refreshType": 2,
					"flagTime": firstTime
				};

				toolkit.sendPost(config.serverBaseUrl + "/dynamic/reqData", info, function(err, result) {
					if(err) {
						throw err;
					} else {
						var obj = JSON.parse(result);
						if(obj.errCode) {
							console.log(obj.errMsg);
						} else {
							var obj = JSON.parse(result);

							resultArray = toolkit.unique(resultArray.concat(obj));

							if(window.localStorage) {
								//localStorage.post_detail = result;
								localStorage.setItem("resultArray", JSON.stringify(resultArray));
							} else {
								mui.alert("不支持本地存储");
							}

							if(window.localStorage) {
								localStorage.post_detail = obj;
							} else {
								mui.alert("不支持本地存储");
							}
							console.log(obj);
							console.log(obj.length);

							for(var i = 0; i < obj.length; i++) {

								self.addDynamic(tab1view, "down", obj[i]);

								if(i == obj.length - 1) {
									firstTime = Date.parse(obj[i].CreateTime) / 1000;
								}

							}
						}
					}
				});
			} else {
				//全部上啦刷新
				var info = {
					"userId": myId,
					"refreshType": 1,
					"flagTime": lastTime
				};
				toolkit.sendPost(config.serverBaseUrl + "/dynamic/reqData", info, function(err, result) {
					if(err) {
						throw err;
					} else {
						var obj = JSON.parse(result);
						if(obj.errCode) {
							console.log(obj.errMsg);
						} else {
							var obj = JSON.parse(result);

							resultArray = toolkit.unique(resultArray.concat(obj));
							if(window.localStorage) {
								//localStorage.post_detail = result;
								localStorage.setItem("resultArray", JSON.stringify(resultArray));
							} else {
								mui.alert("不支持本地存储");
							}

							for(var i = 0; i < obj.length; i++) {
								//console.log(obj[i].PicturePath);

								self.addDynamic(tab1view, "up", obj[i]);

								if(i == obj.length - 1) {
									lastTime = Date.parse(obj[i].CreateTime) / 1000;
								}
							}
						}
					}
				});
			}
			//关注
		} else if(index == 1) {
			//关注下拉刷新
			if(reverse == true) {
				var info = {
					"userId": myId,
					"refreshType": 2,
					"flagTime": lastTime
				};

				toolkit.sendPost(config.serverBaseUrl + "/dynamic/reqFocusUserDynamic", info, function(err, result) {
					if(err) {
						throw err;
					} else {
						var obj = JSON.parse(result);
						if(obj.errCode) {
							console.log(obj.errMsg);
						} else {
							var obj = JSON.parse(result);
							resultArray = toolkit.unique(resultArray.concat(obj));

							if(window.localStorage) {
								//localStorage.post_detail = result;
								localStorage.setItem("resultArray", JSON.stringify(resultArray));
							} else {
								mui.alert("不支持本地存储");
							}

							for(var i = 0; i < obj.length; i++) {

								self.addDynamic(tab2view, "down", obj[i]);

								if(i == obj.length - 1) {
									lastTime = Date.parse(obj[i].CreateTime) / 1000;
								}
							}
						}
					}
				});
			} else {
				var info = {
					"userId": myId,
					"refreshType": 1,
					"flagTime": lastTime
				};
				toolkit.sendPost(config.serverBaseUrl + "/dynamic/reqData", info, function(err, result) {
					if(err) {
						throw err;
					} else {
						var obj = JSON.parse(result);
						if(obj.errCode) {
							console.log(obj.errMsg);
						} else {
							var obj = JSON.parse(result);
							resultArray = toolkit.unique(resultArray.concat(obj));

							if(window.localStorage) {
								localStorage.setItem("resultArray", JSON.stringify(resultArray));
							} else {
								mui.alert("不支持本地存储");
							}

							for(var i = 0; i < obj.length; i++) {

								self.addDynamic(tab2view, "up", obj[i]);

								if(i == obj.length - 1) {
									lastTime = Date.parse(obj[i].CreateTime) / 1000;
								}
							}
						}
					}
				});
			}
		}
		return fragment;
	};

	/**
	 * 点击收藏
	 */
	Index.prototype.clickCollection = function() {
		var info = {
			"userId": myId,
			"dynamicId": DynamicID
		};
		if(collection_text.innerText == "已收藏") {
			toolkit.sendPost(config.serverBaseUrl + "/collect/cancelCollect", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					var obj = JSON.parse(result);
					console.log(obj.errCode + "===" + obj.errMsg);

					collection_text.innerText = "收藏";
					mui.toast("取消收藏");
					mui("#topPopover").popover("toggle");
					for(var i = 0; i < resultArray.length; i++) {
						if(resultArray[i].DynamicID == DynamicID) {
							resultArray[i].HasCollect = 0;
						}
					}
				}
			});
		} else {
			toolkit.sendPost(config.serverBaseUrl + "/collect/addCollect", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					var obj = JSON.parse(result);
					console.log(obj.errCode + "===" + obj.errMsg);
					collection_text.innerText = "已收藏";
					mui.toast("已收藏");
					mui("#topPopover").popover("toggle");

					for(var i = 0; i < resultArray.length; i++) {
						if(resultArray[i].DynamicID == DynamicID) {
							resultArray[i].HasCollect = 1;
						}
					}
				}
			});
		}
	};

	/**
	 * 点击举报事件
	 */
	Index.prototype.clickReport = function() {
		localStorage.setItem("dynamicId", DynamicID);
		localStorage.setItem("myId", myId);

		mui.openWindow({
			url: "report.html"
		});
	};

	/**
	 * 点击删除
	 */
	Index.prototype.clickDeleteBtn = function() {
		mui("#topPopover").popover("toggle");
		localStorage.setItem("dynamicId", DynamicID);
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
						"dynamicId": DynamicID
					};
					toolkit.sendPost(config.serverBaseUrl + "/dynamic/deleteDynamic", info, function(err, result) {
						if(err) {
							throw err;
						} else {
							var obj = JSON.parse(result);
							if(obj.errCode == 0) {
								document.getElementById("tab1_" + DynamicID).style.display = "none";
							} else {
								mui.alert("删除失败！");
							}
						}
					});
					break;
			}
		});
	};

	/**
	 * 跳转主页面
	 */
	Index.prototype.clickHomepage = function() {
		localStorage.setItem("myId", myId);
		mui.openWindow({
			url: "homepage.html"
		});
	};
	/**
	 * 点击全部
	 */
	Index.prototype.clickIndexTotal = function() {
		this.style.fontSize = "18px";
		indexAttention.style.fontSize = "14px";
	};

	/**
	 * 点击关闭
	 */
	Index.prototype.clickIndexAttention = function() {
		this.style.fontSize = "18px";
		indexTotal.style.fontSize = "14px";
	};

	/***
	 * 点击喜欢事件
	 */
	Index.prototype.clickLoveSwitch = function() {
		var str = "";
		for(var i = 0; i < this.classList.length; i++) {
			str += this.classList[i];
		}

		liLove = this.children[0];
		var li = this.parentNode.parentNode;

		DynamicID = li.getAttribute("id");
		DynamicID = DynamicID.match(/\_(\d+)/);
		DynamicID = DynamicID[1];

		if(str == "mui-iconiconfonticon-likeindex_li_foot_love") {
			var info = {
				"userId": myId,
				"paramsJSON": JSON.stringify({
					dynamicId: DynamicID, //帖子的ID
					beLike: true,
					beLikeUserId: userId
				})
			};

			toolkit.sendPost(config.serverBaseUrl + "/dynamic/markLike", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					var obj = JSON.parse(result);
					if(obj.errCode) {
						console.log(obj.errCode + "===" + obj.errMsg);
					}
				}
			});

			this.classList.add("icon-like_y");
			this.style.color = "red";
			liLove.style.color = "#999999";
			count_love = parseInt(liLove.innerText) + 1;
			liLove.innerText = count_love;
		} else {
			var info = {
				"userId": myId,
				"paramsJSON": JSON.stringify({
					dynamicId: DynamicID, //帖子的ID
					beLike: false,
					beLikeUserId: userId
				})
			};

			toolkit.sendPost(config.serverBaseUrl + "/dynamic/markLike", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					var obj = JSON.parse(result);
					if(obj.errCode) {
						console.log(obj.errCode + "===" + obj.errMsg);
					}
				}
			});

			this.classList.remove("icon-like_y");
			this.style.color = "#999999";
			count_love = parseInt(liLove.innerText) - 1;
			liLove.innerText = count_love;
		}
	};

	/***
	 * 点击喜欢事件
	 */
	Index.prototype.clickA = function() {
		DynamicID = this.getAttribute("id");
		for(var i = 0; i < resultArray.length; i++) {
			if(resultArray[i].DynamicID == DynamicID) {
				if(resultArray[i].HasCollect == "1") {
					collection_text.innerText = "已收藏";
				} else {
					collection_text.innerText = "收藏";
				}
			}
		}
	}

	module.exports = new Index();
});