const {
	ipcRenderer,
	clipboard
} = require('electron')
const fs = require('fs')
const path = require('path')
const secretModel = require('./secret.js')

const model = new secretModel('secret-model')
//image 内容
ipcRenderer.on('imageText', (event, message) => {
	message = message.join('\n')
	document.getElementById('image-text').textContent = message
})
// image
ipcRenderer.on('origin-image', (event, message) => {
	document.getElementById('origin-image').src = message
})
// 设置
ipcRenderer.on('setting', (event, m) => {
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
// 检查图片格式
function imgTypeCheck(file) {
	return /(jpg|jpeg|png|bmp|JPG|PNG|JPEG|BMP)$/.test(file.split('/')[1])
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
	// 调用 preventDefault() 来避免浏览器对数据的默认处理 
	event.preventDefault();
	var efile = event.originalEvent.dataTransfer.files[0];
	console.log(efile)
	if (efile.type && imgTypeCheck(efile.type)) {
		fs.readFile(efile.path, function (err, data) {
			if (err) throw err;
			let base64 = Buffer.from(data).toString('base64');
			let imgBase64 = `data:${efile.type};base64,${base64}`
			$('#origin-image').attr('src', imgBase64)
			$('#drop-tip').css('display', 'none')
			ipcRenderer.send('image-drop', imgBase64)
		});
	} else {
		$('#tip').text(`不支持该文件格式${efile.type}`)
	}
	holder.removeClass("holder-ondrag");
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
	model.hide()
})

$('.ok').on('click', () => {
	let filePath = path.resolve(__dirname, 'config/auth.json')
	let config = require(filePath)
	let setting = model.ok()
	if (setting) {
		if (setting.proxy === "1") {
			config.proxy.enable = true
		} else {
			config.direct.client_secret = setting.secret
			config.direct.client_id = setting.id
			config.proxy.enable = false
		}

		fs.writeFile(filePath, JSON.stringify(config), err => {
			if (err) {
				console.log(err)
				$('#setting-tip').css('display', 'block')
				$('#setting-tip-p').text('请输入正确的配置信息')
			} else {
				ipcRenderer.send('update-config', config)
				console.log('配置已更新')
				model.hide()
			}
		})
	} else {
		$('#setting-tip').css('display', 'block')
		$('#setting-tip-p').text('请输入正确的配置信息')
		console.log('请输入正确的配置信息')
	}
})

$('.close').on('click', () => {
	model.hide()
})

$('#image-wrap').on('keydown', (e) => {
	e.preventDefault()
	if (e.ctrlKey && e.which == 86) {
		let image = clipboard.readImage().toDataURL()
		if (image) {
			ipcRenderer.send('stick-up', image)
			$('#origin-image').attr('src', image)
			$('#drop-tip').css('display', 'none')
		} else {
			$('#tip').text(`请复制符合条件的图片`)
		}
	}
})