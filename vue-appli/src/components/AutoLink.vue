<template><span v-html="output"></span></template>

<script>
	export default {
		name: 'AutoLink',
		props: {
			text: String
		},
		data(){
			return {
				output: "",
			}
		},
		created: function(){
			this.output = this.text.replace(/\n/g,'<br>');
			this.output = this.output.replace(/(https?:\/\/[\w!?/+\-_~=;.,*&@#$%()'[\]]+)/g, "<a href='$1' target='_blank'>$1</a>");
		},
		watch: {
			text : function(){
				this.output = this.text.replace(/\n/g,'<br>');
				this.output = this.output.replace(/(https?:\/\/[\w!?/+\-_~=;.,*&@#$%()'[\]]+)/g, "<a href='$1' target='_blank'>$1</a>");
			}
		}

	}
</script>