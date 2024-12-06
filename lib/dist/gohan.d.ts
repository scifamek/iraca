export declare class B {
    constructor(_a: A);
}
export declare class A {
    data: any;
    save(data: any): void;
    hi(): string;
}
export declare class C {
    data: any;
    constructor(_b: B);
    save(data: any): void;
    hi(): string;
}
export declare class D {
    private a;
    private c;
    constructor(a: A, c: C);
    hi(): void;
}
