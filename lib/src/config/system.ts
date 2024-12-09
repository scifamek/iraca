import { EventEmitter } from 'node:events';
import { IracaContainer } from '../dependency-injection/container';

export class DomainEvent<P = any> {
	id: Symbol;
	constructor(public name: string, public payload?: P) {
		this.id = this.makeId();
	}
	makeId() {
		return Symbol();
	}
}

export abstract class Usecase<Param = any, Response = any> {
	static identifier: string;
	static events: string[];
	abstract call(param?: Param): DomainEvent<Response>;
}

export interface EventRegister {
	timestamp: Date;
	domainEvent: DomainEvent;
}
export class Iraca extends EventEmitter {
	eventsRegistry: Map<Symbol, EventRegister>;

	constructor(public dependenciesContainer: IracaContainer) {
		super();

		this.eventsRegistry = new Map();
	}
	notify(domainEvent: DomainEvent) {
		this.eventsRegistry.set(domainEvent.id, {timestamp: new Date(), domainEvent: domainEvent});
		this.emit(domainEvent.name, domainEvent.payload);
	}
	register(usecase: any) {
		const events = usecase['events'];
		const identifier = usecase['identifier'];

		for (const event of events) {
			this.on(event, (data) => {
				console.log(identifier, ' - ', data);

				// const constructor = () =>
				//     Reflect.construct(
				//         usecase,
				//         Object.values(myState.dependencies).map((snapshot) => snapshot.instance)
				//     );
			});
		}
		console.log(identifier, events);
	}
}

// SYSTEM.on('customEvent', (data) => {
// 	console.log(`Evento recibido: ${data}`);
// });

// SYSTEM.emit('customEvent', 'Hola Mundo');
// //-----

// const readable = new Readable({
// 	read() {},
// });

// readable.on('data', (chunk) => {
// 	console.log(`Chunk: ${chunk}`);
// });

// readable.push('Hola');
// readable.push('Mundo');
// readable.push(null); // Fin del flujo
