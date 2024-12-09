"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.D = exports.C = exports.A = exports.B = void 0;
const memoryUsageBefore = process.memoryUsage();
const container_1 = require("./dependency-injection/container");
function printMemory(title) {
    console.log(` - ${title} - `);
    const mem = process.memoryUsage();
    const rss = `${mem.rss / 1024 / 1024}MB`;
    console.log({ rss });
    console.log('');
}
printMemory('Before');
class B {
    constructor(_a) { }
}
exports.B = B;
class A {
    constructor() {
        this.prefix = '#';
    }
    setPrefix(prefix) {
        this.prefix = prefix;
    }
    hi() {
        return this.prefix + '.A.';
    }
}
exports.A = A;
class C {
    constructor() {
        this.prefix = '#';
    }
    setPrefix(prefix) {
        this.prefix = prefix;
    }
    hi() {
        return this.prefix + '.C.';
    }
}
exports.C = C;
class D {
    constructor(a, c) {
        this.a = a;
        this.c = c;
        this.prefix = '**';
    }
    setPrefix(prefix) {
        this.prefix = prefix;
    }
    hi() {
        console.log(this.prefix + '(' + this.a.hi() + ') - (' + this.c.hi() + ')');
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
    strategy: 'factory',
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
d.setPrefix('--');
//# sourceMappingURL=gohan.js.map