var configuration = {
	// 获取url地址参数
	GetUrlData: function(paras) {
		var url = location.href;
		var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
		var paraObj = {};
		for (i = 0; j = paraString[i]; i++) {
			paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length)
		}
		var returnValue = paraObj[paras.toLowerCase()];
		if (typeof(returnValue) == "undefined") {
			return ""
		} else {
			return returnValue
		}
	},
	// 获取语言文件
	getData: function(fun) {
		var search = location.search.replace(/^\?/, '').split('&');

		function get_url_data(key) {
			var val = '';
			search.map(function(k_v) {
				k_v = k_v.split('=');
				if (k_v[0] == key) {
					val = k_v[1];
				}
			});
			return val;
		}
		var lang = get_url_data('lang') || this.GetUrlData("lang");
		// var lang = this.GetUrlData("lang");
		var str = (!lang || lang == "zh_CN") ? "zh_CN" : lang;
		$.ajax({
			url: "lang/" + str + ".json",
			async: false,
			success: function(data) {
				fun(data, str);
			}
		});
	}
}
