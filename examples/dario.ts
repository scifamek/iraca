import { Router } from 'express';

import { Container } from 'iraca/dependency-injection';
import { Usecase } from 'iraca/domain';

import { ExpressController } from 'iraca/web-api';
import { of } from 'rxjs';
import express = require('express');

class GetNoProgresistsUsecase extends Usecase<any, any> {
	call(params: any) {
		console.log(params);
		const {userId} = params;

		return of('Yo no soy progresista, soy ' + userId);
	}
}
class B {
	constructor(_a: GetNoProgresistsUsecase) {}
}
class C {
	constructor(_b: B) {}

	call() {
		return of('Hola C');
	}

	hi() {
		console.log('Clase C:');
	}
}
class D {
	constructor(_a: GetNoProgresistsUsecase) {}
}

const container = new Container();

container.add({
	id: 'B',
	kind: B,
	strategy: 'singleton',
	dependencies: ['A'],
});
// console.log('B was added');

// console.log(`B should be shown as Pending: ${container.getInstance<B>('B').status}`);

container.add({
	id: 'C',
	kind: C,
	strategy: 'singleton',
	dependencies: ['B'],
});

// console.log('C was added');
// console.log(`C should be shown as Pending: ${container.getInstance<B>('C').status}`);

container.add({
	id: 'GetNoProgresistsUsecase',
	kind: GetNoProgresistsUsecase,
	strategy: 'singleton',
	dependencies: ['FIREBASE_INIT'],
});
// console.log('A was added');
// console.log(`A should be shown as Pending: ${container.getInstance<B>('A').status}`);

container.add({
	id: 'D',
	kind: D,
	strategy: 'singleton',
	dependencies: ['A'],
});

// console.log('D was added');
// console.log(`D should be shown as Pending: ${container.getInstance<B>('D').status}`);

const FIREBASE_INIT = {l: 213};

container.addValue({
	id: 'FIREBASE_INIT',
	value: FIREBASE_INIT,
});

// console.log('FIREBASE_INIT was added');
// console.log(
// 	`FIREBASE_INIT should be shown as Resolved: ${container.getInstance<B>('FIREBASE_INIT').status}`
// );
// console.log(
// 	'Then, A, B , C and D should be shown as  Resolved:',

// 	JSON.stringify(
// 		{
// 			A: container.getInstance<A>('A').status,
// 			B: container.getInstance<B>('B').status,
// 			C: container.getInstance<C>('C').status,
// 			D: container.getInstance<D>('D').status,
// 		},
// 		null,
// 		2
// 	)
// );

const app = express();
const router = Router();

// app.use(bodyParser.json({limit: '10mb'}));
// app.use(bodyParser.urlencoded({extended: true, limit: '10mb'}));

class MyController extends ExpressController {
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
// app.use((req, res, next) => {
// 	const {path, method} = req;
// 	console.log(path, method);
// 	next();
// 	res;
// });
// app.get('/b', (req, res) => {
// 	res.send('Hello');
// });

// app.get('/', (req, res) => {
// 	res.send('Hello World!');
// });
app.use('/api', router);

const port = 5555;
app.listen(port, () => {
	console.log('Starting users: ' + port);
});

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })
