"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Iraca = exports.Usecase = exports.DomainEvent = void 0;
const node_events_1 = require("node:events");
class DomainEvent {
    constructor(name, payload) {
        this.name = name;
        this.payload = payload;
        this.id = this.makeId();
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
        this.emit(domainEvent.name, domainEvent.payload);
    }
    register(usecase) {
        const events = usecase['events'];
        const identifier = usecase['identifier'];
        for (const event of events) {
            this.on(event, (data) => {
                console.log(identifier, ' - ', data);
            });
        }
        console.log(identifier, events);
    }
}
exports.Iraca = Iraca;
//# sourceMappingURL=system.js.map