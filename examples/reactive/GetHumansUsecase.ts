import { DomainEvent, Usecase } from 'iraca/config';
import {
	GetFreePlanetsDomainEvent,
	GottenHumansDomainEvent
} from './events';

export class GetHumansUsecase extends Usecase<any, any> {
	static eventKinds = [GetFreePlanetsDomainEvent];
	constructor() {
		super();
	}
	call(param: any): DomainEvent<any> {
		return GottenHumansDomainEvent.build('Humanos');
	}
}
