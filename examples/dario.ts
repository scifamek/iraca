import { Container } from 'iraca/dependency-injection';

class A {}
class B {
  constructor(_a: A) {}
}
class C {
  constructor(_b: B) {}

  hi() {
    console.log('Clase C:');
  }
}
class D {
  constructor(_a: A) {}
}

const container = new Container();

container.add({
  id: 'B',
  kind: B,
  strategy: 'singleton',
  dependencies: ['A'],
});
console.log('B was added');

console.log(`B should be shown as Pending: ${container.getInstance<B>('B').status}`);

container.add({
  id: 'C',
  kind: C,
  strategy: 'singleton',
  dependencies: ['B'],
});

console.log('C was added');
console.log(`C should be shown as Pending: ${container.getInstance<B>('C').status}`);

container.add({
  id: 'A',
  kind: A,
  strategy: 'singleton',
  dependencies: ['FIREBASE_INIT'],
});
console.log('A was added');
console.log(`A should be shown as Pending: ${container.getInstance<B>('A').status}`);

container.add({
  id: 'D',
  kind: D,
  strategy: 'singleton',
  dependencies: ['A'],
});

console.log('D was added');
console.log(`D should be shown as Pending: ${container.getInstance<B>('D').status}`);

const FIREBASE_INIT = { l: 213 };

container.addValue({
  id: 'FIREBASE_INIT',
  value: FIREBASE_INIT,
});

console.log('FIREBASE_INIT was added');
console.log(`FIREBASE_INIT should be shown as Resolved: ${container.getInstance<B>('FIREBASE_INIT').status}`);
console.log(
  'Then, A, B , C and D should be shown as  Resolved:',

  JSON.stringify(
    {
      A: container.getInstance<A>('A').status,
      B: container.getInstance<B>('B').status,
      C: container.getInstance<C>('C').status,
      D: container.getInstance<D>('D').status,
    },
    null,
    2
  )
);



const g: C = container.getInstance<C>('C').instance!;
g.hi();
