import express, { Router } from 'express';
import { IracaContainer } from 'iraca/dependency-injection';
import { ControllerConfiguration, IracaController } from 'iraca/web-api';
import { Repository } from './repository';

class SayayinController extends IracaController {
	constructor(configuration: ControllerConfiguration) {
		super(configuration);
	}
	configureEndpoints(): void {
		this.configureEndpointsByPattern('Usecase$');
	}
}

async function main() {
	const container = new IracaContainer();
	const app = express();
	const router = Router();
	container.add({
		component: Repository,
	});
	await container.addByPattern(__dirname, /Usecase/gi);

	container.addValue({
		id: 'ASD',
		value: 456,
	});

	const myController = new SayayinController({
		container,
		identifier: 'Sayayin',
		router,
		logger: {
			info: (data: string) => {
				console.log(data);
			},
		},
	});

	app.use('/', router);
	app.listen(4433);
}

main();
// const iraca = new Iraca(container);

// iraca.register(GetSayayinsUsecase);
// iraca.on('GottenSayayinsDomainEvent', (payload) => {
// 	console.log('Respondió el usecase ', payload);
// });

// iraca.notify(GetSayayinsDomainEvent.build('ID'));
// iraca.notify(new DomainEvent('EVENT2', 'Deivis'));
