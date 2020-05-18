var im;
var chatRoom;
var conversationList = []; // 当前已存在的会话列表

var app = new Vue({
	el: '#app',
	data: function() {
		return {
			rongAppkey: "vnroth0kvlguo", //融云appkey
			rongAppsecret: "fTY3O6rIXUOWMH", //融云App Secret
			rongToken: "1IFbE7rR0cBX01wwdUNUplAT4JuM0pI6VXA1+/m9Rym8qYY5fPXVwqyMy+tcswrgA9sexUwRYO3HAB1tlkGkfA==", //融云token
			isJoinChatRoom: false,
			userId: "超管", //融云必须传的参数,可以是应用用户appId
			userName: "she", //融云必须传的参数,可以是应用用户name
			userImg: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1585734253422&di=42dfa23b531422ecd6e2144abcf99216&imgtype=0&src=http%3A%2F%2Fdmimg.5054399.com%2Fallimg%2Fpkm%2Fpk%2F22.jpg", //融云必须传的参数,可以是应用用户头像
			currentAttentionState: 0, //关注状态:0=>未关注;1=>已关注
			currentTab: 0, //0=>讨论;1=>简介
		}
	},
	created() {

	},
	mounted() {
		// testScroll
		this.testScroll();

		// 发请求获取融云token(需要后台集成接口)
		// this.getRongToken();
		// (初始化im实例)-用户连接融云,并加入聊天室
		this.joinRongChatRoom();
		// 监听接收消息
		this.watchMessage();
	},
	destroyed() {

	},
	methods: {
		// 时间转换
		getCommentTime: function(time) {
			return getTime.gettime(time);
		},
		// 切换tab
		changeTab: function(index) {
			this.currentTab = index;
		},
		// 关注操作
		payAttention: function() {
			this.currentAttentionState = !this.currentAttentionState;
		},
		// testScroll
		testScroll: function() {
			var chatItemContainer = document.getElementById('chat_item_container');
			$(".chat_list_container").stop().animate({
				'scrollTop': chatItemContainer.scrollHeight
			}, 400, function() {
				$(".chat_list_container").stop(true, true);
			});
			console.log("评论列表的scrollHeight:", chatItemContainer.scrollHeight);
			console.log("评论列表的height:", $(".chat_item_container").height());
		},

		// 发请求获取融云token
		getRongToken: function() {
			console.log("获取融云token");
		},
		// (初始化im实例)-用户连接融云,并加入聊天室
		joinRongChatRoom: function() {
			var _this = this;
			// 初始化 参数
			var appkey = _this.rongAppkey;
			var user = {
				token: _this.rongToken
			};
			im = RongIMLib.init({
				appkey: appkey
			});
			// var chatRoom;
			// 用户连接 融云..............................
			im.connect(user).then(function(user) {
				console.log('链接成功, 链接用户 id 为: ', user.id);

				// 获取 聊天室 实例..............................
				chatRoom = im.ChatRoom.get({
					id: 'dongGe-1'
				});
				// 加入聊天室..............................
				chatRoom.join({
					count: 0 // 进入后, 自动拉取 20 条聊天室最新消息
				}).then(function() {
					console.log('加入聊天室成功...');
					_this.isJoinChatRoom = true;
				}).catch(function(error) {
					console.log('加入聊天室失败...', error);
				});

			}).catch(function(error) {
				console.log('链接失败: ', error.code, error.msg);
			});
		},
		// 监听接收消息
		watchMessage: function() {
			var _this = this;
			if (im) {
				im.watch({
					conversation: function(event) {
						var updatedConversationList = event.updatedConversationList; // 更新的会话列表
						console.log('更新会话汇总:', updatedConversationList);
						console.log('最新会话列表:', im.Conversation.merge(conversationList, updatedConversationList));
					},
					message: function(event) {
						var message = event.message;
						console.log('收到新消息', message);
						$('.chat_item_container').append('<p class="chat_item"><span class="user_nickname">' + message.senderUserId +
							'：</span>' + message.content.content + '</p>');
						_this.testScroll();
					},
					status: function(event) {
						var status = event.status;
						switch (status) {
							case RongIMLib.CONNECTION_STATUS.CONNECTED:
								console.log('链接成功');
								break;
							case RongIMLib.CONNECTION_STATUS.CONNECTING:
								console.log('正在连接中');
								break;
							case RongIMLib.CONNECTION_STATUS.DISCONNECTED:
								console.log('已主动断开连接');
								break;
							case RongIMLib.CONNECTION_STATUS.NETWORK_UNAVAILABLE:
								console.log('网络不可用'); // SDK 内部会自动进行重连
								break;
							case RongIMLib.CONNECTION_STATUS.SOCKET_ERROR:
								console.log('Socket 链接错误'); // SDK 内部会自动进行重连
								break;
							case RongIMLib.CONNECTION_STATUS.KICKED_OFFLINE_BY_OTHER_CLIENT:
								console.log('其他设备登录, 本端被踢'); // 己端被踢, 不可进行重连. 否则会造成多端循环互踢
								break;
							case RongIMLib.CONNECTION_STATUS.BLOCKED:
								console.log('链接断开, 用户已被封禁');
								break;
							default:
								console.log('链接状态变化为:', status);
								break;
						}
					}
				});
			}
		},
		// 用户发送消息
		sendMessage: function() {
			var _this = this;
			if (this.isJoinChatRoom) {
				// 在聊天室发消息..............................
				chatRoom.send({
					messageType: RongIMLib.MESSAGE_TYPE.TEXT, // 'RC:TxtMsg'
					content: {
						content: '超管送你一个...' // 发送文本内容
					}
				}).then(function(message) {
					console.log('发送文字消息成功', message.senderUserId);
					$('.chat_item_container').append('<p class="chat_item"><span class="user_nickname">' + message.senderUserId +
						'：</span>' + message.content.content + '</p>');
					_this.testScroll();
				});
			}
		},
		// 用户点击发送消息按钮
		testSendMessage: function() {
			this.sendMessage();
		}
	}
})
