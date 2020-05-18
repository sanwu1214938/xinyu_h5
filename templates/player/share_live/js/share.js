// 此方法可区分
var ua = navigator.userAgent.toLowerCase();

var app = new Vue({
	el: '#app',
	data: function() {
		return {
			// SDKAppID: 1400363144, //腾讯云web端IM应用ID
			SDKAppID: 1400366418, //腾讯云web端IM应用ID(me)
			chatRoomID: "@TGS#aBHRMFOGV", //测试群组ID
			userId: "超管", //
			userName: "Dong", //
			userImg: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1585734253422&di=42dfa23b531422ecd6e2144abcf99216&imgtype=0&src=http%3A%2F%2Fdmimg.5054399.com%2Fallimg%2Fpkm%2Fpk%2F22.jpg", //
			currentAttentionState: 0, //关注状态:0=>未关注;1=>已关注
			chatList: [], //聊天列表(弹幕列表)
			isXfive: true, //判断是否是x5内核浏览器
		}
	},
	created() {

	},
	mounted() {
		var _this = this;

		// 聊天消息列表自动滚动到底部
		this.chatListScroll();

		// 视频播放
		this.testEnvironment();
		if (this.isXfive) {
			$(function() {
				_this.xFiveVideo("m3u8", "http://ivi.bupt.edu.cn/hls/cctv6hd.m3u8", "xinyu_video", "", "", "");
				setTimeout(() => {
					// $('#xinyu_video>div:nth-of-type(1)').trigger('click');
					$(".big-play-icon").trigger("click");
					SewisePlayer.playerReady(function(id) {
						SewisePlayer.doPlay();
					});
				}, 1000);
			});
		} else {
			$(function() {
				_this.otherVideo();
			})
		}

		// (初始化im实例)-用户连接融云,并加入聊天室,并监听接收消息
		this.joinTIMChatRoom();
	},
	methods: {
		// 时间转换
		getCommentTime: function(time) {
			return getTime.gettime(time);
		},
		// 关注操作
		payAttention: function() {
			this.currentAttentionState = !this.currentAttentionState;
		},
		// 聊天消息列表自动滚动到底部
		chatListScroll: function() {
			var chatItemContainer = document.getElementById('chat_item_container');
			$(".chat_list_container").stop().animate({
				'scrollTop': chatItemContainer.scrollHeight
			}, 400, function() {
				$(".chat_list_container").stop(true, true);
			});
			console.log("评论列表的scrollHeight:", chatItemContainer.scrollHeight);
			console.log("评论列表的height:", $(".chat_item_container").height());
		},

		// (初始化tim实例)-用户连接腾讯云,并加入音视频聊天室
		joinTIMChatRoom: function() {
			var _this = this;

			// 初始化tim实例
			var options = {
				SDKAppID: _this.SDKAppID // 接入时需要将0替换为您的即时通信 IM 应用的 SDKAppID
			};
			var tim = TIM.create(options);
			tim.setLogLevel(0); // 普通级别，日志量较多，接入时建议使用;生产环境建议使用1;

			// 匿名用户加入(无需登录，入群后仅能接收消息)(游客模式)
			let joinPromise = tim.joinGroup({
				groupID: _this.chatRoomID
			});
			joinPromise.then(function(imResponse) {
				switch (imResponse.data.status) {
					case TIM.TYPES.JOIN_STATUS_WAIT_APPROVAL: // 等待管理员同意
						break
					case TIM.TYPES.JOIN_STATUS_SUCCESS: // 加群成功
						console.log("加群成功", imResponse.data.group) // 加入的群组资料
						// 加群成功后 监听消息接收
						tim.on(TIM.EVENT.MESSAGE_RECEIVED, function(event) {
							// 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
							// event.name - TIM.EVENT.MESSAGE_RECEIVED
							// event.data - 存储 Message 对象的数组 - [Message]

							// console.log("直播间消息:", event.data);
							_this.chatList = _this.chatList.concat(event.data);
							console.log("聊天列表:", _this.chatList);
							// 聊天消息列表自动滚动到底部
							_this.chatListScroll();
						});
						break
					case TIM.TYPES.JOIN_STATUS_ALREADY_IN_GROUP: // 已经在群中
						break
					default:
						break
				}
			}).catch(function(imError) {
				console.warn('joinGroup error:', imError) // 申请加群失败的相关信息
				console.log("加群失败");
			});

			// 监听事件，例如：
			tim.on(TIM.EVENT.ERROR, function(event) {
				// 收到 SDK 发生错误通知，可以获取错误码和错误信息
				// event.name - TIM.EVENT.ERROR
				// event.data.code - 错误码
				// event.data.message - 错误信息
			});
			tim.on(TIM.EVENT.SDK_NOT_READY, function(event) {
				// 收到 SDK 进入 not ready 状态通知，此时 SDK 无法正常工作
				// event.name - TIM.EVENT.SDK_NOT_READY
			});
		},

		// 视频播放
		xFiveVideo: function(type, videourl, name, poster, button, primary) {
			SewisePlayer.setup({
				server: "vod",
				type: type,
				videourl: videourl,
				skin: "vodFoream",
				claritybutton: !button ? "disable" : "",
				timedisplay: "disable",
				controlbardisplay: "disable",
				topbardisplay: "disable",
				bigplaybtndisplay: "disable",
				autostart: "false",
				buffer: 2,
				poster: poster,
				primary: primary
			}, name);

			$('video').attr('webkit-playsinline', 'webkit-playsinline');
			$('video').attr('x5-video-player-type', 'h5');
			$('video').attr('x5-video-player-fullscreen', 'true');
			$('video').attr('x-webkit-airplay', 'true');
			$('video').attr('playsinline', 'true');
			$('video').attr('webkit-playsinline', 'true');
			$('video').attr('controls', 'false');

			// video暂停事件
			$("video").on("pause", function() {
				console.log("暂停");
			})
			// 播放事件
			$("video").on("play", function() {
				console.log("播放");
			});
		},
		otherVideo: function() {
			// 初始化
			var options = {
				autoplay: "true"
			};
			var myPlayer = videojs("xinyu_video_other", options, function() {
				console.log('直播开始！！！')
			})
			myPlayer.play();
			setTimeout(() => {
				myPlayer.play();
				$('video').trigger('play');
			}, 1000);
		},

		// 浏览器环境
		testEnvironment: function() {
			// 此方法可区分
			if (ua.match(/MicroMessenger/i) == 'micromessenger') {
				// alert("微信浏览器");
				this.isXfive = true;
			} else if (ua.indexOf(' qq') != -1 && ua.indexOf('mqqbrowser') != -1) {
				// alert("qq内置浏览器中打开");
				this.isXfive = true;
			} else if (ua.indexOf('mqqbrowser') != -1 && ua.indexOf(" qq") == -1) {
				// alert("qq浏览器app中打开");
				this.isXfive = true;
			} else {
				// alert("其他浏览器中打开");
				this.isXfive = false;
			}
		},

		// 跳转App
		toApp: function() {
			var u = navigator.userAgent;
			var isWeixin = u.toLowerCase().indexOf('micromessenger') !== -1; // 微信内
			var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //android终端
			var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端

			// 微信内
			if (isWeixin) {
				alert('请在浏览器上打开');
			} else {
				//android端
				if (isAndroid) {
					//安卓app的scheme协议
					window.location.href = 'taobao://';
					setTimeout(function() {
						let hidden = window.document.hidden || window.document.mozHidden || window.document.msHidden || window.document.webkitHidden
						if (typeof hidden == "undefined" || hidden == false) {
							//应用宝下载地址 (emmm 找不到淘宝应用宝的地址，这里放的是 lucky coffee 地址)
							window.location.href = "https://a.app.qq.com/o/simple.jsp?pkgname=com.lucky.luckyclient";
						}
					}, 2000);
				}
				//ios端
				if (isIOS) {
					//ios的scheme协议
					window.location.href = 'taobao://'
					setTimeout(function() {
						let hidden = window.document.hidden || window.document.mozHidden || window.document.msHidden || window.document.webkitHidden
						if (typeof hidden == "undefined" || hidden == false) {
							//App store下载地址
							window.location.href = "http://itunes.apple.com/app/id387682726";
						}
					}, 2000);
				}
			}
		}
	}
});
