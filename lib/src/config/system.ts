import { EventEmitter } from 'node:events';
import { IracaContainer } from '../dependency-injection/container';
export type EventName = `${string}DomainEvent`;
export function DomainEventKind(name: EventName): DomainEventKind {
	return {
		name,
		build: function (payload: any): DomainEvent {
			return new DomainEvent(this, payload);
		},
	};
}
export interface DomainEventKind {
	name: EventName;
	build: Function;
}

export class DomainEvent<P = any> {
	id: Symbol;
	name: EventName;
	constructor(public domainEventKind: DomainEventKind, public payload?: P) {
		this.id = this.makeId();
		this.name = this.domainEventKind.name;
	}
	makeId() {
		return Symbol();
	}
}

export abstract class Usecase<Param = any, Response = any> {
	static identifier: string;
	static eventKinds: DomainEventKind[];
	abstract call(param?: Param): DomainEvent<Response> | Promise<DomainEvent<Response>>;
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
		console.log('Emitiendo ', domainEvent.name);

		this.emit(domainEvent.name, domainEvent.payload);
	}
	register(usecase: any) {
		const eventKinds: DomainEventKind[] = usecase['eventKinds'];
		const identifier = usecase.name;

		console.log('System ', identifier);
		
		const a: Usecase = this.dependenciesContainer.getInstance(usecase);

		for (const event of eventKinds) {
			console.log('A la espera de  ', event.name);

			this.on(event.name, (data) => {
				console.log(identifier, ' - ', data);
				const res = a.call(data);

				if (res instanceof Promise) {
					res.then((x) => {
						this.emit(x.name, x.payload);
					});
				} else {
					this.emit(res.name, res.payload);
				}

				// const constructor = () =>
				//     Reflect.construct(
				//         usecase,
				//         Object.values(myState.dependencies).map((snapshot) => snapshot.instance)
				//     );
			});
		}
		console.log(identifier, eventKinds);
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
