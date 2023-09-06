export interface BaseHTTPResponse<T> {
    meta: {
        code: string;
        message: string;
    };
    data: T;
}
export type ResponseMeta = BaseHTTPResponse<any>['meta'];
