export class B {
	constructor(_a: A) {}
}
export class A {
	prefix: string = '#';
	public setPrefix(prefix: string) {
		this.prefix = prefix;
	}
	hi() {
		return this.prefix + '.A.';
	}
}
export class C {
	prefix: string = '#';
	public setPrefix(prefix: string) {
		this.prefix = prefix;
	}
	hi() {
		return this.prefix + '.C.';
	}
}
export class D {
	prefix: string = '**';

	constructor(private a: A, private c: C) {}

	public setPrefix(prefix: string) {
		this.prefix = prefix;
	}
	hi() {
		console.log(this.prefix + '(' + this.a.hi() + ') - (' + this.c.hi() + ')');
	}
}
