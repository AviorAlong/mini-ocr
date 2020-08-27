class SecretModel {
	constructor(id) {
		this.handler = document.getElementById(id)
	}
	show() {
		this.handler.style.display = "block"
	}
	hide() {
		this.handler.style.display = "none"
		$('#setting-tip').css('display','none')
		$('input[type=text]').val('')
	}
	ok() {
		let proxy = $('input[name=isProxy]:checked').val()
		let id = $('#client_id').val()
		let secret = $('#client_secret').val()
		if (proxy === "0" && (!id || !secret)) {
			return false
		} 
		return {
			proxy: proxy,
			id: id,
			secret: secret
		}
	}
}

module.exports = SecretModel