// import {DataSource} from './datasource';
// import {Mapper} from './mapper';
// import {CompositeFilters, Filters} from '../domain';

// export abstract class TransversalContract<Entity> {
// 	entity!: string;

// 	constructor(protected dataSource: DataSource<Entity>, protected mapper: Mapper<Entity>) {}

// 	delete(id: string): Promise<void> {
// 		this.refreshEntity();
// 		return this.dataSource.deleteById(id);
// 	}

// 	filter(filter: Filters | CompositeFilters): Promise<Array<Entity>> {
// 		this.refreshEntity();
// 		const castedFilters = filter as CompositeFilters;
// 		let mappedFilters: CompositeFilters | null = null;
// 		if (castedFilters.and || castedFilters.or) {
// 			mappedFilters = {};
// 			if (castedFilters.and) {
// 				mappedFilters['and'] = extract(castedFilters.and, this.mapper);
// 			}
// 			if (castedFilters.or) {
// 				mappedFilters['or'] = extract(castedFilters.or, this.mapper);
// 			}
// 		} else {
// 			mappedFilters = extract(filter as Filters, this.mapper);
// 		}
// 		return this.dataSource
// 			.getByFilter({
// 				filters: mappedFilters!,
// 			})
// 			.then(this.mapItems());

// 		function extract(fx: Filters, mapper: Mapper<Entity>) {
// 			const mappedFilters = {...fx};
// 			const f = fx;
// 			for (const key in f) {
// 				const element = f[key];
// 				delete mappedFilters[key];
// 				mappedFilters[mapper.attributesMapper[key].name] = element;
// 			}
// 			return mappedFilters;
// 		}
// 	}

// 	get(pagination?: {pageNumber: number; pageSize: number}): Promise<Entity[]> {
// 		this.refreshEntity();

// 		return this.dataSource
// 			.getByFilter({
// 				pagination,
// 			})
// 			.then(this.mapItems());
// 	}

// 	getById(id: string): Promise<Entity | undefined> {
// 		this.refreshEntity();
// 		return this.dataSource.getById(id).then((group: Entity | undefined) => {
// 			return !!group ? this.mapper.fromJson(group) : Promise.resolve(group);
// 		});
// 	}

// 	mapItems(): OperatorFunction<Entity[], Entity[]> {
// 		return mergeMap((items: Entity[]) => {
// 			return items.length > 0
// 				? zip(
// 						...items.map((item) => {
// 							return this.mapper.fromJson(item).pipe(filter((item) => !!item)) as Promise<Entity>;
// 						})
// 				  ).pipe(
// 						map((items) => {
// 							return items;
// 						})
// 				  )
// 				: of([]);
// 		});
// 	}

// 	refreshEntity() {
// 		this.dataSource.entity = this.entity;
// 	}

// 	save(entity: Entity): Promise<string> {
// 		this.refreshEntity();
// 		return this.dataSource.save(this.mapper.toJson(entity));
// 	}

// 	update(id: string, entity: Entity): Promise<Entity> {
// 		this.refreshEntity();
// 		return this.dataSource.update(id, this.mapper.toJson(entity)).pipe(map(() => entity));
// 	}
// }
