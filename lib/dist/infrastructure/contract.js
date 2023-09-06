"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = void 0;
class Contract {
    constructor(dataSource, mapper) {
        this.dataSource = dataSource;
        this.mapper = mapper;
    }
    refreshEntity(entity) {
        this.dataSource.entity = entity;
    }
}
exports.Contract = Contract;
//# sourceMappingURL=contract.js.map