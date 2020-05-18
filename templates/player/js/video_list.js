// var apiBaseUrl = "http://47.115.86.202:85/";
var apiBaseUrl = "https://www.amm.tv/";
var appVersion = "1.0.0";
var themeCode = "recommend_drama"; // 专题代号(请求携带参数)

var app = new Vue({
	el: '#app',
	data: function() {
		return {
			apiBaseUrl: '', // 接口域名
			appVersion: '', // App版本
			imgBaseUrl: '', // 图片域名
			themeCode: '', // 专题代号(请求携带参数)
			themeListData: '', // 专题列表数据
		}
	},
	created() {
		this.apiBaseUrl = apiBaseUrl;
		this.appVersion = appVersion;
		this.themeCode = themeCode;
	},
	mounted() {
		this.getAppConfig();
		this.getThemeList();
	},
	methods: {
		// 获取基本配置信息,如图片地址域名...
		getAppConfig: function() {
			$.ajax({
				type: "get",
				url: apiBaseUrl + "server/getAppConfig",
				data: {
					appVersion: this.appVersion
				},
				success: (res) => {
					if (res.code == 0) {
						console.log('配置请求结果', res.data);
						// 初始化数据...
						this.imgBaseUrl = res.data.image_server;
						// console.log(this.imgBaseUrl);
					} else {
						alert("请求配置出错!");
					}
				},
				error: (err) => {
					console.log(err);
				}
			});
		},
		// 专题列表接口
		getThemeList: function() {
			$.ajax({
				type: "get",
				url: apiBaseUrl + "theme/list",
				data: {
					themeCode: themeCode
				},
				success: (res) => {
					if (res.code == 0) {
						console.log('专题列表请求结果', res.data);
						// 初始化数据...
						this.themeListData = res.data;
					} else {
						alert("请求专题列表出错!");
					}
				},
				error: (err) => {
					console.log(err);
				}
			});
		}
	}
})
