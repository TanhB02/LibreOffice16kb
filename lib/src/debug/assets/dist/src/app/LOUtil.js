// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
/* global app */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
// LOUtil contains various LO related utility functions used
// throughout the code.
var LOUtil = /** @class */ (function () {
    function LOUtil() {
    }
    LOUtil.onRemoveHTMLElement = function (element, onDetachCallback) {
        var observer = new MutationObserver(function () {
            function isDetached(el) {
                return !el.closest('html');
            }
            if (isDetached(element)) {
                onDetachCallback();
                observer.disconnect();
            }
        });
        observer.observe(document, {
            childList: true,
            subtree: true,
        });
    };
    LOUtil.startSpinner = function (spinnerCanvas, spinnerSpeed) {
        spinnerCanvas.width = 50;
        spinnerCanvas.height = 50;
        var context = spinnerCanvas.getContext('2d');
        context.lineWidth = 8;
        context.strokeStyle = 'grey';
        var x = spinnerCanvas.width / 2;
        var y = spinnerCanvas.height / 2;
        var radius = y - context.lineWidth / 2;
        var spinnerInterval = setInterval(function () {
            context.clearRect(0, 0, x * 2, y * 2);
            // Move to center
            context.translate(x, y);
            context.rotate((spinnerSpeed * Math.PI) / 180);
            context.translate(-x, -y);
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 1.3);
            context.stroke();
        }, 30);
        return spinnerInterval;
    };
    LOUtil.getViewIdColor = function (viewId) {
        var color = LOUtil.darkColors[(viewId + 1) % LOUtil.darkColors.length];
        return color[2] | (color[1] << 8) | (color[0] << 16);
    };
    LOUtil.rgbToHex = function (color) {
        return '#' + ('000000' + color.toString(16)).slice(-6);
    };
    LOUtil.stringToBounds = function (bounds) {
        var numbers = bounds.match(/\d+/g);
        var topLeft = cool.Point.toPoint(parseInt(numbers[0]), parseInt(numbers[1]));
        var bottomRight = topLeft.add(L.point(parseInt(numbers[2]), parseInt(numbers[3])));
        return cool.Bounds.toBounds(topLeft, bottomRight);
    };
    LOUtil.stringToRectangles = function (strRect) {
        var matches = strRect.match(/\d+/g);
        var rectangles = [];
        if (matches !== null) {
            for (var itMatch = 0; itMatch < matches.length; itMatch += 4) {
                var topLeft = cool.Point.toPoint(parseInt(matches[itMatch]), parseInt(matches[itMatch + 1]));
                var size = cool.Point.toPoint(parseInt(matches[itMatch + 2]), parseInt(matches[itMatch + 3]));
                var topRight = topLeft.add(L.point(size.x, 0));
                var bottomLeft = topLeft.add(L.point(0, size.y));
                var bottomRight = topLeft.add(size);
                rectangles.push([bottomLeft, bottomRight, topLeft, topRight]);
            }
        }
        return rectangles;
    };
    // Helper function to strip '.svg' suffix and 'lc_' prefix.
    LOUtil.stripName = function (name) {
        // Remove the '.svg' suffix.
        var strippedName = name.replace(/\.svg$/, '');
        // Remove the 'lc_' prefix if it exists.
        if (strippedName.startsWith('lc_')) {
            strippedName = strippedName.substring(3);
        }
        return strippedName;
    };
    LOUtil.isDarkModeItem = function (name) {
        var strippedName = LOUtil.stripName(name);
        // Check if the stripped name is in the onlydarkModeItems array.
        return LOUtil.onlydarkModeItems.includes(strippedName);
    };
    LOUtil.isCommonForAllMode = function (name) {
        var strippedName = LOUtil.stripName(name);
        // Check if the stripped name is in the commonItems array.
        return LOUtil.commonItems.includes(strippedName);
    };
    /// unwind things to get a good absolute URL.
    LOUtil.getURL = function (path) {
        if (path === '')
            return '';
        var customWindow = window;
        if (customWindow.host === '' && customWindow.serviceRoot === '')
            return path; // mobile app
        var url = customWindow.makeHttpUrl('/browser/' + customWindow.versionPath);
        if (path.substr(0, 1) !== '/')
            url += '/';
        url += path;
        return url;
    };
    LOUtil.setImage = function (img, name, map) {
        var setupIcon = function () {
            img.src = LOUtil.getImageURL(name);
            LOUtil.checkIfImageExists(img);
        };
        setupIcon();
        map.on('themechanged', setupIcon);
    };
    LOUtil.setUserImage = function (img, map, viewId) {
        // set avatar image if it exist in user extract info.
        var defaultImage = LOUtil.getImageURL('user.svg');
        var viewInfo = map._viewInfo[viewId];
        if (viewInfo !== undefined &&
            viewInfo.userextrainfo !== undefined &&
            viewInfo.userextrainfo.avatar !== undefined) {
            // set user avatar.
            img.src = viewInfo.userextrainfo.avatar;
            // Track if error event is already bound to this image.
            img.addEventListener('error', function () {
                img.src = defaultImage;
                LOUtil.checkIfImageExists(img, true);
            }, { once: true });
            return;
        }
        img.src = defaultImage;
        LOUtil.checkIfImageExists(img, true);
    };
    LOUtil.getImageURL = function (imgName) {
        var defaultImageURL = LOUtil.getURL('images/' + imgName);
        // Check if the image name is in the commonItems list and return the normal image path
        if (LOUtil.isCommonForAllMode(imgName)) {
            return defaultImageURL;
        }
        if (window.prefs.getBoolean('darkTheme')) {
            return LOUtil.getURL('images/dark/' + imgName);
        }
        var dummyEmptyImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        defaultImageURL = LOUtil.isDarkModeItem(imgName)
            ? dummyEmptyImg
            : defaultImageURL;
        return defaultImageURL;
    };
    LOUtil.getIconNameOfCommand = function (name, noCommad) {
        if (!name)
            return '';
        var alreadyClean = noCommad;
        var cleanName = name;
        if (!alreadyClean || alreadyClean !== true) {
            var prefixLength = '.uno:'.length;
            if (name.substr(0, prefixLength) == '.uno:')
                cleanName = name.substr(prefixLength);
            cleanName = encodeURIComponent(cleanName).replace(/%/g, '');
            cleanName = cleanName.toLowerCase();
        }
        var iconURLAliases = {
            // lc_closemobile.svg is generated when loading in NB mode then
            // switch to compact mode: 1st hidden element in the top toolbar
            closemobile: 'closedocmobile',
            'file-saveas': 'saveas',
            'home-search': 'recsearch',
            'addmb-menu': 'ok',
            closetablet: 'view',
            defineprintarea: 'menuprintranges',
            deleteprintarea: 'delete',
            sheetrighttoleft: 'pararighttoleft',
            alignleft: 'leftpara',
            alignright: 'rightpara',
            alignhorizontalcenter: 'centerpara',
            alignblock: 'justifypara',
            formatsparklinemenu: 'insertsparkline',
            insertdatecontentcontrol: 'datefield',
            editheaderandfooter: 'headerandfooter',
            exportas: 'saveas',
            insertheaderfooter: 'headerandfooter',
            previoustrackedchange: 'prevrecord',
            fieldtransparency: 'linetransparency',
            lb_glow_transparency: 'linetransparency',
            settransparency: 'linetransparency',
            field_transparency: 'linetransparency',
            selectionlanugagedefault: 'updateall',
            connectortoolbox: 'connectorlines',
            conditionalformatdialog: 'conditionalformatmenu',
            groupoutlinemenu: 'group',
            paperwidth: 'pagewidth',
            charspacing: 'spacing',
            fontworkcharacterspacingfloater: 'spacing',
            tablesort: 'datasort',
            spellcheckignoreall: 'spelling',
            deleterowbreak: 'delbreakmenu',
            alignmentpropertypanel: 'alignvcenter',
            cellvertcenter: 'alignvcenter',
            charbackcolor: 'backcolor',
            charmapcontrol: 'insertsymbol',
            insertrowsafter: 'insertrowsmenu',
            insertobjectchart: 'drawchart',
            textpropertypanel: 'sidebartextpanel',
            spacepara15: 'linespacing',
            orientationdegrees: 'rotation',
            clearoutline: 'delete',
            docsign: 'editdoc',
            editmenu: 'editdoc',
            drawtext: 'text',
            inserttextbox: 'text',
            accepttrackedchanges: 'acceptchanges',
            accepttrackedchange: 'acceptchanges',
            chartlinepanel: 'linestyle',
            linepropertypanel: 'linestyle',
            xlinestyle: 'linestyle',
            listspropertypanel: 'outlinebullet',
            shadowpropertypanel: 'shadowed',
            incrementlevel: 'outlineleft',
            menurowheight: 'rowheight',
            setoptimalrowheight: 'rowheight',
            cellverttop: 'aligntop',
            scalignmentpropertypanel: 'aligntop',
            hyperlinkdialog: 'inserthyperlink',
            remotelink: 'inserthyperlink',
            remoteaicontent: 'sdrespageobjs',
            openhyperlinkoncursor: 'inserthyperlink',
            pageformatdialog: 'pagedialog',
            backgroundcolor: 'fillcolor',
            cellappearancepropertypanel: 'fillcolor',
            formatarea: 'fillcolor',
            glowcolor: 'fillcolor',
            sccellappearancepropertypanel: 'fillcolor',
            insertcolumnsafter: 'insertcolumnsmenu',
            insertnonbreakingspace: 'formattingmark',
            insertcurrentdate: 'datefield',
            insertdatefieldfix: 'datefield',
            insertdatefield: 'datefield',
            insertdatefieldvar: 'datefield',
            setparagraphlanguagemenu: 'spelldialog',
            spellingandgrammardialog: 'spelldialog',
            spellonline: 'spelldialog',
            styleapply3fstyle3astring3ddefault26familyname3astring3dcellstyles: 'fontcolor',
            fontworkgalleryfloater: 'fontworkpropertypanel',
            insertfieldctrl: 'insertfield',
            pagenumberwizard: 'insertpagenumberfield',
            entirerow: 'fromrow',
            insertcheckboxcontentcontrol: 'checkbox',
            cellvertbottom: 'alignbottom',
            insertcurrenttime: 'inserttimefield',
            inserttimefieldfix: 'inserttimefield',
            inserttimefieldvar: 'inserttimefield',
            cancelformula: 'cancel',
            resetattributes: 'setdefault',
            tabledialog: 'tablemenu',
            insertindexesentry: 'insertmultiindex',
            paperheight: 'pageheight',
            masterslidespanel: 'masterslide',
            slidemasterpage: 'masterslide',
            tabledeletemenu: 'deletetable',
            tracechangemode: 'trackchanges',
            deleteallannotation: 'deleteallnotes',
            sdtabledesignpanel: 'tabledesign',
            tableeditpanel: 'tabledesign',
            tableautofitmenu: 'columnwidth',
            menucolumnwidth: 'columnwidth',
            hyphenation: 'hyphenate',
            objectbackone: 'behindobject',
            deleteannotation: 'deletenote',
            areapropertypanel: 'chartareapanel',
            'downloadas-png': 'insertgraphic',
            decrementlevel: 'outlineright',
            acceptformula: 'ok',
            insertannotation: 'shownote',
            insertcomment: 'shownote',
            objecttitledescription: 'shownote',
            namegroup: 'shownote',
            incrementindent: 'leftindent',
            outlineup: 'moveup',
            charttypepanel: 'diagramtype',
            arrangeframemenu: 'arrangemenu',
            bringtofront: 'arrangemenu',
            scnumberformatpropertypanel: 'numberformatincdecimals',
            graphicpropertypanel: 'graphicdialog',
            rotateflipmenu: 'rotateleft',
            outlinedown: 'movedown',
            nexttrackedchange: 'nextrecord',
            toggleorientation: 'orientation',
            configuredialog: 'sidebar',
            modifypage: 'sidebar',
            parapropertypanel: 'paragraphdialog',
            tablecellbackgroundcolor: 'fillcolor',
            zoteroArtwork: 'zoteroThesis',
            zoteroAudioRecording: 'zoteroThesis',
            zoteroBill: 'zoteroThesis',
            zoteroBlogPost: 'zoteroThesis',
            zoteroBookSection: 'zoteroBook',
            zoteroCase: 'zoteroThesis',
            zoteroConferencePaper: 'zoteroThesis',
            zoteroDictionaryEntry: 'zoteroThesis',
            zoteroDocument: 'zoteroThesis',
            zoteroEmail: 'zoteroThesis',
            zoteroEncyclopediaArticle: 'zoteroThesis',
            zoteroFilm: 'zoteroThesis',
            zoteroForumPost: 'zoteroThesis',
            zoteroHearing: 'zoteroThesis',
            zoteroInstantMessage: 'zoteroThesis',
            zoteroInterview: 'zoteroThesis',
            zoteroLetter: 'zoteroThesis',
            zoteroMagazineArticle: 'zoteroThesis',
            zoteroWebpage: 'zoteroThesis',
            zoteroaddeditcitation: 'insertauthoritiesentry',
            zoteroaddnote: 'addcitationnote',
            zoterorefresh: 'updateall',
            zoterounlink: 'unlinkcitation',
            zoteroaddeditbibliography: 'addeditbibliography',
            zoteroeditbibliography: 'addeditbibliography',
            zoterosetdocprefs: 'formproperties',
            'sidebardeck.propertydeck': 'sidebar',
            // Fix issue #6145 by adding aliases for the PDF and EPUB icons
            // The fix for issues #6103 and #6104 changes the name of these
            // icons so map the new names to the old names.
            'downloadas-pdf': 'exportpdf',
            'downloadas-direct-pdf': 'exportdirectpdf',
            'downloadas-epub': 'exportepub',
            languagestatusmenu: 'languagemenu',
            cancelsearch: 'cancel',
            printoptions: 'print',
            togglesheetgrid: 'show',
            'hamburger-tablet': 'fold',
            exportdirectpdf: 'exportpdf',
            textcolumnspropertypanel: 'entirecolumn',
            'sidebardeck.stylelistdeck': 'editstyle',
        };
        if (iconURLAliases[cleanName]) {
            cleanName = iconURLAliases[cleanName];
        }
        return 'lc_' + cleanName + '.svg';
    };
    LOUtil.checkIfImageExists = function (imageElement, imageIsLayoutCritical) {
        imageElement.addEventListener('error', function (e) {
            if (e.loUtilProcessed) {
                return;
            }
            if (imageElement.src &&
                imageElement.src.includes('/images/branding/dark/')) {
                imageElement.src = imageElement.src.replace('/images/branding/dark/', '/images/dark/');
                e.loUtilProcessed = true;
                return;
            }
            if (imageElement.src &&
                (imageElement.src.includes('/images/dark/') ||
                    imageElement.src.includes('/images/branding/'))) {
                imageElement.src = imageElement.src.replace('/images/dark/', '/images/');
                imageElement.src = imageElement.src.replace('/images/branding/', '/images/');
                e.loUtilProcessed = true;
                return;
            }
            if (imageIsLayoutCritical) {
                imageElement.src =
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
                // We cannot set visibility: hidden because that would hide
                // other attributes of the image, e.g. its border.
                e.loUtilProcessed = true;
                return;
            }
            imageElement.style.display = 'none';
            e.loUtilProcessed = true;
        });
    };
    /// oldFileName = Example.odt, suffix = new
    /// returns: Example_new.odt
    LOUtil.generateNewFileName = function (oldFileName, suffix) {
        var idx = oldFileName.lastIndexOf('.');
        return oldFileName.substring(0, idx) + suffix + oldFileName.substring(idx);
    };
    LOUtil.existsIconForCommand = function (command, docType) {
        var commandName = command.startsWith('.uno:')
            ? command.substring('.uno:'.length)
            : command;
        var res = !LOUtil.commandWithoutIcon.find(function (el) {
            return el.startsWith(commandName);
        });
        if (commandName.indexOf('?') !== -1) {
            if (commandName.indexOf('SpellCheckIgnore') !== -1 ||
                commandName.indexOf('SpellCheckIgnoreAll') !== -1)
                return true;
            if ((docType === 'spreadsheet' || docType === 'presentation') &&
                commandName.indexOf('LanguageStatus') !== -1)
                return true;
            if (commandName ===
                'LanguageStatus?Language:string=Current_LANGUAGE_NONE' ||
                commandName ===
                    'LanguageStatus?Language:string=Current_RESET_LANGUAGES' ||
                commandName ===
                    'LanguageStatus?Language:string=Paragraph_LANGUAGE_NONE' ||
                commandName ===
                    'LanguageStatus?Language:string=Paragraph_RESET_LANGUAGES')
                return true;
            return false;
        }
        return res;
    };
    /// Searching in JSON trees for data with a given field.
    LOUtil.findItemWithAttributeRecursive = function (node, idName, idValue) {
        var found = null;
        if (node[idName] === idValue)
            return node;
        if (node.children) {
            for (var i = 0; !found && i < node.children.length; i++)
                found = LOUtil.findItemWithAttributeRecursive(node.children[i], idName, idValue);
        }
        return found;
    };
    /// Searching in JSON trees for an identifier and return the index in parent.
    LOUtil.findIndexInParentByAttribute = function (node, idName, idValue) {
        if (node.children) {
            for (var i = 0; i < node.children.length; i++)
                if (node.children[i][idName] === idValue)
                    return i;
        }
        return -1;
    };
    LOUtil._doRectanglesIntersect = function (rectangle1, rectangle2) {
        // Format: (x, y, w, h).
        // Don't use equality in comparison, that's not an intersection.
        if (Math.abs(rectangle1[0] +
            rectangle1[2] * 0.5 -
            (rectangle2[0] + rectangle2[2] * 0.5)) <
            0.5 * (rectangle1[2] + rectangle2[2])) {
            if (Math.abs(rectangle1[1] +
                rectangle1[3] * 0.5 -
                (rectangle2[1] + rectangle2[3] * 0.5)) <
                0.5 * (rectangle1[3] + rectangle2[3]))
                return true;
            else
                return false;
        }
        else
            return false;
    };
    // Returns the intersecting area of 2 rectangles. Rectangle format: (x, y, w, h). Return format is the same or null.
    LOUtil._getIntersectionRectangle = function (rectangle1, rectangle2) {
        if (this._doRectanglesIntersect(rectangle1, rectangle2)) {
            var x = rectangle1[0] > rectangle2[0] ? rectangle1[0] : rectangle2[0];
            var y = rectangle1[1] > rectangle2[1] ? rectangle1[1] : rectangle2[1];
            var w = rectangle1[0] + rectangle1[2] < rectangle2[0] + rectangle2[2]
                ? rectangle1[0] + rectangle1[2] - x
                : rectangle2[0] + rectangle2[2] - x;
            var h = rectangle1[1] + rectangle1[3] < rectangle2[1] + rectangle2[3]
                ? rectangle1[1] + rectangle1[3] - y
                : rectangle2[1] + rectangle2[3] - y;
            return [x, y, w, h];
        }
        else
            return null;
    };
    LOUtil.getFileExtension = function (map) {
        var filename = map['wopi'].BaseFileName;
        return filename.substring(filename.lastIndexOf('.') + 1);
    };
    LOUtil.isFileODF = function (map) {
        var ext = LOUtil.getFileExtension(map);
        return ext === 'odt' || ext === 'ods' || ext === 'odp' || ext == 'odg';
    };
    LOUtil.containsDOMRect = function (viewRect, rect) {
        return (rect.top >= viewRect.top &&
            rect.right <= viewRect.right &&
            rect.bottom <= viewRect.bottom &&
            rect.left >= viewRect.left);
    };
    // Based on core.git's colordata.hxx: COL_AUTHOR1_DARK...COL_AUTHOR9_DARK
    // consisting of arrays of RGB values
    // Maybe move the color logic to separate file when it becomes complex
    LOUtil.darkColors = [
        [198, 146, 0],
        [6, 70, 162],
        [87, 157, 28],
        [105, 43, 157],
        [197, 0, 11],
        [0, 128, 128],
        [140, 132, 0],
        [53, 85, 107],
        [209, 118, 0],
    ];
    // Some items will only be present in dark mode so we will not check errors
    // for those in other mode.
    LOUtil.onlydarkModeItems = ['invertbackground'];
    // Common images used in all modes, so the default one will be used.
    LOUtil.commonItems = ['serverauditok', 'serverauditerror'];
    LOUtil.commandWithoutIcon = [
        'InsertPageHeader',
        'InsertPageFooter',
        'FLD_COL_NUMBER',
        'MTR_FLD_COL_SPACING',
        'rows',
        'cols',
        'None',
    ];
    LOUtil.Rectangle = cool.Rectangle;
    LOUtil.createRectangle = cool.createRectangle;
    return LOUtil;
}());
app.LOUtil = LOUtil;
//# sourceMappingURL=LOUtil.js.map