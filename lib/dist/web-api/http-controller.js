"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpController = void 0;
const code_responses_1 = require("./code-responses");
const moment = require("moment");
class HttpController {
    static handler(config) {
        let func = null;
        const { translatorId, container, usecaseId, usecaseParam, response, messageConfiguration } = config;
        if (translatorId) {
            const translator = container.getInstance(translatorId).instance;
            if (translator) {
                func = translator.fromJson;
            }
        }
        this.generalHandlerController(container, usecaseId, usecaseParam, func, response, messageConfiguration);
    }
    static makeErrorCode(exceptionName) {
        return exceptionName
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/Error$/, ':ERROR')
            .toUpperCase();
    }
    static makeErrorMessage(config, error) {
        let httpMessageCode = '';
        let message = '';
        httpMessageCode = 'SERVER:ERROR';
        message = code_responses_1.DEFAULT_MESSAGES[httpMessageCode];
        if (error && Object.keys(error).length > 0) {
            const exception = Object.assign({}, error);
            const exceptionName = exception.name;
            if (!config.exceptions) {
                const exceptionCode = HttpController.makeErrorCode(exceptionName);
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
                        message = HttpController.formatMessage(message, exception);
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
        const code = `${config.identifier}:${httpMessageCode}`;
        return {
            meta: {
                code,
                message,
            },
        };
    }
    static readyHandler(_request, response) {
        return response.status(200).json({});
    }
    static formatMessage(message, data) {
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
    static generalHandlerController(container, usecaseIdentifier, param, func, response, config) {
        let insideLogger;
        if (this.logger) {
            insideLogger = this.logger;
        }
        else if (this.loggerId) {
            insideLogger = container.getInstance(this.loggerId).instance;
        }
        const usecase = container.getInstance(usecaseIdentifier).instance;
        insideLogger === null || insideLogger === void 0 ? void 0 : insideLogger.group(usecaseIdentifier);
        if (typeof param == 'object') {
            insideLogger === null || insideLogger === void 0 ? void 0 : insideLogger.info(`Param:\n\t${JSON.stringify(param, null, 2)}`);
        }
        else if (typeof param == 'undefined') {
            insideLogger === null || insideLogger === void 0 ? void 0 : insideLogger.info(`\n\tWitout Param`);
        }
        else {
            insideLogger === null || insideLogger === void 0 ? void 0 : insideLogger.info(`Param:\n\t\t${param}`);
        }
        let dataRes = null;
        let params = param;
        const prev = moment();
        if (!usecase) {
            const resp = this.makeErrorMessage(config);
            response.send(resp);
        }
        else {
            if (func) {
                if (param) {
                    params = func(param);
                    dataRes = usecase.call(params);
                }
                else {
                    dataRes = usecase.call();
                }
            }
            else {
                if (param) {
                    dataRes = usecase.call(param);
                }
                else {
                    dataRes = usecase.call();
                }
            }
            dataRes.subscribe({
                next: (data) => {
                    if (typeof data == 'object') {
                        insideLogger === null || insideLogger === void 0 ? void 0 : insideLogger.info(`Usecase response:\n\t\t${JSON.stringify(data, null, 2)}`);
                    }
                    else if (typeof data == 'undefined') {
                        insideLogger === null || insideLogger === void 0 ? void 0 : insideLogger.info(`\n\tWitout Response`);
                    }
                    else {
                        insideLogger === null || insideLogger === void 0 ? void 0 : insideLogger.info(`Usecase response:\n\t\t${param}`);
                    }
                    let code = '';
                    let message = '';
                    if (typeof config.successCode == 'string') {
                        code = `${config.identifier}:${config.successCode}`;
                        message = code_responses_1.DEFAULT_MESSAGES[config.successCode];
                    }
                    else {
                        code = `${config.identifier}:${config.successCode.code}`;
                        message = config.successCode.message || '';
                    }
                    message = HttpController.formatMessage(message, config.extraData);
                    response.send({
                        meta: {
                            code,
                            message,
                        },
                        data,
                    });
                },
                error: (error) => {
                    insideLogger === null || insideLogger === void 0 ? void 0 : insideLogger.error(`Error: ${error === null || error === void 0 ? void 0 : error.name}, ${error === null || error === void 0 ? void 0 : error.message}`);
                    const resp = this.makeErrorMessage(config, error);
                    response.send(resp);
                },
                complete: () => {
                    const final = moment();
                    const rest = final.diff(prev, 'milliseconds');
                    insideLogger === null || insideLogger === void 0 ? void 0 : insideLogger.info(`Process Time: ${rest}ms, ${rest / 1000}s`);
                    insideLogger === null || insideLogger === void 0 ? void 0 : insideLogger.closeGroup();
                },
            });
        }
    }
}
exports.HttpController = HttpController;
HttpController.loggerId = 'Logger';
//# sourceMappingURL=http-controller.js.map