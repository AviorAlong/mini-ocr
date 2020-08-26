const qs = require('querystring');
const DEFAULT_FETCH_AHEAD_DURATION = 24 * 60 * 60 * 1000
const Request = require('./request')
class Baidu {
	constructor(config) {
		this.config = config
		this.authCache = {
			access_token: '',
			expires_in: null,
			lastTokenTime: null
		}
		this.authDate = new Date()
		this.Request = new Request()
	}
	
	// 校验token是否有效
	isExpired() {

		let now = new Date();
		// 根据服务器返回的access_token过期时间，提前重新获取token
		if (this.authCache.expires_in && this.authCache.lastTokenTime && (this.authCache.lastTokenTime -
			this.authDate.getTime() > this.authCache.expires_in  -
			DEFAULT_FETCH_AHEAD_DURATION)) {
			return true;
		}
		return false;

	}
	// 获取token
	async getToken() {
		const param = qs.stringify({
			'grant_type': this.config.grant_type,
			'client_id': this.config.client_id,
			'client_secret': this.config.client_secret
		})
		let options = {
			url: `${this.config.host}/oauth/2.0/token?${param}`,
			method: 'GET',
		}
		let token = await this.Request.pmRequest(options)
		if (token && token.data && token.data.access_token) {
			let now = new Date()
			this.authCache.access_token = token.data.access_token
			this.authCache.expires_in = token.data.expires_in * 1000
			this.authCache.lastTokenTime =  now.setMilliseconds(now.getMilliseconds() + this.authCache.expires_in)
			return token
		}
	}
	// 图片转文字
	async ocrTrans(image) {

		image = encodeURI(image.split(',')[1])
		const body = qs.stringify({
			'image': image,
			'paragraph': 'true'
			// 'probability': 'true'
		})
		const param = qs.stringify({
			'access_token': this.authCache.access_token
		})
		let options = {
			url: `${this.config.host}/rest/2.0/ocr/v1/accurate_basic?${param}`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}
		let text = await this.Request.pmRequest(options, body)
		if (text && text.data) {
			return text.data
		}
	}
	// 拼接翻译结果
	transResult(src){
		let dest = []
		for (let i in src) {
			dest.push(src[i].words)			
		}
		return dest
	}
}
module.exports = Baidu