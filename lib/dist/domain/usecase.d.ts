import { Observable } from "rxjs";
export interface Pagination {
    pageSize: number;
    pageNumber: number;
}
export declare abstract class Usecase<Param, Response> {
    abstract call(param?: Param): Observable<Response>;
}
