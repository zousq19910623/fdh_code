// 所有模块都通过 define 来定义
define(function(require, exports, module) {

	/**
	 * 创建HttpRequest对象
	 */
	function createXMLHttpRequest() {
		//定义了XMLHttpRequest对象
		var xmlrequest;
		if(typeof plus != "undefined"){
			xmlrequest = new plus.net.XMLHttpRequest();
		}
		else if(window.XMLHttpRequest) {
			//DOM 2浏览器
			xmlrequest = new XMLHttpRequest();
		} else if(window.ActiveXObject) {
			// IE浏览器
			try {
				xmlrequest = new ActiveXObject("Msxml2.XMLHTTP");
			} catch(e) {
				try {
					xmlrequest = new ActiveXObject("Microsoft.XMLHTTP");
				} catch(e) {}
			}
		}
		return xmlrequest;
	}

	/**
	 * 发送Post请求
	 * @param {Object} urlStr //Url地址
	 * @param {Object} data   //要发送的数据
	 * @param {Object} cb	  //回调函数
	 */
	exports.sendPost = function(urlStr, data, cb) {
		var xmlrequest = createXMLHttpRequest();
		if(!xmlrequest) {
			cb("Cann't create request!");
		} else {
			var dataStr = "";
			var bFirst = true;
			for(var key in data) {
				if(bFirst) {
					bFirst = false;
					dataStr = key + "=" + data[key];
				} else {
					dataStr = dataStr + "&" + key + "=" + data[key];
				}
			}

			//打开与服务器资源的连接
			xmlrequest.open("POST", urlStr, true);
			xmlrequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xmlrequest.withCredentials = true;

			//设置处理响应的回调函数
			xmlrequest.onreadystatechange = function processResponse() {
				//响应完成且响应正常
				if(xmlrequest.readyState == 4) {
					if(xmlrequest.status == 200) {
						var response = xmlrequest.responseText;
						cb(null, response);
					} else {
						//页面不正常
						cb("您所请求的页面有异常。" + xmlrequest.responseText);
					}
				}
			};
			//发送请求
			xmlrequest.send(dataStr);
		}
	}

	/**
	 * 获取地址栏参数
	 * @param {Object} name
	 */
	exports.GetQueryString = function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return unescape(r[2]);
		return null;
	}

	/**
	 * 保留2位小数，如：2，会在2后面补上00.即2.00
	 * @param {Object} s
	 */
	exports.toDecimal2 = function(s) {
		if(s >= 0) {
			if(Number.isInteger(s)) {
				s = s + ".00";
			} else {
				//只有一位小数的时候
				if(/^\d+(\.\d{1})$/.test(s)) {
					s = s + "0";
				} else {
					s = Number(s.toString().match(/^\d+(?:\.\d{0,2})?/));
					s = s + "";
					s = s.substring(0, s.indexOf(".") + 3);
				}
			}
		} else {
			s = Math.abs(s);
			if(Number.isInteger(s)) {
				s = "-" + s + ".00";
			} else {
				s = Number(s.toString().match(/^\d+(?:\.\d{0,2})?/));
				s = s + "";
				s = "-" + s.substring(0, s.indexOf(".") + 3);
			}
		}

		return s;
	}

	/** 
	 * 是否去除所有空格 
	 */

	exports.trim = function trim(str) {
		return str.replace(/^(\s|\xA0)+|(\s|\xA0)+$/g, '');
	}

	/**
	 * 数组去除重复的方法
	 * @param {Object} jsonList
	 */
	exports.unique = function(jsonList) {
		var hash = {};
		var result = [];
		for(var i = 0, len = jsonList.length; i < len; i++) {
			if(!hash[jsonList[i].DynamicID]) {
				result.push(jsonList[i]);
				hash[jsonList[i].DynamicID] = true;
			}
		}

		return result;
	}

	/**
	 * 九宫格图片宽高自适应
	 */

	exports.setImageSize = function() {
		//var ScreenWidth = window.screen.width;
		var ScreenWidth = document.body.offsetWidth;
		//alert(ScreenWidth)
		var img_height = ScreenWidth * 0.28;
		var nimei = exports.getElementsByClassName("index_li_img", "mui-table-view");
		var img_son, i = 0,
			j = 0;
		//alert(nimei.length)
		for(j = 0; j < nimei.length; j++) {
			img_son = nimei[j].querySelectorAll("img");
			for(i = 0; i < img_son.length; ++i) {
				img_son[i].style.height = img_height + "px";
			}
		}

	}

	/**
	 * 九宫格图片宽高自适应
	 */
	exports.getElementsByClassName = function(className, outid) {

		var oBox = document.getElementById(outid); //获取ID为outid的元素

		this.d = oBox || document; //检测oBox是否存在，如果不存在则把document赋予内部变量d

		var children = this.d.getElementsByTagName('*') || document.all; //获取页面所有元素

		var elements = new Array(); //定义一个数组，用于存储所得到的元素

		//获取元素的class为className的所有元素

		for(var i = 0; i < children.length; i++) {

			var child = children[i];

			var classNames = child.className.split(' ');

			for(var j = 0; j < classNames.length; j++) {
				if(classNames[j] == className) {
					elements.push(child); //如果class存在，则存入elements
					break;
				}
			}
		}
		return elements;
	}

	/**
	 * setImageSize 函数中引用
	 */
	exports.getElementsByClassName = function(className, outid) {

		var oBox = document.getElementById(outid); //获取ID为outid的元素

		this.d = oBox || document; //检测oBox是否存在，如果不存在则把document赋予内部变量d

		var children = this.d.getElementsByTagName('*') || document.all; //获取页面所有元素

		var elements = new Array(); //定义一个数组，用于存储所得到的元素

		//获取元素的class为className的所有元素

		for(var i = 0; i < children.length; i++) {

			var child = children[i];

			var classNames = child.className.split(' ');

			for(var j = 0; j < classNames.length; j++) {
				if(classNames[j] == className) {
					elements.push(child); //如果class存在，则存入elements
					break;
				}
			}
		}
		return elements;
	}

	exports.setImageSize2 = function() {
		//var ScreenWidth = window.screen.width;
		var ScreenWidth = document.body.offsetWidth;
		//alert(ScreenWidth)
		var img_height = ScreenWidth * 0.29;
		var nimei = exports.getElementsByClassName("index_li_img", "mui-table-view2");
		var img_son, i = 0,
			j = 0;
		//alert(nimei.length)
		for(j = 0; j < nimei.length; j++) {
			img_son = nimei[j].querySelectorAll("img");
			for(i = 0; i < img_son.length; ++i) {
				img_son[i].style.height = img_height + "px";
			}
		}
	}

	/**
	 * 获取相邻上下的元素
	 */
	exports.getNearEle = function(ele, type) {
		type = type == 1 ? "previousSibling" : "nextSibling";
		var nearEle = ele[type];
		while(nearEle) {
			if(nearEle.nodeType === 1) {
				return nearEle;
			}
			nearEle = nearEle[type];
			if(!nearEle) {
				break;
			}
		}
		return null;
	}

	/**
	 * 获取元素的样式
	 */
	exports.getDefaultStyle = function(obj, attribute) {
		return obj.currentStyle ? obj.currentStyle[attribute] : document.defaultView.getComputedStyle(obj, false)[attribute];
	}

	/**
	 * 去左右空格;
	 * @param {Object} s
	 */

	exports.trim = function trim(s) {
		return s.replace(/(^\s*)|(\s*$)/g, "");
	}

	/**
	 * 统计字符个数
	 * @param {Object} value
	 */

	exports.native2ascii = function native2ascii(value) {
		// console.log(value)
		var nativecode = value.split("");
		var len = 0;
		for(var i = 0; i < nativecode.length; i++) {
			var code = Number(nativecode[i].charCodeAt(0));
			if(code > 127) {
				len += 1;
			} else {
				len++;
			}
		}
		return len;
	}

	/**
	 * 截取字符串
	 * @param {Object} str
	 * @param {Object} len
	 */

	exports.cutString = function(str, len) {
		//length属性读出来的汉字长度为1
		if(str.length * 2 <= len) {
			return str;
		}
		var strlen = 0;
		var s = "";
		for(var i = 0; i < str.length; i++) {
			s = s + str.charAt(i);
			if(str.charCodeAt(i) > 128) {
				strlen = strlen + 2;
				if(strlen >= len) {
					return s.substring(0, s.length - 1) + "...";
				}
			} else {
				strlen = strlen + 1;
				if(strlen >= len) {
					return s.substring(0, s.length - 2) + "...";
				}
			}
		}
		return s;
	}

	/**
	 * 四宫格
	 * @param {Object} number
	 */
	exports.setImageSize4 = function(number) {
		var ScreenWidth = document.body.offsetWidth;
		//alert(ScreenWidth)
		var img_height = ScreenWidth * number;
		var nimei = exports.getElementsByClassName("invitation_comment_li", "mui-table-view");
		var apostrophe = document.querySelector(".apostrophe");
		apostrophe.style.lineHeight = img_height + "px";
		apostrophe.style.height = img_height + "px";
		var img_son, i = 0,
			j = 0;
		//alert(nimei.length)
		for(j = 0; j < nimei.length; j++) {
			img_son = nimei[j].querySelectorAll("img");
			for(i = 0; i < img_son.length; ++i) {
				img_son[i].style.height = img_height + "px";
			}
		}

	}

	/**
	 * 时间格式
	 */
	//JavaScript函数：
	var minute = 1000 * 60;
	var hour = minute * 60;
	var day = hour * 24;
	var halfamonth = day * 15;
	var month = day * 30;

	exports.getDateDiff = function (dateTimeStamp) {
		var now = new Date().getTime();
		var diffValue = now - dateTimeStamp;
		if(diffValue < 0) {
			//若日期不符则弹出窗口告之
			//alert("结束日期不能小于开始日期！");
		}
		var monthC = diffValue / month;
		var weekC = diffValue / (7 * day);
		var dayC = diffValue / day;
		var hourC = diffValue / hour;
		var minC = diffValue / minute;
		if(monthC >= 1) {
			result = parseInt(monthC) + "个月前";
		} else if(weekC >= 1) {
			result = parseInt(weekC) + "周前";
		} else if(dayC >= 1) {
			result = parseInt(dayC) + "天前";
		} else if(hourC >= 1) {
			result = parseInt(hourC) + "个小时前";
		} else if(minC >= 1) {
			result = parseInt(minC) + "分钟前";
		} else
			result = "刚刚发表";
		return result;
	}
	
	/**
	 * 获取字符串中的数字
	 */
	exports.getNum = function (text){
var value = text.replace(/[^0-9]/ig,""); 
return value;
}

	/**
	 * 判断二维数组中是否存在id
	 * @param {Object} e
	 */
	/*	Array.prototype.in_array = function(e) {
			var r = new RegExp(',' + e + ',');
			return(r.test(',' + this.join(this.S) + ','));
		};*/

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

	/***
	 * 点击喜欢事件
	 */
	exports.clickLoveSwitch = function() {
		var str = "";

		console.log(this.classList);
		for(var i = 0; i < this.classList.length; i++) {
			str += this.classList[i];
		}

		// alert(str)

		li_love = this.children[0];
		var li = this.parentNode.parentNode;
		button_id = li.getAttribute("id");

		button_id = button_id.match(/\_(\d+)/);

		button_id = button_id[1];

		if(str == "mui-iconiconfonticon-likeindex_li_foot_love") {

			var info = {
				"userId": 1,
				"paramsJSON": JSON.stringify({
					dynamicId: button_id, //帖子的ID
					beLike: true //喜欢(不喜欢)
				})

			};

			//alert(config.serverBaseUrl)
			exports.sendPost(config.serverBaseUrl + "/dynamic/markLike", info, function(err, result) {
				if(err) {
					alert("错误")
					throw err;
				} else {
					var obj = JSON.parse(result);
					if(obj.errCode) {
						alert(obj.errMsg);
					} else {
						var obj = JSON.parse(result);
						console.log(obj);
					}

				}

			});

			this.classList.add("icon-like_y");
			this.style.color = "red";
			li_love.style.color = "#999999";
			count_love = parseInt(li_love.innerText) + 1;
			li_love.innerText = count_love;

		} else {
			this.classList.remove("icon-like_y");
			this.style.color = "#999999";
			count_love = parseInt(li_love.innerText) - 1;
			li_love.innerText = count_love;

		}
	}

	/**
	 * 点击喜爱
	 */
	exports.clickLove = function() {
		var a = this;
		var b = this.firstElementChild
		var c = this.firstElementChild.innerText * 1;
		if(a.className === "mui-icon iconfont icon-like_y index_li_foot_love") {
			a.className = "mui-icon iconfont icon-like index_li_foot_love";
			c--;
			b.innerText = c;
		} else {
			a.className = "mui-icon iconfont icon-like_y index_li_foot_love"
			c++;
			b.innerText = c;
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
	 * 点击跳转头像跳转到我的主页
	 */
	exports.clickHeadImg = function() {
		mui.openWindow({
			url: 'homepage.html',
			id: 'homepage'
		});
	}
	
	/**
	 * 点击删除帖子事件
	 */
	exports.clickDeletePost = function() {
		document.getElementById('post-id-two').remove();
	}

	

});