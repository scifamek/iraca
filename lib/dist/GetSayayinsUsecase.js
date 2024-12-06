"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSayayinsUsecase = void 0;
const system_1 = require("./config/system");
class GetSayayinsUsecase extends system_1.Usecase {
    constructor(myUsecaseB) {
        super();
        this.myUsecaseB = myUsecaseB;
        console.log('Dependencia ', this.myUsecaseB);
    }
    call(param) {
        console.log(param);
        return new system_1.DomainEvent('EVENT3', 789);
    }
}
exports.GetSayayinsUsecase = GetSayayinsUsecase;
GetSayayinsUsecase.events = ['EVENT1', 'EVENT2'];
GetSayayinsUsecase.identifier = 'GetSayayinsUsecase';
//# sourceMappingURL=GetSayayinsUsecase.js.map