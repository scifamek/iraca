"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadImageFromURL = exports.convertToImage = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
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
            return fileAdapter.uploadFile(path, signature).pipe((0, operators_1.map)(() => path));
        }
        else {
            return (0, rxjs_1.of)(getPartialUrlFromAbsolute(signature));
        }
    }
    return (0, rxjs_1.of)(signature);
}
exports.convertToImage = convertToImage;
function downloadImageFromURL(url) {
    var client = http;
    if (url.startsWith('https')) {
        client = https;
    }
    return (0, rxjs_1.from)(new Promise((resolve) => {
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
    }));
}
exports.downloadImageFromURL = downloadImageFromURL;
//# sourceMappingURL=image.helpers.js.map