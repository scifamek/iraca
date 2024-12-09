"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.A = void 0;
const http_1 = require("http");
const rxjs_1 = require("rxjs");
const container_1 = require("./dependency-injection/container");
class A {
    constructor() {
        this.prefix = '#';
    }
    setPrefix(prefix) {
        this.prefix = prefix;
    }
    hi() {
        return new rxjs_1.Observable((obs) => {
            let i = 5000000000;
            while (i > 0) {
                i--;
            }
            obs.next(this.prefix + '.A.');
            obs.complete();
        });
    }
}
exports.A = A;
const container = new container_1.IracaContainer();
container.add({
    component: A,
    strategy: 'singleton',
});
const server = (0, http_1.createServer)({}, (req, res) => {
    const r = req.url;
    console.log(r);
    if (r == '/worker') {
        const d = container.getInstance('A');
        const respuesta = d.hi();
        respuesta.subscribe((resp) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(resp + ' ' + Date.now().toString());
        });
    }
    else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('HOLI' + ' ' + Date.now().toString());
    }
});
const PORT = 7000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en ${PORT}`);
});
//# sourceMappingURL=vegeta.js.map