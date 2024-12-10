"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IracaContainer = void 0;
const fs_1 = require("fs");
const helpers_1 = require("../helpers");
const ComponentIsNotConfiguredYet = (0, helpers_1.generateError)('ComponentIsNotConfiguredYet', 'the {id} component is not configured yet');
const ClassNotResolved = (0, helpers_1.generateError)('ClassNotResolved', 'the {c} is not resolved yet');
class IracaContainer {
    constructor() {
        this.configsTable = new Map();
        this.instancesDependencyTable = new Map();
        this.pendingParticles = new Map();
    }
    size() {
        const objetoPlano = Array.from(this.instancesDependencyTable.entries()).map(([key, value]) => ({
            key,
            value: value.map((item) => ({
                generatedBy: item.generatedBy,
                instance: item.instance,
            })),
        }));
        const objetoString = JSON.stringify(objetoPlano);
        return new Blob([objetoString]).size;
    }
    addAll(container) {
        this.configsTable = { ...container.configsTable };
    }
    async addByPattern(dirname, pattern) {
        var _a;
        const files = (0, fs_1.readdirSync)(dirname);
        const foundFiles = files
            .filter((x) => !x.endsWith('.map') && !x.endsWith('.d.ts'))
            .filter((file) => !!file.match(pattern));
        for (const file of foundFiles) {
            const usecaseName = file.replace(/\.js$/, '');
            const declarationFileContent = (0, fs_1.readFileSync)(`${dirname}/${usecaseName}.d.ts`, 'utf-8');
            const constructorPattern = /^.*constructor\((.*)\)/gm;
            const dependencies = [];
            if (declarationFileContent) {
                const result = constructorPattern.exec(declarationFileContent);
                if (result) {
                    const constructorLine = result[1];
                    const injectionPattern = /([\w]+)[\s]*:[\s]*([\w]+)/gi;
                    let found = injectionPattern.exec(constructorLine);
                    while (found) {
                        dependencies.push(found[2]);
                        found = injectionPattern.exec(constructorLine);
                    }
                }
            }
            const res = await (_a = `${dirname}/${file}`, Promise.resolve().then(() => __importStar(require(_a))));
            const a = res[usecaseName];
            this.add({
                component: a,
                dependencies,
            });
        }
        return foundFiles;
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
    _add(config) {
        const prevRegisteredParticule = this.configsTable.get(config.id);
        if (prevRegisteredParticule && prevRegisteredParticule.constructor !== null) {
            return true;
        }
        let typeClass = config.component ||
            config.implementation;
        const myState = this.getStateByDependencies(config.dependencies || []);
        if (myState.status === 'resolved') {
            this.configsTable.set(config.id, {
                status: 'resolved',
                config,
            });
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
            config,
        });
        this.resolveDependentParticles(config);
    }
    getStateByDependencies(dependencies) {
        const foundDependencies = {};
        const notFoundDependencies = [];
        let status = 'resolved';
        for (const dependency of dependencies) {
            const id = typeof dependency === 'string' ? dependency : dependency.name;
            const configuration = this.configsTable.get(id);
            if (configuration) {
                if (['no-resolved', 'pending'].includes(configuration.status)) {
                    status = 'pending';
                }
                foundDependencies[id] = configuration;
            }
            else {
                notFoundDependencies.push(dependency);
                status = 'pending';
            }
        }
        return { foundDependencies, notFoundDependencies, status };
    }
    getInstance(instanceClass, parentId) {
        const start = performance.now();
        let startTime = process.hrtime.bigint();
        const id = typeof instanceClass == 'string' ? instanceClass : instanceClass.name;
        const savedConfiguration = this.configsTable.get(id);
        if (savedConfiguration) {
            if (savedConfiguration.status == 'resolved') {
                if (savedConfiguration.config.value) {
                    const end = performance.now();
                    const preciseDiffNanoseconds = (end - start) * 1000;
                    let endTime = process.hrtime.bigint();
                    const endDiff = endTime - startTime;
                    return savedConfiguration.value;
                }
                const innerConfig = savedConfiguration.config;
                if (innerConfig.strategy == 'singleton') {
                    const tentativeInstance = this.instancesDependencyTable.get(id);
                    if (tentativeInstance && tentativeInstance.length) {
                        const end = performance.now();
                        const preciseDiffNanoseconds = (end - start) * 1000;
                        let endTime = process.hrtime.bigint();
                        const endDiff = endTime - startTime;
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
                    this.instancesDependencyTable.set(id, [
                        {
                            generatedBy: parentId || id,
                            instance,
                        },
                    ]);
                    const end = performance.now();
                    const preciseDiffNanoseconds = (end - start) * 1000;
                    let endTime = process.hrtime.bigint();
                    const endDiff = endTime - startTime;
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
                    const instance = Reflect.construct(typeClass, depnden);
                    instance.__id__ = Symbol();
                    if (!this.instancesDependencyTable.get(id)) {
                        this.instancesDependencyTable.set(id, []);
                    }
                    const prev = this.instancesDependencyTable.get(id);
                    prev?.push({
                        generatedBy: parentId || id,
                        instance,
                    });
                    const end = performance.now();
                    const preciseDiffNanoseconds = (end - start) * 1000;
                    let endTime = process.hrtime.bigint();
                    const endDiff = endTime - startTime;
                    return instance;
                }
            }
            else {
                throw new ClassNotResolved({ id });
            }
        }
        throw new ComponentIsNotConfiguredYet({ id });
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