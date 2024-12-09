export declare function calcularBytes(instancesTable: any): number;
export declare class B {
    constructor(_a: A);
}
export declare class A {
    prefix: string;
    setPrefix(prefix: string): void;
    hi(): string;
}
export declare class C {
    prefix: string;
    setPrefix(prefix: string): void;
    hi(): string;
}
export declare class D {
    private a;
    private c;
    prefix: string;
    constructor(a: A, c: C);
    setPrefix(prefix: string): void;
    hi(): void;
}
