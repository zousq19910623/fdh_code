//所有模块都通过 define 来定义
define(function(require, exports, module) {
	//	var line = require("./lineChart");
	var toolkit = require("./toolkit");
	var config = require("./config");
	var count = 0;
	var self = null;
	var userId, time;
	var myId = localStorage.getItem("myId") * 1;
	var DynamicID, selfShare, picturePathArray;
	var resultArray = new Array();
	var collectionText = document.getElementById("hint_collection");
	/**
	 * 主逻辑处理类
	 */
	function MyCollections() {
		self = this;
		this.init();
	};
	/**
	 * 初始化函数
	 */
	MyCollections.prototype.init = function() {
		//mui初始化
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
		//mui('body').on('tap', 'a', function() { document.location.href = this.href; });
		//图片预览
		mui.previewImage();
		//设置图片宽高
		toolkit.setImageSize();
		//绑定事件处理函数调用
		this.bindEvent();
	}
	/**
	 * 事件绑定处理函数
	 */
	MyCollections.prototype.bindEvent = function() {
		mui.plusReady(function() {
			var detailcomment = null;
			//点击帖子正文跳转到详情页
			mui("body").on('tap', ".index_li_title", function() {
				var dynamicId = this.parentNode.firstChild.getAttribute("id");
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
			});
			//点击帖子跳转到详情页
			mui("body").on('tap', ".index_li_head", function(ev) {
				var ev = ev || window.event;
				var target = ev.target || ev.srcElement;
				var aa = target.className.toLocaleLowerCase();
				if (aa!="index_li_head_img1"&&aa!="index_li_head_span1 li_link"&&aa!="index_li_head_img2_a mui-icon mui-icon-arrowdown") {
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
			});
			//点击评论
			mui("body").on("tap", ".index_li_foot_comment", function() {
				var dynamicId = this.parentNode.parentNode.firstChild.getAttribute("id");
				var beCommentUserId = this.getAttribute('userId')
				var beCommentName = this.getAttribute('commentName')
				var commentInfo = {
					beCommentUserId: beCommentUserId,
					beCommentName: beCommentName,
					dynamicId: dynamicId
				}
				localStorage.setItem("commentInfo", JSON.stringify(commentInfo));
				mui.openWindow({
					url: 'invitationcomment.html',
					id:'invitationcomment'
				});
			});
		})
		//删除帖子点击事件
		mui('.li_delete').on('tap', '.li_head_detele', toolkit.clickDeletePost);
		//点击用户头像跳转我的主页
		mui("body").on('tap', '.index_li_head_img1', function() {
			userId = this.parentNode.parentNode.getAttribute("id");
			localStorage.setItem("userId", userId);
			mui.openWindow({
				url: 'homepage.html',
				id: 'homepage',
			});
		});
		//点击用户名跳转我的主页
		mui("body").on('tap', ".index_li_head_span1", function() {
			userId = this.parentNode.parentNode.getAttribute("id");
			localStorage.setItem("userId", userId);
			mui.openWindow({
				url: 'homepage.html',
				id: 'homepage',
			});
		});
		//下拉框点击事件
		mui("body").on("tap", ".mui-icon-arrowdown", function() {
			DynamicID = this.parentElement.getAttribute("id") * 1;
			for(var i = 0; i < resultArray.length; i++) {
				if(resultArray[i].DynamicID == DynamicID) {
					if(resultArray[i].HasCollect == "1") {
						collectionText.innerText = "已收藏";
					} else {
						collectionText.innerText = "收藏";
					}
				}
			}
		});
		//分享点击事件
		mui("body").on("tap", ".index_li_foot_share", function() {
			selfShare = this;
		});
		//点击喜欢按钮
		mui("body").on("tap", ".index_li_foot_love", self.clickLove);
		//收藏
		document.getElementById("Collection").addEventListener("tap", self.clickCollection);
		//删除弹出窗口
		document.getElementById("delete-btn").addEventListener('tap', self.clickDeleteBtn);
		//分享到微信
		document.getElementById("li_share1").addEventListener("tap", self.clickShareWei);
		//分享到朋友圈
		document.getElementById("li_share2").addEventListener("tap", self.clickSharePeng);
		//分享到QQ
		document.getElementById("li_share3").addEventListener("tap", self.clickShareQQ);
		//分享到QQ空间
		document.getElementById("li_share4").addEventListener("tap", self.clickShareQQKong);
		//下拉框举报点击事件
		document.getElementById("index_report_li").addEventListener("tap", self.clickReport);
	}
	/**
	 * 初始化加载数据
	 */
	time = Date.parse(new Date()) / 1000;
	MyCollections.prototype.initData = function() {
		var info = {
			userId: myId,
			flagTime: time
		}
		var table = document.body.querySelector('.mui-table-view');
		var cells = document.body.querySelectorAll('.mui-table-view-cell');
		toolkit.sendPost(config.fdhUrl + "/collect/reqData", info, function(err, result) {
			if(err) {
				throw err
			} else {
				var obj = JSON.parse(result);
				console.log(obj);
				resultArray = obj;
				if(obj.errCode) {
					throw obj.errMsg;
				} else {
					for(var i = 0; i < obj.length; i++) {
						var li = document.createElement('li');
						li.className = 'mui-table-view-cell';
						li.id = obj[i].UserID;
						li.innerHTML +=
							'<div id="' + obj[i].DynamicID + '" class="index_li_head">' +
							'<img id="index_li_head_img1" class="index_li_head_img1" src="' + obj[i].HeadIconPath + '" />' +
							'<span id="head-user-name" class="index_li_head_span1 li_link">' + obj[i].NickName + '</span>' +
							'<span class="index_li_head_span2 li_link">' + toolkit.getDateDiff(Date.parse(obj[i].CollectTime)) + '</span>' +
							'<a class="index_li_head_img2_a mui-icon mui-icon-arrowdown" style="display:inline-block; z-index: 10;" href="#topPopover"></a>' +
							'</div>' +
							'<div class="index_li_title li_link">' + obj[i].Content + '</div>'
						if(obj[i].PicturePath) {
							picturePathArray = JSON.parse(obj[i].PicturePath);
							var div = document.createElement('div');
							div.className = 'index_li_img li_link';
							div.id = 'index_li_img';
							for(var j = 0; j < picturePathArray.length; j++) {
								div.innerHTML +=
									'<img class="index_li_img_son" src="' + picturePathArray[j].picUrl + '" data-preview-src="" data-preview-group="1" />'
							}
							li.appendChild(div)
						}
						li.innerHTML +=
							'<div class="index_li_location">' +
							'<span class="mui-icon iconfont icon-like icon-map"></span>' +
							'<span>蛇口创业壹号</span>' +
							'</div>'
						if(obj[i].HasFond == 0) {
							li.innerHTML +=
								'<div class="index_li_foot">' +
								'<button type="button" class="index_li_foot_love mui-icon iconfont icon-like"> <span class="love-number1">' + obj[i].DynamicTimes.FondTimes + '</span> </button>' +
								'<button type="button" class="mui-icon iconfont icon-comment index_li_foot_comment"><span class="love-number">' + obj[i].DynamicTimes.ReadTimes + '</span></button>' +
								'<a href="#index_share"> <button id="' + obj[i].DynamicID + '" type="button" class="mui-icon iconfont icon-Share index_li_foot_share"><span class="love-number">' + obj[i].DynamicTimes.ShareTimes + '</span></button></a>' +
								'</div>';
						} else {
							li.innerHTML +=
								'<div class="index_li_foot">' +
								'<button type="button" class="index_li_foot_love mui-icon iconfont icon-like_y"> <span class="love-number1">' + obj[i].DynamicTimes.FondTimes + '</span> </button>' +
								'<button commentName="' + obj[i].NickName + '" userId="' + obj[i].UserID + '" type="button" class="mui-icon iconfont icon-comment index_li_foot_comment"><span class="love-number">' + obj[i].DynamicTimes.ReadTimes + '</span></button>' +
								'<a href="#index_share"> <button id="' + obj[i].DynamicID + '" type="button" class="mui-icon iconfont icon-Share index_li_foot_share"><span class="love-number">' + obj[i].DynamicTimes.ShareTimes + '</span></button></a>' +
								'</div>';
						}

						table.appendChild(li);
						toolkit.setImageSize();

						if(i == obj.length - 1) {
							time = Date.parse(obj[i].CreateTime) / 1000;
						}
					}

				}
			}
		});
	}
	/**
	 * 上拉加载刷新数据
	 */
	MyCollections.prototype.pullupRefresh = function() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //参数为true代表没有更多数据了。
			self.initData();
		}, 500)
	}
	/**
	 * 点击喜欢
	 */
	MyCollections.prototype.clickLove = function() {
		var a = this;
		var b = this.firstElementChild
		var c = this.firstElementChild.innerText * 1;
		var li = this.parentNode.parentNode;
		beLikeUserId = li.getAttribute("id");
		DynamicID = li.firstChild.getAttribute("id");
		if(a.className === "index_li_foot_love mui-icon iconfont icon-like_y") {
			if(c > 0) {
				var info = {
					"userId": myId,
					"paramsJSON": JSON.stringify({
						dynamicId: DynamicID, //帖子的ID
						beLike: false,
						beLikeUserId: beLikeUserId
					})
				};
				toolkit.sendPost(config.fdhUrl + "/dynamic/markLike", info, function(err, result) {
					if(err) {
						throw err
					} else {
						var obj = JSON.parse(result);
						console.log(obj);
						if(obj.errCode == 1012) {
							a.className = "index_li_foot_love mui-icon iconfont icon-like";
							c--;
							b.innerText = c;
						}
					}
				});
			}
		} else {
			var info = {
				"userId": myId,
				"paramsJSON": JSON.stringify({
					dynamicId: DynamicID, //帖子的ID
					beLike: true,
					beLikeUserId: beLikeUserId
				})
			};
			toolkit.sendPost(config.fdhUrl + "/dynamic/markLike", info, function(err, result) {
				if(err) {
					throw err
				} else {
					var obj = JSON.parse(result);
					console.log(obj);
					if(obj.errCode == 1011) {
						a.className = "index_li_foot_love mui-icon iconfont icon-like_y"
						c++;
						b.innerText = c;
					}
				}
			});
		}

	}
	/**
	 * 点击收藏
	 */
	MyCollections.prototype.clickCollection = function() {
		var info = {
			"userId": myId,
			"dynamicId": DynamicID
		};
		if(collectionText.innerText == "已收藏") {

			toolkit.sendPost(config.serverBaseUrl + "/collect/cancelCollect", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					var obj = JSON.parse(result);
					console.log(obj.errCode + "===" + obj.errMsg);

					collectionText.innerText = "收藏";
					mui.toast('取消收藏');
					mui('#topPopover').popover('toggle');
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
					collectionText.innerText = "已收藏";
					mui.toast('已收藏');
					mui('#topPopover').popover('toggle');
					for(var i = 0; i < resultArray.length; i++) {
						if(resultArray[i].DynamicID == DynamicID) {
							//alert(resultArray[i].HasCollect)
							resultArray[i].HasCollect = 1;
						}
					}
				}

			});

		}

	}
	/**
	 * 下拉弹出框删除点击事件
	 */
	MyCollections.prototype.clickDeleteBtn = function() {
		mui('#topPopover').popover('toggle');
		var btnArray = [{
			title: "确认删除",
			style: "destructive"
		}];
		plus.nativeUI.actionSheet({
			cancel: "取消",
			buttons: btnArray
		}, function(e) {
			var index = e.index;
			if(index == 1) {
				var info = {
					userId: myId,
					dynamicId: DynamicID
				}
				toolkit.sendPost(config.serverBaseUrl + "/dynamic/deleteDynamic", info, function(err, result) {
					if(err) {
						throw err;
					} else {
						var obj = JSON.parse(result);
						console.log(obj.errCode + "===" + obj.errMsg);
						mui.toast('成功删除帖子');
						//mui('#topPopover').popover('toggle');
						document.getElementById(DynamicID).parentElement.remove();
					}

				});
			}
		});
	}

	/**
	 * 点击分享微信
	 */
	MyCollections.prototype.clickShareWei = function(id) {
		var dynamicId = selfShare.getAttribute("id")
		var shareNumber = selfShare.innerText
		var info = {
			userId: myId,
			dynamicId: dynamicId
		}
		toolkit.sendPost(config.fdhUrl + "/dynamic/shareDynamic", info, function(err, result) {
			if(err) {
				throw err
			} else {
				var obj = JSON.parse(result);
				console.log(obj);
				if(obj.errCode == 0) {
					mui.toast("分享成功")
					selfShare.innerText = ++shareNumber;
					mui('#index_share').popover('toggle');
				}
			}
		});
	}

	/**
	 * 点击分享朋友圈
	 */
	MyCollections.prototype.clickSharePeng = function() {
		var dynamicId = selfShare.getAttribute("id")
		var shareNumber = selfShare.innerText
		var info = {
			userId: myId,
			dynamicId: dynamicId
		}
		toolkit.sendPost(config.fdhUrl + "/dynamic/shareDynamic", info, function(err, result) {
			if(err) {
				throw err
			} else {
				var obj = JSON.parse(result);
				console.log(obj);
				if(obj.errCode == 0) {
					mui.toast("分享成功")
					selfShare.innerText = ++shareNumber;
					mui('#index_share').popover('toggle');
				}
			}
		});
	}

	/**
	 * 点击分享QQ
	 */
	MyCollections.prototype.clickShareQQ = function() {
		var dynamicId = selfShare.getAttribute("id")
		var shareNumber = selfShare.innerText
		var info = {
			userId: myId,
			dynamicId: dynamicId
		}
		toolkit.sendPost(config.fdhUrl + "/dynamic/shareDynamic", info, function(err, result) {
			if(err) {
				throw err
			} else {
				var obj = JSON.parse(result);
				console.log(obj);
				if(obj.errCode == 0) {
					mui.toast("分享成功")
					selfShare.innerText = ++shareNumber;
					mui('#index_share').popover('toggle');
				}
			}
		});
	}

	/**
	 * 点击分享QQ空间
	 */
	MyCollections.prototype.clickShareQQKong = function() {
		var dynamicId = selfShare.getAttribute("id")
		var shareNumber = selfShare.innerText
		var info = {
			userId: myId,
			dynamicId: dynamicId
		}
		toolkit.sendPost(config.fdhUrl + "/dynamic/shareDynamic", info, function(err, result) {
			if(err) {
				throw err
			} else {
				var obj = JSON.parse(result);
				console.log(obj);
				if(obj.errCode == 0) {
					mui.toast("分享成功")
					selfShare.innerText = ++shareNumber;
					mui('#index_share').popover('toggle');
				}
			}
		});
	}
	/**
	 * 点击举报事件
	 */
	MyCollections.prototype.clickReport = function() {
		localStorage.setItem("dynamicId", DynamicID);
		localStorage.setItem("myId", myId);

		mui.openWindow({
			url: 'report.html',
		});

	}

	module.exports = new MyCollections();
});