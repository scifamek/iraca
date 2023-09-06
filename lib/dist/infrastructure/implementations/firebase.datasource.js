"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseDataSource = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const firebase_filter_query_manager_1 = require("./firebase-filter-query-manager");
const datasource_1 = require("../datasource");
class FirebaseDataSource extends datasource_1.DataSource {
    constructor(db) {
        super();
        this.db = db;
    }
    deleteById(id) {
        const entitySnapshot = this.db.collection(this.entity).doc(id);
        return (0, rxjs_1.from)(entitySnapshot.delete()).pipe((0, operators_1.map)(() => {
            return;
        }));
    }
    getByFilter(config) {
        let query = this.db.collection(this.entity);
        const filters = config === null || config === void 0 ? void 0 : config.filters;
        const pagination = config === null || config === void 0 ? void 0 : config.pagination;
        if (!!pagination) {
            if (pagination.pageNumber != 0) {
                query = query.orderBy('id').limit((pagination.pageNumber + 1) * pagination.pageSize);
                return (0, rxjs_1.from)(query.get()).pipe((0, operators_1.map)((items) => {
                    return items.docs
                        .map((item) => (Object.assign(Object.assign({}, item.data()), { id: item.id })))
                        .pop();
                }), (0, operators_1.map)((last) => {
                    if (last) {
                        query = query.startAfter(last.id).limit(pagination.pageSize);
                    }
                    return query;
                }), (0, operators_1.mergeMap)((query) => {
                    return (0, rxjs_1.from)(query.get()).pipe((0, operators_1.map)((items) => {
                        return items.docs.map((item) => (Object.assign(Object.assign({}, item.data()), { id: item.id })));
                    }));
                }));
            }
            else {
                query = query.limit(pagination.pageSize);
                return (0, rxjs_1.from)(query.get()).pipe((0, operators_1.map)((items) => {
                    return items.docs.map((item) => (Object.assign(Object.assign({}, item.data()), { id: item.id })));
                }));
            }
        }
        const computedFilters = (0, firebase_filter_query_manager_1.filterWizard)(query, filters);
        query = computedFilters.query;
        let $query = (0, rxjs_1.from)(query.get()).pipe((0, operators_1.map)((items) => {
            return items.docs.map((item) => (Object.assign(Object.assign({}, item.data()), { id: item.id })));
        }));
        for (const pipe of computedFilters.pipe) {
            $query = $query.pipe(pipe);
        }
        return $query;
    }
    getById(id) {
        return (0, rxjs_1.from)(this.db.collection(this.entity).doc(id).get()).pipe((0, operators_1.map)((item) => {
            return item.data()
                ? Object.assign(Object.assign({}, item.data()), { id: item.id })
                : undefined;
        }));
    }
    save(entity) {
        return (0, rxjs_1.from)(this.db.collection(this.entity).add(entity)).pipe((0, operators_1.map)((snapshot) => {
            return snapshot.id;
        }));
    }
    update(id, entity) {
        const docReference = this.db.collection(this.entity).doc(id);
        return (0, rxjs_1.from)(docReference.update(entity));
    }
}
exports.FirebaseDataSource = FirebaseDataSource;
//# sourceMappingURL=firebase.datasource.js.map