//所有模块都通过 define 来定义
define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");
	var count = 0;
	var self = null;
	var userId,time;
	var myId = localStorage.getItem("myId") * 1;
	var DynamicID, count_love,selfShare;
	var result_array = new Array();
	var collection_text = document.getElementById("hint_collection");
	var flag = 1;
	/**
	 * 主逻辑处理类
	 */
	function HotPost() {
		self = this;
		this.init();
		self.bindEvent();
	}
	/**
	 * 初始化函数
	 */
	HotPost.prototype.init = function() {
		//mui初始化
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
		/*	mui('body').on('tap', 'a', function() { document.location.href = this.href; });*/
		//图片预览
		mui.previewImage();
		//设置图片宽高
		toolkit.setImageSize();
		//		if(mui.os.plus){
		//			mui.plusReady(function() {
		//					self.initData();
		//					//关闭等待框
		//					plus.nativeUI.closeWaiting();
		//					//显示当前页面
		//					mui.currentWebview.show();
		//				});
		//			}else{
		//					self.initData();
		//		}

	}
	/**
	 * 事件绑定处理函数
	 */
	HotPost.prototype.bindEvent = function() {
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
		//点击帖子正文跳转到详情页
		mui("body").on('tap', ".index_li_title", function() {
			var dynamicId = this.parentNode.firstChild.getAttribute("id");
			localStorage.setItem("dynamicId", dynamicId);
			mui.openWindow({
				url: 'detailcomment.html',
			});
		});
		//下拉框点击事件
		mui("body").on("tap", ".mui-icon-arrowdown", function() {
			DynamicID = this.parentElement.getAttribute("id") * 1;
			for(var i = 0; i < result_array.length; i++) {
				if(result_array[i].DynamicID == DynamicID) {
					//alert(result_array[i].HasCollect)
					if(result_array[i].HasCollect == "1") {
						collection_text.innerText = "已收藏";
					} else {
						collection_text.innerText = "收藏";
					}
				}
			}
		});
		//点击评论
		mui("body").on("tap", ".index_li_foot_comment", function() {
			var dynamicId = this.parentNode.parentNode.firstChild.getAttribute("id");
			localStorage.setItem("dynamicId", dynamicId);
			localStorage.setItem("myId", myId);
			mui.openWindow({
				url: 'detailcomment.html',
			});
		});
		//收藏弹出窗口
		document.getElementById("Collection").addEventListener("tap", self.clickCollection);
		//删除弹出窗口
		document.getElementById("delete-btn").addEventListener('tap', self.clickDeleteBtn);
		//下拉框举报点击事件
		document.getElementById("index_report_li").addEventListener("tap", self.clickReport);
	}
	/**
	 * 初始化加载数据
	 */
	HotPost.prototype.initData = function() {
		var info = {
			reqType: 2,
			startRow: flag
		}
		var table = document.body.querySelector('.mui-table-view');
		var cells = document.body.querySelectorAll('.mui-table-view-cell');

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
						var li = document.createElement('li');
						li.className = 'mui-table-view-cell';
						li.id = obj[i].UserID;
						li.innerHTML = '' +
							'<div id="' + obj[i].DynamicID + '" class="index_li_head">' +
							'<img id="index_li_head_img1" class="index_li_head_img1" src="images/2222.jpg" />' +
							'<span id="head-user-name" class="index_li_head_span1 li_link">' + obj[i].NickName + '</span>' +
							'<span class="index_li_head_span2 li_link">' + toolkit.getDateDiff(Date.parse(obj[i].CreateTime)) + '</span>' +
							'<a class="index_li_head_img2_a mui-icon mui-icon-arrowdown" style="display:inline-block; z-index: 10;" href="#topPopover"></a>' +
							'</div>' +
							'<div class="index_li_title li_link">' + obj[i].Content + '</div>'
						if(obj[i].PicturePath) {
							PicturePath_arr = JSON.parse(obj[i].PicturePath);
							var div = document.createElement('div');
							div.className = 'index_li_img li_link';
							div.id = 'index_li_img'; 
							for (var j = 0;j<PicturePath_arr.length;j++) {
								div.innerHTML+=
								'<img class="index_li_img_son" src="'+PicturePath_arr[j].picUrl+'" data-preview-src="" data-preview-group="1" />'
							}
							li.appendChild(div)
						}
						li.innerHTML +=
							'<div class="index_li_location">' +
							'<span class="mui-icon iconfont icon-like icon-map"></span>' +
							'<span>蛇口创业壹号</span>' +
							'</div>'
						table.appendChild(li);
						toolkit.setImageSize();
						
						if(i == obj.length - 1) {
							flag+=10;
						}
					}
				}
			}
		});
	}
	/**
	 * 上拉加载刷新数据
	 */
	HotPost.prototype.pullupRefresh = function() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //参数为true代表没有更多数据了。
			self.initData();
		},500)
	}
	/**
	 * 点击收藏
	 */
	HotPost.prototype.clickCollection = function() {
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
	 * 下拉弹出框删除点击事件
	 */
	HotPost.prototype.clickDeleteBtn = function() {
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
						alert("错误")
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
	 * 点击举报事件
	 */
	HotPost.prototype.clickReport = function() {
		//alert(DynamicID)
		localStorage.setItem("dynamicId", DynamicID);
		localStorage.setItem("myId", myId);

		mui.openWindow({
			url: 'report.html',
		});

	}

	module.exports = new HotPost();
});