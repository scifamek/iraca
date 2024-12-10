import { DomainEvent, Usecase } from 'iraca/config';
import { GetSayayinsDomainEvent, GottenSayayinsDomainEvent } from './events';
import { Repository } from './repository';

export type MyParam = {
	count: number;
};

export class GetSayayinsUsecase extends Usecase<MyParam, any> {
	static eventKinds = [GetSayayinsDomainEvent];

	constructor(private repository: Repository) {
		super();
	}

	call(param: MyParam): DomainEvent<any> | Promise<DomainEvent<any>> {
		const count = param ? param.count || 5 : 5;

		return this.repository
			.get(count)
			.then((result: any) => GottenSayayinsDomainEvent.build(result));
	}
}
