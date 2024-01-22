export type Operator = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'not-in' | 'array-contains-any' | '=' | 'contains';
export declare const FilterOperators: string[];
export interface Filter {
    operator: Operator;
    value: any;
}
export interface Filters {
    [index: string]: Filter | Filter[];
}
export interface CompositeFilters {
    'or'?: Filters;
    'and'?: Filters;
}
export declare function makeFilters(data: any, operator?: Operator): Filters;
