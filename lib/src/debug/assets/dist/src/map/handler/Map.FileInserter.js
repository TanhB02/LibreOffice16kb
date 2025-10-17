/* -*- js-indent-level: 8 -*- */
/*
 * L.Map.FileInserter is handling the fileInserter action
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/* global app _ Uint8Array errorMessages */
L.Map.mergeOptions({
    fileInserter: true
});
L.Map.FileInserter = L.Handler.extend({
    initialize: function (map) {
        this._map = map;
        this._childId = null;
        this._toInsertGraphic = {};
        this._toInsertMultimedia = {};
        this._toInsertURL = {};
        this._toInsertBackground = {};
        var parser = document.createElement('a');
        parser.href = window.host;
    },
    getWopiUrl: function (map) {
        return window.makeHttpUrlWopiSrc('/' + map.options.urlPrefix + '/', map.options.doc, '/insertfile');
    },
    addHooks: function () {
        this._map.on('insertgraphic', this._onInsertGraphic, this);
        this._map.on('insertmultimedia', this._onInsertMultimedia, this);
        this._map.on('inserturl', this._onInsertURL, this);
        this._map.on('childid', this._onChildIdMsg, this);
        this._map.on('selectbackground', this._onSelectBackground, this);
    },
    removeHooks: function () {
        this._map.off('insertgraphic', this._onInsertGraphic, this);
        this._map.off('insertmultimedia', this._onInsertMultimedia, this);
        this._map.off('inserturl', this._onInsertURL, this);
        this._map.off('childid', this._onChildIdMsg, this);
        this._map.off('selectbackground', this._onSelectBackground, this);
    },
    _onInsertGraphic: function (e) {
        if (!this._childId) {
            app.socket.sendMessage('getchildid');
            this._toInsertGraphic[Date.now()] = e.file;
        }
        else {
            this._sendFile(Date.now(), e.file, 'graphic');
        }
    },
    _onInsertMultimedia: function (e) {
        if (!this._childId) {
            app.socket.sendMessage('getchildid');
            this._toInsertMultimedia[Date.now()] = e.file;
        }
        else {
            this._sendFile(Date.now(), e.file, 'multimedia');
        }
    },
    _onInsertURL: function (e) {
        if (!this._childId) {
            app.socket.sendMessage('getchildid');
            this._toInsertURL[Date.now()] = e;
        }
        else {
            this._sendURL(Date.now(), e);
        }
    },
    _onSelectBackground: function (e) {
        if (!this._childId) {
            app.socket.sendMessage('getchildid');
            this._toInsertBackground[Date.now()] = e.file;
        }
        else {
            this._sendFile(Date.now(), e.file, 'selectbackground');
        }
    },
    _onChildIdMsg: function (e) {
        // When childId is not created (usually when we insert file/URL very first time), we send message to get child ID
        // and store the file(s) into respective arrays (look at _onInsertGraphic, _onInsertMultimedia, _onInsertURL, _onSelectBackground)
        // When we receive the childId we empty all the array and insert respective file/URL from here
        this._childId = e.id;
        for (var name in this._toInsertGraphic) {
            this._sendFile(name, this._toInsertGraphic[name], 'graphic');
        }
        this._toInsertGraphic = {};
        for (var name in this._toInsertMultimedia) {
            this._sendFile(name, this._toInsertMultimedia[name], 'multimedia');
        }
        this._toInsertMultimedia = {};
        for (name in this._toInsertURL) {
            this._sendURL(name, this._toInsertURL[name]);
        }
        this._toInsertURL = {};
        for (name in this._toInsertBackground) {
            this._sendFile(name, this._toInsertBackground[name], 'selectbackground');
        }
        this._toInsertBackground = {};
    },
    _sendFile: function (name, file, type) {
        return __awaiter(this, void 0, void 0, function () {
            var socket, map, sectionContainer, url, size, videoElement_1, objectURL, videoLoadPromise, videoLoaded, _error_1, maxSize, shrinkToFitFactor, errMsg, reader, xmlHttp, formData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        socket = app.socket;
                        map = this._map;
                        sectionContainer = app.sectionContainer;
                        url = this.getWopiUrl(map);
                        if (!(type === 'multimedia')) return [3 /*break*/, 5];
                        videoElement_1 = document.createElement('video');
                        objectURL = window.URL.createObjectURL(file);
                        videoElement_1.src = objectURL;
                        videoLoadPromise = new Promise(function (resolve, reject) {
                            videoElement_1.addEventListener("loadedmetadata", resolve);
                            videoElement_1.addEventListener("error", reject);
                        });
                        videoElement_1.load();
                        videoLoaded = false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, videoLoadPromise];
                    case 2:
                        _a.sent();
                        videoLoaded = true;
                        return [3 /*break*/, 4];
                    case 3:
                        _error_1 = _a.sent();
                        size = {
                            width: 0,
                            height: 0,
                        }; // 0, 0 will make core pick the minimum size - which was the behavior before we checked size like this
                        return [3 /*break*/, 4];
                    case 4:
                        if (videoLoaded) {
                            size = {
                                width: videoElement_1.videoWidth,
                                height: videoElement_1.videoHeight,
                            };
                            maxSize = {
                                width: app.file.size.cX * map.getZoomScale(10),
                                height: app.file.size.cY * map.getZoomScale(10),
                            };
                            shrinkToFitFactor = Math.min(1, maxSize.width / size.width, maxSize.height / size.height);
                            size.width *= shrinkToFitFactor;
                            size.height *= shrinkToFitFactor;
                        }
                        videoElement_1.src = undefined;
                        window.URL.revokeObjectURL(objectURL);
                        _a.label = 5;
                    case 5:
                        if ('processCoolUrl' in window) {
                            url = window.processCoolUrl({ url: url, type: 'insertfile' });
                        }
                        if (!(file.filename && file.url) && (file.name === '' || file.size === 0)) {
                            errMsg = _('The file of type: {0} cannot be uploaded to server since the file has no name');
                            if (file.size === 0)
                                errMsg = _('The file of type: {0} cannot be uploaded to server since the file is empty');
                            errMsg = errMsg.replace('{0}', file.type);
                            map.fire('error', { msg: errMsg, critical: false });
                            return [2 /*return*/];
                        }
                        this._toInsertBackground = {};
                        if (window.ThisIsAMobileApp) {
                            reader = new FileReader();
                            reader.onload = (function (aFile) {
                                return function (e) {
                                    var byteBuffer = new Uint8Array(e.target.result);
                                    var strBytes = '';
                                    for (var i = 0; i < byteBuffer.length; i++) {
                                        strBytes += String.fromCharCode(byteBuffer[i]);
                                    }
                                    if (type === 'multimedia') {
                                        window.postMobileMessage('insertfile name=' + aFile.name + ' type=' + type +
                                            ' data=' + window.btoa(strBytes) +
                                            ' width=' + size.width + ' height=' + size.height);
                                    }
                                    else {
                                        window.postMobileMessage('insertfile name=' + aFile.name + ' type=' + type +
                                            ' data=' + window.btoa(strBytes));
                                    }
                                };
                            })(file);
                            reader.onerror = function (e) {
                                window.postMobileError('Error when reading file: ' + e);
                            };
                            reader.onprogress = function (e) {
                                window.postMobileDebug('FileReader progress: ' + Math.round(e.loaded * 100 / e.total) + '%');
                            };
                            reader.readAsArrayBuffer(file);
                        }
                        else {
                            xmlHttp = new XMLHttpRequest();
                            this._map.showBusy(_('Uploading...'), false);
                            xmlHttp.onreadystatechange = function () {
                                if (xmlHttp.readyState === 4) {
                                    map.hideBusy();
                                    if (xmlHttp.status === 200) {
                                        var sectionName = L.CSections.ContentControl.name;
                                        var section;
                                        if (sectionContainer.doesSectionExist(sectionName)) {
                                            section = sectionContainer.getSectionWithName(sectionName);
                                        }
                                        if (section && section.sectionProperties.picturePicker && type === 'graphic') {
                                            socket.sendMessage('contentcontrolevent type=picture' + ' name=' + name);
                                        }
                                        else if (type === 'multimedia') {
                                            socket.sendMessage('insertfile name=' + name + ' type=' + type + ' width=' + size.width + ' height=' + size.height);
                                        }
                                        else {
                                            socket.sendMessage('insertfile name=' + name + ' type=' + type);
                                        }
                                    }
                                    else if (xmlHttp.status === 404) {
                                        map.fire('error', { msg: errorMessages.uploadfile.notfound });
                                    }
                                    else if (xmlHttp.status === 413) {
                                        map.fire('error', { msg: errorMessages.uploadfile.toolarge });
                                    }
                                    else {
                                        var msg = _('Uploading file to server failed with status: {0}');
                                        msg = msg.replace('{0}', xmlHttp.status);
                                        map.fire('error', { msg: msg });
                                    }
                                }
                            };
                            xmlHttp.open('POST', url, true);
                            formData = new FormData();
                            formData.append('name', name);
                            formData.append('childid', this._childId);
                            if (file.filename && file.url) {
                                formData.append('url', file.url);
                                formData.append('filename', file.filename);
                            }
                            else {
                                formData.append('file', file);
                            }
                            xmlHttp.send(formData);
                            // Set it to null in case server restarts/shuts down or the user reconnects after being idle
                            // these change the childId but it would be cached already with the old one if a previous insertfile is made.
                            // in that case we would get http error 400 because of the wrong childId.
                            // when it's null we ask for a new childId before uploading.
                            this._childId = null;
                        }
                        return [2 /*return*/];
                }
            });
        });
    },
    _sendURL: function (name, e) {
        var sectionName = L.CSections.ContentControl.name;
        var section;
        if (app.sectionContainer.doesSectionExist(sectionName)) {
            section = app.sectionContainer.getSectionWithName(sectionName);
        }
        if (e.urltype == "graphicurl" && section && section.sectionProperties.picturePicker) {
            // The order argument is important
            app.socket.sendMessage('contentcontrolevent type=pictureurl name=' + encodeURIComponent(e.url));
        }
        else {
            app.socket.sendMessage('insertfile name=' + encodeURIComponent(e.url) + ' type=' + e.urltype);
        }
    }
});
L.Map.addInitHook('addHandler', 'fileInserter', L.Map.FileInserter);
//# sourceMappingURL=Map.FileInserter.js.map