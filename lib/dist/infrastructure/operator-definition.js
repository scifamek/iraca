"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPERATORS_HANDLER_MAPPER = exports.containsOperator = exports.permissiveEqualOperator = void 0;
const rxjs_1 = require("rxjs");
function permissiveEqualOperator(key, value) {
    return (source) => {
        return new rxjs_1.Observable((suscriber) => {
            source.subscribe({
                next: (items) => {
                    suscriber.next(items.filter((item) => {
                        var _a;
                        return ((_a = item[key]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === value.toUpperCase();
                    }));
                },
                error: () => suscriber.error(),
                complete: () => suscriber.complete(),
            });
        });
    };
}
exports.permissiveEqualOperator = permissiveEqualOperator;
function containsOperator(key, value) {
    return (source) => {
        return new rxjs_1.Observable((suscriber) => {
            source.subscribe({
                next: (items) => {
                    suscriber.next(items.filter((item) => {
                        return item[key].toUpperCase().includes(value.toUpperCase());
                    }));
                },
                error: () => {
                    return suscriber.error();
                },
                complete: () => suscriber.complete(),
            });
        });
    };
}
exports.containsOperator = containsOperator;
exports.OPERATORS_HANDLER_MAPPER = {
    '=': permissiveEqualOperator,
    contains: containsOperator,
};
//# sourceMappingURL=operator-definition.js.map