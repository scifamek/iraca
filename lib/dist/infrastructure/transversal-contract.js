"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransversalContract = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
class TransversalContract {
    constructor(dataSource, mapper) {
        this.dataSource = dataSource;
        this.mapper = mapper;
    }
    delete(id) {
        this.refreshEntity();
        return this.dataSource.deleteById(id);
    }
    filter(filter) {
        this.refreshEntity();
        const mappedFilters = Object.assign({}, filter);
        for (const key in filter) {
            if (Object.prototype.hasOwnProperty.call(filter, key)) {
                const element = filter[key];
                delete mappedFilters[key];
                mappedFilters[this.mapper.attributesMapper[key].name] = element;
            }
        }
        return this.dataSource
            .getByFilter({
            filters: mappedFilters,
        })
            .pipe(this.mapItems());
    }
    get(pagination) {
        this.refreshEntity();
        return this.dataSource
            .getByFilter({
            pagination,
        })
            .pipe(this.mapItems());
    }
    getById(id) {
        this.refreshEntity();
        return this.dataSource.getById(id).pipe((0, operators_1.mergeMap)((group) => {
            return !!group ? this.mapper.fromJson(group) : (0, rxjs_1.of)(group);
        }));
    }
    mapItems() {
        return (0, operators_1.mergeMap)((items) => {
            return items.length > 0
                ? (0, rxjs_1.zip)(...items.map((item) => {
                    return this.mapper.fromJson(item).pipe((0, operators_1.filter)((item) => !!item));
                })).pipe((0, operators_1.map)((items) => {
                    return items;
                }))
                : (0, rxjs_1.of)([]);
        });
    }
    refreshEntity() {
        this.dataSource.entity = this.entity;
    }
    save(entity) {
        this.refreshEntity();
        return this.dataSource.save(this.mapper.toJson(entity));
    }
    update(id, entity) {
        this.refreshEntity();
        return this.dataSource.update(id, this.mapper.toJson(entity)).pipe((0, operators_1.map)(() => entity));
    }
}
exports.TransversalContract = TransversalContract;
//# sourceMappingURL=transversal-contract.js.map