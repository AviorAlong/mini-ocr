const {
	ipcRenderer
} = require('electron')
const fs = require('fs')
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

ipcRenderer.on('setting', (event, m) => {
	console.log(m)
	m = JSON.parse(m)
	let display = model.handler.style.display
	if (m && m.msg && !m.proxy) {
		console.log(m.msg)
	}

	if (display === "" || display === "none") {
		model.show()
	}
	if (m && m.proxy) {
		$('input[type=radio][name="isProxy"][value="1"]').attr('checked', true)
		$('input[type=text]').attr('disabled', true)
		$('input[type=text]').val('')
		$('.row.buttons').css('display', 'none')
	} else {
		$('.row.buttons').css('display', 'block')
		$('input[type=radio][name="isProxy"][value="0"]').attr('checked', true)
		if (m.client_secret && m.client_id) {
			$('#client_secret').val(m.client_secret)
			$('#client_id').val(m.client_id)
		}
	}
})

function imgTypeCheck(file) {
	return !/.(jpg|jpeg|png|bmp|JPG|PNG|JPEG|BMP)$/.test(file.split('/')[1])
}
const holder = $('#image-wrap')
holder.on("dragenter dragover", function (event) {
	// 重写ondragover 和 ondragenter 使其可放置
	event.preventDefault();
	holder.addClass("holder-ondrag");
});

holder.on("dragleave", function (event) {
	event.preventDefault();
	holder.removeClass("holder-ondrag");
});

holder.on("drop", function (event) {
	// 调用 preventDefault() 来避免浏览器对数据的默认处理（drop 事件的默认行为是以链接形式打开） 
	event.preventDefault();
	// 原生语句如下，但引进jquery后要更改
	// var file=event.dataTransfer.files[0];
	// 原因：
	// 在jquery中，最终传入事件处理程序的 event 其实已经被 jQuery 做过标准化处理，
	// 其原有的事件对象则被保存于 event 对象的 originalEvent 属性之中，
	// 每个 event 都是 jQuery.Event 的实例
	// 应该这样写:
	var efile = event.originalEvent.dataTransfer.files[0];
	console.log(efile)
	if (efile.type && imgTypeCheck(efile.type)) {
		fs.readFile(efile.path, function (err, data) {
			if (err) throw err;
			let base64 = Buffer.from(data).toString('base64');
			let imgBase64 = `data:${efile.type};base64,${base64}`
			$('#origin-image').attr('src', imgBase64)
			$('#drop-tip').attr('display','none')
			ipcRenderer.send('image-drop',imgBase64)
		});
	} else {
		$('#drop-tip').text = `不支持该图片格式${efile.type}`
	}
	holder.removeClass("holder-ondrag");

	return false;
});



$('input[type=radio][name="isProxy"]').change(() => {
	let isProxy = $('input[type=radio][name="isProxy"]:checked').val()
	if (isProxy === '1') {
		$('input[type=text]').attr('disabled', true)
		$('input[type=text]').val('')
	} else {
		$('.row.buttons').css('display', 'block')
		$('input[type=text]').attr('disabled', false)
		$('input[type=text]').val('')
	}
})


$('.cancel').on('click', () => {
	$('input[type=text]').val('')
	model.hide()
})

$('.ok').on('click', () => {
	let checkResult = model.check()
	if (checkResult) {
		model.ok()
	} else {
		console.log('参数不正确')
	}
})

$('.close').on('click', () => {
	$('input[type=text]').val('')
	model.hide()
})