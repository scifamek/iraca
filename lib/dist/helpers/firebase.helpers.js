"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unifyData = void 0;
function unifyData(data) {
    const response = data.data();
    if (!response) {
        return undefined;
    }
    return {
        ...data.data(),
        id: data.id,
    };
}
exports.unifyData = unifyData;
//# sourceMappingURL=firebase.helpers.js.map