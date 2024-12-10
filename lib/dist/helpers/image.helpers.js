"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadImageFromURL = exports.convertToImage = void 0;
const stream_1 = require("stream");
const http = require('http');
const https = require('https');
function convertToImage(signature, path, fileAdapter) {
    function getPartialUrlFromAbsolute(absoluteUrl) {
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
        }
        else {
            return Promise.resolve(getPartialUrlFromAbsolute(signature));
        }
    }
    return Promise.resolve(signature);
}
exports.convertToImage = convertToImage;
function downloadImageFromURL(url) {
    var client = http;
    if (url.startsWith('https')) {
        client = https;
    }
    return new Promise((resolve) => {
        client
            .request(url, function (response) {
            var data = new stream_1.Transform();
            response.on('data', function (chunk) {
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
exports.downloadImageFromURL = downloadImageFromURL;
//# sourceMappingURL=image.helpers.js.map