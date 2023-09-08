"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFilters = exports.FilterOperators = void 0;
exports.FilterOperators = ['<', '<=', '==', '!=', '>=', '>', 'array-contains', 'in', 'not-in', 'array-contains-any', '=', 'contains'];
function makeFilters(data, operator = 'contains') {
    const response = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key];
            response[key] = {
                operator,
                value,
            };
        }
    }
    return response;
}
exports.makeFilters = makeFilters;
//# sourceMappingURL=filters.js.map