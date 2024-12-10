"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressController = void 0;
class ExpressController {
    constructor(configuration) {
        this.configuration = configuration;
        this.loggerId = 'Logger';
        this.container = configuration.container;
        this.identifier = configuration.identifier;
        this.router = configuration.router;
        this.resolveLogger();
    }
    resolveLogger() {
        if (this.configuration.logger) {
            this.logger = this.configuration.logger;
        }
        else if (this.configuration.loggerId) {
            this.logger = this.container.getInstance(this.loggerId).instance;
        }
    }
    readyHandler(_request, response) {
        return response.status(200).json({});
    }
    logParam(logInformation, param) {
        if (typeof param == 'object') {
            logInformation += `Param:\n${JSON.stringify(param, null, 2)}`;
        }
        else if (typeof param == 'undefined') {
            logInformation += `\n\tWitout Param`;
        }
        else {
            logInformation += `Param:\n\t\t${param}`;
        }
        return logInformation;
    }
    logResponse(logInformation, response) {
        if (typeof response == 'object') {
            logInformation += `Usecase response:\n\t${JSON.stringify(response, null, 2)}`;
        }
        else if (typeof response == 'undefined') {
            logInformation += `\n\tWitout Response`;
        }
        else {
            logInformation += `Usecase response:\n\t\t${response}`;
        }
        return logInformation;
    }
    logError(logInformation, error) {
        logInformation += `Error: ${error?.name}, ${error?.message}`;
        return logInformation;
    }
    logTitle(logInformation, title) {
        logInformation += `**  ${title}\n`;
        return logInformation;
    }
    makeHttpPath(usercaseId) {
        const segment = usercaseId
            .replace(/Usecase/gi, '')
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toLowerCase();
        return `/${segment}`;
    }
    extractParam(request) {
        if (request.body && Object.keys(request.body).length) {
            return request.body;
        }
        if (request.query && Object.keys(request.query).length) {
            return request.query;
        }
        if (request.params && Object.keys(request.params).length) {
            return request.params;
        }
        return null;
    }
    returnSuccessResponse(response, logInformation, data) {
        this.logResponse(logInformation, data);
        let code = `${this.identifier}:${data.name}`;
        response.send({
            meta: {
                code,
            },
            data: data.payload,
        });
    }
    returnErrorResponse(response, error) {
        let code = `${this.identifier}:${error.name}`;
        response.status(500).send({
            meta: {
                code,
            },
        });
    }
    register(registerConfiguration) {
        const id = typeof registerConfiguration.usecase == 'string'
            ? registerConfiguration.usecase
            : registerConfiguration.usecase.name;
        let usecaseHttpPath = registerConfiguration.path || this.makeHttpPath(id);
        usecaseHttpPath = usecaseHttpPath.startsWith('/') ? usecaseHttpPath : `/${usecaseHttpPath}`;
        const method = (registerConfiguration.method || 'get').toLowerCase();
        const handler = (request, response) => {
            let logInformation = '';
            let alfa = process.hrtime.bigint();
            try {
                const usecase = this.container.getInstance(id);
                logInformation = this.logTitle(logInformation, id);
                const param = this.extractParam(request);
                logInformation = this.logParam(logInformation, param);
                const paramsMapper = registerConfiguration.paramsMapper;
                if (!usecase) {
                    const error = new Error('The usecase is not registered');
                    error.name = 'UsecaseNotRegisteredError';
                    this.returnErrorResponse(response, error);
                }
                else {
                    let convertedParams = param;
                    if (paramsMapper) {
                        convertedParams = paramsMapper(param);
                    }
                    const dataRes = usecase.call(convertedParams);
                    if (dataRes instanceof Promise) {
                        dataRes
                            .then((data) => {
                            this.returnSuccessResponse(response, logInformation, data);
                        })
                            .catch((error) => {
                            logInformation = this.logError(logInformation, error);
                            this.returnErrorResponse(response, error);
                        })
                            .finally(() => {
                            this.endTransaction(alfa, logInformation);
                        });
                    }
                    else if (!!dataRes.subscribe) {
                        dataRes.subscribe({
                            next: (data) => {
                                this.returnSuccessResponse(response, logInformation, data);
                            },
                            error: (error) => {
                                logInformation = this.logError(logInformation, error);
                                this.returnErrorResponse(response, error);
                            },
                            complete: () => {
                                this.endTransaction(alfa, logInformation);
                            },
                        });
                    }
                    else {
                        this.returnSuccessResponse(response, logInformation, dataRes);
                        this.endTransaction(alfa, logInformation);
                    }
                }
            }
            catch (error) {
                this.returnErrorResponse(response, error);
            }
        };
        if (method == 'get') {
            this.router.get(usecaseHttpPath, handler);
        }
        else if (method == 'post') {
            this.router.post(usecaseHttpPath, handler);
        }
        else if (method == 'put') {
            this.router.put(usecaseHttpPath, handler);
        }
    }
    endTransaction(alfa, logInformation) {
        let beta = process.hrtime.bigint();
        const endDiff = beta - alfa;
        this.logger?.info(logInformation);
        const micro = endDiff / 1000n;
        const mili = micro / 1000n;
        const sec = mili / 1000n;
        this.logger?.info(`Process Time: ${endDiff}ns ${micro}us ${mili}ms ${sec}s `);
    }
}
exports.ExpressController = ExpressController;
//# sourceMappingURL=express-controller.js.map