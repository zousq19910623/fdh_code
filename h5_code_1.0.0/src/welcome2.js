// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");

	var sex = 1, age, birthDay;
	var welcome_complete = document.getElementById("welcome_complete");
	var skip2 = document.getElementById("skip2");
	var title_circle1 = document.querySelector(".title_circle1");
	var title_circle2 = document.querySelector(".title_circle2");

	function Welcome() {
		self = this;
		mui.ready(this.init);
		title_circle1.style.background = "#FFFFFF";
		title_circle2.style.background = "#FFFFFF";
		title_circle2.style.display = "none";
	}

	Welcome.prototype.init = function() {
		var $ = mui;
		var doc = document;

		var availHeight = document.body.clientHeight;

		//===================================================
		var title_circle1 = document.querySelector(".title_circle1")
		var title_circle2 = document.querySelector(".title_circle2")
		var sex;
		
		document.querySelector(".welcome_man").addEventListener("tap", function() {
			title_circle1.style.display = "block";
			title_circle2.style.display = "none";
		})

		document.querySelector(".welcome_woman").addEventListener("tap", function() {
			title_circle1.style.display = "none";
			title_circle2.style.display = "block";
		})

		skip2.addEventListener("tap", function() {

//                  mui.openWindow({
//						url: 'index.html',
//						id: 'index'
//					});
			plus.webview.currentWebview().loadURL("index.html");
		})

		welcome_complete.addEventListener("tap", function() {

			var rs = userPicker.getSelectedItems();
			age = rs[0].text;
			var myDate = new Date();
			var year = myDate.getFullYear();
			birthDay = year - age;
			if(title_circle1.style.background == "rgb(255, 255, 255)") {
				sex = 1;
			} else if(title_circle2.style.background == "rgb(255, 255, 255)") {
				sex = 2;
			} else {
				mui.alert("您还没选择性别！")
				return;
			}
			
			var info = {
				"tokenId": localStorage.getItem("FirstmyId"),
				"nickName": localStorage.getItem("myName"),
				"headIconPath": localStorage.getItem("myHead"),
				"sex": sex,
				"birthDay": birthDay,
			};
			toolkit.sendPost(config.serverBaseUrl + "/usermanager/regUser", info, function(err, result) {
				if(err) {
					alert("错误")
					throw err;
				} else {
					var obj = JSON.parse(result);
					alert(obj);
					localStorage.setItem("myId", obj.UserID);
					localStorage.setItem("HeadIconPath", obj.HeadIconPath);
					plus.webview.currentWebview().loadURL("index.html");
				}

			});

		});

		//===================================================

		//普通示例
		var userPicker = new $.PopPicker();
		
		userPicker.setData([{
				value: 'age',
				text: '1'
			}, {
				value: 'age',
				text: '2'
			}, {
				value: 'age',
				text: '3'
			},
			{
				value: 'age',
				text: '4'
			}, {
				value: 'age',
				text: '5'
			}, {
				value: 'age',
				text: '6'
			},
			{
				value: 'age',
				text: '7'
			}, {
				value: 'age',
				text: '8'
			}, {
				value: 'age',
				text: '9'
			},
			{
				value: 'age',
				text: '10'
			}, {
				value: 'age',
				text: '11'
			}, {
				value: 'age',
				text: '12'
			},
			{
				value: 'age',
				text: '13'
			}, {
				value: 'age',
				text: '14'
			}, {
				value: 'age',
				text: '15'
			},
			{
				value: 'age',
				text: '16'
			}, {
				value: 'age',
				text: '17'
			}, {
				value: 'age',
				text: '18'
			},
			{
				value: 'age',
				text: '19'
			}, {
				value: 'age',
				text: '20'
			}, {
				value: 'age',
				text: '21'
			},
			{
				value: 'age',
				text: '22'
			}, {
				value: 'age',
				text: '23'
			}, {
				value: 'age',
				text: '24'
			},
			{
				value: 'age',
				text: '25'
			}, {
				value: 'age',
				text: '26'
			}, {
				value: 'age',
				text: '27'
			},
			{
				value: 'age',
				text: '28'
			}, {
				value: 'age',
				text: '29'
			}, {
				value: 'age',
				text: '30'
			},
			{
				value: 'age',
				text: '31'
			}, {
				value: 'age',
				text: '32'
			}, {
				value: 'age',
				text: '33'
			},
			{
				value: 'age',
				text: '34'
			}, {
				value: 'age',
				text: '35'
			}, {
				value: 'age',
				text: '36'
			},
			{
				value: 'age',
				text: '37'
			}, {
				value: 'age',
				text: '38'
			}, {
				value: 'age',
				text: '39'
			},
			{
				value: 'age',
				text: '40'
			}, {
				value: 'age',
				text: '41'
			}, {
				value: 'age',
				text: '42'
			},
			{
				value: 'age',
				text: '43'
			}, {
				value: 'age',
				text: '44'
			}, {
				value: 'age',
				text: '45'
			},
			{
				value: 'age',
				text: '46'
			}, {
				value: 'age',
				text: '47'
			}, {
				value: 'age',
				text: '48'
			},
			{
				value: 'age',
				text: '49'
			}, {
				value: 'age',
				text: '50'
			}, {
				value: 'age',
				text: '51'
			},
			{
				value: 'age',
				text: '52'
			}, {
				value: 'age',
				text: '53'
			}, {
				value: 'age',
				text: '54'
			},
			{
				value: 'age',
				text: '55'
			}, {
				value: 'age',
				text: '56'
			}, {
				value: 'age',
				text: '57'
			},
			{
				value: 'age',
				text: '58'
			}, {
				value: 'age',
				text: '59'
			}, {
				value: 'age',
				text: '60'
			},
			{
				value: 'age',
				text: '61'
			}, {
				value: 'age',
				text: '62'
			}, {
				value: 'age',
				text: '63'
			},
			{
				value: 'age',
				text: '64'
			}, {
				value: 'age',
				text: '65'
			}, {
				value: 'age',
				text: '66'
			},
			{
				value: 'age',
				text: '66'
			}, {
				value: 'age',
				text: '67'
			}, {
				value: 'age',
				text: '68'
			},
			{
				value: 'age',
				text: '69'
			}, {
				value: 'age',
				text: '70'
			}, {
				value: 'age',
				text: '71'
			},
			{
				value: 'age',
				text: '72'
			}, {
				value: 'age',
				text: '73'
			}, {
				value: 'age',
				text: '74'
			},
			{
				value: 'age',
				text: '75'
			}, {
				value: 'age',
				text: '76'
			}, {
				value: 'age',
				text: '77'
			},
			{
				value: 'age',
				text: '75'
			}, {
				value: 'age',
				text: '76'
			}, {
				value: 'age',
				text: '77'
			},
			{
				value: 'age',
				text: '78'
			}, {
				value: 'age',
				text: '79'
			}, {
				value: 'age',
				text: '80'
			},
			{
				value: 'age',
				text: '81'
			}, {
				value: 'age',
				text: '82'
			}, {
				value: 'age',
				text: '83'
			},
			{
				value: 'age',
				text: '84'
			}, {
				value: 'age',
				text: '85'
			}, {
				value: 'age',
				text: '86'
			},
			{
				value: 'age',
				text: '87'
			}, {
				value: 'age',
				text: '88'
			}, {
				value: 'age',
				text: '89'
			},
			{
				value: 'age',
				text: '90'
			}, {
				value: 'age',
				text: '91'
			}, {
				value: 'age',
				text: '92'
			},
			{
				value: 'age',
				text: '93'
			}, {
				value: 'age',
				text: '94'
			}, {
				value: 'age',
				text: '95'
			},
			{
				value: 'age',
				text: '96'
			}, {
				value: 'age',
				text: '97'
			}, {
				value: 'age',
				text: '98'
			},
			{
				value: 'age',
				text: '99'
			}, {
				value: 'age',
				text: '100'
			}, {
				value: 'age',
				text: '101'
			},
			{
				value: 'age',
				text: '102'
			}, {
				value: 'age',
				text: '103'
			}, {
				value: 'age',
				text: '104'
			},
			{
				value: 'age',
				text: '105'
			}, {
				value: 'age',
				text: '106'
			}, {
				value: 'age',
				text: '107'
			},
			{
				value: 'age',
				text: '108'
			}, {
				value: 'age',
				text: '109'
			}, {
				value: 'age',
				text: '110'
			},
			{
				value: 'age',
				text: '111'
			}, {
				value: 'age',
				text: '112'
			}, {
				value: 'age',
				text: '113'
			},
			{
				value: 'age',
				text: '114'
			}, {
				value: 'age',
				text: '115'
			}, {
				value: 'age',
				text: '116'
			},
			{
				value: 'age',
				text: '117'
			}, {
				value: 'age',
				text: '118'
			}, {
				value: 'age',
				text: '119'
			},
			{
				value: 'age',
				text: '120'
			}, {
				value: 'age',
				text: '121'
			}, {
				value: 'age',
				text: '122'
			},
			{
				value: 'age',
				text: '123'
			}, {
				value: 'age',
				text: '124'
			}, {
				value: 'age',
				text: '125'
			},
			{
				value: 'age',
				text: '126'
			}, {
				value: 'age',
				text: '127'
			}, {
				value: 'age',
				text: '128'
			},
			{
				value: 'age',
				text: '129'
			}, {
				value: 'age',
				text: '130'
			}, {
				value: 'age',
				text: '131'
			},
			{
				value: 'age',
				text: '132'
			}, {
				value: 'age',
				text: '133'
			}, {
				value: 'age',
				text: '134'
			},
			{
				value: 'age',
				text: '135'
			}, {
				value: 'age',
				text: '136'
			}, {
				value: 'age',
				text: '137'
			},
			{
				value: 'age',
				text: '138'
			}, {
				value: 'age',
				text: '139'
			}, {
				value: 'age',
				text: '140'
			},
			{
				value: 'age',
				text: '141'
			}, {
				value: 'age',
				text: '142'
			}, {
				value: 'age',
				text: '143'
			},
			{
				value: 'age',
				text: '144'
			}, {
				value: 'age',
				text: '145'
			}, {
				value: 'age',
				text: '146'
			},
			{
				value: 'age',
				text: '147'
			}, {
				value: 'age',
				text: '148'
			}, {
				value: 'age',
				text: '149'
			},
			{
				value: 'age',
				text: '150'
			}
		]);
		
		//初始化年龄
		userPicker.pickers[0].setSelectedIndex(30);
		document.querySelector(".mui-poppicker-header").style.display = "none";
		document.getElementById("welcome_complete").addEventListener("tap", function() {
		});
	}
	module.exports = new Welcome();

});