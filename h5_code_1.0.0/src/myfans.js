// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");
	var count = 0;
	var self = null;
	var userId, time;
	var myId = localStorage.getItem("myId") * 1;

	function MyFans() {
		self = this;
		this.init();
	}

	MyFans.prototype.init = function() {
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
		//监听输入框
		document.getElementById("searchs").addEventListener('input', self.search);
		//关注事件
		mui(".mui-table-view").on('tap', '.attention', self.addFocusAndCancelFocus);
	}

	/**
	 * 上拉加载具体业务实现
	 */
	time = Date.parse(new Date()) / 1000;
	MyFans.prototype.initData = function() {
		var info = {
			userId: myId,
			flagTime: time
		}
		var table = document.body.querySelector('.mui-table-view');
		var cells = document.body.querySelectorAll('.mui-table-view-cell');
		toolkit.sendPost(config.fdhUrl + "/relation/reqFansData", info, function(err, result) {
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
						li.className = 'mui-table-view-cell';
						li.id = obj[i].FansUserInfo.UserID;
						li.innerHTML = '' +
							'<div style="position:relative;">' +
							'<img  class="attetion_img" src="' + obj[i].HeadIconPath + '" />' +
							'<span class="attetion_text1">' + obj[i].FansUserInfo.NickName + '</span>' +
							'<span class="attetion_text2">' + obj[i].FansUserInfo.Signature + '</span>'
						if(obj[i].HasFocus) {
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

				}
			}
		});
	}

	/**
	 * 点击关注用户的头像
	 */
	MyFans.prototype.topHead = function() {
		userId = this.parentNode.parentNode.getAttribute("id");
		localStorage.setItem("userId", userId);
		mui.openWindow({
			url: 'homepage.html',
			id: 'homepage'
		});
	}
	/**
	 * 上拉刷新
	 */
	MyFans.prototype.pullupRefresh = function() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //参数为true代表没有更多数据了。
			self.initData();
		}, 500)
	}
	/**
	 * 点击搜索框
	 */
	MyFans.prototype.search = function() {
		var find = this.value;
		var info = {
			userId: myId,
			findName: find,
			findFlag: 1
		}
		var table = document.body.querySelector('.mui-table-view');
		var cells = document.body.querySelectorAll('.mui-table-view-cell');
		toolkit.sendPost(config.fdhUrl + "/relation/findUser", info, function(err, result) {
			if(err) {
				throw err
			} else {
				var obj = JSON.parse(result);
				console.log(obj);
				if(find == "") {
					time = Date.parse(new Date()) / 1000;
					table.innerHTML = "";
					self.initData();
				} else {
					for(var i = 0; i < obj.length; i++) {
						var li = document.createElement('li');
						li.className = 'mui-table-view-cell';
						li.id = obj[i].FocusUserInfo.UserID;
						li.innerHTML = '' +
							'<div style="position:relative;">' +
							'<img  class="attetion_img" src="images/2222.jpg" />' +
							'<span class="attetion_text1">' + obj[i].FocusUserInfo.NickName + '</span>' +
							'<span class="attetion_text2">' + obj[i].FocusUserInfo.Signature + '</span>'
						if(obj[i].HasFocus) {
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
						table.innerHTML = "";
						table.appendChild(li);
					}

				}
			}
		});
	}
	/**
	 * 加关注取消关注事件响应
	 */
	MyFans.prototype.addFocusAndCancelFocus = function() {
		var a = this.lastElementChild;
		var b = this.firstElementChild;
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
							}
						}
					});
				}
			})
		}
	}
	module.exports = new MyFans();
});