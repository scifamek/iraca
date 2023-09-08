"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateError = void 0;
function generateError(name, message) {
    var _a;
    const ErrorClass = (_a = class extends Error {
            constructor(extraData) {
                super();
                this.name = name;
                this.message = this.formatMessage(extraData || {}, message);
            }
            toString() {
                return `${this.name}: ${this.message}`;
            }
            formatMessage(extraData, message) {
                const pattern = /\{([\w]+)\}/;
                let find = pattern.exec(message);
                while (find) {
                    const valueToReplace = extraData[find[1]] || '';
                    message = message.replace(find[0], valueToReplace);
                    find = pattern.exec(message);
                }
                return message;
            }
        },
        _a.id = name,
        _a);
    return ErrorClass;
}
exports.generateError = generateError;
//# sourceMappingURL=errors.helpers.js.map