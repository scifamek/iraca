import { DomainEvent, Usecase } from 'iraca/config';
import { GetSayayinsDomainEvent, GottenSayayinsDomainEvent } from './events';
import { Repository } from './repository';

export type MyParam = string;

export class GetSayayinsUsecase extends Usecase<MyParam, number> {
	static eventKinds = [GetSayayinsDomainEvent];

	constructor(private repository: Repository, private asd: string) {
		super();
		console.log('Dependencia ', this.repository, this.asd);
	}

	call(param: MyParam): DomainEvent<number> | Promise<DomainEvent<number>> {
		return this.repository.getById(param).then((result: any) => {
			return GottenSayayinsDomainEvent.build({...result, ki: this.asd});
		});
	}
}
