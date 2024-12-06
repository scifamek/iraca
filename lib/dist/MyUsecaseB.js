"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyUsecaseB = void 0;
const system_1 = require("./config/system");
class MyUsecaseB extends system_1.Usecase {
    constructor() {
        super();
    }
    call(param) {
        console.log(param);
        return new system_1.DomainEvent('EVENT3', 789);
    }
}
exports.MyUsecaseB = MyUsecaseB;
MyUsecaseB.events = ['EVENT1', 'EVENT2'];
MyUsecaseB.identifier = 'MyUsecaseB';
//# sourceMappingURL=MyUsecaseB.js.map