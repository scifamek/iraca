import { DomainEvent, Usecase } from 'iraca/config';
import { GetFreePlanetsDomainEvent, GottenFreePlanetsDomainEvent } from './events';

export class GetFreePlanetsUsecase extends Usecase<any, number> {
	static eventKinds = [GetFreePlanetsDomainEvent];
	constructor() {
		super();
	}
	call(param: any): DomainEvent<number> {
		console.log(param);
		return new DomainEvent(GottenFreePlanetsDomainEvent, 789);
	}
}
