class SecretModel {
	constructor(id){
		this.handler = document.getElementById(id)
	}
	show (){
		this.handler.style.display = "block"
	}
	hide (){
		this.handler.style.display = "none"
	}
	check(){

	}

	ok(){

	}
}

module.exports = SecretModel