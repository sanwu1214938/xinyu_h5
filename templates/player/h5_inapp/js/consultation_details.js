var app = new Vue({
	el: '#app',
	data: function() {
		return {
			currentCommentType: 0, //评论类型: 0=>最热,1=>最新,2=>最早
			currentAttentionState: 0, //当前关注状态: 0=>未关注,1=>已关注
		}
	},
	created() {
		
	},
	mounted() {

	},
	destroyed() {

	},
	methods: {
		// 点关注
		payAttention: function(){
			this.currentAttentionState = !this.currentAttentionState;
		},
		// 选择评论类型
		changeCommentType: function(index) {
			this.currentCommentType = index;
		},
		// 对父评论点赞
		dianzanFu: function(){
			
		},
		// 对父评论进行评论
		commentFu: function(){
			
		},
		// 时间转换
		getCommentTime: function(time) {
			return getTime.gettime(time);
		}
	}
})
