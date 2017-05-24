define(function(require, exports, module) {
    	var id_array = new Array();
        
    /**
	 * li的点击事件
	 */
	exports.clickLi = function(ev) {
		//事件委托 
		var ev = ev || window.event;
		var target = ev.target || ev.srcElement;
        alert(li.getAttribute("id"))

		if(target.nodeName.toLocaleLowerCase() == "img") {
			return true;
		}

		mui.openWindow({
			url: 'invitation_detail.html',
			id: 'invitation_detail',
			show: {
				autoShow: false,
			}
		});

	}
	/**
	 * 点击喜爱按钮
	 */
   exports.clickLoveSwitch = function() {
		li_love = this.children[0];
		var li = this.parentNode.parentNode;
		button_id = li.getAttribute("id")
		//alert(button_id)

		if(!id_array.in_array(button_id)) {
			isClick = false;
		}

		for(var i = 0; i < id_array.length; i++) {
			if(id_array[i][0] == button_id) {
				//alert(id_array[i][1])
				isClick = id_array[i][1];
			}
		}

		if(isClick == false) {
			this.style.color = "red";
			li_love.style.color = "#999999";
			count_love = parseInt(li_love.innerText) + 1;
			li_love.innerText = count_love;
			this.classList.add("icon-like_y");
			button_id = li.getAttribute("id");
			isClick = true;
		} else {
			li_love = this.children[0];
			count_love = parseInt(li_love.innerText) - 1;
			li_love.innerText = count_love;
			this.classList.remove("icon-like_y");
			this.style.color = "#999999";
			isClick = false;
		}
		if(id_array.in_array(button_id)) {
			for(var i = 0; i < id_array.length; i++) {
				//alert(id_array[i])
				if(id_array[i][0] == button_id) {
					id_array[i][1] = isClick;
				}
			}
		} else {
			id_array.push([button_id, isClick]);
		}

	}
	/**
	 * 点击喜爱
	 */
	exports.clickLove=function () {
		var a=this;
		var b=this.firstElementChild
		var c=this.firstElementChild.innerText*1;
		if(a.className==="mui-icon iconfont icon-like_y index_li_foot_love"){
			a.className="mui-icon iconfont icon-like index_li_foot_love";
			c--;
			b.innerText=c;
		}else{
            a.className="mui-icon iconfont icon-like_y index_li_foot_love"
			c++;
			b.innerText=c;
		}
	}
	/**
	 * 点击分享微博
	 */
	exports.clickShareWei = function(id) {
		mui('#index_share').popover('toggle');
		alert(1)
	}

	/**
	 * 点击分享朋友圈
	 */
	exports.clickSharePeng = function() {
		mui('#index_share').popover('toggle');
		alert(1)
	}

	/**
	 * 点击分享QQ
	 */
	exports.clickShareQQ = function() {
		mui('#index_share').popover('toggle');
		alert(1)
	}

	/**
	 * 点击分享QQ空间
	 */
	exports.clickShareQQKong = function() {
		mui('#index_share').popover('toggle');
		alert(1)
	}

	/**
	 * 点击收藏
	 */
	exports.clickCollection = function() {
		mui.toast('已收藏');
		mui('#topPopover').popover('toggle');
	}

	/**
	 * 点击删除
	 */
	exports.clickDeleteBtn = function() {
		mui('#topPopover').popover('toggle');
		var btnArray = [{ title: "删除信息", style: "destructive" }];
		plus.nativeUI.actionSheet({
			cancel: "取消",
			buttons: btnArray
		}, function(e) {
			var index = e.index;
			var text = "你刚点击了\"";
			switch(index) {
				case 0:
					text += "取消";
					break;
				case 1:
					text += "删除信息";
					break;
			}
			info.innerHTML = text + "\"按钮";
		});
	}
	/**
	 * 点击跳转头像跳转到我的主页
	 */
	exports.clickHeadImg=function () {
		mui.openWindow({
			url: 'homepage.html',
			id: 'homepage'
		});
	}
	/**
	 * 点击帖子正文跳转到帖子详情页
	 */
	exports.clickPostText=function () {
		mui.openWindow({
			url: 'homepage.html',
			id: 'homepage'
		});
	}
	/**
	 * 点击删除帖子事件
	 */
	exports.clickDeletePost=function () {
		document.getElementById('post-id-two').remove();
	}
});