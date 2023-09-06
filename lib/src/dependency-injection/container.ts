import { ParticleDefinition, ParticleConfiguration, ParticleValueConfiguration, Snapshot, Status } from './models';

export class Container {
  pending: {
    [pendingId: string]: (ParticleConfiguration | null)[];
  };
  table: {
    [index: string]: ParticleDefinition<any>;
  };

  constructor() {
    this.table = {};
    this.pending = {};
  }
  addAll(container: Container) {
    this.table = { ...container.table };
  }

  add(config: ParticleConfiguration): boolean {
    const res = this._add(config);
    this.removeEmptyPendings();
    return res;
  }

  _add(config: ParticleConfiguration): boolean {
    if (this.table[config.id] && this.table[config.id].constructor !== null) {
      return true;
    }
    let typeClass = config.kind;
    if (config.override) {
      typeClass = config.override;
    }

    const myState = this.getStateByDependencies(config.dependencies || []);

    if (myState.status === 'resolved') {
      const constructor = () =>
        Reflect.construct(
          typeClass,
          Object.values(myState.dependencies).map((snapshot) => snapshot.instance)
        );

      this.table[config.id] = {
        constructor,
        snapshot: {
          instance: constructor(),
          status: 'resolved',
        },
      };

      this.resolveDependentParticles(config);
      return true;
    } else {
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

  addValue(config: ParticleValueConfiguration) {
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

  private getStateByDependencies(dependenciesId: string[]) {
    const response: {
      [dependencyName: string]: Snapshot<unknown>;
    } = {};

    let generalStatus: Status = 'resolved';
    for (const dep of dependenciesId) {
      const instance: Snapshot<unknown> = this.getInstance(dep);

      if (['no-resolved', 'pending'].includes(instance.status)) {
        generalStatus = 'pending';
      }
      response[dep] = instance;
    }
    return { dependencies: response, status: generalStatus };
  }

  getInstance<T>(id: string): Snapshot<T> {
    const savedKindConfiguration: ParticleDefinition<T> = this.table[id];
    if (savedKindConfiguration) {
      return savedKindConfiguration.snapshot;
    }
    const temp: ParticleDefinition<T> = {
      constructor: null,
      snapshot: {
        instance: null,
        status: 'no-resolved',
      },
    };
    this.table[id] = temp;

    return temp.snapshot;
  }

  private removeEmptyPendings() {
    const newPendings: {
      [pendingId: string]: (ParticleConfiguration | null)[];
    } = {};
    for (const key in this.pending) {
      if (Object.prototype.hasOwnProperty.call(this.pending, key)) {
        const dependencies: (ParticleConfiguration | null)[] = this.pending[key];
        const cleaned = dependencies.filter((d) => !!d);

        if (cleaned.length > 0) {
          newPendings[key] = cleaned;
        }
      }
    }

    this.pending = newPendings;
  }

  private resolveDependentParticles(config: ParticleConfiguration | ParticleValueConfiguration) {
    if (Object.prototype.hasOwnProperty.call(this.pending, config.id)) {
      const dependencies: any[] = this.pending[config.id];
      for (let i = 0; i < dependencies.length; i++) {
        const dependentConfig = dependencies[i];

        const res = this._add(dependentConfig);
        if (res) {
          dependencies[i] = null;
        }
      }
    }
  }

  private addPending<T>(config: ParticleConfiguration, dependencies: { [dependencyName: string]: Snapshot<T> }) {
    for (const dependencyName in dependencies) {
      if (Object.prototype.hasOwnProperty.call(dependencies, dependencyName)) {
        const dependencyObj = dependencies[dependencyName];

        if (dependencyObj.status !== 'resolved') {
          if (!this.pending[dependencyName]) {
            this.pending[dependencyName] = [];
          }
          const exist = this.pending[dependencyName].filter((x: ParticleConfiguration | null) => x && x.id === config.id).length > 0;
          if (!exist) {
            this.pending[dependencyName].push(config);
          }
        }
      }
    }
  }
}
