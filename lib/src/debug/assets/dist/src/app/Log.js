// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Logger contains methods for logging the activity
 */
var Logger = /** @class */ (function () {
    function Logger() {
        this._logs = [];
        this.startTime = null;
    }
    Logger.prototype.log = function (msg, direction) {
        var time = Date.now();
        if (!this.startTime)
            this.startTime = time;
        // Limit memory usage of log by only keeping the latest entries
        var maxEntries = 100;
        if (window.enableDebug)
            maxEntries = 1000;
        if (time - this.startTime < 60 * 1000 /* ms */)
            maxEntries = 500; // enough to capture early start.
        while (this._logs.length > maxEntries)
            this._logs.shift();
        // Limit memory usage of log by limiting length of message
        var maxMsgLen = 128;
        if (msg.length > maxMsgLen)
            msg = msg.substring(0, maxMsgLen);
        msg = msg.replace(/(\r\n|\n|\r)/gm, ' ');
        this._logs.push({ msg: msg, direction: direction, time: time });
    };
    Logger.prototype._getEntries = function () {
        this._logs.sort(function (a, b) {
            if (a.time < b.time) {
                return -1;
            }
            if (a.time > b.time) {
                return 1;
            }
            return 0;
        });
        var data = '';
        for (var i = 0; i < this._logs.length; i++) {
            data +=
                this._logs[i].time +
                    '.' +
                    this._logs[i].direction +
                    '.' +
                    this._logs[i].msg;
            data += '\n';
        }
        return data;
    };
    Logger.prototype.print = function () {
        window.app.console.log('Queued log messages:');
        window.app.console.log(this._getEntries());
        window.app.console.log('End of queued log messages:');
    };
    Logger.prototype.save = function () {
        var blob = new Blob([this._getEntries()], { type: 'text/csv' });
        var a = document.createElement('a');
        a.download = Date.now() + '.csv';
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/csv', a.download, a.href].join(':');
        var e = new MouseEvent('click', {
            bubbles: true,
            cancelable: false,
            view: window,
            detail: 0,
            screenX: 0,
            screenY: 0,
            clientX: 0,
            clientY: 0,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            button: 0,
            relatedTarget: null,
        });
        a.dispatchEvent(e);
    };
    Logger.prototype.clear = function () {
        this._logs = [];
    };
    return Logger;
}());
app.Log = new Logger();
//# sourceMappingURL=Log.js.map