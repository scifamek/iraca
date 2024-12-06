import { DomainEvent, Usecase } from './config/system';
import { MyUsecaseB } from './MyUsecaseB';

export type MyParam = [string, string];

export class GetSayayinsUsecase extends Usecase<MyParam, number> {
	static events = ['EVENT1', 'EVENT2'];
	static identifier = 'GetSayayinsUsecase';

	constructor(private myUsecaseB: MyUsecaseB) {
		super();
		console.log('Dependencia ', this.myUsecaseB);
	}
	call(param: MyParam): DomainEvent<number> {
		console.log(param);
		return new DomainEvent('EVENT3', 789);
	}
}
