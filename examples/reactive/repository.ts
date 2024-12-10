import axios from 'axios';
export class Repository {
	hola:string;
	constructor() {
		this.hola = 'hola';
	}
	getById(id: string) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					id: 'bdab8d50-4c01-49a2-aa2e-11ce30e43d26' + id,
					name: 'Broly',
				});
			}, 200);
		});
	}
	get(count: number) {
		return axios.get('https://randomuser.me/api/?results=' + count).then((response) => {
			return response.data.results;
		});
	}
}
