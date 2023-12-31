"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.operatorsHandlerMapper = exports.containsOperator = exports.permissiveEqualOperator = void 0;
const rxjs_1 = require("rxjs");
function permissiveEqualOperator(key, value) {
    return (source) => {
        return new rxjs_1.Observable((suscriber) => {
            source.subscribe({
                next: (items) => {
                    suscriber.next(items.filter((item) => {
                        return item[key].toUpperCase() === value.toUpperCase();
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
exports.operatorsHandlerMapper = {
    '=': permissiveEqualOperator,
    contains: containsOperator,
};
//# sourceMappingURL=firebase-filter-query-manager.js.map