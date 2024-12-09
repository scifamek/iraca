import { Iraca } from 'iraca/config';
import { IracaContainer } from 'iraca/dependency-injection';
import { GetFreePlanetsUsecase } from './GetFreePlanetsUsecase';
import { GetSayayinsUsecase } from './GetSayayinsUsecase';
import { GetSayayinsDomainEvent } from './events';
import { Repository } from './repository';

const container = new IracaContainer();
container.add({
	component: GetFreePlanetsUsecase,
});
container.add({
	component: Repository,
});
container.addValue({
	id: 'ASD',
	value: 456,
});

container.add({
	component: GetSayayinsUsecase,
	dependencies: [Repository, 'ASD'],
});

const iraca = new Iraca(container);
iraca.register(GetSayayinsUsecase);
iraca.on('GottenSayayinsDomainEvent', (payload) => {
	console.log('Respondió el usecase ', payload);
});

iraca.notify(GetSayayinsDomainEvent.build('ID'));
// iraca.notify(new DomainEvent('EVENT2', 'Deivis'));
