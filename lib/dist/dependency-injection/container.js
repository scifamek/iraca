"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IracaContainer = void 0;
class IracaContainer {
    constructor() {
        this.configsTable = new Map();
        this.instancesTable = new Map();
        this.pendingParticles = new Map();
    }
    addAll(container) {
        this.configsTable = Object.assign({}, container.configsTable);
    }
    add(config) {
        const c = Object.assign(config);
        if (!c.id) {
            const component = c.component ||
                c.abstraction;
            if (c)
                c.id = component.name;
        }
        if (!c.strategy) {
            c.strategy = 'singleton';
        }
        const res = this._add(c);
        return res;
    }
    makeInstance(typeClass, config, state) {
        console.log(typeClass, config, state);
    }
    _add(config) {
        const prevRegisteredParticule = this.configsTable.get(config.id);
        if (prevRegisteredParticule && prevRegisteredParticule.constructor !== null) {
            return true;
        }
        let typeClass = config.component ||
            config.implementation;
        const myState = this.getStateByDependencies(config.dependencies || []);
        console.log(111, typeClass, myState);
        if (myState.status === 'resolved') {
            this.configsTable.set(config.id, {
                status: 'resolved',
                config,
            });
            this.makeInstance;
            this.resolveDependentParticles(config);
            return true;
        }
        else {
            this.addPending;
            this.configsTable.set(config.id, {
                status: 'pending',
                config,
            });
            return false;
        }
    }
    addValue(config) {
        this.configsTable.set(config.id, {
            value: config.value,
            status: 'resolved',
        });
        this.resolveDependentParticles(config);
    }
    getStateByDependencies(dependenciesId) {
        const foundDependencies = {};
        const notFoundDependencies = [];
        let status = 'resolved';
        for (const dependencyId of dependenciesId) {
            const configuration = this.configsTable.get(dependencyId);
            if (configuration) {
                if (['no-resolved', 'pending'].includes(configuration.status)) {
                    status = 'pending';
                }
                foundDependencies[dependencyId] = configuration;
            }
            else {
                notFoundDependencies.push(dependencyId);
                status = 'pending';
            }
        }
        return { foundDependencies, notFoundDependencies, status };
    }
    getInstance(id, parentId) {
        console.log('Obteniendo ', id, parentId);
        const savedConfiguration = this.configsTable.get(id);
        if (savedConfiguration) {
            if (savedConfiguration.status == 'resolved') {
                if (savedConfiguration.config.value) {
                    return savedConfiguration.value;
                }
                const innerConfig = savedConfiguration.config;
                console.log(innerConfig.strategy, 45444);
                if (innerConfig.strategy == 'singleton') {
                    const tentativeInstance = this.instancesTable.get(id);
                    if (tentativeInstance && tentativeInstance.length) {
                        return tentativeInstance[0].instance;
                    }
                    let typeClass = savedConfiguration.config.component ||
                        savedConfiguration.config.implementation;
                    const depnden = [];
                    const dependencies = savedConfiguration.config.dependencies || [];
                    for (const ins of dependencies) {
                        const ii = this.getInstance(ins, id);
                        depnden.push(ii);
                    }
                    const constructor = Reflect.construct(typeClass, depnden);
                    const instance = constructor;
                    this.instancesTable.set(id, [
                        {
                            generatedBy: parentId || id,
                            instance,
                        },
                    ]);
                    return instance;
                }
                else {
                    const dependencies = savedConfiguration.config.dependencies || [];
                    const depnden = [];
                    for (const ins of dependencies) {
                        const ii = this.getInstance(ins, id);
                        depnden.push(ii);
                    }
                    let typeClass = savedConfiguration.config.component ||
                        savedConfiguration.config.implementation;
                    console.log(' / ', depnden);
                    const constructor = Reflect.construct(typeClass, depnden);
                    const instance = constructor;
                    if (!this.instancesTable.get(id)) {
                        this.instancesTable.set(id, []);
                    }
                    const prev = this.instancesTable.get(id);
                    prev === null || prev === void 0 ? void 0 : prev.push({
                        generatedBy: parentId || id,
                        instance,
                    });
                    return instance;
                }
            }
            else {
                throw new Error('Class not resolved');
            }
        }
        throw new Error(`${id} component is not configuret yet`);
    }
    resolveDependentParticles(config) {
        const dependents = this.pendingParticles.get(config.id);
        const newDependents = [];
        if (dependents) {
            for (let i = 0; i < dependents.length; i++) {
                const dependentConfig = dependents[i];
                const res = this._add(dependentConfig);
                if (!res) {
                    newDependents.push(dependentConfig);
                }
            }
            dependents.splice(0, dependents.length, ...newDependents);
        }
        if (!!dependents && dependents.length == 0) {
            this.pendingParticles.delete(config.id);
        }
    }
    addPending(config, dependencies) {
        for (const dependencyName in dependencies) {
            const dependencyObj = dependencies[dependencyName];
            if (dependencyObj.status !== 'resolved') {
                if (!this.pendingParticles.get(dependencyName)) {
                    this.pendingParticles.set(dependencyName, []);
                }
                const dep = this.pendingParticles.get(dependencyName);
                if (dep) {
                    const exist = dep.filter((x) => x && x.id === config.id).length > 0;
                    if (!exist) {
                        dep.push(config);
                    }
                }
            }
        }
    }
}
exports.IracaContainer = IracaContainer;
//# sourceMappingURL=container.js.map