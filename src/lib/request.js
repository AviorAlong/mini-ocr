const net = require('electron').net

class Request{

	async pmRequest(options, data = null) {
		return new Promise((resolve, reject) => {

			let {
				method,
				url
			} = options;
			const request = net.request({
				method,
				url
			})
			const headers = options.headers;
			if (headers) {
				for (let key in headers) {
					request.setHeader(key, headers[key]);
				}
			}
			if (options.method == 'post' || options.method == 'POST' && data) {
				request.write(data)
			}
			request.on('response', (response) => {
				response.setEncoding('utf8')
				let temp = ''
				response.on('data', (chunk) => {
					temp += chunk
				})
				response.on('end', () => {
					console.log(url, temp)
					resolve({
						data: JSON.parse(temp),
						statusCode: response.statusCode,
						headers: response.headers
					})
				})

			})
			request.on('error', (err) => {
				console.log(err)
				reject(err)
			})

			request.end()
		})
	}
}

module.exports = Request