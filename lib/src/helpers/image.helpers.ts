import { Transform } from 'stream';
import { FileAdapter } from '../infrastructure/file.adapter';
const http = require('http');
const https = require('https');

export function convertToImage(
	signature: string | undefined,
	path: string,
	fileAdapter: FileAdapter
) {
	function getPartialUrlFromAbsolute(absoluteUrl: string) {
		const pattern = /([\w\-\.]+%2F)+[\w\-\.]+/;
		const patternObj = new RegExp(pattern);
		const result = patternObj.exec(absoluteUrl);
		if (result) {
			const brutUrl = result[0].replace(/%2F/g, '/');
			return brutUrl;
		}
		return undefined;
	}
	if (!!signature) {
		if (signature.startsWith('data:image')) {
			return fileAdapter.uploadFile(path, signature).then(() => path);
		} else {
			return Promise.resolve(getPartialUrlFromAbsolute(signature));
		}
	}
	return Promise.resolve(signature);
}

export function downloadImageFromURL(url: string): Promise<string> {
	var client = http;
	if (url.startsWith('https')) {
		client = https;
	}

	return new Promise<string>((resolve) => {
		client
			.request(url, function (response: any) {
				var data = new Transform();
				response.on('data', function (chunk: any) {
					data.push(chunk);
				});
				response.on('end', function () {
					const buffer = data.read();
					resolve('data:image/jpeg;base64,' + buffer.toString('base64'));
				});
			})
			.end();
	});
}
