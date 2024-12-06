"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressController = void 0;
const code_responses_1 = require("./code-responses");
const moment = require("moment");
class ExpressController {
    constructor(configuration) {
        this.configuration = configuration;
        this.loggerId = 'Logger';
        this.container = configuration.container;
        this.identifier = configuration.identifier;
        this.app = configuration.app;
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
    makeErrorCode(exceptionName) {
        return exceptionName
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/-Error$/, ':ERROR')
            .toUpperCase();
    }
    makeErrorMessage(config, error) {
        let httpMessageCode = '';
        let message = '';
        httpMessageCode = 'SERVER:ERROR';
        message = code_responses_1.DEFAULT_MESSAGES[httpMessageCode];
        if (error && Object.keys(error).length > 0) {
            const exception = Object.assign({}, error);
            const exceptionName = exception.name;
            if (!config.exceptions) {
                const exceptionCode = this.makeErrorCode(exceptionName);
                if (exceptionCode) {
                    httpMessageCode = exceptionCode;
                    message = exception.message;
                }
                else {
                    httpMessageCode = 'SERVER:ERROR';
                    message = code_responses_1.DEFAULT_MESSAGES[httpMessageCode] + ' : ' + error.message;
                }
            }
            else {
                const castedConfig = config;
                httpMessageCode = castedConfig.exceptions[exceptionName];
                if (httpMessageCode) {
                    if (castedConfig.errorCodes) {
                        message = castedConfig.errorCodes[httpMessageCode];
                        message = this.formatMessage(message, exception);
                    }
                    else {
                        message = exception.message;
                    }
                }
                else {
                    httpMessageCode = 'SERVER:ERROR';
                    message = code_responses_1.DEFAULT_MESSAGES[httpMessageCode] + ' : ' + error.message;
                }
            }
        }
        const p = /[A-Z]+:[A-Z\-]+:[A-Z]+/g;
        let code = `${httpMessageCode}`;
        if (!httpMessageCode.match(p)) {
            code = `${config.identifier}:${httpMessageCode}`;
        }
        return {
            meta: {
                code,
                message,
            },
        };
    }
    makeErrorResponse(error) {
        let httpMessageCode = '';
        let message = '';
        const exception = Object.assign({}, error);
        message = exception.message;
        const p = /[A-Z]+:[A-Z\-]+:[A-Z]+/g;
        let code = exception.name;
        if (!httpMessageCode.match(p)) {
            const e = this.makeErrorCode(exception.name);
            code = `${this.identifier.toUpperCase()}:${e}`;
        }
        return {
            meta: {
                code,
                message,
            },
        };
    }
    readyHandler(_request, response) {
        return response.status(200).json({});
    }
    formatMessage(message, data) {
        if (!data) {
            return message;
        }
        const pattern = '{([A-Za-z]+)}';
        const regex = new RegExp(pattern);
        let temp = regex.exec(message);
        while (temp && temp.length > 0) {
            const key = temp[1];
            message = message.replace(`{${key}}`, data[key] || '');
            temp = regex.exec(message);
        }
        return message;
    }
    logParam(logInformation, param) {
        if (typeof param == 'object') {
            logInformation += `Param:\n\t${JSON.stringify(param, null, 2)}`;
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
            logInformation += `Usecase response:\n\t\t${JSON.stringify(response, null, 2)}`;
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
        logInformation += `Error: ${error === null || error === void 0 ? void 0 : error.name}, ${error === null || error === void 0 ? void 0 : error.message}`;
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
    getSuccessCode(usercaseId) {
        return usercaseId
            .replace(/Usecase/gi, '')
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toUpperCase();
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
    register(registerConfiguration) {
        const usecaseHttpPath = this.makeHttpPath(registerConfiguration.usecaseId);
        const method = (registerConfiguration.method || 'get').toLowerCase();
        console.log('Rourter', this.app, method);
        const methodHandler = this.app[method];
        const handler = (request, response) => {
            const { path, method } = request;
            console.log(' * ', path, method);
            let logInformation = '';
            const prev = moment();
            const usecase = this.container.getInstance(registerConfiguration.usecaseId).instance;
            this.logTitle(logInformation, registerConfiguration.usecaseId);
            const param = this.extractParam(request);
            this.logParam(logInformation, param);
            const paramsMapper = registerConfiguration.paramsMapper;
            if (!usecase) {
                const error = new Error('The usecase is not registered');
                error.name = 'UsecaseNotRegistered';
                const resp = this.makeErrorResponse(error);
                response.json(resp);
            }
            else {
                let convertedParams = null;
                if (paramsMapper) {
                    convertedParams = paramsMapper(param);
                }
                const dataRes = usecase.call(convertedParams);
                dataRes.subscribe({
                    next: (data) => {
                        this.logResponse(logInformation, data);
                        let code = '';
                        let message = '';
                        code = `${this.identifier}:${registerConfiguration.successCode ||
                            this.getSuccessCode(registerConfiguration.usecaseId)}`;
                        message = '';
                        response.send({
                            meta: {
                                code,
                                message,
                            },
                            data,
                        });
                    },
                    error: (error) => {
                        this.logError(logInformation, error);
                        const resp = this.makeErrorResponse(error);
                        response.send(resp);
                    },
                    complete: () => {
                        var _a, _b;
                        const final = moment();
                        const rest = final.diff(prev, 'milliseconds');
                        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info(logInformation);
                        (_b = this.logger) === null || _b === void 0 ? void 0 : _b.info(`Process Time: ${rest}ms, ${rest / 1000}s`);
                    },
                });
            }
        };
        this.app.get(usecaseHttpPath, handler);
        console.log({ methodHandler, router: this.router, method, usecaseHttpPath });
        methodHandler.bind(this.app, usecaseHttpPath, handler);
    }
}
exports.ExpressController = ExpressController;
//# sourceMappingURL=express-controller.js.map