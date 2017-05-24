/*!
 * ======================================================
 * FeedBack Template For MUI (http://dev.dcloud.net.cn/mui)
 * =======================================================
 * @version:1.0.0
 * @author:cuihongbao@dcloud.io
 */

// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");
	var input_txt = document.getElementById("form_article");
	var self;
    var latitude,longitude;
    
	function Invitation() {
		self = this;
		this.init();
		var imgPath;
	}

	Invitation.prototype.init = function() {
		var submitBtn = document.getElementById("sendMassege");
		var back = document.getElementById("back");
		var path_json = "";
		var index = 1;
		var size = null;
		var imageIndexIdNum = 0;
		var starIndex = 0;
		var box = document.getElementById("image-list");
		var face = document.getElementById("face");
		var photograph = document.getElementById("photograph");
		var size = document.getElementById("size");
		var say = '说点什么...';
	
		
		mui.init({
				preloadPages: [{
					id: 'index',
					url: 'index.html'
				}]
			});
		
		$(document).ready(function() {

			// 扩展API加载完毕后调用onPlusReady回调函数 
			document.addEventListener("plusready", onPlusReady, false);
			// 扩展API加载完毕，现在可以正常调用扩展API
			function onPlusReady() {
				plus.geolocation.getCurrentPosition(function(p) {
					longitude = p.coords.longitude;
					latitude = p.coords.latitude;
				}, function(e) {
					longitude = "";
					latitude = "";
				});
			}

		});

		//输入的汉字个数监听
		input_txt.addEventListener('input', self.monitorText);
		$("#form_article").bind('DOMNodeInserted', self.monitorPicture);
		size.innerHTML = 150;

		$("#form_article").click(function() {
			list_emotion.style.display = "none";
			nav_emotion.style.display = "none";
			if($("#form_article").html() == say) {
				$("#form_article").html("");
			}
		});

		$("#page_emotion  dd").click(function() {
			$("#form_article").html($("#form_article").html().replace(say, ''));
		});

		photograph.onclick = function() {
			box.style.display = "block";
			list_emotion.style.display = "none";
			nav_emotion.style.display = "none";
		};

		face.onclick = function() {
			list_emotion.style.display = "block";
			nav_emotion.style.display = "block";
			/*box.style.opacity = "1";*/
			box.style.opacity = "1";
			box.style.display = "none";
		};

		var feedback = {
			question: document.getElementById('question'),
			contact: document.getElementById('contact'),
			imageList: document.getElementById('image-list'),

		};
		var url = 'https://service.dcloud.net.cn/feedback';
		feedback.files = [];
		feedback.uploader = null;
		feedback.deviceInfo = null;
		mui.plusReady(function() {
			//设备信息，无需修改
			feedback.deviceInfo = {
				appid: plus.runtime.appid,
				imei: plus.device.imei, //设备标识
				images: feedback.files, //图片文件
				p: mui.os.android ? 'a' : 'i', //平台类型，i表示iOS平台，a表示Android平台。
				md: plus.device.model, //设备型号
				app_version: plus.runtime.version,
				plus_version: plus.runtime.innerVersion, //基座版本号
				os: mui.os.version,
				net: '' + plus.networkinfo.getCurrentType()
			}
		});

		feedback.getFileInputArray = function() {
			return [].slice.call(feedback.imageList.querySelectorAll('.file'));
		};
		feedback.addFile = function(path) {
			feedback.files.push({
				name: "images" + index,
				path: path,
				id: "img-" + index
			});
			index++;
		};
		/**
		 * 初始化图片域占位
		 */
		feedback.newPlaceholder = function() {

			var fileInputArray = feedback.getFileInputArray();
			if(fileInputArray &&
				fileInputArray.length > 0 &&
				fileInputArray[fileInputArray.length - 1].parentNode.classList.contains('space')) {
				return;
			};

			imageIndexIdNum++;

			var placeholder = document.createElement('div');
			placeholder.setAttribute('class', 'image-item space');

			var up = document.createElement("div");
			up.setAttribute('class', 'image-up');

			//删除图片
			var closeButton = document.createElement('div');
			closeButton.setAttribute('class', 'image-close');
			closeButton.innerHTML = 'X';
			closeButton.id = "img-" + index;

			var fileInput = document.createElement('div');
			fileInput.setAttribute('class', 'file');
			fileInput.setAttribute('id', 'image-' + imageIndexIdNum);

			fileInput.addEventListener('tap', function(event) {
				var self = this;
				var index = (this.id).substr(-1);
				plus.gallery.pick(function(e) {
					var name = e.substr(e.lastIndexOf('/') + 1);
					plus.zip.compressImage({
						src: e,
						dst: '_doc/' + name,
						overwrite: true,
						quality: 50
					}, function(zip) {
						size += zip.size
						console.log("filesize:" + zip.size + ",totalsize:" + size);
						if(size > (10 * 1024 * 1024)) {
							return mui.toast('文件超大,请重新选择~');
						}
						if(!self.parentNode.classList.contains('space')) { //已有图片
							feedback.files.splice(index - 1, 1, {
								name: "images" + index,
								path: e
							});
						} else { //加号
							placeholder.classList.remove('space');
							feedback.addFile(zip.target);
							feedback.newPlaceholder();
						}
						up.classList.remove('image-up');
						placeholder.style.backgroundImage = 'url(' + zip.target + ')';
					}, function(zipe) {
						mui.toast('压缩失败！')
					});

				}, function(e) {
					mui.toast(e.message);
				}, {
					multiple: false
				});
			}, false);

			//小X的点击事件
			closeButton.addEventListener('tap', function(event) {
				//alert(feedback.files.length-1)

				for(var temp = 0; temp < feedback.files.length; temp++) {
					if(feedback.files[temp].id == closeButton.id) {
						feedback.files.splice(temp, 1);
					}
				}
				feedback.imageList.removeChild(placeholder);
				alert(feedback.files.length)

				if(feedback.files.length == 8) {
					feedback.newPlaceholder();
				}

				return false;
			}, false);

			//判断图片的 张数
			if(feedback.files.length >= 9) {
				// $("#image-list").children("div:last-child").css("display","none");
				//$(".space").css("display","none");
				mui.alert("最多只能上传九张！");
			} else {
				placeholder.appendChild(closeButton);
				placeholder.appendChild(fileInput);
				placeholder.appendChild(up);
				feedback.imageList.appendChild(placeholder);
			}

		};

		feedback.newPlaceholder();
		
		back.addEventListener("back", function() {
				mui.back();
		});

		submitBtn.addEventListener("tap", function() {
			
			path_json = '{"imgPath":' + "\""
			for(var i = 0; i < feedback.files.length; i++) {
				//path_json +="imgPath" + +":"+"  "+feedback.files[i].path + ",";
				path_json += plus.io.convertLocalFileSystemURL(feedback.files[i].path) + ",";
			}
			path_json += "\"}";
			var content = $("#form_article").html();
			
			/*content = toolkit.trim(content);
			content = content.replace(/&nbsp;/ig, '');
			content = toolkit.trim(content);*/
			
			if(feedback.files.length == 0) {
				imgPath = "";
				self.sendInvitation(imgPath, content);
			} else {

				path_json = JSON.parse(path_json);
			   // alert("path_json==========" + JSON.stringify(path_json))
				plus.FLJPlugin.PNGuploadFun("invitation.html", path_json,
					function(result) {
						//alert( "ok222==========" + JSON.stringify(result)  );
						//result = JSON.parse(result);
						imgPath = JSON.stringify(result);
						/*	    alert( localStorage.getItem("myId") +"====="+JSON.stringify({
										"picturePath": imgPath,
										"content": content,
										"location": '',
										"longitude": 1234.5,
										"latitude": 2345.6
									})
								)*/
                       	//alert("ok222==========" + imgPath)
						self.sendInvitation(imgPath, content);

					},
					function(result) {});

			}

		})
	}

	Invitation.prototype.sendInvitation = function(imgPath, content) {
        //alert("sendInvitation===imgPath========="+imgPath)
		var info = {
			"userId": localStorage.getItem("myId"),
			"paramsJSON": JSON.stringify({
				"picturePath": imgPath,
				"content": content,
				"location": '',
				"longitude": longitude,
				"latitude": latitude
			})
		};

		alert("info ====== " + JSON.stringify(info))
		console.log("info ====== " + JSON.stringify(info))

		toolkit.sendPost(config.serverBaseUrl + "/dynamic/publishDynamic", info, function(err, result) {
			if(err) {
				alert("错误")
				throw err;
			} else {
				var obj = JSON.parse(result);
				if(obj.errCode) {
					mui.alert("invitation====="  + obj.errCode + "===" + obj.errMsg )
				} else {
					var obj = JSON.parse(result);
					console.log(obj);
					alert("ok")
					//触发事件
						//获得详情页面
						
			    var index = null;
				if(!index) {
					index = plus.webview.getWebviewById('index');
				}
                
                alert(index)
					
				mui.fire(index,'insertInvitation',{
					    id:118
					  }); 
						
					
				mui.plusReady(function() {
						/*var taskList = plus.webview.getWebviewById('index');
						taskList.reload();*/
						mui.back();
					})
				}
			}
		});

	}
	
	
	/**
	 * 监听输入事件
	 * @param {Object} target
	 */
	Invitation.prototype.monitorText = function(target) {

		var maxLength = 150;
		var reg = /<img.*?(?:>|\/>)/gi;
		var txt = input_txt.innerHTML;
		var targetLength = toolkit.native2ascii(txt.replace("reg", 'gg'));
		var leftLength = maxLength - targetLength;

		if(leftLength < 0) {
			size.innerHTML = '<span style="color:red;">个性签名过长</span>';
			return;
		}

		if(leftLength >= 0) {
			size.innerHTML = leftLength;
			size.innerHTML = size.innerHTML.replace(/(\+|\-)?\d+/, leftLength);
		}

	}

	/**
	 * 监听图片
	 * @param {Object} e
	 */
	Invitation.prototype.monitorPicture = function(e) {
		var maxLength = 150;
		var reg = /<img.*?(?:>|\/>)/gi;
		var txt = input_txt.innerHTML;

		txt = txt.replace("</img>", '');
		var targetLength = toolkit.native2ascii(txt.replace(reg, '房东'));
		var leftLength = maxLength - targetLength;

		if(leftLength < 0) {
			size.innerHTML = '<span style="color:red;">个性签名过长</span>';
			return;
		}

		if(leftLength >= 0) {
			size.innerHTML = leftLength;
			size.innerHTML = size.innerHTML.replace(/(\+|\-)?\d+/, leftLength);
		}
	}

	module.exports = new Invitation();

});