document.addEventListener("plusready", function() {
	// 声明的JS“扩展插件别名”
	var _BARCODE = 'FLJPlugin',
		B = window.plus.bridge;
	var plugin = {
		/**
		 * 上传图片到万象优图
		 * @param {Object} Argus1
		 * @param {Object} Argus2
		 * @param {Object} successCallback
		 * @param {Object} errorCallback
		 */
		PNGuploadFun: function( Argus1, Argus2, successCallback, errorCallback) {
			var success = typeof successCallback !== 'function' ? null : function(args) {
					successCallback(args);
				},
				fail = typeof errorCallback !== 'function' ? null : function(code) {
					errorCallback(code);
				};
			var callbackID = B.callbackId(success, fail);
			// 通知Native层PNGupload扩展插件运行”PNGuploadFunction”方法
			return B.exec(_BARCODE, "PNGuploadFun", [callbackID, Argus1, Argus2]);
		},
		
		/**
		 * 获得用户信息
		 */
        GetUserInfo : function () 
        {                          
            return B.execSync(_BARCODE, "GetUserInfo", []);
        }
   };
	window.plus.FLJPlugin = plugin;
}, true);