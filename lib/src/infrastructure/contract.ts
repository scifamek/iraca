import { DataSource } from './datasource';
import { Mapper } from './mapper';

export abstract class Contract<Entity> {
  constructor(protected dataSource: DataSource<Entity>, protected mapper: Mapper<Entity>) {}

  refreshEntity(entity: string) {
    this.dataSource.entity = entity;
  }
}
