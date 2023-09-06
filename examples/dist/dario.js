"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iraca_1 = require("iraca");
class A {
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
const container = new iraca_1.Container();
container.add({
    id: 'B',
    kind: B,
    strategy: 'singleton',
    dependencies: ['A'],
});
console.log('B was added');
console.log(`B should be shown as Pending: ${container.getInstance('B').status}`);
container.add({
    id: 'C',
    kind: C,
    strategy: 'singleton',
    dependencies: ['B'],
});
console.log('C was added');
console.log(`C should be shown as Pending: ${container.getInstance('C').status}`);
container.add({
    id: 'A',
    kind: A,
    strategy: 'singleton',
    dependencies: ['FIREBASE_INIT'],
});
console.log('A was added');
console.log(`A should be shown as Pending: ${container.getInstance('A').status}`);
container.add({
    id: 'D',
    kind: D,
    strategy: 'singleton',
    dependencies: ['A'],
});
console.log('D was added');
console.log(`D should be shown as Pending: ${container.getInstance('D').status}`);
const FIREBASE_INIT = { l: 213 };
container.addValue({
    id: 'FIREBASE_INIT',
    value: FIREBASE_INIT,
});
console.log('FIREBASE_INIT was added');
console.log(`FIREBASE_INIT should be shown as Resolved: ${container.getInstance('FIREBASE_INIT').status}`);
console.log('Then, A, B , C and D should be shown as  Resolved:', JSON.stringify({
    A: container.getInstance('A').status,
    B: container.getInstance('B').status,
    C: container.getInstance('C').status,
    D: container.getInstance('D').status,
}, null, 2));
const g = container.getInstance('C').instance;
g.hi();
//# sourceMappingURL=dario.js.map