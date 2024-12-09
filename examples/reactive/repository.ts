export class Repository {
	getById(id: string) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					id: 'bdab8d50-4c01-49a2-aa2e-11ce30e43d26'+id,
					name: 'Broly',
				});
			}, 200);
		});
	}
}
