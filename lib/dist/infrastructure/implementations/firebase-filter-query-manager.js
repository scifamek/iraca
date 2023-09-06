"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterWizard = exports.containsOperator = exports.permissiveEqualOperator = exports.makeFilters = exports.CustomFilterOperators = void 0;
const rxjs_1 = require("rxjs");
exports.CustomFilterOperators = ['=', 'contains'];
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
const operatorsHandlerMapper = {
    '=': permissiveEqualOperator,
    contains: containsOperator,
};
function filterWizard(query, filters, mapper) {
    const customOperators = [];
    if (filters)
        for (const key in filters) {
            const config = filters[key];
            if (Array.isArray(config)) {
                for (const innerConfig of config) {
                    query = _map(key, innerConfig, query);
                }
            }
            else {
                query = _map(key, config, query);
            }
        }
    const response = {
        query,
        pipe: customOperators,
    };
    return response;
    function _map(key, config, query) {
        let transformKey = key;
        if (!!mapper) {
            if (!mapper.attributesMapper[key]) {
            }
            else {
                transformKey = mapper.attributesMapper[key].name;
            }
        }
        if (exports.CustomFilterOperators.indexOf(config.operator) == -1) {
            query = query.where(transformKey, config.operator, config.value);
            return query;
        }
        else {
            const handler = operatorsHandlerMapper[config.operator];
            if (handler) {
                customOperators.push(handler(transformKey, config.value));
            }
        }
        return query;
    }
}
exports.filterWizard = filterWizard;
//# sourceMappingURL=firebase-filter-query-manager.js.map