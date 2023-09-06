"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
class Container {
    constructor() {
        this.table = {};
        this.pending = {};
    }
    addAll(container) {
        this.table = Object.assign({}, container.table);
    }
    add(config) {
        const res = this._add(config);
        this.removeEmptyPendings();
        return res;
    }
    _add(config) {
        if (this.table[config.id] && this.table[config.id].constructor !== null) {
            return true;
        }
        let typeClass = config.kind;
        if (config.override) {
            typeClass = config.override;
        }
        const myState = this.getStateByDependencies(config.dependencies || []);
        if (myState.status === 'resolved') {
            const constructor = () => Reflect.construct(typeClass, Object.values(myState.dependencies).map((snapshot) => snapshot.instance));
            this.table[config.id] = {
                constructor,
                snapshot: {
                    instance: constructor(),
                    status: 'resolved',
                },
            };
            this.resolveDependentParticles(config);
            return true;
        }
        else {
            this.addPending(config, myState.dependencies);
            this.table[config.id] = {
                constructor: null,
                snapshot: {
                    instance: null,
                    status: 'pending',
                },
            };
            return false;
        }
    }
    addValue(config) {
        this.table[config.id] = {
            constructor: () => config.value,
            snapshot: {
                instance: config.value,
                status: 'resolved',
            },
        };
        this.resolveDependentParticles(config);
        this.removeEmptyPendings();
    }
    getStateByDependencies(dependenciesId) {
        const response = {};
        let generalStatus = 'resolved';
        for (const dep of dependenciesId) {
            const instance = this.getInstance(dep);
            if (['no-resolved', 'pending'].includes(instance.status)) {
                generalStatus = 'pending';
            }
            response[dep] = instance;
        }
        return { dependencies: response, status: generalStatus };
    }
    getInstance(id) {
        const savedKindConfiguration = this.table[id];
        if (savedKindConfiguration) {
            return savedKindConfiguration.snapshot;
        }
        const temp = {
            constructor: null,
            snapshot: {
                instance: null,
                status: 'no-resolved',
            },
        };
        this.table[id] = temp;
        return temp.snapshot;
    }
    removeEmptyPendings() {
        const newPendings = {};
        for (const key in this.pending) {
            if (Object.prototype.hasOwnProperty.call(this.pending, key)) {
                const dependencies = this.pending[key];
                const cleaned = dependencies.filter((d) => !!d);
                if (cleaned.length > 0) {
                    newPendings[key] = cleaned;
                }
            }
        }
        this.pending = newPendings;
    }
    resolveDependentParticles(config) {
        if (Object.prototype.hasOwnProperty.call(this.pending, config.id)) {
            const dependencies = this.pending[config.id];
            for (let i = 0; i < dependencies.length; i++) {
                const dependentConfig = dependencies[i];
                const res = this._add(dependentConfig);
                if (res) {
                    dependencies[i] = null;
                }
            }
        }
    }
    addPending(config, dependencies) {
        for (const dependencyName in dependencies) {
            if (Object.prototype.hasOwnProperty.call(dependencies, dependencyName)) {
                const dependencyObj = dependencies[dependencyName];
                if (dependencyObj.status !== 'resolved') {
                    if (!this.pending[dependencyName]) {
                        this.pending[dependencyName] = [];
                    }
                    const exist = this.pending[dependencyName].filter((x) => x && x.id === config.id).length > 0;
                    if (!exist) {
                        this.pending[dependencyName].push(config);
                    }
                }
            }
        }
    }
}
exports.Container = Container;
//# sourceMappingURL=container.js.map