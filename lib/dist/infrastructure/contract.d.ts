import { DataSource } from './datasource';
import { Mapper } from './mapper';
export declare abstract class Contract<Entity> {
    protected dataSource: DataSource<Entity>;
    protected mapper: Mapper<Entity>;
    constructor(dataSource: DataSource<Entity>, mapper: Mapper<Entity>);
    refreshEntity(entity: string): void;
}
