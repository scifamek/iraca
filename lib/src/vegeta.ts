import { createServer } from 'http';
import { IracaContainer } from './dependency-injection/container';

export class A {
	prefix: string = '#';
	public setPrefix(prefix: string) {
		this.prefix = prefix;
	}
	hi() {
		return new Promise((obs) => {
			let i = 5_000_000_000;
			while (i > 0) {
				i--;
			}
			obs(this.prefix + '.A.');
		});
	}
}
const container = new IracaContainer();

container.add({
	component: A,
	strategy: 'singleton',
});

const server = createServer({}, (req, res) => {
	const r = req.url;
	console.log(r);

	if (r == '/worker') {
		const d = container.getInstance<A>(A);
		const respuesta = d.hi();
		respuesta.then((resp:any) => {
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end(resp + ' ' + Date.now().toString());
		});
	} else {
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('HOLI' + ' ' + Date.now().toString());
	}
});

const PORT = 7000;

server.listen(PORT, () => {
	console.log(`Servidor corriendo en ${PORT}`);
});
