/* -*- js-indent-level: 8 -*- */
var ClientAuditor = /** @class */ (function () {
    function ClientAuditor() {
    }
    ClientAuditor.checkPostMessages = function (entries) {
        if (window.WOPIPostmessageReady)
            entries.push({ code: 'postmessage', status: 'ok' });
        else
            entries.push({ code: 'postmessage', status: 'hostnotready' });
    };
    ClientAuditor.performClientAudit = function () {
        var entries = new Array();
        ClientAuditor.checkPostMessages(entries);
        return entries;
    };
    return ClientAuditor;
}());
var ServerAuditDialog = /** @class */ (function () {
    function ServerAuditDialog(map) {
        this.id = 'ServerAuditDialog';
        this.map = map;
        this.map.on('receivedserveraudit', this.onServerAudit.bind(this), this);
        this.errorCodes = {
            is_admin: {
                missing: [
                    _('The IsAdminUser property is not set by integration'),
                    'SDK: IsAdminUser',
                    'https://sdk.collaboraonline.com/docs/advanced_integration.html?highlight=IsAdminUser#isadminuser',
                ],
                deprecated: [
                    _('Used deprecated is_admin field, integration should use IsAdminUser property instead'),
                    'SDK: IsAdminUser',
                    'https://sdk.collaboraonline.com/docs/advanced_integration.html?highlight=IsAdminUser#isadminuser',
                ],
                ok: [
                    _('The IsAdminUser user property is set by integration'),
                    'SDK: IsAdminUser',
                    'https://sdk.collaboraonline.com/docs/advanced_integration.html?highlight=IsAdminUser#isadminuser',
                ],
            },
            certwarning: {
                sslverifyfail: [
                    _('Your WOPI server is not secure: SSL verification failed'),
                    'SDK: ssl-configuration',
                    'https://sdk.collaboraonline.com/docs/installation/Configuration.html?highlight=ssl#ssl-configuration',
                ],
                ok: [
                    _('No problems with SSL verification detected'),
                    'SDK: ssl-configuration',
                    'https://sdk.collaboraonline.com/docs/installation/Configuration.html?highlight=ssl#ssl-configuration',
                ],
            },
            postmessage: {
                ok: [
                    _('PostMessage API is initialized'),
                    'SDK: post-message-initialization',
                    'https://sdk.collaboraonline.com/docs/postmessage_api.html#initialization',
                ],
                hostnotready: [
                    _('Integrator is not ready for PostMessage calls'),
                    'SDK: post-message-initialization',
                    'https://sdk.collaboraonline.com/docs/postmessage_api.html#initialization',
                ],
            },
            hardwarewarning: {
                lowresources: [
                    _('Your server is configured with insufficient hardware resources, which may lead to poor performance.'),
                    'SDK: hardware-requirements',
                    'https://sdk.collaboraonline.com/docs/installation/Configuration.html#performance',
                ],
                ok: [
                    _('Hardware resources are sufficient for optimal performance'),
                    'SDK: hardware-requirements',
                    'https://sdk.collaboraonline.com/docs/installation/Configuration.html#performance',
                ],
            },
        };
    }
    ServerAuditDialog.prototype.open = function () {
        var serverEntries = this.getEntries(app.serverAudit);
        var clientEntries = this.getEntries(ClientAuditor.performClientAudit());
        var dialogBuildEvent = {
            data: this.getJSON(serverEntries.concat(clientEntries)),
            callback: this.callback.bind(this),
        };
        this.map.fire(window.mode.isMobile() ? 'mobilewizard' : 'jsdialog', dialogBuildEvent);
    };
    ServerAuditDialog.prototype.getEntries = function (source) {
        var _this = this;
        var entries = new Array();
        if (!source)
            return entries;
        var errorIcon = { collapsed: 'serverauditerror.svg' };
        var okIcon = { collapsed: 'serverauditok.svg' };
        source.forEach(function (entry) {
            var found = _this.errorCodes[entry.code];
            if (found) {
                var status_1 = found[entry.status];
                if (status_1) {
                    entries.push({
                        row: 0,
                        columns: [
                            entry.status === 'ok' ? okIcon : errorIcon,
                            { text: status_1[0] },
                            status_1[1] && status_1[2]
                                ? {
                                    text: status_1[1],
                                    link: status_1[2],
                                }
                                : { text: '' },
                        ],
                    });
                }
            }
            else {
                console.warn('Unknown server audit entry: ' + entry.code);
            }
        });
        return entries;
    };
    ServerAuditDialog.prototype.hasErrors = function () {
        var hasErrors = false;
        if (app.serverAudit) {
            app.serverAudit.forEach(function (entry) {
                if (entry.status !== 'ok') {
                    hasErrors = true;
                }
            });
        }
        if (app.clientAudit) {
            app.clientAudit.forEach(function (entry) {
                if (entry.status !== 'ok') {
                    hasErrors = true;
                }
            });
        }
        return hasErrors;
    };
    ServerAuditDialog.prototype.countErrors = function () {
        var _a, _b, _c, _d;
        return (((_b = (_a = app.serverAudit) === null || _a === void 0 ? void 0 : _a.filter(function (entry) { return entry.status !== 'ok'; }).length) !== null && _b !== void 0 ? _b : 0) +
            ((_d = (_c = app.clientAudit) === null || _c === void 0 ? void 0 : _c.filter(function (entry) { return entry.status !== 'ok'; }).length) !== null && _d !== void 0 ? _d : 0));
    };
    ServerAuditDialog.prototype.getJSON = function (entries) {
        var hasErrors = this.hasErrors();
        var countErrors = this.countErrors();
        return {
            id: this.id,
            dialogid: this.id,
            type: 'dialog',
            text: _('Server audit'),
            title: _('Server audit'),
            jsontype: 'dialog',
            responses: [
                {
                    id: 'ok',
                    response: 1,
                },
            ],
            children: [
                {
                    id: this.id + '-mainbox',
                    type: 'container',
                    vertical: true,
                    children: [
                        {
                            id: 'auditlist',
                            type: 'treelistbox',
                            headers: [
                                /* icon */ { text: _('Status'), sortable: false },
                                { text: _('Help'), sortable: false },
                            ],
                            entries: entries,
                            enabled: entries.length > 0,
                        },
                        !hasErrors
                            ? {
                                id: 'auditsuccess',
                                type: 'fixedtext',
                                text: _('No issues found'),
                            }
                            : {
                                id: 'auditerror',
                                type: 'fixedtext',
                                text: _('Alerts:') + ' ' + countErrors,
                            },
                        {
                            id: this.id + '-buttonbox',
                            type: 'buttonbox',
                            children: [
                                {
                                    id: 'ok',
                                    type: 'pushbutton',
                                    text: _('OK'),
                                },
                            ],
                            layoutstyle: 'end',
                        },
                    ],
                },
            ],
        };
    };
    ServerAuditDialog.prototype.close = function () {
        var closeEvent = {
            data: {
                action: 'close',
                id: this.id,
            },
        };
        this.map.fire(window.mode.isMobile() ? 'closemobilewizard' : 'jsdialog', closeEvent);
    };
    ServerAuditDialog.prototype.onServerAudit = function () {
        if (app.serverAudit.length) {
            var hasErrors_1 = false;
            app.serverAudit.forEach(function (entry) {
                if (entry.status !== 'ok') {
                    hasErrors_1 = true;
                }
            });
            // only show the snackbar if there are specific warnings
            // and if the current view isadminuser
            if (hasErrors_1 && app.isAdminUser) {
                this.map.uiManager.showSnackbar(_('Check security warnings of your server'), _('OPEN'), this.open.bind(this));
            }
            // but if we any results, enable the toolbar entry for the server audit
            this.map.uiManager.refreshUI();
        }
    };
    ServerAuditDialog.prototype.callback = function (objectType, eventType, object, data, builder) {
        if (eventType === 'response' || object.id === 'ok')
            this.close();
    };
    return ServerAuditDialog;
}());
JSDialog.serverAuditDialog = function (map) {
    return new ServerAuditDialog(map);
};
//# sourceMappingURL=Control.ServerAuditDialog.js.map