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
    static makeErrorMessage(config, error) {
        let httpMessageCode = '';
        let message = '';
        httpMessageCode = 'SERVER:ERROR';
        message = code_responses_1.DEFAULT_MESSAGES[httpMessageCode];
        if (error && Object.keys(error).length > 0) {
            const data = Object.assign({}, error);
            const name = data.name;
            if (!config.exceptions) {
                httpMessageCode = 'SERVER:ERROR';
                message = code_responses_1.DEFAULT_MESSAGES[httpMessageCode] + ' : ' + error.message;
            }
            else {
                const castedConfig = config;
                httpMessageCode = castedConfig.exceptions[name];
                if (httpMessageCode) {
                    if (castedConfig.errorCodes) {
                        message = castedConfig.errorCodes[httpMessageCode];
                        message = HttpController.formatMessage(message, data);
                    }
                    else {
                        message = data.message;
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
        const logger = container.getInstance('Logger').instance;
        const usecase = container.getInstance(usecaseIdentifier).instance;
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
                    const final = moment();
                    const rest = final.diff(prev, 'milliseconds');
                    logger.info(`Process Time (${usecaseIdentifier}): ${rest}ms, ${rest / 1000}s`);
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
                    logger.info('Output ', usecaseIdentifier, new Date());
                },
                error: (error) => {
                    console.error('*:* Error:: ', error === null || error === void 0 ? void 0 : error.name, error === null || error === void 0 ? void 0 : error.message);
                    const resp = this.makeErrorMessage(config, error);
                    response.send(resp);
                },
                complete: () => { },
            });
        }
    }
}
exports.HttpController = HttpController;
//# sourceMappingURL=http-controller.js.map