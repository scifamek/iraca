"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.D = exports.C = exports.A = exports.B = exports.calcularBytes = void 0;
function calcularBytes(instancesTable) {
    const objetoPlano = Array.from(instancesTable.entries()).map(([key, value]) => ({
        key,
        value: value.map((item) => ({
            generatedBy: item.generatedBy,
            instance: item.instance,
        })),
    }));
    const objetoString = JSON.stringify(objetoPlano);
    return new Blob([objetoString]).size;
}
exports.calcularBytes = calcularBytes;
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
//# sourceMappingURL=container-helpers.js.map