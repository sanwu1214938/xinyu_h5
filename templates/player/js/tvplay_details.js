var myPlayer;
// var apiBaseUrl = "http://47.115.86.202:85/";
var apiBaseUrl = "https://www.amm.tv/";
var appVersion = "1.0.0";
// var groupId = 4;
// var dramaId = 19;
// var targetId = 4;

var app = new Vue({
	el: '#app',
	data: function() {
		return {
			currentTab: 0, //选项卡类型: 0=>视频选项卡,1=>简介弹出框,2=>选集弹出框,3=>猜你喜欢弹出框,4=>评论选项卡
			currentCommentType: 0, //评论类型: 0=>最热,1=>最新,2=>最早
			commentListData: [], // 评论列表
			commentTotalNum: 0, // 总评论数量
			currentChooseType: 0, //0=>选集,1=>分集简介
			currentGroupNum: 50, //电视总集数的分组: 十个为一组...
			currentTvNumGroupIdx: 0, //电视总集数的分组: 0=>第一组...
			currentTvState: 0, //0=>暂停,1=>播放

			appVersion: '', // App版本
			apiBaseUrl: '', // 接口域名
			imgBaseUrl: '', // 图片域名
			vid: '', // 视频ID
			playAuth: '', // 播放凭证
			dramaId: '', // 剧集ID
			dataId: '', // 对应每一个视频的ID
			groupId: '',
			targetId: '',
			currentTvData: {}, // 电视剧所有信息
			currentTvTitle: '', // 电视剧名
			currentTvSubtitle: '', // 每一集的标题
			hotNum: 0, // 电视剧热度
			currentTvType: '', // 电视剧类型
			currentTvScore: 0, // 当前评分
			currentTvDesc: '', // 电视剧简介
			updateExplain: '', // 更新规则说明
			releaseDate: '', // 电视剧上映时间
			isVip: '', // 视频是否VIP
			isTrailer: false, // 是否是预告
			jumpAddress: '', // 跳转地址
			currentVideoIdx: 0, //当前视频idx
			currentVideoSrc: '', //当前视频src
			currentVideoPoster: '', //当前视频封面
			currentTvTotalNum: 0, //当前电视剧总集数
			currentTvTotalNumList: [], // 将剧集总数转换为一个数字数组,方便处理
			currentTvUpdateNum: 0, // 当前电视剧更新集数
			currentTvUpdateNumList: [], // 将剧集更新集数转换为一个数字数组,方便处理
			currentTvUpdateList: [], // 视频列表
			gatherList: [], // TV信息
			net404: false,

			language: {}, // 语言
			languageType: ''
		}
	},
	created() {
		var _this = this;
		// console.log(this.GetUrlData('groupId'));
		// this.groupId = this.GetUrlData('groupId') || '' || groupId;
		// this.dramaId = this.GetUrlData('dramaId') || '' || dramaId;
		// this.dataId = this.GetUrlData('dataId') || '';
		// this.targetId = this.GetUrlData('targetId') || '';
		this.groupId = groupId;
		this.dramaId = dramaId;
		this.apiBaseUrl = apiBaseUrl;
		this.appVersion = appVersion;
		// 获取配置
		this.getAppConfig();

		// 获取多语言数据
		this.languageType = langInfo;
		this.getLanguageData((data, str) => {
			console.log("语言数据", data);
			console.log("语言", str);
			_this.language = data;
			// $(function() {
			// 	$("#language_video").text(data.comm.video);
			// 	$("#language_comment").text(data.comm.video);
			// });
		});
	},
	mounted() {
		var _this = this;

		// 请求剧集接口,初始化数据
		$.ajax({
			type: "get",
			url: apiBaseUrl + "player/getPlayerDramaDetail",
			data: {
				groupId: this.groupId,
				dramaId: this.dramaId
			},
			success: (res) => {
				if (res.code == 0) {
					console.log('mounted剧集请求结果', res.data);
					// 初始化数据
					this.currentTvData = res.data; // 总数据
					this.dramaId = this.currentTvData.id;
					this.currentTvTitle = this.currentTvData.title;
					this.currentTvSubtitle = this.currentTvData.subtitle;
					$('title').text('' + this.currentTvSubtitle + '');
					this.currentVideoPoster = this.imgBaseUrl + this.currentTvData.cover;
					this.currentTvDesc = this.currentTvData.synopsis;
					this.vid = this.currentTvData.videoId;
					this.updateExplain = this.currentTvData.updateExplain;
					this.currentTvType = this.currentTvData.dramaType;
					this.currentTvUpdateNum = this.currentTvData.updateTotal;
					this.currentTvTotalNum = this.currentTvData.finalTotal;
					this.gatherList = this.currentTvData.gather;
					this.hotNum = this.currentTvData.hotNum;
					// 将剧集更新集数转换为一个数字数组,方便处理
					this.currentTvUpdateNumList = [];
					for (var i = 0; i < this.currentTvUpdateNum; i++) {
						this.currentTvUpdateNumList.push(i + 1);
					}
					this.releaseDate = this.currentTvData.releaseDate;
					this.isVip = this.currentTvData.isVip;
					this.currentTvUpdateList = this.currentTvData.groupList;
					if (this.currentTvUpdateList) {
						for (var i = 0; i < this.currentTvUpdateList.length; i++) {
							if (this.dramaId == this.currentTvUpdateList[i].dataId) {
								this.currentVideoIdx = i;
							}
						}
					}
					// 播放凭证
					$.ajax({
						type: "post",
						url: apiBaseUrl + "vod/get_video_play_auth",
						data: {
							videoId: this.vid
						},
						success: (res) => {
							if (res.code == 0) {
								console.log('播放凭证请求结果', res.data);
								this.vid = res.data.videoMeta.videoId;
								this.playAuth = res.data.playAuth;
								this.currentVideoPoster = res.data.videoMeta.coverURL;
								// 初始化 阿里云播放器
								myPlayer = new Aliplayer({
									id: 'J_prismPlayer',
									width: '100%',
									height: '100%',
									autoplay: false,
									//支持播放地址播放,此播放优先级最高
									// source: _this.currentVideoSrc,
									//播放方式二：点播用户推荐
									vid: _this.vid,
									playauth: _this.playAuth,
									cover: _this.currentVideoPoster,
									encryptType: 1, //当播放私有加密流时需要设置。
								}, function(myPlayer) {
									console.log('播放器创建好了。');
								});
							} else {
								alert("播放出错!");
							}
						},
						error: (err) => {
							console.log(err);
						}
					});
				} else {
					this.net404 = true;
				}
			},
			error: (err) => {
				this.net404 = true;
			}
		});

		// 演员列表...
		// $.ajax({
		// 	type: "get",
		// 	url: apiBaseUrl + "player/cast/list",
		// 	data: {
		// 		targetId: this.targetId
		// 	},
		// 	success: (res) => {
		// 		console.log('演员请求结果', res);
		// 		// 初始化数据...
		// 	},
		// 	error: (err) => {
		// 		console.log(err);
		// 	}
		// });

		// 评论列表...
		$.ajax({
			type: "get",
			url: apiBaseUrl + "evaluate/comment/list",
			data: {
				moduleName: 'drama',
				objectId: this.dataId ? this.dataId : this.dramaId,
				sorts: 'likeNum'
			},
			success: (res) => {
				if (res.code == 0) {
					console.log('评论请求结果', res.data);
					// 初始化数据...
					this.commentListData = res.data;
				} else {
					this.commentListData = null;
				}

				if (this.commentListData) {
					this.commentTotalNum = this.commentListData.length;
				} else {
					this.commentTotalNum = 0;
				}
			},
			error: (err) => {
				console.log(err);
			}
		});
	},
	destroyed() {

	},
	//定义私用局部过滤器。只能在当前 vue 对象中使用
	filters: {
		// 时间转换
		getCommentTime: function(time) {
			// var date = new Date(time);
			// console.log(Date.parse(date));
			var year = time.toString().slice(0, 4);
			var month = time.toString().slice(4, 6);
			var day = time.toString().slice(6, 8);
			var hour = time.toString().slice(8, 10);
			var minute = time.toString().slice(10, 12);
			var second = time.toString().slice(12);
			var timeStr = '' + year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
			// var transformTime = new Date(year,month,day,hour,minute,second).valueOf();
			var transformTime = new Date(timeStr).valueOf();
			// console.log(year,month,day,hour,minute,second);
			// console.log("transformTime:", transformTime);
			return getTime.gettime(transformTime);
		}
	},
	methods: {
		// 切换Tab
		changeTab: function(index) {
			this.currentTab = index;
		},
		// 选择剧集...
		chooseVideo: function(index) {
			// 选择剧集播放,需要请求播放凭证
			this.currentVideoIdx = index;
			// this.currentTvTitle = this.currentTvUpdateList[index].title;
			// this.currentTvSubtitle = this.currentTvUpdateList[index].subtitle;
			this.jumpAddress = this.currentTvUpdateList[index].jumpAddress;

			// 获取每一集对应的dataId,重新请求player/getPlayerDramaDetail接口,去取videoId,然后根据videoId请求播放凭证;
			this.dataId = this.currentTvUpdateList[index].dataId;
			this.groupId = this.currentTvUpdateList[index].groupId;
			// 播放剧集
			$.ajax({
				type: "get",
				url: apiBaseUrl + "player/getPlayerDramaDetail",
				data: {
					groupId: this.groupId,
					dramaId: this.dataId
				},
				success: (res) => {
					if (res.code == 0) {
						console.log('选择剧集请求结果', res.data);
						// 初始化数据
						this.currentTvData = res.data; // 总数据
						this.currentTvTitle = this.currentTvData.title;
						this.currentTvSubtitle = this.currentTvData.subtitle;
						$('title').text('' + this.currentTvSubtitle + '');
						this.currentVideoPoster = this.imgBaseUrl + this.currentTvData.cover;
						this.currentTvDesc = this.currentTvData.synopsis;
						this.vid = this.currentTvData.videoId;
						this.updateExplain = this.currentTvData.updateExplain;
						this.currentTvType = this.currentTvData.dramaType;
						this.currentTvUpdateNum = this.currentTvData.updateTotal;
						this.currentTvTotalNum = this.currentTvData.finalTotal;
						this.gatherList = this.currentTvData.gather;
						this.hotNum = this.currentTvData.hotNum;
						// 将剧集更新集数转换为一个数字数组,方便处理
						this.currentTvUpdateNumList = [];
						for (var i = 0; i < this.currentTvUpdateNum; i++) {
							this.currentTvUpdateNumList.push(i + 1);
						}
						this.releaseDate = this.currentTvData.releaseDate;
						this.isVip = this.currentTvData.isVip;
						this.currentTvUpdateList = this.currentTvData.groupList;

						this.currentCommentType = 0;

						// 播放凭证
						$.ajax({
							type: "post",
							url: apiBaseUrl + "vod/get_video_play_auth",
							data: {
								videoId: this.vid
							},
							success: (res) => {
								if (res.code == 0) {
									console.log('播放凭证请求结果', res.data);
									this.vid = res.data.videoMeta.videoId;
									this.playAuth = res.data.playAuth;
									this.currentVideoPoster = res.data.videoMeta.coverURL;
									console.log(this.vid, this.playAuth);
									// 加载新视频
									// myPlayer.loadByUrl(this.currentVideoSrc);
									myPlayer.replayByVidAndPlayAuth(this.vid, this.playAuth);
									setTimeout(() => {
										myPlayer.play();
										$('video').trigger('play');
									}, 600)
								} else {
									alert("播放出错!");
								}
							},
							error: (err) => {
								console.log(err);
							}
						});

						// 评论列表...
						$.ajax({
							type: "get",
							url: apiBaseUrl + "evaluate/comment/list",
							data: {
								moduleName: 'drama',
								objectId: this.dataId ? this.dataId : this.groupId,
								sorts: 'likeNum'
							},
							success: (res) => {
								if (res.code == 0) {
									console.log('评论请求结果', res.data);
									// 初始化数据...
									this.commentListData = res.data;
								} else {
									this.commentListData = null;
								}

								if (this.commentListData) {
									this.commentTotalNum = this.commentListData.length;
								} else {
									this.commentTotalNum = 0;
								}
							},
							error: (err) => {
								console.log(err);
							}
						});
					} else {
						this.net404 = true;
					}
				},
				error: (err) => {
					this.net404 = true;
				}
			});
		},
		// 选择评论类型
		changeCommentType: function(index) {
			this.currentCommentType = index;
			var sorts = null;
			var direction = null;
			// 判断评论类型
			switch (index) {
				case 0:
					sorts = "likeNum";
					break;
				case 1:
					sorts = null;
					break;
				case 2:
					sorts = null;
					direction = 'asc';
					break;
				default:
					sorts = "likeNum";
			}
			// 评论列表...
			if (sorts) {
				$.ajax({
					type: "get",
					url: apiBaseUrl + "evaluate/comment/list",
					data: {
						moduleName: 'drama',
						objectId: this.dataId ? this.dataId : this.dramaId,
						sorts: sorts
					},
					success: (res) => {
						if (res.code == 0) {
							console.log('评论请求结果', res.data);
							// 初始化数据...
							this.commentListData = res.data;
						} else {
							this.commentListData = null;
						}

						if (this.commentListData) {
							this.commentTotalNum = this.commentListData.length;
						} else {
							this.commentTotalNum = 0;
						}
					},
					error: (err) => {
						console.log(err);
					}
				});
			} else {
				if (direction) {
					$.ajax({
						type: "get",
						url: apiBaseUrl + "evaluate/comment/list",
						data: {
							moduleName: 'drama',
							objectId: this.dataId ? this.dataId : this.dramaId,
							direction: direction
						},
						success: (res) => {
							if (res.code == 0) {
								console.log('评论请求结果', res.data);
								// 初始化数据...
								this.commentListData = res.data;
							} else {
								this.commentListData = null;
							}

							if (this.commentListData) {
								this.commentTotalNum = this.commentListData.length;
							} else {
								this.commentTotalNum = 0;
							}
						},
						error: (err) => {
							console.log(err);
						}
					});
				} else {
					$.ajax({
						type: "get",
						url: apiBaseUrl + "evaluate/comment/list",
						data: {
							moduleName: 'drama',
							objectId: this.dataId ? this.dataId : this.dramaId
						},
						success: (res) => {
							if (res.code == 0) {
								console.log('评论请求结果', res.data);
								// 初始化数据...
								this.commentListData = res.data;
							} else {
								this.commentListData = null;
							}

							if (this.commentListData) {
								this.commentTotalNum = this.commentListData.length;
							} else {
								this.commentTotalNum = 0;
							}
						},
						error: (err) => {
							console.log(err);
						}
					});
				}
			}
		},
		// 选集 or 分集简介
		changeChooseType: function(index) {
			this.currentChooseType = index;
		},
		// 将集数数组拆分
		splitTvTotalNumArr(dataList, num) {
			let arr = [];
			let len = dataList.length;
			for (let i = 0; i < len; i += num) {
				arr.push(dataList.slice(i, i + num));
			}
			return arr;
		},
		// 选择集数分组
		changecurrentTvNumGroupIdx: function(index) {
			this.currentTvNumGroupIdx = index;
		},
		// 获取url参数值
		GetUrlData: function(paras) {
			var url = location.href;
			if (url.charAt(url.indexOf("?") + 1) == "&") {
				paraString = url.substring(url.indexOf("?") + 2, url.length).split("&");
			} else {
				paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
			}
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
		// 获取基本配置信息,如图片地址域名...
		getAppConfig: function() {
			$.ajax({
				type: "get",
				url: apiBaseUrl + "server/getAppConfig",
				data: {
					appVersion: appVersion
				},
				success: (res) => {
					if (res.code == 0) {
						console.log('配置请求结果', res.data);
						// 初始化数据...
						this.imgBaseUrl = res.data.image_server;
					} else {
						alert("请求配置出错!");
					}
				},
				error: (err) => {
					console.log(err);
				}
			});
		},
		// 刷新网页
		refreshPage: function() {
			location.reload();
		},
		// 获取语言文件
		getLanguageData: function(fun) {
			var str = (!langInfo || langInfo == "zh_CN") ? "zh_CN" : langInfo;
			$.ajax({
				url: "lang/" + str + ".json",
				async: false,
				success: function(data) {
					fun(data, str);
				}
			});
		}
	}
})
