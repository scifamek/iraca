"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Traslator = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
class Traslator {
    constructor() {
        this.attributes = {};
    }
    fromJson(obj) {
        const values = Object.values(this.attributes);
        const keys = Object.keys(this.attributes);
        const newKeys = [];
        if (!obj) {
            return (0, rxjs_1.of)(undefined);
        }
        for (let index = 0; index < values.length; index++) {
            const config = values[index];
            const value = config.name;
            const key = keys[index];
            let mappedValue = undefined;
            if (config.from) {
                if (obj[value] !== undefined) {
                    mappedValue = config.from(obj[value]).pipe((0, operators_1.map)((val) => {
                        return {
                            key,
                            value: val,
                        };
                    }));
                }
                else if (config.default != undefined) {
                    mappedValue = (0, rxjs_1.of)(config.default).pipe((0, operators_1.map)((val) => {
                        return {
                            key,
                            value: val,
                        };
                    }));
                }
                else {
                    mappedValue = undefined;
                }
            }
            else {
                if (obj[value] !== undefined) {
                    mappedValue = (0, rxjs_1.of)({
                        key,
                        value: obj[value],
                    });
                }
                else if (config.default !== undefined) {
                    mappedValue = (0, rxjs_1.of)({
                        key,
                        value: config.default,
                    });
                }
                else {
                    mappedValue = undefined;
                }
            }
            if (mappedValue) {
                newKeys.push(mappedValue);
            }
        }
        return newKeys.length > 0
            ? (0, rxjs_1.zip)(...newKeys).pipe((0, operators_1.map)((mappedAttributes) => {
                const result = {};
                for (const mappedAttribute of mappedAttributes) {
                    result[mappedAttribute.key] = mappedAttribute.value;
                }
                return result;
            }))
            : (0, rxjs_1.of)({});
    }
    toJson(obj) {
        const values = Object.values(this.attributes);
        const keys = Object.keys(this.attributes);
        const result = {};
        for (let index = 0; index < values.length; index++) {
            const config = values[index];
            const value = values[index].name;
            const key = keys[index];
            let mappedValue = undefined;
            if (obj[key] === undefined) {
                if (config.default !== undefined) {
                    mappedValue = config.default;
                }
            }
            else {
                mappedValue = obj[key];
                if (config.to) {
                    mappedValue = config.to(obj[key]);
                }
            }
            if (mappedValue !== undefined) {
                result[value] = mappedValue;
            }
        }
        return result;
    }
}
exports.Traslator = Traslator;
//# sourceMappingURL=translator.js.map