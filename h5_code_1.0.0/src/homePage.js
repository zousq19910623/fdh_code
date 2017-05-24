// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");

	var count = 0;
	var self = null;
	var homePage_Index;
	var myId, userId;
	var time;
	var homepage_head_span2_2 = document.querySelector(".homepage_head_span2_2");
	var homepage_head_span3 = document.querySelector(".homepage_head_span3");
	var attention = document.querySelector(".attention");
	var fans = document.querySelector(".fans");
	var homepage_head_img = document.querySelector(".homepage_head_img");
	var homePage_love1 = document.querySelector(".homePage_love1");
	var homePage_comment1 = document.querySelector(".homePage_comment1");
	var homepage_head_span1 = document.querySelector(".homepage_head_span1");
	var homepage_age = document.querySelector(".homepage_age");
	var homepage_head_span2_2 = document.querySelector(".homepage_head_span2_2");
	var homepage_head_span3 = document.querySelector(".homepage_head_span3");
	var attention_count = document.querySelector(".attention_count");
	var fans_count = document.querySelector(".fans_count");
	var FondCount = document.querySelector(".FondCount");
	var CommentCount = document.querySelector(".CommentCount");
	var CollectCount = document.querySelector(".CollectCount");
	var PublishCount = document.querySelector(".PublishCount");
	var collection_text = document.getElementById("hint_collection");
	var li_delete = document.getElementById("delete-btn");
	var result_array = new Array();

	function HomePage() {
		self = this;
		this.init();
	}

	HomePage.prototype.init = function() {
		FirstmyId = localStorage.getItem("FirstmyId");
		myId = localStorage.getItem("myId");
		time = Date.parse(new Date()) / 1000;
		//相册
		mui.previewImage();

		mui.init({

			pullRefresh: {
				container: '#pullrefresh',
				up: {
					auto: true,
					contentrefresh: '正在加载...',
					callback: pullupRefresh
				}
			},

			/*preloadPages: [{
					url: 'invitation_collect.html',
					id: 'invitation_collect'
				},
				{
					url: 'invitation_comment.html',
					id: 'invitation_comment'
				},
				{
					url: 'invitation_love.html',
					id: 'invitation_love'
				}

			]*/

		});

		mui.plusReady(function() {

			var info = {
				"tokenId": FirstmyId
			};

			//alert(config.serverBaseUrl)
			toolkit.sendPost(config.serverBaseUrl + "/usermanager/reqData", info, function(err, result) {
				if(err) {
					alert("错误")
					throw err;
				} else {
					var obj = JSON.parse(result);
					if(obj.errCode) {
						mui.alert(obj.errMsg);
					} else {
						var obj = JSON.parse(result);

						if(window.localStorage) {
							localStorage.post_detail = result;
						} else {
							mui.alert("不支持本地存储");
						}

						console.log(obj);
						homepage_head_span1.innerText = obj.NickName;
						//homepage_age.innerText = toolkit.getNum(moment(obj.BirthDay, "YYYYMMDD").fromNow());
						homepage_age.innerText = new Date().getFullYear()-obj.BirthDay.slice(0,4)+""
						//homepage_head_span2_2.innerText = obj.City;
						homepage_head_span2_2.innerText = obj.Address;
						homepage_head_span3.innerText = obj.Signature;
						attention_count.innerText = obj.FocusCount;
						fans_count.innerText = obj.FansCount;
						FondCount.innerText = obj.FondCount;
						CommentCount.innerText = obj.CommentCount;
						CollectCount.innerText = obj.CollectCount;
						PublishCount.innerText = obj.PublishCount;
						homepage_head_img.setAttribute("src",obj.HeadIconPath);
						console.log(obj.length + "===" + obj.Address);

					}
				}
			});

		});

		mui.ready(function() {

			//B页面onload从服务器获取列表数据；
			window.onload = function() {
				//从服务器获取数据

				//业务数据获取完毕，并已插入当前页面DOM；

				//注意：若为ajax请求，则需将如下代码放在处理完ajax响应数据之后；

				mui.plusReady(function() {
					/*
										var self = plus.webview.currentWebview();
										var id = self.id;
										alert("home"+id)*/

					//关闭等待框
					plus.nativeUI.closeWaiting();
					//显示当前页面
					mui.currentWebview.show();
				});
			}

		});

		/**
		 * 上拉加载具体业务实现
		 */
		function pullupRefresh() {

			setTimeout(function() {
				mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2)); //参数为true代表没有更多数据了。
				var table = document.body.querySelector('.mui-table-view');

				var info = {
					"userId": myId,
					"refreshType": 1,
					"flagTime": time
				};

				toolkit.sendPost(config.serverBaseUrl + "/dynamic/myPublishDynamic", info, function(err, result) {
					if(err) {
						alert("错误")
						throw err;
					} else {
						var obj = JSON.parse(result);
						if(obj.errCode) {
							mui.alert(obj.errMsg);
						} else {
							var obj = JSON.parse(result);
							//result_array = obj;

							result_array.concat(obj);

							if(window.localStorage) {
								//localStorage.post_detail = result;
								localStorage.setItem('result_array', JSON.stringify(result_array));
							} else {
								mui.alert("不支持本地存储");
							}

							//alert(count)

							console.log(obj);
							console.log(obj.length);

							/*	for(var i = 0; i < obj.length; i++) {
									console.log(obj[i].CreateTime);
									//清空li_html
									li_html = "";
									if(obj[i].PicturePath == "") {

										li = document.createElement('li');
										li.className = 'mui-table-view-cell cell_lick';
										DynamicID = obj[i].DynamicID;
										HasFond = obj[i].HasFond;
										li.id = "tab1_" + DynamicID;
										UserID = obj[i].UserID;
										DynamicTimes = obj[i].DynamicTimes;

										li_html += '' +
											'<div class="index_li_head">' +
											'<img   id=' + UserID + ' class="index_li_head_img1" src="images/2222.jpg" />' +
											'<span class="index_li_head_span1 li_link">' + obj[i].NickName + '111</span>' +
											'<span class="index_li_head_span2 li_link_time">' + toolkit.getDateDiff(Date.parse(obj[i].CreateTime)) + '</span>' +
											'<a  class="index_li_head_img2_a mui-icon mui-icon-arrowdown" href="#topPopover"></a>' +
											'</div>' +
											'<div class="index_li_title li_link">' + obj[i].Content + '</div>' +
											'<div class="index_li_location">' +
											'<span class="mui-icon iconfont icon-like icon-map"></span>' +
											'<span>蛇口创业壹号</span>' +
											'</div>' +
											'<div class="index_li_foot">';

										if(HasFond == 1) {
											li_html +=
												'<button id="li_love" type="button" class="mui-icon iconfont  icon-like index_li_foot_love icon-like_y"  style="color:red;"> <span class="li_love">' + obj[i].DynamicTimes.FondTimes + '</span></button>';
										} else {
											li_html +=
												'<button  id="li_love" type="button" class="mui-icon iconfont  icon-like index_li_foot_love"> <span class="li_love">' + obj[i].DynamicTimes.FondTimes + '</span></button>';
										}

										li_html += '<button type="button" class="mui-icon iconfont icon-comment index_li_foot_comment"> ' + obj[i].DynamicTimes.CommentTimes + '</button>' +
											'<a href="#index_share"> <button id="li_share" type="button" class="mui-icon iconfont icon-Share index_li_foot_share"> ' + obj[i].DynamicTimes.ShareTimes + '</button></a>' +
											'</div>';

										li.innerHTML = li_html;

										table.appendChild(li);
									}

									if(i == obj.length - 1) {
										time = Date.parse(obj[i].CreateTime) / 1000;
										//alert(lastTime);
									}
								}
						
							*/

							for(var i = 0; i < obj.length; i++) {
								//清空li_html
								li_html = "";
								li = document.createElement('li');
								li.className = 'mui-table-view-cell cell_lick';
								DynamicID = obj[i].DynamicID;
								HasFond = obj[i].HasFond;
								//alert(sId)
								li.id = "tab1_" + DynamicID;
								UserID = obj[i].UserID;
								DynamicTimes = obj[i].DynamicTimes;
								// alert(UserID)
								li_html += '' +
									'<div class="index_li_head">' +
									'<img   id=' + UserID + ' class="index_li_head_img1" src="'+obj[i].HeadIconPath+'" />' +
									'<span class="index_li_head_span1 li_link">' + obj[i].NickName + '</span>' +
									'<span class="index_li_head_span2 li_link_time">' + toolkit.getDateDiff(Date.parse(obj[i].CreateTime)) + '</span>' +
									'<a  class="index_li_head_img2_a mui-icon mui-icon-arrowdown" href="#topPopover"></a>' +
									'</div>' +
									'<div class="index_li_title li_link">' + obj[i].Content + '</div>';

								li_html += '</div>' +
									'<div class="index_li_location">' +
									'<span class="mui-icon iconfont icon-like icon-map"></span>' +
									'<span>蛇口创业壹号</span>' +
									'</div>' +
									'<div class="index_li_foot" >';

								li.innerHTML = li_html;
								table.appendChild(li);

								if(i == obj.length - 1) {
									time = Date.parse(obj[i].CreateTime) / 1000;
									//alert(lastTime);
								}

							}

						}
					}
				});

				//设置图片宽高
				toolkit.setImageSize();

			}, 1500);
		}

		//设置图片宽高
		toolkit.setImageSize();

		mui.ready(function() {

			setTimeout(function() {
				mui('#pullrefresh').pullRefresh().pullupLoading();
			}, 1000);

			//=====全部页面ul li 帖子点击事件================================================================
			/*mui(".mui-table-view").on('tap', '.li_link', function(ev) {
				//事件委托 
				var ev = ev || window.event;
				var target = ev.target || ev.srcElement;

				//alert(2)

				if(target.nodeName.toLocaleLowerCase() == "img") {
					return true;
				}

				mui.openWindow({
					url: 'postdetail.html',
					id: 'postdetail',
					show: {
						autoShow: false,
					}
				});

			});

*/
			//=====全部页面ul li 帖子点击事件================================================================
			mui(".mui-table-view").on('tap', '.index_li_head', function(ev) {
				//事件委托 
				var ev = ev || window.event;
				var target = ev.target || ev.srcElement;

				DynamicID = this.parentNode.getAttribute("id");
				//alert(DynamicID)
				DynamicID = DynamicID.match(/\_(\d+)/);
				DynamicID = DynamicID[1];
				UserID = this.children[0].getAttribute("id");

				//alert(UserID + "====" + myId)
				if(UserID == myId) {
					//alert(document.getElementById("topPopover"))
					li_delete.style.display = "block";
					topPopover.style.height = "150px";
				} else {
					li_delete.style.display = "none";
					topPopover.style.height = "100px";
				}

				//点击头像
				if(target.className.toLocaleLowerCase() == "index_li_head_img1") {
					//UserID = this.children[0].children[0].getAttribute("id");
					//alert("head===" + UserID)
					localStorage.setItem("userId", UserID);
					mui.openWindow({
						url: 'homePage.html',
						id: UserID,
						show: {
							autoShow: false,
						},
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
					//console.log(result_array.length)
					for(var i = 0; i < result_array.length; i++) {
						if(result_array[i].DynamicID == DynamicID) {
							//alert(result_array[i].HasCollect)
							if(result_array[i].HasCollect == "1") {
								collection_text.innerText = "已收藏";
							}
						}
					}
					return true;
				}

				//alert("li==" + DynamicID)
				localStorage.setItem("dynamicId", DynamicID);
				localStorage.setItem("myId", myId);

				mui.openWindow({
					url: 'detailcomment.html',
					id:'detailcomment',
					show: {
						autoShow: false,
					},
				});

			});

			//==================点击其他用户的头像================================================
			mui(".mui-table-view").on('tap', '.index_li_head_img1', function() {
				//alert(1)
				mui.openWindow({
					url: 'homepage.html',
					id: 'homepage'
				});
			});

			//===================跳转粉丝页面==========
			document.querySelector(".fans").addEventListener("tap", function() {
				localStorage.setItem("myId", myId);
				mui.openWindow({
					url: 'myfans.html',

				});
			});

			//===================跳转关注页面==========
			document.querySelector(".attention").addEventListener("tap", function() {
				localStorage.setItem("myId", myId);
				mui.openWindow({
					url: 'myattentions.html',
				});
			});

			//============举报==================================================

			var index_report_li = document.querySelector(".index_report_li");

			index_report_li.addEventListener("tap", function() {
				localStorage.setItem("dynamicId", DynamicID);
				localStorage.setItem("myId", myId);
				mui('#topPopover').popover('hide');

				mui.openWindow({
					url: 'report_comment.html',
				});

			});

			//=================喜欢跳转======================
			document.querySelector(".homePage_love").addEventListener("tap", function() {

				localStorage.setItem("myId", myId);

				mui.openWindow({
					url: 'myloves.html',
				});

			});

			//=================评论跳转======================
			document.querySelector(".homePage_comment").addEventListener("tap", function() {
				localStorage.setItem("myId", myId);
				mui.openWindow({
					url: 'mycomments.html',
				});
			});

			//=================收藏跳转======================
			document.querySelector(".homePage_collect").addEventListener("tap", function() {
				localStorage.setItem("myId", myId);
				mui.openWindow({
					url: 'mycollections.html',

				});
			});

			//=================跳转person_data======================
			document.getElementById("homepage_head").addEventListener("tap", function() {
				localStorage.setItem("myId", myId);
				mui.openWindow({
					url: 'personalinfo.html',
				});

			});

			//回复跳转
			mui(".mui-table-view").on('tap', '.index_li_foot_comment', function() {
				userId = this.parentNode.getAttribute("id");
				localStorage.setItem("userId", userId);
				mui.openWindow({
					url: 'detailcomment.html',
					id: 'detailcomment'
				});
			});

		});

		//点击喜欢按钮
		mui(".mui-table-view").on("tap", ".index_li_foot_love", self.clickLoveSwitch);

		//吐司
		document.getElementById("Collection").addEventListener("tap", self.clickCollection);
		//删除弹出窗口
		document.getElementById("delete-btn").addEventListener('tap', self.clickDeleteBtn);

		//分享
		document.getElementById("li_share1").addEventListener("tap", self.clickShareWei);
		document.getElementById("li_share2").addEventListener("tap", self.clickSharePeng);
		document.getElementById("li_share3").addEventListener("tap", self.clickShareQQ);
		document.getElementById("li_share4").addEventListener("tap", self.clickShareQQKong);

	}

	/***
	 * 点击喜欢事件
	 */
	HomePage.prototype.clickLoveSwitch = function() {

		var str = "";

		console.log(this.classList);
		for(var i = 0; i < this.classList.length; i++) {
			str += this.classList[i];
		}

		li_love = this.children[0];
		var li = this.parentNode.parentNode;
		userId = this.parentNode.getAttribute("id");
		//alert(userId)

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

			toolkit.sendPost(config.serverBaseUrl + "/dynamic/markLike", info, function(err,result ) {
				if(err) {
					alert("错误")
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
			li_love.style.color = "#999999";
			count_love = parseInt(li_love.innerText) + 1;
			li_love.innerText = count_love;

		} else {

			var info = {
				"userId": myId,
				"paramsJSON": JSON.stringify({
					dynamicId: DynamicID, //帖子的ID
					beLike: false,
					beLikeUserId: userId
				})
			};

			//alert(config.serverBaseUrl)
			toolkit.sendPost(config.serverBaseUrl + "/dynamic/markLike", info, function(err, result) {
				if(err) {
					alert("错误")
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
			count_love = parseInt(li_love.innerText) - 1;
			li_love.innerText = count_love;

		}
	}

	/**
	 * 点击收藏
	 */
	HomePage.prototype.clickCollection = function() {
		// alert(DynamicID  +"======="+  UserID)

		var info = {
			"userId": myId,
			"dynamicId": DynamicID
		};

		//alert(collection_text.innerText)
		if(collection_text.innerText == "已收藏") {

			toolkit.sendPost(config.serverBaseUrl + "/collect/cancelCollect", info, function(err, result) {
				if(err) {
					alert("错误")
					throw err;
				} else {
					var obj = JSON.parse(result);
					console.log(obj.errCode + "===" + obj.errMsg);

					collection_text.innerText = "收藏";
					mui.toast('取消收藏');
					mui('#topPopover').popover('toggle');
					for(var i = 0; i < result_array.length; i++) {
						if(result_array[i].DynamicID == DynamicID) {
							//alert(result_array[i].HasCollect)
							result_array[i].HasCollect = 0;
						}
					}

				}

			});
			//alert(config.serverBaseUrl)
		} else {

			toolkit.sendPost(config.serverBaseUrl + "/collect/addCollect", info, function(err, result) {
				if(err) {
					alert("错误")
					throw err;
				} else {
					var obj = JSON.parse(result);
					console.log(obj.errCode + "===" + obj.errMsg);
					collection_text.innerText = "已收藏";
					mui.toast('已收藏');
					mui('#topPopover').popover('toggle');

					for(var i = 0; i < result_array.length; i++) {
						if(result_array[i].DynamicID == DynamicID) {
							//alert(result_array[i].HasCollect)
							result_array[i].HasCollect = 1;
						}
					}

				}

			});

		}

	}

	/**
	 * 点击举报事件
	 */
	HomePage.prototype.clickReport = function() {
		//alert(DynamicID)
		localStorage.setItem("dynamicId", DynamicID);
		localStorage.setItem("myId", myId);

		mui.openWindow({
			url: 'report.html',
		});

	}

	/**
	 * 点击删除
	 */
	HomePage.prototype.clickDeleteBtn = function() {
		mui('#topPopover').popover('toggle');
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

					alert(myId + "====" + DynamicID)

					var info = {
						"userId": myId,
						"dynamicId": DynamicID
					};

					toolkit.sendPost(config.serverBaseUrl + "/dynamic/deleteDynamic", info, function(err, result) {
						if(err) {
							alert("错误")
							throw err;
						} else {
							var obj = JSON.parse(result);
							alert(obj.errCode + "===" + obj.errMsg);
							if(obj.errCode == 0) {
								//alert(document.getElementById("tab1_" + DynamicID))
								document.getElementById("tab1_" + DynamicID).style.display = "none";
							} else {
								mui.alert("删除失败！");
							}
						}

					});

					break;
			}

		});

	}

	/**
	 * 跳转主页面
	 */
	HomePage.prototype.clickHomepage = function() {
		localStorage.setItem("myId", myId);
		mui.openWindow({
			url: 'homepage.html',

		});
	}

	module.exports = new HomePage();

});