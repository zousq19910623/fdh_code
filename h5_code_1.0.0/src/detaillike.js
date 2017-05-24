define(function(require, exports, module) {
	//	var line = require("./lineChart");
	var toolkit = require("./toolkit");
	var config = require("./config");
	var self = null;
	var index = 0;
	var likeList = JSON.parse(localStorage.getItem("likeList"));
	console.log(likeList);
	DetailLike.prototype.webview = null;
	var table = mui("#likeList")[0];
	function DetailLike(){
		self = this;
		this.init();
	}
	
	/**
	 * mui初始化
	 */
	DetailLike.prototype.init = function(){
		
		mui('.mui-scroll-wrapper').scroll({
			deceleration: 0.0002 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});
		self.loadLike();
		mui("#likeList").on("tap",".like-item",function(){
				var UserID = this.getAttribute("userId");
				localStorage.setItem("userId", UserID);
				mui.openWindow({
					url: 'homePage.html'
				});
			})
		mui.init({
			pullRefresh : {
				container: '#pullrefresh',
				up: {
					contentrefresh: '正在加载...',
					callback: self.pullupRefresh
				}
			}
		});
	
		
		
	};
	
	/**
	 * 喜欢样式
	 * @param {Object} obj
	 */
	DetailLike.prototype.createLikeDom = function(obj){
		var li = document.createElement('li');
		li.className = "mui-table-view-cell like-item";
		li.userId = obj.UserID;
		li.innerHTML = '<img src="'+ obj.HeadIconPath +'" />' + 
			'<a>'+ obj.NickName +'</a>';
		return li;
	}
	
	
	DetailLike.prototype.loadLike = function () {
		//深度遍历，生成DOM控件
		var i;
		for(i=0 ;i <likeList.length ; i++){
			//var comment = commentList[likeList[i+index]];
			var dom = self.createLikeDom(likeList[i]);
			table.appendChild(dom);
		}
//		index += i;
	}
	
	
	
	/**
	 * 上拉加载具体业务实现
	 */
	DetailLike.prototype.pullupRefresh = function() {
		setTimeout(function() {
			self.loadLike();
			mui('#pullrefresh').pullRefresh().endPullupToRefresh((index > likeList.length)); //参数为true代表没有更多数据了。
		}, 1500);
	}
	

	
	
	
	module.exports = new DetailLike();
});