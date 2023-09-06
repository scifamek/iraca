"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unifyData = exports.mapFromSnapshot = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
function mapFromSnapshot(response, mapper = (x) => x) {
    return (0, rxjs_1.from)(response).pipe((0, operators_1.map)((snapshot) => {
        return snapshot.docs;
    }), (0, operators_1.map)((snapshot) => {
        return snapshot.map((x) => {
            return Object.assign(Object.assign({}, x.data()), { id: x.id });
        });
    }), (0, operators_1.map)((data) => {
        return data.map((y) => mapper(y));
    }));
}
exports.mapFromSnapshot = mapFromSnapshot;
function unifyData(data) {
    const response = data.data();
    if (!response) {
        return undefined;
    }
    return Object.assign(Object.assign({}, data.data()), { id: data.id });
}
exports.unifyData = unifyData;
//# sourceMappingURL=firebase.helpers.js.map