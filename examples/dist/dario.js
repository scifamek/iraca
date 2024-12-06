"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dependency_injection_1 = require("iraca/dependency-injection");
const domain_1 = require("iraca/domain");
const web_api_1 = require("iraca/web-api");
const rxjs_1 = require("rxjs");
const express = require("express");
class A extends domain_1.Usecase {
    call() {
        return (0, rxjs_1.of)('HOla');
    }
}
class B {
    constructor(_a) { }
}
class C {
    constructor(_b) { }
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
    id: 'A',
    kind: A,
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
            app: app,
        });
    }
    configureEndpoints() {
        this.register({
            usecaseId: 'A',
        });
    }
}
const myController = new MyController();
myController.configureEndpoints();
app.use((req, res, next) => {
    const { path, method } = req;
    console.log(path, method);
    next();
    res;
});
app.get('/b', (req, res) => {
    res.send('Hello');
});
app.get('/', (req, res) => {
    res.send('Hello World!');
});
const port = 5555;
app.listen(port, () => {
    console.log('Starting users: ' + port);
});
//# sourceMappingURL=dario.js.map