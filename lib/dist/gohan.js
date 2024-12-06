"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.D = exports.C = exports.A = exports.B = void 0;
const system_1 = require("./config/system");
const container_1 = require("./dependency-injection/container");
class B {
    constructor(_a) { }
}
exports.B = B;
class A {
    constructor() {
        this.data = '#';
    }
    save(data) {
        this.data = data;
    }
    hi() {
        return '.A.' + this.data;
    }
}
exports.A = A;
class C {
    constructor(_b) {
        this.data = '#';
    }
    save(data) {
        this.data = data;
    }
    hi() {
        return '.C.' + this.data;
    }
}
exports.C = C;
class D {
    constructor(a, c) {
        this.a = a;
        this.c = c;
    }
    hi() {
        console.log(this.a.hi() + ' - ' + this.c.hi());
    }
}
exports.D = D;
const container = new container_1.IracaContainer();
container.add({
    component: A,
    strategy: 'factory',
});
container.add({
    component: C,
    strategy: 'factory',
});
container.add({
    component: D,
    dependencies: ['A', 'C'],
});
const FIREBASE_INIT = { l: 213 };
container.addValue({
    id: 'FIREBASE_INIT',
    value: FIREBASE_INIT,
});
const d = container.getInstance('D');
const a = container.getInstance('A');
d.hi();
console.log(a);
a.save('%');
d.hi();
const aa = container.getInstance('A');
const cc = container.getInstance('C');
cc.save('|');
d.hi();
aa.save('&');
d.hi();
console.log(container.instancesTable);
const iraca = new system_1.Iraca(container);
iraca.notify(new system_1.DomainEvent('EVENT1', 789));
iraca.notify(new system_1.DomainEvent('EVENT2', 'Deivis'));
iraca.on('EVENT3', (payload) => {
    console.log('Respondió el usecase ', payload);
});
//# sourceMappingURL=gohan.js.map