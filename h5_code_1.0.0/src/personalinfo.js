define(function(require, exports, module) {
	//	var line = require("./lineChart");
	var toolkit = require("./toolkit");
	var config = require("./config");
	var openId = toolkit.GetQueryString("openId");
	var tel = toolkit.GetQueryString("tel");
	var self = null;
	var change2 = document.getElementById("change2");
	var change1 = document.getElementById("change1");
	var changeInput2 = document.getElementById("changeInput2");
	var changeInput = document.getElementById("changeInput");
	var back2 = document.getElementById("back2");
	var back1 = document.getElementById("back1");
	var myId = localStorage.getItem("myId");
	var saveNickName;
	var saveSignature;
	function PersonalInfo() {
		self = this;
		this.init();
		self.bindEvent();
	}
	/**
	 * mui初始化
	 */
	PersonalInfo.prototype.init = function() {
		//个人资料页面数据初始化
		var userInfo = JSON.parse(localStorage.post_detail);
		console.log(userInfo);
		document.getElementById("head-img1").setAttribute("src",userInfo.HeadIconPath);
		mui("#change1 .mui-pull-right")[0].innerHTML=userInfo.NickName+"<span class='mui-icon mui-icon-forward'></span>";
		document.getElementById("sexResult").innerText=userInfo.Sex==1?"男":"女";
		var a = new Date();
		document.getElementById("ageResult").innerText=a.getFullYear()-userInfo.BirthDay.slice(0,4);
		mui("#change2 .mui-pull-right")[0].innerHTML=userInfo.Signature+"<span class='mui-icon mui-icon-forward'></span>";
		document.getElementById("cityResult").innerText = userInfo.Address;
		//mui初始化
		mui.init();
		//B页面onload从服务器获取列表数据；
		window.onload = function() {
			//从服务器获取数据

			//业务数据获取完毕，并已插入当前页面DOM；

			//注意：若为ajax请求，则需将如下代码放在处理完ajax响应数据之后；
			mui.plusReady(function() {

				var self = plus.webview.currentWebview();
				var id = self.id;

				//关闭等待框
				plus.nativeUI.closeWaiting();
				//显示当前页面
				mui.currentWebview.show();

				//更换头像
				mui(".mui-table-view-cell").on("tap", "#head", function(e) {
					if(mui.os.plus) {
						var a = [{
							title: "拍照"
						}, {
							title: "从手机相册选择"
						}];
						plus.nativeUI.actionSheet({
							title: "修改头像",
							cancel: "取消",
							buttons: a
						}, function(b) {
							switch(b.index) {
								case 0:
									break;
								case 1:
									getImage();
									break;
								case 2:
									galleryImg();
									break;
								default:
									break
							}
						})
					}

				});

				function getImage() {
					var c = plus.camera.getCamera();
					c.captureImage(function(e) {
						plus.io.resolveLocalFileSystemURL(e, function(entry) {
							var s = entry.toLocalURL() + "?version=" + new Date().getTime();
							console.log(s);
							//document.getElementById("head-img").src = s;
							document.getElementById("head-img1").src = s;
							//变更大图预览的src
							//目前仅有一张图片，暂时如此处理，后续需要通过标准组件实现
							document.querySelector("#__mui-imageview__group .mui-slider-item img").src = s + "?version=" + new Date().getTime();;;
						}, function(e) {
							console.log("读取拍照文件错误：" + e.message);
						});
					}, function(s) {
						console.log("error" + s);
					}, {
						filename: "_doc/head.jpg"
					})
				}
				function galleryImg() {
					plus.gallery.pick(function(a) {
						plus.io.resolveLocalFileSystemURL(a, function(entry) {
							plus.io.resolveLocalFileSystemURL("_doc/", function(root) {
								root.getFile("head.jpg", {}, function(file) {
									//文件已存在
									file.remove(function() {
										console.log("file remove success");
										entry.copyTo(root, 'head.jpg', function(e) {
												var e = e.fullPath + "?version=" + new Date().getTime();
												//document.getElementById("head-img").src = e;
												document.getElementById("head-img1").src = e;
												//变更大图预览的src
												//目前仅有一张图片，暂时如此处理，后续需要通过标准组件实现
												document.querySelector("#__mui-imageview__group .mui-slider-item img").src = e + "?version=" + new Date().getTime();;
											},
											function(e) {
												console.log('copy image fail:' + e.message);
											});
									}, function() {
										console.log("delete image fail:" + e.message);
									});
								}, function() {
									//文件不存在
									entry.copyTo(root, 'head.jpg', function(e) {
											var path = e.fullPath + "?version=" + new Date().getTime();
											//document.getElementById("head-img").src = path;
											document.getElementById("head-img1").src = path;
											//变更大图预览的src
											//目前仅有一张图片，暂时如此处理，后续需要通过标准组件实现
											document.querySelector("#__mui-imageview__group .mui-slider-item img").src = path;
										},
										function(e) {
											console.log('copy image fail:' + e.message);
										});
								});
							}, function(e) {
								console.log("get _www folder fail");
							})
						}, function(e) {
							console.log("读取拍照文件错误：" + e.message);
						});
					}, function(a) {}, {
						filter: "image"
					})
				};

				function defaultImg() {
					if(mui.os.plus) {
						plus.io.resolveLocalFileSystemURL("_doc/head.jpg", function(entry) {
							var s = entry.fullPath + "?version=" + new Date().getTime();;
							//document.getElementById("head-img").src = s;
							document.getElementById("head-img1").src = s;
						}, function(e) {
							//document.getElementById("head-img").src = '../images/logo.png';
							document.getElementById("head-img1").src = './images/logo.png';
						})
					} else {
						//document.getElementById("head-img").src = '../images/logo.png';
						document.getElementById("head-img1").src = './images/logo.png';
					}

				}

				document.getElementById("head-img1").addEventListener('tap', function(e) {
					e.stopPropagation();
				});

				function initImgPreview() {
					var imgs = document.querySelectorAll("img.mui-action-preview");
					imgs = mui.slice.call(imgs);
					if(imgs && imgs.length > 0) {
						var slider = document.createElement("div");
						slider.setAttribute("id", "__mui-imageview__");
						slider.classList.add("mui-slider");
						slider.classList.add("mui-fullscreen");
						slider.style.display = "none";
						slider.addEventListener("tap", function() {
							slider.style.display = "none";
						});
						slider.addEventListener("touchmove", function(event) {
							event.preventDefault();
						})
						var slider_group = document.createElement("div");
						slider_group.setAttribute("id", "__mui-imageview__group");
						slider_group.classList.add("mui-slider-group");
						imgs.forEach(function(value, index, array) {
							//给图片添加点击事件，触发预览显示；
							value.addEventListener('tap', function() {
								slider.style.display = "block";
								_slider.refresh();
								_slider.gotoItem(index, 0);
							})
							var item = document.createElement("div");
							item.classList.add("mui-slider-item");
							var a = document.createElement("a");
							var img = document.createElement("img");
							img.setAttribute("src", value.src);
							a.appendChild(img)
							item.appendChild(a);
							slider_group.appendChild(item);
						});
						slider.appendChild(slider_group);
						document.body.appendChild(slider);
						var _slider = mui(slider).slider();
					}
				}

			});
		}

		//点击名称
		change1.addEventListener("tap", function() {

			changeInput.style.display = "block";
			changeInput.classList.add("slider");

			if(changeInput.classList.contains("slider")) {
				changeInput.classList.remove("slider_back");
			}

		})
		back1.addEventListener("tap", function() {
			if(changeInput.classList.contains("slider")) {
				changeInput.classList.remove("changeInput2");
			}
			changeInput.classList.add("slider_back");
		});

		//点击签名
		change2.addEventListener("tap", function() {

			changeInput2.style.display = "block";
			changeInput2.classList.add("slider");

			if(changeInput2.classList.contains("slider")) {
				changeInput2.classList.remove("slider_back");
			}

		})
		back2.addEventListener("tap", function() {
			if(changeInput2.classList.contains("slider")) {
				changeInput2.classList.remove("changeInput2");
			}
			changeInput2.classList.add("slider_back");
		});

		//初始化单页的区域滚动
		mui('.mui-scroll-wrapper').scroll();

		(function($, doc) {

			/**
			 * 选择年龄
			 */
			$.ready(function() {
				var agePicker = new $.PopPicker();
				var age = [];
				for(var i = 1; i <= 150; i++) {
					age.push(i)
				};
				agePicker.setData(age);
				var showAgePickerButton = doc.getElementById('showAgePicker');
				var ageResult = doc.getElementById('ageResult');
				showAgePickerButton.addEventListener('tap', function(event) {
					agePicker.show(function(items) {
						ageResult.innerText = JSON.stringify(items[0]);
						self.submitEvent();
						//返回 false 可以阻止选择框的关闭
						//return false;
					});
				}, false);

				/**
				 * 选择性别
				 */
				var sexPicker = new $.PopPicker();
				sexPicker.setData([{
					text: '男'
				}, {
					text: '女'
				}]);
				var showSexPickerButton = doc.getElementById('showSexPicker');
				var sexResult = doc.getElementById('sexResult');
				showSexPickerButton.addEventListener('tap', function(event) {
					sexPicker.show(function(items) {
						sexResult.innerText = JSON.stringify(items[0].text);
						sexResult.innerText = sexResult.innerText.replace(/\"/g, "");
						self.submitEvent();
						//返回 false 可以阻止选择框的关闭
						//return false;
					});
				}, false);

				/**
				 * 选择城市
				 */
				var cityPicker = new $.PopPicker({
					layer: 2
				});
				cityPicker.setData(cityData);
				var showCityPickerButton = doc.getElementById('showCityPicker');
				var cityResult = doc.getElementById('cityResult');
				showCityPickerButton.addEventListener('tap', function(event) {
					cityPicker.show(function(items) {
						cityResult.innerText = items[0].text + items[1].text;
						cityResult.innerText = cityResult.innerText.replace("省", "");
						cityResult.innerText = cityResult.innerText.replace("市", "");
						cityResult.innerText = cityResult.innerText.replace(/\"/g, "");
						self.submitEvent();
						//返回 false 可以阻止选择框的关闭
						//return false;
					});
				}, false);

			});

		})(mui, document);

		var sex = document.getElementById("sex");
		var write = document.getElementsByClassName('write');
		mui('.mui-popover').on('tap', '.mui-table-view-cell a', function() {
			sex.innerHTML = this.innerHTML;
			self.submitEvent();
			mui('#sexPopover').popover('hide');
		})

		mui.plusReady(function() {
			mui('.mui-scroll-wrapper').scroll();
			mui('body').on('shown', '.mui-popover', function(e) {
				//console.log('shown', e.detail.id);//detail为当前popover元素
			});

			mui('body').on('hidden', '.mui-popover', function(e) {
				//console.log('hidden', e.detail.id);//detail为当前popover元素
			});
		})
	}

	//下一个兄弟节点
	PersonalInfo.prototype.nextSibling = function(node) {
		var tempLast = node.parentNode.lastChild;
		if(node == tempLast) return null;
		var tempObj = node.nextSibling;
		while(tempObj.nodeType != 1 && tempObj.nextSibling != null) {
			tempObj = tempObj.nextSibling;
		}
		return(tempObj.nodeType == 1) ? tempObj : null;
	}
	//前一个兄弟节点
	PersonalInfo.prototype.prevSibling = function(node) {
		var tempFirst = node.parentNode.firstChild;
		if(node == tempFirst) return null;
		var tempObj = node.previousSibling;
		while(tempObj.nodeType != 1 && tempObj.previousSibling != null) {
			tempObj = tempObj.previousSibling;
		}
		return(tempObj.nodeType == 1) ? tempObj : null;
	}

	PersonalInfo.prototype.dc = function() {
		var test1 = /^s+$/;
		var str = this.firstChild.value;
		console.log(this.firstChild);
		var preTxt = this.previousElementSibling.innerHTML;
		if(str = "") {
			return false;
		}
		if(test1.test(str)) {
			return false;
		}
		this.parentNode.innerHTML = '<span>' + preTxt + '</span><p class="head mui-ellipsis change" >' + str + '</p>';
	}

	PersonalInfo.prototype.getImage = function() {
		var c = plus.camera.getCamera();
		c.captureImage(function(e) {
			plus.io.resolveLocalFileSystemURL(e, function(entry) {
				var s = entry.toLocalURL() + "?version=" + new Date().getTime();
				console.log(s);
				document.getElementById("head-img1").src = s;
				//变更大图预览的src
				//目前仅有一张图片，暂时如此处理，后续需要通过标准组件实现
				document.querySelector("#__mui-imageview__group .mui-slider-item img").src = s + "?version=" + new Date().getTime();;;
			}, function(e) {
				console.log("读取拍照文件错误：" + e.message);
			});
		}, function(s) {
			console.log("error" + s);
		}, {
			filename: "img/touxiang01.jpg"
		})
	}

	PersonalInfo.prototype.galleryImg = function() {
		plus.gallery.pick(function(a) {
			plus.io.resolveLocalFileSystemURL(a, function(entry) {
				plus.io.resolveLocalFileSystemURL("_doc/", function(root) {
					root.getFile("img/touxiang01", {}, function(file) {
						//文件已存在
						file.remove(function() {
							console.log("file remove success");
							entry.copyTo(root, 'head.jpg', function(e) {
									var e = e.fullPath + "?version=" + new Date().getTime();
									document.getElementById("head-img1").src = e;
									//变更大图预览的src
									//目前仅有一张图片，暂时如此处理，后续需要通过标准组件实现
									document.querySelector("#__mui-imageview__group .mui-slider-item img").src = e + "?version=" + new Date().getTime();;
								},
								function(e) {
									console.log('copy image fail:' + e.message);
								});
						}, function() {
							console.log("delete image fail:" + e.message);
						});
					}, function() {
						//文件不存在
						entry.copyTo(root, 'head.jpg', function(e) {
								var path = e.fullPath + "?version=" + new Date().getTime();
								document.getElementById("head-img1").src = path;
								//变更大图预览的src
								//目前仅有一张图片，暂时如此处理，后续需要通过标准组件实现
								document.querySelector("#__mui-imageview__group .mui-slider-item img").src = path;
							},
							function(e) {
								console.log('copy image fail:' + e.message);
							});
					});
				}, function(e) {
					console.log("get _www folder fail");
				})
			}, function(e) {
				console.log("读取拍照文件错误：" + e.message);
			});
		}, function(a) {}, {
			filter: "image"
		})
	};
	
	/**
	 * 修改成功服务器调用
	 */
	PersonalInfo.prototype.submitEvent=function () {
		var headIconPath = document.getElementById("head-img1").getAttribute("src");
		var userSex = document.getElementById("sexResult").innerText;
		if (userSex=="男") {
			userSex=1;
		} else{
			userSex=2;
		}
		var a = new Date();
		var birthDay =a.getFullYear()-document.getElementById("ageResult").innerText+"-00-00";
		var city = document.getElementById("cityResult").innerText;
		var info = {
			userId:myId,
			paramsJSON:JSON.stringify({
				nickName:saveNickName,
				headIconPath:headIconPath, 
				birthDay: birthDay,
				sex:userSex,
				signature:saveSignature,
				country:"中国",
				province : '',	
				city : '',
				address:city
			})
		}
		toolkit.sendPost(config.fdhUrl + "/usermanager/updateUser", info, function(err, result) {
			if(err) {
				throw err
			} else {
				var obj = JSON.parse(result);
				console.log(obj);
			}
		});
	}
	PersonalInfo.prototype.bindEvent = function () {
		//昵称保存事件
		mui("#changeInput").on('tap','.save', function () {
			saveNickName=mui("#changeInput input")[0].value;
			mui("#change1 .mui-pull-right")[0].innerHTML = mui("#changeInput input")[0].value+"<span class='mui-icon mui-icon-forward'></span>";
			self.submitEvent();
			changeInput.className = "slider slider_back";
		});
		//个性签名事件
		mui("#changeInput2").on('tap','.save', function () {
			saveSignature=mui("#changeInput2 textarea")[0].value;
			mui("#change2 .mui-pull-right")[0].innerHTML = mui("#changeInput2 textarea")[0].value+"<span class='mui-icon mui-icon-forward'></span>";
			self.submitEvent();
			changeInput2.className = "slider slider_back";
		});
	}    
	module.exports = new PersonalInfo();
})