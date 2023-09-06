"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDateFromSeconds = void 0;
const firestore_1 = require("firebase-admin/firestore");
function getDateFromSeconds(seconds) {
    const fn = (data) => {
        if (!isNaN(data) && typeof data === 'number' && data !== undefined) {
            const date = new Date(Date.UTC(1970, 0, 1));
            date.setSeconds(data);
            return date;
        }
        return data;
    };
    if (typeof seconds == 'number') {
        return fn(seconds);
    }
    else if (typeof seconds == 'object') {
        if (seconds instanceof firestore_1.Timestamp) {
            return fn(seconds.seconds);
        }
        else if (seconds instanceof Date) {
            return seconds;
        }
    }
    return seconds;
}
exports.getDateFromSeconds = getDateFromSeconds;
//# sourceMappingURL=date.helpers.js.map