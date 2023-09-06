"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRepository = void 0;
const fs_1 = require("fs");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const mime = require('mime-types');
const os_1 = require("os");
const path_1 = require("path");
const file_adapter_1 = require("../file.adapter");
class FileRepository extends file_adapter_1.FileAdapter {
    constructor(storage) {
        super();
        this.storage = storage;
    }
    createLocalFile(data, location) {
        const tmp = (0, os_1.tmpdir)();
        const filepath = (0, path_1.join)(tmp, location).replace(/\\/g, '/');
        (0, fs_1.writeFileSync)(filepath, data, {
            encoding: 'base64',
        });
        return filepath;
    }
    deleteFile(filePath) {
        const restaured = filePath.split('/o/')[1].split('?')[0].replace(/%2F/g, '/');
        return (0, rxjs_1.from)(this.storage.bucket().file(restaured).delete()).pipe((0, operators_1.catchError)(() => {
            return (0, rxjs_1.of)(false);
        }));
    }
    deleteLocalFile(location) {
        try {
            (0, fs_1.unlinkSync)(location);
        }
        catch (error) { }
        if ((0, fs_1.existsSync)(location)) {
            (0, fs_1.rmSync)(location, {
                force: true,
                recursive: true,
            });
        }
    }
    getAbsoluteHTTPUrl(filePath) {
        return filePath
            ? (0, rxjs_1.from)(this.storage.bucket().file(filePath).getMetadata()).pipe((0, operators_1.catchError)(() => {
                return (0, rxjs_1.of)(null);
            }), (0, operators_1.map)((results) => {
                if (results) {
                    const metadata = results[0];
                    return metadata.mediaLink.replace('https://storage.googleapis.com/download/storage/v1', 'https://firebasestorage.googleapis.com/v0');
                }
            }))
            : (0, rxjs_1.of)('');
    }
    getRelativeUrl(filePath) {
        const fragments = filePath.split('com/o/');
        if (fragments.length > 1) {
            const temp = filePath.split('com/o/')[1];
            const newFragments = temp.split('?generation')[0];
            return newFragments.replace(/%2F/g, '/');
        }
        return filePath;
    }
    uploadFile(filePath, fileData) {
        let data = fileData.split(';base64,').pop();
        const fragments = filePath.split('/');
        const name = fragments.pop();
        const tmp = this.createLocalFile(data, name);
        const fileMime = mime.lookup(filePath);
        return (0, rxjs_1.from)(this.storage.bucket().upload(tmp, {
            destination: filePath,
            contentType: fileMime,
        })).pipe((0, operators_1.tap)(() => {
            if (name) {
                this.deleteLocalFile(tmp);
            }
        }));
    }
}
exports.FileRepository = FileRepository;
//# sourceMappingURL=firebase-file.repository.js.map