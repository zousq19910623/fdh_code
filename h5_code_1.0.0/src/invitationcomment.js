define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");
	var myId = localStorage.getItem("myId");
	var input_txt = document.getElementById("form_article");
	var say = '说点什么...';
	var face = document.getElementById("face");
	var box = document.getElementById("box");
	mui("#form_article")[0].innerHTML = say;
	var commentInfo = JSON.parse(localStorage.getItem("commentInfo"));
	console.log(commentInfo);
	console.log(commentInfo.beCommentName);
	if(commentInfo.belongCommentID) {
		mui(".mui-title")[0].innerText = "@" + commentInfo.beCommentName;
	} else {
		mui(".mui-title")[0].innerText = "@" + commentInfo.beCommentName;
	}

	function InvitationComment() {
		self = this;
		this.init();
	}
	InvitationComment.prototype.init = function() {
		mui.init({
			preloadPages: [{
				beforeback: self.clear,
				id: 'detailcomment',
				url: 'detailcomment.html'
			}]
		})
		mui("#form_article")[0].onfocus = function() {
			if(mui("#form_article")[0].innerHTML == say) {
				mui("#form_article")[0].innerHTML = "";
			}
		}
		face.onclick = function() {
			list_emotion.style.display = "block";
			nav_emotion.style.display = "block";
			/*box.style.opacity = "1";*/
			box.style.opacity = "1";
			box.style.display = "none";
		};
		input_txt.addEventListener('input', self.monitorText);
		input_txt.addEventListener('DOMNodeInserted', self.monitorPicture);
		mui("body").on("tap", "#sendMassege", function() {
			if(mui("#form_article")[0].innerHTML) {

			}
			if(commentInfo.belongCommentID != undefined) {
				toolkit.sendPost(config.serverBaseUrl + "/dynamic/reply", {
					"userId": myId, //用户ID
					"paramsJSON": JSON.stringify({
						dynamicId: commentInfo.dynamicId,
						beCommentId: commentInfo.beCommentId,
						belongCommentID: commentInfo.belongCommentID,
						beCommentUserId: commentInfo.beCommentUserId,
						beCommentName: commentInfo.beCommentName,
						commentContent: mui("#form_article")[0].innerHTML
					})
				}, function(err, result) {
					if(err) {
						throw err;
					} else {
						var obj = JSON.parse(result);
						console.log(obj.errCode + "===" + obj.errMsg);
						mui.plusReady(function() {
							var taskList = plus.webview.getWebviewById('detailcomment');
							if(taskList != null) {
								taskList.reload();
							}
							mui.back();
						})
						return;
					}
				});
			} else {
				toolkit.sendPost(config.serverBaseUrl + "/dynamic/comment", {
					"userId": myId, //用户ID
					"paramsJSON": JSON.stringify({
						dynamicId: commentInfo.dynamicId,
						beCommentUserId: commentInfo.beCommentUserId,
						beCommentName: commentInfo.beCommentName,
						commentContent: mui("#form_article")[0].innerHTML
					})
				}, function(err, result) {
					if(err) {
						throw err;
					} else {
						var obj = JSON.parse(result);
						console.log(obj.errCode + "===" + obj.errMsg);
						mui.plusReady(function() {
							var taskList = plus.webview.getWebviewById('detailcomment');
							if(taskList != null) {
								taskList.reload();
							}
							mui.back();
						})
						return;
					}
				});
			}

		})
	}

	/**
	 * 监听输入事件
	 * @param {Object} target
	 */
	InvitationComment.prototype.monitorText = function(target) {

		var maxLength = 150;
		var reg = /<img.*?(?:>|\/>)/gi;
		var txt = input_txt.innerHTML;
		txt = txt.replace("</img>", '');

		var targetLength = toolkit.native2ascii(txt.replace("reg", 'gg'));
		var leftLength = maxLength - targetLength;

		if(leftLength < 0) {
			size.innerHTML = '<span style="color:red;">0</span>';
			mui.toast("评论字数超过限制");
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
	InvitationComment.prototype.monitorPicture = function(e) {
		var maxLength = 150;
		var reg = /<img.*?(?:>|\/>)/gi;
		var txt = input_txt.innerHTML;

		txt = txt.replace("</img>", '');
		console.log(txt.replace(reg, 'gg'))
		var targetLength = toolkit.native2ascii(txt.replace(reg, 'gg'));

		var leftLength = maxLength - targetLength;

		if(leftLength < 0) {
			size.innerHTML = '<span style="color:red;">0</span>';
			mui.toast("评论字数超过限制");
			return;
		}

		if(leftLength >= 0) {
			size.innerHTML = leftLength;
			size.innerHTML = size.innerHTML.replace(/(\+|\-)?\d+/, leftLength);
		}

	}

	module.exports = new InvitationComment();
})