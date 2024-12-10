"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mapper = void 0;
class Mapper {
    constructor() {
        this.attributesMapper = {};
    }
    fromJson(obj) {
        const values = Object.values(this.attributesMapper);
        const keys = Object.keys(this.attributesMapper);
        const newKeys = [];
        if (!obj) {
            return Promise.resolve(undefined);
        }
        for (let index = 0; index < values.length; index++) {
            const config = values[index];
            const value = config.name;
            const key = keys[index];
            let mappedValue = undefined;
            if (config.from) {
                if (obj[value] !== undefined) {
                    mappedValue = config.from(obj[value]).then((val) => {
                        return {
                            key,
                            value: val,
                        };
                    });
                }
                else if (config.default != undefined) {
                    mappedValue = Promise.resolve(config.default).then((val) => {
                        return {
                            key,
                            value: val,
                        };
                    });
                }
                else {
                    mappedValue = undefined;
                }
            }
            else {
                if (obj[value] !== undefined) {
                    mappedValue = Promise.resolve({
                        key,
                        value: obj[value],
                    });
                }
                else if (config.default !== undefined) {
                    mappedValue = Promise.resolve({
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
        return Promise.all(newKeys).then((mappedAttributes) => {
            const result = {};
            for (const mappedAttribute of mappedAttributes) {
                result[mappedAttribute.key] = mappedAttribute.value;
            }
            return result;
        });
    }
    toJson(obj) {
        const values = Object.values(this.attributesMapper);
        const keys = Object.keys(this.attributesMapper);
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
exports.Mapper = Mapper;
//# sourceMappingURL=mapper.js.map