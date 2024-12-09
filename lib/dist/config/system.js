"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Iraca = exports.Usecase = exports.DomainEvent = exports.DomainEventKind = void 0;
const node_events_1 = require("node:events");
function DomainEventKind(name) {
    return {
        name,
        build: function (payload) {
            return new DomainEvent(this, payload);
        },
    };
}
exports.DomainEventKind = DomainEventKind;
class DomainEvent {
    constructor(domainEventKind, payload) {
        this.domainEventKind = domainEventKind;
        this.payload = payload;
        this.id = this.makeId();
        this.name = this.domainEventKind.name;
    }
    makeId() {
        return Symbol();
    }
}
exports.DomainEvent = DomainEvent;
class Usecase {
}
exports.Usecase = Usecase;
class Iraca extends node_events_1.EventEmitter {
    constructor(dependenciesContainer) {
        super();
        this.dependenciesContainer = dependenciesContainer;
        this.eventsRegistry = new Map();
    }
    notify(domainEvent) {
        this.eventsRegistry.set(domainEvent.id, { timestamp: new Date(), domainEvent: domainEvent });
        console.log('Emitiendo ', domainEvent.name);
        this.emit(domainEvent.name, domainEvent.payload);
    }
    register(usecase) {
        const eventKinds = usecase['eventKinds'];
        const identifier = usecase.name;
        console.log('System ', identifier);
        const a = this.dependenciesContainer.getInstance(usecase);
        for (const event of eventKinds) {
            console.log('A la espera de  ', event.name);
            this.on(event.name, (data) => {
                console.log(identifier, ' - ', data);
                const res = a.call(data);
                if (res instanceof Promise) {
                    res.then((x) => {
                        this.emit(x.name, x.payload);
                    });
                }
                else {
                    this.emit(res.name, res.payload);
                }
            });
        }
        console.log(identifier, eventKinds);
    }
}
exports.Iraca = Iraca;
//# sourceMappingURL=system.js.map