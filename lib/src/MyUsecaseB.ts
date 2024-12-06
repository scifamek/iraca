import { DomainEvent, Usecase } from './config/system';

export class MyUsecaseB extends Usecase<any, number> {
	static events = ['EVENT1', 'EVENT2'];
	static identifier = 'MyUsecaseB';
	constructor() {
		super();
	}
	call(param: any): DomainEvent<number> {
		console.log(param);
		return new DomainEvent('EVENT3', 789);
	}
}
