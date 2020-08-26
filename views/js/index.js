const { ipcRenderer } = require('electron')
const secretModel = require('./views/js/secret.js')

let model = new secretModel('secret-model')
// model.show()

ipcRenderer.on('imageText', (event, message) => {
	message = message.join('\n')
	document.getElementById('image-text').textContent = message
})
ipcRenderer.on('origin-image', (event, message) => {
	document.getElementById('origin-image').src = message
})

ipcRenderer.on('setting', (event, message) => {
	let display = model.handler.style.display
	if(display === "none"){
		model.show()
	}
})

$('input[type=radio][name="isProxy"]').change(() => {
	let isProxy = $('input[type=radio][name="isProxy"]:checked').val()
	if(isProxy === '1'){
		$('input[type=text]').attr('disabled',true)
		$('input[type=text]').val('')
	}else{
		$('input[type=text]').attr('disabled',false)
		$('input[type=text]').val('')
	}
})

$('.cancel').on('click',()=>{
	$('input[type=text]').val('')
	model.hide()
})

$('.ok').on('click',()=>{
	let checkResult = model.check()
	if(checkResult){
		model.ok()
	}else{
		console.log('参数不正确')
	}
})