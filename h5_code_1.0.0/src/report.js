// 所有模块都通过 define 来定义
define(function(require, exports, module) {
	var toolkit = require("./toolkit");
	var config = require("./config");
    var person_text = document.querySelector(".person_text");
    var  dynamicId,myId;
    var result_array;
    var onlyPic = document.getElementById("onlyPic");
    var txtAndPic = document.getElementById("txtAndPic");
    var nolyTxt = document.getElementById("nolyTxt");
	
	function Report() {
		self = this;
		this.init();
	}

	Report.prototype.init = function() {
		
		result_array = localStorage.getItem("result_array");
		dynamicId = localStorage.getItem("dynamicId");
        myId = localStorage.getItem("myId");
        result_array = JSON.parse(result_array);
        console.log(result_array);
        for(var i=0; i<result_array.length;i++){
        	if(result_array[i].DynamicID ==  dynamicId){
        		if(result_array[i].PicturePath == ""){
        			nolyTxt.style.display = "block";
        		}else if(result_array[i].Content == "" && result_array[i].PicturePath != "" ){
        			onlyPic.style.display = "block";
        		}else{
        			txtAndPic.style.display = "block";
        		}
        	}
        }
        
		//B页面onload从服务器获取列表数据；
		window.onload = function() {

			mui.init();
			//从服务器获取数据

			//业务数据获取完毕，并已插入当前页面DOM；
			//注意：若为ajax请求，则需将如下代码放在处理完ajax响应数据之后；
			mui.plusReady(function() {

				//关闭等待框
				//lus.nativeUI.closeWaiting();
				//显示当前页面
				mui.currentWebview.show();

			});

			document.getElementById("report_submit").addEventListener('tap', function() {
				mui.toast('举报成功！');
				
				 var checkboxArray = document.getElementsByName("checkbox");  
                 var chestr ="";
			        for(var i=0;i<checkboxArray.length;i++){  
			            if(checkboxArray[i].checked == true){  
			                chestr += checkboxArray[i].value + "_";  
			            }   
			        }   
			        
			   var info = {
				"userId": myId,
				"dynamicId":dynamicId,
				"content":chestr
			};

			toolkit.sendPost(config.serverBaseUrl + "/report/report", info, function(err, result) {
				if(err) {
					throw err;
				} else {
					var obj = JSON.parse(result);
					if(obj.errCode) {
						console.log(obj.errCode + "===" + obj.errMsg);
					}
				}

			});
				setTimeout(function() {
					//返回页面时刷新
					/* var opener = plus.webview.currentWebview().opener();
                    opener.reload()*/
					//mui.back();
				}, 2000);
			});

		}

	
		var str = person_text.innerText;
		person_text.innerText = toolkit.cutString(str, 60);
		//调用
		toolkit.setImageSize4(0.23);
	}

	module.exports = new Report();

});