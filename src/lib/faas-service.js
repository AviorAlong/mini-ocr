const Request = require('./request.js')
const qs = require('querystring')
class FaasService{
	constructor(config){
		this.config = config
		this.Request = new Request()
	}
	//调用阿里云faas代理转发
	async accurate(image){
		const body = qs.stringify({
			'image': image
		})
		let options = {
			url: `${this.config.host}`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}
		let text = await this.Request.pmRequest(options, body)
		console.log(text)
		if (text && text.data) {
			return text.data
		}
	}
	// 拼接翻译结果
	transResult(src){
		let dest = []
		for (let i in src) {
			dest.push(src[i].words || src[i])			
		}
		return dest
	}
}

module.exports = FaasService