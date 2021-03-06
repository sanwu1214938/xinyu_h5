var myPlayer;
// var apiBaseUrl = "http://47.115.86.202:85/";
var apiBaseUrl = "https://www.amm.tv/";
var appVersion = "1.0.0";
// var groupId = 0; // 组别ID
// var varietyId = 2; // 综艺ID
// var dataId = 2; // 每个视频对应的ID,用户点击选择播放时,将dataId作为varietyId去请求接口

var app = new Vue({
	el: '#app',
	data: function() {
		return {
			currentTab: 0, //选项卡类型: 0=>视频选项卡,1=>简介弹出框,2=>选集弹出框,3=>猜你喜欢弹出框,4=>评论选项卡
			currentVideoSrc: '', //当前视频src
			currentCommentType: 0, //评论类型: 0=>最热,1=>最新,2=>最早
			currentMoreItemIdx: 0, //查看更多当前选中项
			commentListData: null, // 评论列表
			commentTotalNum: 0, // 总评论数

			appVersion: '', // App版本
			apiBaseUrl: '', // 接口域名
			imgBaseUrl: '', // 图片域名
			vid: '', // 视频ID
			playAuth: '', // 播放凭证
			dataId: '', // 对应每一个视频的ID
			varietyId: '', // 获取综艺详情需要携带的参数
			groupId: '', // 组别ID
			targetId: '', // 获取演员列表需要携带的参数
			hotNum: '', // 热度
			areaId: '', // 发布地区
			groupList: null, // 系列列表(为null时不显示系列UI出来)
			groupTitle: '',
			isVip: '', // 是否VIP播放
			releaseDate: '', // 发布年份
			specs: '', // 综艺规格
			updateTime: '', // 更新时间
			updateExplain: '', // 更新说明
			updateTotal: '', // 更新期数
			varietyType: '', // 综艺类型（自制，播报，访谈，选秀等）
			currentVarietyData: {}, // 综艺数据
			currentVarietyTitle: '',
			currentVarietySubtitle: '',
			currentVarietyPoster: '', // 封面
			currentVarietyDesc: '', // 简介
			explain: '', // 说明
			gatherList: '', // 一些综艺信息
			tally: '', // 计数
			themeType: '', // 题材（音乐，舞蹈等）
			jumpAddress: '', // 跳转地址
			net404: false,
			
			language: {}, // 语言
			languageType: ''
		}
	},
	created() {
		var _this = this;
		// console.log(this.GetUrlData('groupId'));
		// this.groupId = this.GetUrlData('groupId') || '' || groupId;
		// this.varietyId = this.GetUrlData('varietyId') || '' || varietyId;
		// this.dataId = this.GetUrlData('dataId') || '';
		// this.targetId = this.GetUrlData('targetId') || '';
		this.groupId = groupId;
		this.varietyId = varietyId;
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
		// 请求综艺接口,初始化数据
		$.ajax({
			type: "get",
			url: apiBaseUrl + "player/getPlayerVarietyDetail",
			data: {
				groupId: this.groupId,
				varietyId: this.varietyId
			},
			success: (res) => {
				if (res.code == 0) {
					console.log('mounted综艺请求结果', res.data);
					// 初始化数据
					this.currentVarietyData = res.data;
					this.varietyId = this.currentVarietyData.id;
					this.currentVarietyTitle = this.currentVarietyData.title;
					this.currentVarietySubtitle = this.currentVarietyData.subtitle;
					$('title').text('' + this.currentVarietySubtitle + '');
					this.currentVarietyPoster = this.currentVarietyData.cover;
					this.currentVarietyDesc = this.currentVarietyData.synopsis;
					this.explain = this.currentVarietyData.explain;
					this.vid = this.currentVarietyData.videoId;
					this.groupId = this.currentVarietyData.groupId;
					this.hotNum = this.currentVarietyData.hotNum;
					this.groupTitle = this.currentVarietyData.groupTitle;
					this.groupList = this.currentVarietyData.groupList ? this.currentVarietyData.groupList : null;
					if (this.groupList) {
						for (var i = 0; i < this.groupList.length; i++) {
							if (this.varietyId == this.groupList[i].dataId) {
								this.currentMoreItemIdx = i;
							}
						}
					}
					this.releaseDate = this.currentVarietyData.releaseDate;
					this.areaId = this.currentVarietyData.areaId;
					this.varietyType = this.currentVarietyData.varietyType;
					this.specs = this.currentVarietyData.specs;
					this.isVip = this.currentVarietyData.isVip;
					this.updateTime = this.currentVarietyData.updateTime;
					this.updateExplain = this.currentVarietyData.updateExplain;
					this.updateTotal = this.currentVarietyData.updateTotal;
					this.gatherList = this.currentVarietyData.gather;
					this.tally = this.currentVarietyData.tally;

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

		// // 演员列表...
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
				moduleName: 'variety',
				objectId: this.dataId ? this.dataId : this.varietyId,
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
						moduleName: 'variety',
						objectId: this.dataId ? this.dataId : this.varietyId,
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
							moduleName: 'variety',
							objectId: this.dataId ? this.dataId : this.varietyId,
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
							moduleName: 'variety',
							objectId: this.dataId ? this.dataId : this.varietyId
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
		// 用户点击切换当前查看更多
		changeWatchMoreItem: function(index) {
			this.currentMoreItemIdx = index;

			// 选择剧集播放,需要请求播放凭证
			// this.currentVarietyTitle = this.groupList[index].title;
			// this.currentVarietySubtitle = this.groupList[index].subtitle;
			this.jumpAddress = this.groupList[index].jumpAddress;

			// 获取每一集对应的dataId,重新请求/player/getPlayerVarietyDetail接口,去取videoId,然后根据videoId请求播放凭证;
			this.dataId = this.groupList[index].dataId;
			this.groupId = this.groupList[index].groupId;
			// 播放剧集
			$.ajax({
				type: "get",
				url: apiBaseUrl + "player/getPlayerVarietyDetail",
				data: {
					groupId: this.groupId,
					varietyId: this.dataId
				},
				success: (res) => {
					if (res.code == 0) {
						console.log('选择综艺请求结果', res.data);
						// 初始化数据
						this.currentVarietyData = res.data;
						this.varietyId = this.currentVarietyData.id;
						this.currentVarietyTitle = this.currentVarietyData.title;
						this.currentVarietySubtitle = this.currentVarietyData.subtitle;
						$('title').text('' + this.currentVarietySubtitle + '');
						this.currentVarietyPoster = this.currentVarietyData.cover;
						this.currentVarietyDesc = this.currentVarietyData.synopsis;
						this.explain = this.currentVarietyData.explain;
						this.vid = this.currentVarietyData.videoId;
						this.groupId = this.currentVarietyData.groupId;
						this.hotNum = this.currentVarietyData.hotNum;
						this.groupTitle = this.currentVarietyData.groupTitle;
						this.groupList = this.currentVarietyData.groupList ? this.currentVarietyData.groupList : null;
						this.releaseDate = this.currentVarietyData.releaseDate;
						this.areaId = this.currentVarietyData.areaId;
						this.varietyType = this.currentVarietyData.varietyType;
						this.specs = this.currentVarietyData.specs;
						this.isVip = this.currentVarietyData.isVip;
						this.updateTime = this.currentVarietyData.updateTime;
						this.updateExplain = this.currentVarietyData.updateExplain;
						this.updateTotal = this.currentVarietyData.updateTotal;
						this.gatherList = this.currentVarietyData.gather;
						this.tally = this.currentVarietyData.tally;

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
								moduleName: 'variety',
								objectId: this.dataId ? this.dataId : this.varietyId,
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
