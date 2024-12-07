"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dependency_injection_1 = require("iraca/dependency-injection");
const domain_1 = require("iraca/domain");
const web_api_1 = require("iraca/web-api");
const rxjs_1 = require("rxjs");
const express = require("express");
class GetNoProgresistsUsecase extends domain_1.Usecase {
    call(params) {
        console.log(params);
        const { userId } = params;
        return (0, rxjs_1.of)('Yo no soy progresista, soy ' + userId);
    }
}
class B {
    constructor(_a) { }
}
class C {
    constructor(_b) { }
    call() {
        return (0, rxjs_1.of)('Hola C');
    }
    hi() {
        console.log('Clase C:');
    }
}
class D {
    constructor(_a) { }
}
const container = new dependency_injection_1.Container();
container.add({
    id: 'B',
    kind: B,
    strategy: 'singleton',
    dependencies: ['A'],
});
container.add({
    id: 'C',
    kind: C,
    strategy: 'singleton',
    dependencies: ['B'],
});
container.add({
    id: 'GetNoProgresistsUsecase',
    kind: GetNoProgresistsUsecase,
    strategy: 'singleton',
    dependencies: ['FIREBASE_INIT'],
});
container.add({
    id: 'D',
    kind: D,
    strategy: 'singleton',
    dependencies: ['A'],
});
const FIREBASE_INIT = { l: 213 };
container.addValue({
    id: 'FIREBASE_INIT',
    value: FIREBASE_INIT,
});
const app = express();
const router = (0, express_1.Router)();
class MyController extends web_api_1.ExpressController {
    constructor() {
        super({
            container: container,
            identifier: 'TOURNAMENTS',
            router: router,
        });
    }
    configureEndpoints() {
        this.register({
            usecaseId: 'GetNoProgresistsUsecase',
            paramsMapper: (param) => {
                return {
                    userId: param.userId.toUpperCase(),
                };
            },
        });
        this.register({
            usecaseId: 'C',
        });
    }
}
const myController = new MyController();
myController.configureEndpoints();
app.use('/api', router);
const port = 5555;
app.listen(port, () => {
    console.log('Starting users: ' + port);
});
//# sourceMappingURL=dario.js.map