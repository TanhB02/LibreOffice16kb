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
 */
/* global app _ */
/*
    app.dispatcher.dispatch() will be used to call some actions so we can share the code
    This is mostly used by keyboard shortcuts etc, which need a base (for simplicity) to call actions.
*/
var Dispatcher = /** @class */ (function () {
    /// optional docType specifies which commands should we load
    function Dispatcher(docType) {
        if (docType === void 0) { docType = undefined; }
        this.actionsMap = {};
        docType = docType ? docType : app.map._docLayer._docType;
        this.addGeneralCommands();
        this.addExportCommands();
        if (docType === 'text') {
            this.addWriterCommands();
            this.addZoteroCommands();
        }
        else if (docType === 'spreadsheet') {
            this.addCalcCommands();
        }
        else if (['presentation', 'drawing'].includes(docType)) {
            this.addImpressAndDrawCommands();
        }
        if (window.mode.isMobile())
            this.addMobileCommands();
    }
    Dispatcher.prototype.addGeneralCommands = function () {
        var _this = this;
        this.actionsMap['save'] = function () {
            // Save only when not read-only.
            if (!app.map.isReadOnlyMode()) {
                app.map.fire('postMessage', {
                    msgId: 'UI_Save',
                    args: { source: 'toolbar' },
                });
                if (!app.map._disableDefaultAction['UI_Save']) {
                    app.map.save(false /* An explicit save should terminate cell edit */, false /* An explicit save should save it again */);
                }
            }
        };
        this.actionsMap['closeapp'] = function () {
            if (window.ThisIsAMobileApp) {
                window.postMobileMessage('BYE');
            }
            else {
                if (app.map &&
                    app.map.formulabar &&
                    (app.map.formulabar.hasFocus() || app.map.formulabar.isInEditMode())) {
                    _this.dispatch('acceptformula'); // save data from the edited cell on exit
                }
                app.map.fire('postMessage', {
                    msgId: 'close',
                    args: { EverModified: app.map._everModified, Deprecated: true },
                });
                app.map.fire('postMessage', {
                    msgId: 'UI_Close',
                    args: { EverModified: app.map._everModified },
                });
            }
            if (!app.map._disableDefaultAction['UI_Close'])
                app.map.remove();
        };
        this.actionsMap['userlist'] = function () {
            if (app.map.userList)
                app.map.userList.openDropdown();
        };
        this.actionsMap['print'] = function () {
            app.map.print();
        };
        this.actionsMap['print-notespages'] = function () {
            // To Export only notes with slides both should be true (ExportNotesPages, ExportOnlyNotesPages).
            // As ExportOnlyNotesPages is kind of child condition to ExportNotesPages.
            var options = {
                ExportNotesPages: {
                    type: 'boolean',
                    value: true,
                },
                ExportOnlyNotesPages: {
                    type: 'boolean',
                    value: true,
                },
            };
            var optionsString = JSON.stringify(options);
            app.map.print(optionsString);
        };
        this.actionsMap['repair'] = function () {
            app.socket.sendMessage('commandvalues command=.uno:DocumentRepair');
        };
        this.actionsMap['remotelink'] = function () {
            app.map.fire('postMessage', { msgId: 'UI_PickLink' });
        };
        this.actionsMap['remoteaicontent'] = function () {
            app.map.fire('postMessage', { msgId: 'UI_InsertAIContent' });
        };
        // TODO: deduplicate
        this.actionsMap['hyperlinkdialog'] = function () {
            app.map.showHyperlinkDialog();
        };
        this.actionsMap['inserthyperlink'] = function () {
            if (app.map.getDocType() == 'spreadsheet')
                app.map.sendUnoCommand('.uno:HyperlinkDialog');
            else
                app.map.showHyperlinkDialog();
        };
        this.actionsMap['rev-history'] = function () {
            app.map.openRevisionHistory();
        };
        this.actionsMap['shareas'] = function () {
            app.map.openShare();
        };
        this.actionsMap['savecomments'] = function () {
            if (app.isCommentEditingAllowed()) {
                app.map.fire('postMessage', { msgId: 'UI_Save' });
                if (!app.map._disableDefaultAction['UI_Save']) {
                    app.map.save(false, false);
                }
            }
        };
        this.actionsMap['insertmultimedia'] = function () {
            L.DomUtil.get('insertmultimedia').click();
        };
        this.actionsMap['remotemultimedia'] = function () {
            app.map.fire('postMessage', {
                msgId: 'UI_InsertFile',
                args: {
                    callback: 'Action_InsertMultimedia',
                    mimeTypeFilter: [
                        'video/MP2T',
                        'video/mp4',
                        'video/mpeg',
                        'video/ogg',
                        'video/quicktime',
                        'video/webm',
                        'video/x-matroska',
                        'video/x-ms-wmv',
                        'video/x-msvideo',
                        'audio/aac',
                        'audio/flac',
                        'audio/mp4',
                        'audio/mpeg',
                        'audio/ogg',
                        'audio/x-wav',
                    ],
                },
            });
        };
        this.actionsMap['charmapcontrol'] = function () {
            app.map.sendUnoCommand('.uno:InsertSymbol');
        };
        this.actionsMap['closetablet'] = function () {
            app.map.uiManager.enterReadonlyOrClose();
        };
        this.actionsMap['toggledarktheme'] = function () {
            app.map.uiManager.toggleDarkMode();
        };
        this.actionsMap['invertbackground'] = function () {
            app.map.uiManager.toggleInvert();
        };
        this.actionsMap['home-search'] = function () {
            app.map.uiManager.focusSearch();
        };
        this.actionsMap['renamedocument'] = function () {
            app.map.uiManager.renameDocument();
        };
        this.actionsMap['togglewasm'] = function () {
            app.map.uiManager.toggleWasm();
        };
        this.actionsMap['languagemenu'] = function () {
            app.map.fire('morelanguages');
        };
        this.actionsMap['morelanguages-selection'] = function () {
            app.map.fire('morelanguages', { applyto: 'selection' });
        };
        this.actionsMap['morelanguages-paragraph'] = function () {
            app.map.fire('morelanguages', { applyto: 'paragraph' });
        };
        this.actionsMap['morelanguages-all'] = function () {
            app.map.fire('morelanguages', { applyto: 'all' });
        };
        this.actionsMap['localgraphic'] = function () {
            L.DomUtil.get('insertgraphic').click();
        };
        this.actionsMap['remotegraphic'] = this.actionsMap['insertremotegraphic'] =
            function () {
                app.map.fire('postMessage', { msgId: 'UI_InsertGraphic' });
            };
        this.actionsMap['showhelp'] = function () {
            app.map.showHelp('online-help-content');
        };
        this.actionsMap['focustonotebookbar'] = function () {
            var tabsContainer = document.getElementsByClassName('notebookbar-tabs-container')[0].children[0];
            var elementToFocus;
            if (tabsContainer) {
                for (var i = 0; i < tabsContainer.children.length; i++) {
                    if (tabsContainer.children[i].classList.contains('selected')) {
                        elementToFocus = tabsContainer.children[i];
                        break;
                    }
                }
            }
            if (!elementToFocus)
                elementToFocus = document.getElementById('Home-tab-label');
            elementToFocus.focus();
        };
        this.actionsMap['saveas'] = function () {
            if (app.map && app.map.uiManager.getCurrentMode() === 'notebookbar') {
                app.map.openSaveAs(); // Opens save as dialog if integrator supports it.
            }
        };
        this.actionsMap['insertcomment'] = function () {
            app.map.insertComment();
        };
        this.actionsMap['zoomin'] = function () {
            app.map.zoomIn(1, null, true /* animate? */);
        };
        this.actionsMap['zoomout'] = function () {
            app.map.zoomOut(1, null, true /* animate? */);
        };
        this.actionsMap['zoomreset'] = function () {
            app.map.setZoom(app.map.options.zoom, null, true);
        };
        this.actionsMap['searchprev'] = function () {
            app.searchService.searchPrevious();
        };
        this.actionsMap['searchnext'] = function () {
            app.searchService.searchNext();
        };
        this.actionsMap['cancelsearch'] = function () {
            app.map.cancelSearch();
        };
        this.actionsMap['showsearchbar'] = function () {
            $('#toolbar-down').hide();
            $('#showsearchbar').removeClass('over');
            $('#toolbar-search').show();
            L.DomUtil.get('search-input').focus();
        };
        this.actionsMap['hidesearchbar'] = function () {
            $('#toolbar-search').hide();
            if (app.map.isEditMode())
                $('#toolbar-down').show();
            /** show edit button if only we are able to edit but in readonly mode */
            if (!app.isReadOnly() && app.map.isReadOnlyMode())
                $('#mobile-edit-button').css('display', 'flex');
        };
        this.actionsMap['prev'] = function () {
            if (app.map._docLayer._docType === 'text')
                app.map.goToPage('prev');
            else
                app.map.setPart('prev');
        };
        this.actionsMap['next'] = function () {
            if (app.map._docLayer._docType === 'text')
                app.map.goToPage('next');
            else
                app.map.setPart('next');
        };
        this.actionsMap['inserttextbox'] = function () {
            app.map.sendUnoCommand('.uno:Text?CreateDirectly:bool=true');
        };
        this.actionsMap['insertannotation'] = function () {
            app.map.insertComment();
        };
        this.actionsMap['fold'] = this.actionsMap['hamburger-tablet'] = function () {
            app.map.uiManager.toggleMenubar();
        };
        this.actionsMap['close'] = this.actionsMap['closemobile'] = function () {
            app.map.uiManager.enterReadonlyOrClose();
        };
        this.actionsMap['serveraudit'] = function () {
            app.map.serverAuditDialog.open();
        };
        this.actionsMap['togglea11ystate'] = function () {
            if (app.map._lockAccessibilityOn) {
                return;
            }
            var prevAccessibilityState = window.prefs.getBoolean('accessibilityState');
            app.map.setAccessibilityState(!prevAccessibilityState);
        };
        this.actionsMap['toggleuimode'] = function () {
            if (app.map.uiManager.shouldUseNotebookbarMode()) {
                app.map.uiManager.onChangeUIMode({ mode: 'classic', force: true });
            }
            else {
                app.map.uiManager.onChangeUIMode({ mode: 'notebookbar', force: true });
            }
        };
        this.actionsMap['showruler'] = function () {
            app.map.uiManager.toggleRuler();
        };
        this.actionsMap['showstatusbar'] = function () {
            app.map.uiManager.toggleStatusBar();
        };
        this.actionsMap['collapsenotebookbar'] = function () {
            app.map.uiManager.collapseNotebookbar();
        };
        this.actionsMap['scrollpreviewup'] = function () {
            var stylePreview = document.getElementById('stylesview');
            stylePreview.scrollBy({
                top: -stylePreview.offsetHeight,
                behavior: 'smooth',
            }); // Scroll up based on stylepreview height
        };
        this.actionsMap['scrollpreviewdown'] = function () {
            var stylePreview = document.getElementById('stylesview');
            stylePreview.scrollBy({
                top: stylePreview.offsetHeight,
                behavior: 'smooth',
            }); // Scroll up based on stylepreview height
        };
    };
    Dispatcher.prototype.addExportCommands = function () {
        this.actionsMap['exportpdf'] = function () {
            app.map.sendUnoCommand('.uno:ExportToPDF', {
                SynchronMode: {
                    type: 'boolean',
                    value: false,
                },
            });
        };
        this.actionsMap['exportdirectpdf'] = function () {
            app.map.sendUnoCommand('.uno:ExportDirectToPDF', {
                SynchronMode: {
                    type: 'boolean',
                    value: false,
                },
            });
        };
        this.actionsMap['exportepub'] = function () {
            app.map.sendUnoCommand('.uno:ExportToEPUB', {
                SynchronMode: {
                    type: 'boolean',
                    value: false,
                },
            });
        };
    };
    Dispatcher.prototype.addCalcCommands = function () {
        this.actionsMap['acceptformula'] = function () {
            if (window.mode.isMobile()) {
                app.map.focus();
                app.map._docLayer.postKeyboardEvent('input', app.map.keyboard.keyCodes.enter, app.map.keyboard._toUNOKeyCode(app.map.keyboard.keyCodes.enter));
            }
            else {
                app.map.sendUnoCommand('.uno:AcceptFormula');
            }
            app.map.onFormulaBarBlur();
            app.map.formulabarBlur();
            app.map.formulabarSetDirty();
        };
        this.actionsMap['cancelformula'] = function () {
            app.map.sendUnoCommand('.uno:Cancel');
            app.map.onFormulaBarBlur();
            app.map.formulabarBlur();
            app.map.formulabarSetDirty();
        };
        this.actionsMap['startformula'] = function () {
            app.map.sendUnoCommand('.uno:StartFormula');
            app.map.onFormulaBarFocus();
            app.map.formulabarFocus();
            app.map.formulabarSetDirty();
        };
        this.actionsMap['functiondialog'] = function () {
            if (window.mode.isMobile() && app.map._functionWizardData) {
                app.map._docLayer._closeMobileWizard();
                app.map._docLayer._openMobileWizard(app.map._functionWizardData);
                app.map.formulabarSetDirty();
            }
            else {
                app.map.sendUnoCommand('.uno:FunctionDialog');
            }
        };
        this.actionsMap['print-active-sheet'] = function () {
            var currentSheet = app.map._docLayer._selectedPart + 1;
            var options = {
                ExportFormFields: {
                    type: 'boolean',
                    value: false,
                },
                ExportNotes: {
                    type: 'boolean',
                    value: false,
                },
                SheetRange: {
                    type: 'string',
                    value: currentSheet + '-' + currentSheet,
                },
            };
            var optionsString = JSON.stringify(options);
            app.map.print(optionsString);
        };
        this.actionsMap['print-all-sheets'] = function () {
            app.map.print();
        };
        this.actionsMap['togglerelative'] = function () {
            app.map.sendUnoCommand('.uno:ToggleRelative');
        };
        this.actionsMap['focusonaddressinput'] = function () {
            document.getElementById('#addressInput input').focus();
        };
        // sheets toolbar
        this.actionsMap['insertsheet'] = function () {
            var nPos = $('#spreadsheet-tab-scroll')[0].childElementCount;
            app.map.insertPage(nPos);
            app.map.insertPage.scrollToEnd = true;
        };
        this.actionsMap['firstrecord'] = function () {
            $('#spreadsheet-tab-scroll').scrollLeft(0);
        };
        this.actionsMap['nextrecord'] = function () {
            // TODO: We should get visible tab's width instead of 60px
            $('#spreadsheet-tab-scroll').scrollLeft($('#spreadsheet-tab-scroll').scrollLeft() + 60);
        };
        this.actionsMap['prevrecord'] = function () {
            $('#spreadsheet-tab-scroll').scrollLeft($('#spreadsheet-tab-scroll').scrollLeft() - 30);
        };
        this.actionsMap['lastrecord'] = function () {
            // Set a very high value, so that scroll is set to the maximum possible value internally.
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft
            L.DomUtil.get('spreadsheet-tab-scroll').scrollLeft = 100000;
        };
        this.actionsMap['columnrowhighlight'] = function () {
            var newState = !app.map.uiManager.getHighlightMode();
            app.map.uiManager.setHighlightMode(newState);
            if (newState)
                FocusCellSection.showFocusCellSection();
            else
                FocusCellSection.hideFocusCellSection();
            app.sectionContainer.requestReDraw();
        };
    };
    Dispatcher.prototype.addImpressAndDrawCommands = function () {
        this.actionsMap['presentation'] = this.actionsMap['fullscreen-presentation'] = function () {
            if (window.canvasSlideshowEnabled)
                app.map.fire('newfullscreen');
            else
                app.map.fire('fullscreen');
        };
        this.actionsMap['presentation-currentslide'] = this.actionsMap['presentation-currentslide'] = function () {
            if (window.canvasSlideshowEnabled)
                app.map.fire('newfullscreen', {
                    startSlideNumber: app.map.getCurrentPartNumber(),
                });
            else
                app.map.fire('fullscreen', {
                    startSlideNumber: app.map.getCurrentPartNumber(),
                });
        };
        this.actionsMap['presentinwindow'] = this.actionsMap['present-in-window'] =
            function () {
                if (window.canvasSlideshowEnabled)
                    app.map.fire('newpresentinwindow');
                else
                    app.map.fire('presentinwindow');
            };
        this.actionsMap['presenterconsole'] = function () {
            if (window.canvasSlideshowEnabled)
                app.map.fire('newpresentinconsole');
        };
        this.actionsMap['fullscreen-drawing'] = function () {
            app.util.toggleFullScreen();
        };
        this.actionsMap['deletepage'] = function () {
            var msg;
            if (app.map.getDocType() === 'presentation') {
                msg = _('Are you sure you want to delete this slide?');
            }
            else {
                /* drawing */
                msg = _('Are you sure you want to delete this page?');
            }
            app.map.uiManager.showInfoModal('deleteslide-modal', _('Delete'), msg, '', _('OK'), function () {
                app.map.deletePage();
            }, true, 'deleteslide-modal-response');
        };
        this.actionsMap['previouspart'] = function () {
            app.map._docLayer._preview._scrollViewByDirection('prev');
        };
        this.actionsMap['nextpart'] = function () {
            app.map._docLayer._preview._scrollViewByDirection('next');
        };
        this.actionsMap['lastpart'] = function () {
            if (app && app.file.fileBasedView === true) {
                var partToSelect = app.map._docLayer._parts - 1;
                app.map._docLayer._preview._scrollViewToPartPosition(partToSelect);
            }
        };
        this.actionsMap['firstpart'] = function () {
            if (app && app.file.fileBasedView === true) {
                var partToSelect = 0;
                app.map._docLayer._preview._scrollViewToPartPosition(partToSelect);
            }
        };
        this.actionsMap['hideslide'] = function () {
            app.map.hideSlide();
        };
        this.actionsMap['showslide'] = function () {
            app.map.showSlide();
        };
        this.actionsMap['duplicatepage'] = function () {
            app.map.duplicatePage();
        };
        this.actionsMap['insertpage'] = function () {
            app.map.insertPage();
        };
        this.actionsMap['leftpara'] = function () {
            app.map.sendUnoCommand(window.getUNOCommand({
                textCommand: '.uno:LeftPara',
                objectCommand: '.uno:ObjectAlignLeft',
                unosheet: '.uno:AlignLeft',
            }));
        };
        this.actionsMap['centerpara'] = function () {
            app.map.sendUnoCommand(window.getUNOCommand({
                textCommand: '.uno:CenterPara',
                objectCommand: '.uno:AlignCenter',
                unosheet: '.uno:AlignHorizontalCenter',
            }));
        };
        this.actionsMap['rightpara'] = function () {
            app.map.sendUnoCommand(window.getUNOCommand({
                textCommand: '.uno:RightPara',
                objectCommand: '.uno:ObjectAlignRight',
                unosheet: '.uno:AlignRight',
            }));
        };
        this.actionsMap['selectbackground'] = function () {
            L.DomUtil.get('selectbackground').click();
        };
        this.actionsMap['notesmode'] = function () {
            if (app.impress.notesMode)
                app.map.sendUnoCommand('.uno:NormalMultiPaneGUI');
            else
                app.map.sendUnoCommand('.uno:NotesMode');
        };
    };
    Dispatcher.prototype.addZoteroCommands = function () {
        this.actionsMap['zoteroaddeditcitation'] = function () {
            app.map.zotero.handleItemList();
        };
        this.actionsMap['zoterosetdocprefs'] = function () {
            app.map.zotero.handleStyleList();
        };
        this.actionsMap['zoteroaddeditbibliography'] = function () {
            app.map.zotero.insertBibliography();
        };
        this.actionsMap['zoteroaddnote'] = function () {
            app.map.zotero.handleInsertNote();
        };
        this.actionsMap['zoterorefresh'] = function () {
            app.map.zotero.refreshCitationsAndBib();
        };
        this.actionsMap['zoterounlink'] = function () {
            app.map.zotero.unlinkCitations();
        };
    };
    Dispatcher.prototype.addWriterCommands = function () {
        this.actionsMap['.uno:ShowResolvedAnnotations'] = function () {
            var items = app.map['stateChangeHandler'];
            var val = items.getItemValue('.uno:ShowResolvedAnnotations');
            val = val === 'true' || val === true;
            app.map.showResolvedComments(!val);
        };
        this.actionsMap['showannotations'] = function () {
            var items = app.map['stateChangeHandler'];
            var val = items.getItemValue('showannotations');
            val = val === 'true' || val === true;
            app.map.showComments(!val);
        };
        this.actionsMap['.uno:AcceptAllTrackedChanges'] = function () {
            app.map.sendUnoCommand('.uno:AcceptAllTrackedChanges');
            app.socket.sendMessage('commandvalues command=.uno:ViewAnnotations');
        };
        this.actionsMap['.uno:RejectAllTrackedChanges'] = function () {
            app.map.sendUnoCommand('.uno:RejectAllTrackedChanges');
            var commentSection = app.sectionContainer.getSectionWithName(L.CSections.CommentList.name);
            commentSection.rejectAllTrackedCommentChanges();
        };
    };
    Dispatcher.prototype.addMobileCommands = function () {
        this.actionsMap['comment_wizard'] = function () {
            var configuration = window;
            if (configuration.commentWizard) {
                configuration.commentWizard = false;
                app.sectionContainer
                    .getSectionWithName(L.CSections.CommentList.name)
                    .removeHighlighters();
                app.map.fire('closemobilewizard');
                app.map.mobileTopBar.selectItem('comment_wizard', false);
            }
            else {
                if (configuration.insertionMobileWizard)
                    app.dispatcher.dispatch('insertion_mobile_wizard');
                else if (configuration.mobileWizard)
                    app.dispatcher.dispatch('mobile_wizard');
                configuration.commentWizard = true;
                var menuData = app.map._docLayer.getCommentWizardStructure();
                app.map.fire('mobilewizard', { data: menuData });
                app.map.mobileTopBar.selectItem('comment_wizard', true);
            }
        };
        this.actionsMap['mobile_wizard'] = function () {
            var configuration = window;
            if (configuration.mobileWizard) {
                configuration.mobileWizard = false;
                app.map.sendUnoCommand('.uno:SidebarHide');
                app.map.fire('closemobilewizard');
                app.map.mobileTopBar.selectItem('mobile_wizard', false);
            }
            else {
                if (configuration.insertionMobileWizard)
                    app.dispatcher.dispatch('insertion_mobile_wizard');
                else if (configuration.commentWizard)
                    app.dispatcher.dispatch('comment_wizard');
                configuration.mobileWizard = true;
                app.map.sendUnoCommand('.uno:SidebarShow');
                app.map.fire('showwizardsidebar');
                app.map.mobileTopBar.selectItem('mobile_wizard', true);
            }
        };
        this.actionsMap['insertion_mobile_wizard'] = function () {
            var configuration = window;
            if (configuration.insertionMobileWizard) {
                configuration.insertionMobileWizard = false;
                app.map.fire('closemobilewizard');
                app.map.mobileTopBar.selectItem('insertion_mobile_wizard', false);
            }
            else {
                if (configuration.mobileWizard)
                    app.dispatcher.dispatch('mobile_wizard');
                else if (configuration.commentWizard)
                    app.dispatcher.dispatch('comment_wizard');
                configuration.insertionMobileWizard = true;
                var menuData = app.map.menubar.generateInsertMenuStructure();
                app.map.fire('mobilewizard', { data: menuData });
                app.map.mobileTopBar.selectItem('insertion_mobile_wizard', true);
            }
        };
        this.actionsMap['fontcolor'] = function () {
            app.map.fire('mobilewizard', {
                data: window.getColorPickerData('Font Color'),
            });
        };
        this.actionsMap['backcolor'] = function () {
            app.map.fire('mobilewizard', {
                data: window.getColorPickerData('Highlight Color'),
            });
        };
        // TODO: leftover from mobile bottom bar
        // if (id === 'fontcolor' && typeof e.color !== 'undefined') {
        // 	onColorPick(id, e.color, e.themeData);
        // }
        // else if (id === 'backcolor' && typeof e.color !== 'undefined') {
        // 	onColorPick(id, e.color, e.themeData);
        // }
        // else if (id === 'backgroundcolor' && typeof e.color !== 'undefined') {
        // 	onColorPick(id, e.color, e.themeData);
        // }
    };
    Dispatcher.prototype.dispatch = function (action) {
        // Don't allow to execute new actions while any dialog is visible.
        // It prevents launching multiple instances of the same dialog.
        if (app.map.dialog.hasOpenedDialog() ||
            (app.map.jsdialog && app.map.jsdialog.hasDialogOpened())) {
            app.map.dialog.blinkOpenDialog();
            console.debug('Cannot dispatch: ' + action + ' when dialog is opened.');
            return;
        }
        if (action.indexOf('saveas-') === 0) {
            var format = action.substring('saveas-'.length);
            app.map.openSaveAs(format);
            return;
        }
        else if (action.indexOf('downloadas-') === 0) {
            var format = action.substring('downloadas-'.length);
            var fileName = app.map['wopi'].BaseFileName;
            fileName = fileName.substr(0, fileName.lastIndexOf('.'));
            fileName = fileName === '' ? 'document' : fileName;
            app.map.downloadAs(fileName + '.' + format, format);
            return;
        }
        if (action.indexOf('exportas-') === 0) {
            var format = action.substring('exportas-'.length);
            app.map.openSaveAs(format);
            return;
        }
        if (action === '.uno:Copy' ||
            action === '.uno:Cut' ||
            action === '.uno:Paste' ||
            action === '.uno:PasteSpecial') {
            app.map._clip.filterExecCopyPaste(action);
            return;
        }
        if (this.actionsMap[action] !== undefined) {
            this.actionsMap[action]();
            return;
        }
        console.error('unknown dispatch: "' + action + '"');
    };
    return Dispatcher;
}());
app.definitions['dispatcher'] = Dispatcher;
//# sourceMappingURL=docdispatcher.js.map