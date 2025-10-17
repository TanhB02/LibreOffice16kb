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
/*
 * PresenterConsole
 */
/* global app SlideShow _ */
var PresenterConsole = /** @class */ (function () {
    function PresenterConsole(map, presenter) {
        this._map = map;
        this._presenter = presenter;
        this._map.on('presentationinfo', this._onPresentationInfo, this);
        this._map.on('newpresentinconsole', this._onPresentInConsole, this);
    }
    PresenterConsole.prototype._generateHtml = function (title) {
        this.labels = {
            currentSlide: _('Current Slide'),
            nextSlide: _('Next Slide'),
            previous: _('Previous'),
            next: _('Next'),
            notes: _('Notes'),
            slides: _('Slides'),
            pause: _('Pause'),
            restart: _('Restart'),
            resume: _('Resume'),
            goBack: _('Go Back'),
            zoomIn: _('Zoom In'),
            zoomOut: _('Zoom Out'),
        };
        var sanitizer = document.createElement('div');
        sanitizer.innerText = title;
        var sanitizedTitle = sanitizer.innerHTML;
        return "\n\t\t\t<!DOCTYPE html>\n\t\t\t<html lang=\"en\">\n\t\t\t<head>\n\t\t\t\t<meta charset=\"UTF-8\">\n\t\t\t\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n\t\t\t\t<title>" + sanitizedTitle + "</title>\n\t\t\t</head>\n\t\t\t<body>\n                                <header>\n                                </header>\n                                <main id=\"main-content\">\n\t\t\t\t\t\t\t\t  <div id=\"toolbar\">\n\t\t\t\t\t\t\t\t\t<button type=\"button\" id=\"close-slides\" data-cooltip=\"" + this.labels.goBack + "\">\n\t\t\t\t\t\t\t\t\t\t<img src=\"images/presenterscreen-ArrowBack.svg\">\n\t\t\t\t\t\t\t\t\t</button>\n                                  </div>\n                                  <div id=\"presentation-content\">\n                                    <div id=\"first-presentation\">\n\t\t\t\t\t\t\t\t\t\t<div id=\"timer-container\">\n\t\t\t\t\t\t\t\t\t\t\t<div id=\"timer\"></div>\n\t\t\t\t\t\t\t\t\t\t\t <div id=\"timer-controls\">\n\t\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" id=\"pause\" data-cooltip=\"" + this.labels.pause + "\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<img src=\"images/presenterscreen-ButtonPauseTimerNormal.svg\">\n\t\t\t\t\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" id=\"restart\" data-cooltip=\"" + this.labels.restart + "\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<img src=\"images/presenterscreen-ButtonRestartTimerNormal.svg\">\n\t\t\t\t\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t\t\t\t\t </div>\n\t\t\t\t\t\t\t\t\t\t\t<div id=\"today\"></div>\n\t\t\t\t\t\t\t\t\t\t</div>\n                                        <div id='current-slide-container'>\n                                            <canvas id=\"current-presentation\"></canvas>\n\t\t\t\t\t\t\t\t\t\t\t<div id=\"slideshow-control-container\">\n\t\t\t\t\t\t\t\t\t\t\t<div id=\"navigation-container\">\n\t\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" id=\"prev\" data-cooltip=\"" + this.labels.previous + "\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<img src=\"images/presenterscreen-ButtonSlidePreviousSelected.svg\">\n\t\t\t\t\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t\t\t\t\t\t<div id=\"title-current\">" + this.labels.currentSlide + "</div>\n\t\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" id=\"next\" data-cooltip=\"" + this.labels.next + "\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<img src=\"images/presenterscreen-ButtonEffectNextSelected.svg\">\n\t\t\t\t\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t<div id=\"action-buttons-container\">\n\t\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" id=\"notes\" data-cooltip=\"" + this.labels.notes + "\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<img src=\"images/presenterscreen-ButtonNotesNormal.svg\">\n\t\t\t\t\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" id=\"slides\" data-cooltip=\"" + this.labels.slides + "\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<img src=\"images/presenterscreen-ButtonSlideSorterNormal.svg\">\n\t\t\t\t\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t</div>\n                                        </div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div id=\"notes-separator\"></div>\n                                     <div id=\"second-presentation\">\n                                         <div id=\"title-next\">" + this.labels.nextSlide + "</div>\n                                         <div id='next-slide-container'>\n                                            <img id=\"next-presentation\"></img>\n                                         </div>\n                                    </div>\n                                  </div>\n                                </main>\n                                <footer>\n                                </footer>\n\t\t\t</body>\n\t\t\t</html>\n\t\t\t";
    };
    PresenterConsole.prototype._getSlidesCount = function () {
        return this._presenter._getSlidesCount();
    };
    PresenterConsole.prototype._getRepeatDuration = function () {
        return this._presenter._getRepeatDuration();
    };
    PresenterConsole.prototype._isSlideHidden = function (slideNumber) {
        return this._presenter.isSlideHidden(slideNumber);
    };
    PresenterConsole.prototype._getNextVisibleSlide = function (slideNumber) {
        return this._presenter.getNextVisibleSlide(slideNumber);
    };
    PresenterConsole.prototype._getVisibleIndex = function (slideNumber) {
        return this._presenter.getVisibleIndex(slideNumber);
    };
    PresenterConsole.prototype._onPresentationInfo = function () {
        if (!this._proxyPresenter) {
            return;
        }
        this._map.on('newslideshowframe', this._onNextFrame, this);
        this._map.on('transitionstart', this._onTransitionStart, this);
        this._map.on('transitionend', this._onTransitionEnd, this);
        this._map.on('tilepreview', this._onTilePreview, this);
        this._map.on('presentinwindowclose', this._onWindowClose, this);
        // safe check for current-presentation element
        var currentPresentationCanvas = this._proxyPresenter.document.querySelector('#current-presentation');
        if (!currentPresentationCanvas)
            return;
        this._computeCanvas(currentPresentationCanvas);
        this._timer = this._proxyPresenter.setInterval(L.bind(this._onTimer, this), 1000);
        this._ticks = 0;
        this._pause = false;
        this._visibleSlidesCount = this._presenter.getVisibleSlidesCount();
        this._previews = new Array(this._getSlidesCount());
        this._disableButton(this._prevButton); // On start by default we should disable the prev button
        if (this._slides) {
            var img = void 0;
            var elem = this._slides.querySelector('#slides-preview');
            for (var index = 0; index < this._getSlidesCount(); index++) {
                if (this._isSlideHidden(index))
                    continue;
                img = this._proxyPresenter.document.createElement('img');
                img.id = "preview-slide-" + index;
                img.src = document.querySelector('meta[name="previewImg"]').content;
                img.alt = _('Preview Slide {1}').replace('{1}', index + 1);
                img.style.marginLeft = '10px';
                img.style.marginRight = '10px';
                img.style.marginTop = '10px';
                img.style.marginBottom = '10px';
                img.style.border = '3px solid transparent';
                img.style.padding = '1px';
                img.style.borderRadius = '3px';
                img.width = 100;
                img.height = 100;
                img._index = index;
                elem.append(img);
            }
        }
    };
    PresenterConsole.prototype._onImpressModeChanged = function (e) {
        if (this._waitForExitingNotesMode && e.mode === 0) {
            this._waitForExitingNotesMode = false;
            this._map.off('impressmodechanged', this._onImpressModeChanged, this);
            setTimeout(this._onPresentInConsole.bind(this), 500);
        }
    };
    PresenterConsole.prototype._onPresentInConsole = function () {
        var _this = this;
        if (app.impress.notesMode) {
            console.debug('PresenterConsole._onPresentInConsole: notes mode is enabled, exiting');
            // exit notes view mode and wait for status update notification
            // so we're sure that impress mode is changed
            // finally skip next partsupdate event,
            // since it's only due to the mode change
            this._presenter._skipNextSlideShowInfoChangedMsg = true;
            this._waitForExitingNotesMode = true;
            this._map.on('impressmodechanged', this._onImpressModeChanged, this);
            app.map.sendUnoCommand('.uno:NormalMultiPaneGUI');
            return;
        }
        this._map.fire('newpresentinwindow');
        if (!this._presenter._slideShowWindowProxy) {
            return;
        }
        this._proxyPresenter = window.open('', '_blank', 'toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,popup=true');
        if (!this._proxyPresenter) {
            this._presenter._notifyBlockedPresenting();
            return;
        }
        this._proxyPresenter.document.open();
        this._proxyPresenter.document.write(this._generateHtml(_('Presenter Console')));
        this._proxyPresenter.document.close();
        this._currentSlideCanvas = this._proxyPresenter.document.querySelector('#current-presentation');
        this._currentSlideContext =
            this._currentSlideCanvas.getContext('bitmaprenderer');
        this._proxyPresenter.addEventListener('resize', L.bind(this._onResize, this));
        if (this._presenter._slideShowWindowProxy) {
            this._presenter._slideShowWindowProxy.addEventListener('unload', L.bind(this._onWindowClose, this));
            window.addEventListener('beforeunload', L.bind(this._onWindowClose, this));
        }
        this._proxyPresenter.addEventListener('unload', L.bind(this._onConsoleClose, this));
        this._proxyPresenter.addEventListener('keydown', L.bind(this._onKeyDown, this));
        // Declare some basic elements that we will use often in next function calls
        this._prevButton = this._proxyPresenter.document.querySelector('#prev');
        this._nextButton = this._proxyPresenter.document.querySelector('#next');
        this._proxyPresenter.document.body.style.margin = '0';
        this._proxyPresenter.document.body.style.padding = '0';
        this._proxyPresenter.document.body.style.overflowX = 'hidden';
        this._proxyPresenter.document.body.style.display = 'flex';
        this._proxyPresenter.document.body.style.flexDirection = 'column';
        this._proxyPresenter.document.body.style.minHeight = '100vh';
        this._proxyPresenter.document.body.style.minWidth = '100vw';
        var elem;
        var mainContentContainer = this._proxyPresenter.document.querySelector('#main-content');
        var slideShowBGColor = window
            .getComputedStyle(document.documentElement)
            .getPropertyValue('--color-background-slideshow');
        this.slideShowColor = window
            .getComputedStyle(document.documentElement)
            .getPropertyValue('--color-slideshow');
        var slideShowFontFamily = window
            .getComputedStyle(document.documentElement)
            .getPropertyValue('--cool-font');
        this.slideSelectionColor = window
            .getComputedStyle(document.documentElement)
            .getPropertyValue('--orange1-txt-primary-color');
        this.PresenterConsoleBtnHoverColor = window
            .getComputedStyle(document.documentElement)
            .getPropertyValue('--color-main-text');
        this.PresenterConsoleBtnRadius = window
            .getComputedStyle(document.documentElement)
            .getPropertyValue('--border-radius');
        mainContentContainer.style.backgroundColor = slideShowBGColor;
        mainContentContainer.style.color = this.slideShowColor;
        mainContentContainer.style.fontFamily = slideShowFontFamily;
        mainContentContainer.style.display = 'flex';
        mainContentContainer.style.flexDirection = 'column';
        mainContentContainer.style.minWidth = '100vw';
        mainContentContainer.style.minHeight = '100vh';
        // Disable text selection
        mainContentContainer.style.userSelect = 'none'; //Firefox, Chrome etc.
        this._proxyPresenter.document.body.style.backgroundColor = slideShowBGColor;
        elem = this._proxyPresenter.document.querySelector('#presentation-content');
        elem.style.display = 'flex';
        elem.style.flexWrap = 'wrap';
        elem.style.gap = '3vw';
        elem.style.marginBottom = '10px';
        this._first = elem = this._proxyPresenter.document.querySelector('#first-presentation');
        elem.style.display = 'flex';
        elem.style.flexDirection = 'column';
        elem.style.flex = '1';
        // consistent gap between label and presentation preview
        elem.style.gap = '1vh';
        elem.style.marginTop = '4vh';
        elem.style.marginLeft = '2vw';
        // Apply common button style to every button in Current slide division
        var currentSlideActionButtons = this._first.querySelectorAll('button');
        currentSlideActionButtons.forEach(function (button) {
            button.style.display = 'flex';
            button.style.flexDirection = 'column';
            button.style.alignItems = 'center';
            button.style.backgroundColor = 'transparent';
            button.style.color = _this.slideShowColor;
            button.style.border = 'none';
            button.style.borderRadius = _this.PresenterConsoleBtnRadius;
        });
        elem = this._proxyPresenter.document.querySelector('#title-current');
        elem.style.display = 'flex';
        elem.style.flexDirection = 'column';
        elem.style.justifyContent = 'center';
        elem.style.alignItems = 'center';
        elem.style.backgroundColor = 'transparent';
        elem.style.color = this.slideShowColor;
        elem.style.fontSize = '22px';
        elem = this._proxyPresenter.document.querySelector('#current-slide-container');
        // this will handle the responsiveness on resize for current-presentation window
        elem.style.width = '56vw';
        elem.style.height = '67vh';
        // slideshow-control-container
        var slideshowControlContainer = this._proxyPresenter.document.querySelector('#slideshow-control-container');
        slideshowControlContainer.style.display = 'flex';
        slideshowControlContainer.style.gap = '2vw';
        slideshowControlContainer.style.alignItems = 'center';
        slideshowControlContainer.style.marginTop = '1vh';
        // Select the parent container by its ID
        var navigationContainer = this._proxyPresenter.document.getElementById('navigation-container');
        // Add the necessary styles to make elements appear in a row
        navigationContainer.style.display = 'flex';
        navigationContainer.style.width = 'max-content';
        navigationContainer.style.alignItems = 'center';
        navigationContainer.style.gap = '0.5vw'; // Adjust gap as needed
        // Select all button elements inside #navigation-container
        var navigationButtons = this._proxyPresenter.document.querySelectorAll('#navigation-container button');
        // Apply additional style for navigation button
        navigationButtons.forEach(function (button) {
            button.style.border = 'none';
            button.style.justifyContent = 'center';
        });
        // slideshow-control-container
        var actionBtnContainer = this._proxyPresenter.document.querySelector('#action-buttons-container');
        actionBtnContainer.style.display = 'flex';
        actionBtnContainer.style.gap = '1vw';
        this._first.addEventListener('click', L.bind(this._onToolbarClick, this));
        var notesSeparator = this._proxyPresenter.document.querySelector('#notes-separator');
        notesSeparator.style.backgroundColor = 'transparent';
        notesSeparator.style.color = 'transparent';
        notesSeparator.style.border = '1px solid';
        notesSeparator.style.margin = '2vh 0vw';
        notesSeparator.style.height = '85vh';
        this._second = elem = this._proxyPresenter.document.querySelector('#second-presentation');
        elem.style.display = 'flex';
        elem.style.flexDirection = 'column';
        elem.style.flex = '1';
        // consistent gap between label and presentation preview
        elem.style.gap = '1vh';
        elem.style.marginTop = '4vh';
        elem = this._proxyPresenter.document.querySelector('#title-next');
        elem.style.display = 'flex';
        elem.style.flexDirection = 'column';
        elem.style.backgroundColor = 'transparent';
        elem.style.color = this.slideShowColor;
        elem.style.height = '35px';
        elem.style.fontSize = '22px';
        elem.style.justifyContent = 'center';
        var nextSlideContainer = this._proxyPresenter.document.querySelector('#next-slide-container');
        nextSlideContainer.style.width = '25vw';
        nextSlideContainer.style.height = '80vh';
        nextSlideContainer.style.display = 'flex';
        nextSlideContainer.style.flexDirection = 'column';
        nextSlideContainer.style.gap = '2vw';
        elem = this._proxyPresenter.document.querySelector('#next-presentation');
        elem.addEventListener('click', L.bind(this._onClickPreview, this));
        this._notes = this._proxyPresenter.document.createElement('div');
        this._notes.style.height = '45vh';
        this._notes.style.width = '25vw';
        this._notes.style.paddingTop = '10px';
        this._notes.style.borderTop = '2px solid transparent';
        this._notes.style.fontSize = '24px';
        this._notes.style.overflowX = 'hidden';
        elem = this._proxyPresenter.document.createElement('div');
        elem.id = 'notes';
        elem.style.height = '100%';
        elem.style.width = '100%';
        elem.style.userSelect = 'text'; // Enables text selection
        this._notes.appendChild(elem);
        // Append the container div to the notes section
        nextSlideContainer.appendChild(this._createTextScalerContainer());
        this._slides = this._proxyPresenter.document.createElement('div');
        this._slides.style.height = '100%';
        this._slides.style.width = '100%';
        this._slides.style.display = 'flex';
        this._slides.style.flexDirection = 'column';
        this._slides.style.gap = '2vh';
        elem = this._proxyPresenter.document.createElement('div');
        elem.id = 'slides-preview';
        elem.style.overflow = 'auto';
        elem.style.height = '90vh';
        elem.style.width = '100%';
        elem.style.display = 'flex';
        elem.style.flexWrap = 'wrap';
        elem.style.justifyContent = 'center';
        elem.style.columnGap = '5vw';
        this._slides.appendChild(elem);
        this._slides.addEventListener('click', L.bind(this._onClickSlides, this));
        elem = this._proxyPresenter.document.querySelector('#toolbar');
        elem.style.display = 'flex';
        elem.style.alignItems = 'center';
        elem.style.backgroundColor = slideShowBGColor;
        elem.style.overflow = 'hidden';
        elem.style.width = '100%';
        elem.style.gap = '1vw';
        elem.style.margin = '1vh 0vw';
        elem.style.height = '6vh';
        elem.addEventListener('click', L.bind(this._onToolbarClick, this));
        var list = this._proxyPresenter.document.querySelectorAll('#toolbar button');
        for (elem = 0; elem < list.length; elem++) {
            list[elem].style.display = 'flex';
            list[elem].style.flexDirection = 'column';
            list[elem].style.justifyContent = 'center';
            list[elem].style.alignItems = 'center';
            list[elem].style.backgroundColor = 'transparent';
            list[elem].style.color = this.slideShowColor;
            list[elem].style.padding = '10px';
            list[elem].style.height = '6vh';
            list[elem].style.border = 'none';
        }
        // By default we will hide the Back button to jump from Slides view to Normal view
        var closeSlideButton = this._proxyPresenter.document.querySelector('#close-slides');
        closeSlideButton.style.display = 'none';
        closeSlideButton.style.marginLeft = '10px';
        elem = this._proxyPresenter.document.querySelector('#timer-container');
        elem.style.display = 'flex';
        elem.style.alignItems = 'center';
        elem.style.gap = '15px';
        elem = this._proxyPresenter.document.querySelector('#timer');
        elem.style.fontSize = '22px';
        elem.style.width = '85px';
        elem.style.color = this.slideShowColor;
        var timeControlElem = this._proxyPresenter.document.querySelector('#timer-controls');
        timeControlElem.style.display = 'flex';
        timeControlElem.style.alignItems = 'center';
        timeControlElem.style.gap = '5px';
        timeControlElem.addEventListener('click', L.bind(this._onToolbarClick, this));
        // Style buttons in slideshow control container
        var buttons = timeControlElem.querySelectorAll('button');
        buttons.forEach(function (button) {
            button.style.display = 'flex';
            button.style.flexDirection = 'column';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
            button.style.backgroundColor = 'transparent';
            button.style.borderColor = 'none';
        }.bind(this));
        elem = this._proxyPresenter.document.querySelector('#today');
        elem.style.textAlign = 'right';
        elem.style.fontSize = '22px';
        elem.style.marginLeft = 'auto';
        elem.style.color = this.slideShowColor;
        this._ticks = 0;
        this._onTimer();
        // initialize tooltip division
        this.tooltip = this._proxyPresenter.document.createElement('div');
        this.tooltip.style.position = 'absolute';
        this.tooltip.style.backgroundColor = '#262626';
        this.tooltip.style.color = '#e8e8e8';
        this.tooltip.style.padding = '7px 9px';
        this.tooltip.style.borderRadius = '6px';
        this.tooltip.style.fontSize = '14px';
        this.tooltip.style.fontFamily = slideShowFontFamily;
        this.tooltip.style.whiteSpace = 'nowrap';
        this.tooltip.style.pointerEvents = 'none';
        this.tooltip.style.zIndex = '2147483647';
        this.tooltip.style.boxShadow = 'rgba(77, 77, 77, 0.5) 0px 0px 4px 0px';
        this.tooltip.style.display = 'none'; // Initially hidden
        mainContentContainer.append(this.tooltip);
        this._tooltip = L.control.tooltip({
            window: this._proxyPresenter,
            container: this.tooltip,
        });
        var allPresenterConsoleButtons = this._proxyPresenter.document.querySelectorAll('button');
        this._attachTooltips(allPresenterConsoleButtons);
        // enable notes by default on start of present console
        this._onShowNotes();
        // simulate resize to Firefox
        this._onResize();
    };
    // Show the tooltip
    PresenterConsole.prototype._showTooltip = function (button, text) {
        // Show the tooltip
        this.tooltip.style.display = 'block';
        // Set the tooltip text
        this.tooltip.textContent = text;
        // Get the button's position and tooltip dimensions
        var rect = button.getBoundingClientRect();
        var tooltipRect = this.tooltip.getBoundingClientRect();
        // Calculate initial position
        var left = rect.left + this._proxyPresenter.scrollX;
        var top = rect.bottom + this._proxyPresenter.scrollY + 5;
        // Adjust if tooltip goes off the right edge of the screen
        if (left + tooltipRect.width > this._proxyPresenter.innerWidth) {
            left = this._proxyPresenter.innerWidth - tooltipRect.width - 10; // Add some padding
        }
        // Adjust if tooltip goes off the left edge of the screen
        if (left < 0) {
            left = 10; // Add some padding
        }
        // Adjust if tooltip goes off the bottom edge of the screen
        if (top + tooltipRect.height > this._proxyPresenter.innerHeight) {
            top = rect.top + this._proxyPresenter.scrollY - tooltipRect.height - 5; // Position above the button
        }
        // Adjust if tooltip goes off the top edge of the screen
        if (top < 0) {
            top = rect.bottom + this._proxyPresenter.scrollY + 5; // Revert to below the button
        }
        // Apply the adjusted position
        this.tooltip.style.left = left + "px";
        this.tooltip.style.top = top + "px";
    };
    // Hide the tooltip
    PresenterConsole.prototype._hideTooltip = function () {
        this.tooltip.style.display = 'none';
    };
    // Attach tooltips to buttons
    PresenterConsole.prototype._attachTooltips = function (buttons) {
        buttons.forEach(function (button) {
            button.addEventListener('mouseenter', function () {
                // Add hover effect for enabled button only
                if (!button.disable)
                    button.style.backgroundColor = this.PresenterConsoleBtnHoverColor;
                button.style.borderRadius = this.PresenterConsoleBtnRadius;
                var tooltipText = button.getAttribute('data-cooltip') || 'Button'; // Default text if no attribute
                this._showTooltip(button, tooltipText);
            }.bind(this));
            var hideTooltip = this._hideTooltip.bind(this);
            button.addEventListener('mouseleave', function () {
                // Remove hover effect
                if (!button.disable)
                    button.style.backgroundColor = 'transparent';
                // Hide tooltip
                this._hideTooltip();
            }.bind(this));
            // for slides view change element on screen to show all the slides in that case tooltip should be hidden
            if (button.getAttribute('data-cooltip') === this.labels.slides)
                button.addEventListener('click', hideTooltip);
        }.bind(this));
    };
    PresenterConsole.prototype._adjustFontSize = function (increment) {
        // Define the font size bounds
        var MIN_FONT_SIZE = 12;
        var MAX_FONT_SIZE = 64;
        var currentFontSize = parseInt(this._notes.style.fontSize);
        var newFontSize = currentFontSize + increment;
        var zoomInBtn = this._proxyPresenter.document.querySelector('#increase');
        var zoomOutBtn = this._proxyPresenter.document.querySelector('#decrease');
        // Ensure the font size stays within bounds
        if (newFontSize >= MIN_FONT_SIZE && newFontSize <= MAX_FONT_SIZE) {
            this._notes.style.fontSize = newFontSize + "px";
            this._enableButton(zoomInBtn);
            this._enableButton(zoomOutBtn);
        }
        if (newFontSize <= MIN_FONT_SIZE) {
            this._disableButton(zoomOutBtn);
        }
        else if (newFontSize >= MAX_FONT_SIZE) {
            this._disableButton(zoomInBtn);
        }
    };
    PresenterConsole.prototype._createTextScalerContainer = function () {
        // Create the main container div
        var fontChangeContainer = this._proxyPresenter.document.createElement('div');
        fontChangeContainer.id = 'textScaler';
        fontChangeContainer.style.display = 'none';
        // Create the plus button
        var plusButton = this._proxyPresenter.document.createElement('button');
        plusButton.id = 'increase';
        plusButton.setAttribute('data-cooltip', this.labels.zoomIn); // Set the tooltip text
        // Create the image for the plus button
        var plusImage = this._proxyPresenter.document.createElement('img');
        plusImage.src = 'images/presenterscreen-ButtonPlusNormal.svg';
        plusImage.alt = 'Increase Font'; // Optional: Add alt text for accessibility
        // Add the image inside the plus button
        plusButton.appendChild(plusImage);
        // Create the minus button
        var minusButton = this._proxyPresenter.document.createElement('button');
        minusButton.id = 'decrease';
        minusButton.setAttribute('data-cooltip', this.labels.zoomOut); // Set the tooltip text
        // Create the image for the minus button
        var minusImage = this._proxyPresenter.document.createElement('img');
        minusImage.src = 'images/presenterscreen-ButtonMinusNormal.svg';
        minusImage.alt = 'Decrease Font'; // Optional: Add alt text for accessibility
        // Add the image inside the minus button
        minusButton.appendChild(minusImage);
        // Add buttons to the container div
        fontChangeContainer.appendChild(plusButton);
        fontChangeContainer.appendChild(minusButton);
        // common button settings
        var fontScalerButtons = fontChangeContainer.querySelectorAll('button');
        fontScalerButtons.forEach(function (button) {
            button.style.display = 'flex';
            button.style.flexDirection = 'column';
            button.style.alignItems = 'center';
            button.style.backgroundColor = 'transparent';
            button.style.border = 'none';
            button.style.margin = '0 5px'; // Add some spacing between buttons
        }.bind(this));
        // font change button action listener
        fontChangeContainer.addEventListener('click', L.bind(this._onToolbarClick, this));
        return fontChangeContainer;
    };
    PresenterConsole.prototype._pauseButton = function () {
        // Update the image source
        var pauseBtn = this._proxyPresenter.document.querySelector('#pause');
        var imgElem = this._proxyPresenter.document.querySelector('#pause>img');
        if (this._pause) {
            imgElem.src = 'images/presenterscreen-ButtonResumeTimerNormal.svg';
            pauseBtn.setAttribute('data-cooltip', this.labels.resume); // Set the tooltip text
        }
        else {
            imgElem.src = 'images/presenterscreen-ButtonPauseTimerNormal.svg';
            pauseBtn.setAttribute('data-cooltip', this.labels.pause); // Set the tooltip text
        }
        // Kind of special case, on restart we will nor show tooltip on play/pause button
        if (!this._timerReset) {
            this._showTooltip(pauseBtn, pauseBtn.getAttribute('data-cooltip'));
            return;
        }
        this._timerReset = false;
    };
    PresenterConsole.prototype._onKeyDown = function (e) {
        this._presenter.getNavigator().onKeyDown(e);
    };
    PresenterConsole.prototype._onClickPreview = function (e) {
        this._presenter.getNavigator().onClick(e);
    };
    PresenterConsole.prototype._onToolbarClick = function (e) {
        var target = e.target;
        if (!target) {
            return;
        }
        if (target.localName !== 'button') {
            target = target.parentElement;
        }
        if (target.localName !== 'button') {
            return;
        }
        var isLastSlide = this._currentIndex + 1 == this._visibleSlidesCount;
        switch (target.id) {
            case 'prev': {
                this._presenter.getNavigator().rewindEffect();
                break;
            }
            case 'next': {
                this._presenter.getNavigator().dispatchEffect();
                // if repeat after sec is set then do not close on last slide
                if (isLastSlide && !this._presenter._presentationInfo.isEndless) {
                    this._onWindowClose();
                    break;
                }
                break;
            }
            case 'pause':
                this._pause = !this._pause;
                this._pauseButton();
                break;
            case 'restart':
                this._pause = false;
                this._ticks = 0;
                this._drawClock();
                this._timerReset = true;
                this._pauseButton();
                this._proxyPresenter.clearInterval(this._timer);
                this._timer = this._proxyPresenter.setInterval(L.bind(this._onTimer, this), 1000);
                break;
            case 'help':
                // TODO. add help.collaboraonline.com
                window.open('https://collaboraonline.com', '_blank');
                break;
            case 'notes':
                if (this._proxyPresenter.document.contains(this._notes)) {
                    this._onHideNotes();
                }
                else {
                    this._onShowNotes();
                }
                break;
            case 'slides':
                this._onShowSlides();
                break;
            case 'close-slides':
                this._onHideSlides();
                break;
            case 'increase':
                this._adjustFontSize(2);
                break;
            case 'decrease':
                this._adjustFontSize(-2);
                break;
        }
        e.stopPropagation();
    };
    PresenterConsole.prototype._resizePreviews = function (width, height) {
        var preview;
        var previews = this._slides.querySelector('#slides-preview');
        var size = this._map.getPreview(2000, 0, width, height, {
            fetchThumbnail: false,
            autoUpdate: false,
        });
        for (var index = 0; index < this._visibleSlidesCount; index++) {
            preview = previews.children.item(index);
            if (preview.width !== size.width ||
                preview.height !== size.height ||
                width !== size.width ||
                height !== size.height) {
                this._map.getPreview(2000, preview._index, size.width, size.height, {
                    autoUpdate: false,
                    slideshow: true,
                });
            }
        }
    };
    PresenterConsole.prototype._onShowSlides = function () {
        var elem = this._proxyPresenter.document.querySelector('#slides');
        this.toggleButtonState(elem, true);
        // Show Back button to go into previous page (Current slides page)
        var closeSlideButton = this._proxyPresenter.document.querySelector('#close-slides');
        closeSlideButton.style.display = 'block';
        elem = this._proxyPresenter.document.querySelector('#next-presentation');
        var rect = elem.getBoundingClientRect();
        var notesSeparator = this._proxyPresenter.document.querySelector('#notes-separator');
        notesSeparator.style.display = 'none';
        this._first.style.display = 'none';
        this._second.style.display = 'none';
        elem = this._proxyPresenter.document.querySelector('#presentation-content');
        elem.appendChild(this._slides);
        if (this._selectedImg) {
            this._selectedImg.scrollIntoView();
        }
        this._proxyPresenter.setTimeout(L.bind(this._resizePreviews, this, rect.width, rect.height), 0);
    };
    PresenterConsole.prototype._onHideSlides = function () {
        var elem = this._proxyPresenter.document.querySelector('#presentation-content');
        this._slides.remove();
        var notesSeparator = this._proxyPresenter.document.querySelector('#notes-separator');
        notesSeparator.style.display = 'block';
        this._first.style.display = 'flex';
        this._second.style.display = 'flex';
        elem = this._proxyPresenter.document.querySelector('#slides');
        this.toggleButtonState(elem, false);
        // Hide back button on normal view
        var closeSlideButton = this._proxyPresenter.document.querySelector('#close-slides');
        closeSlideButton.style.display = 'none';
        this._onResize();
    };
    PresenterConsole.prototype._selectImg = function (img) {
        if (this._selectedImg) {
            this._selectedImg.style.border = '3px solid transparent';
            this._selectedImg = null;
        }
        if (img) {
            this._selectedImg = img;
            this._selectedImg.style.border =
                '3px solid rgb(' + this.slideSelectionColor + ')';
        }
    };
    PresenterConsole.prototype._onClickSlides = function (e) {
        if (e.target && e.target.localName === 'img') {
            this._selectImg(e.target);
            if (this._selectedImg && this._proxyPresenter) {
                this._proxyPresenter.requestAnimationFrame(function (navigator, index) {
                    navigator.displaySlide(index, true);
                }.bind(null, this._presenter.getNavigator(), this._selectedImg._index));
            }
        }
        e.stopPropagation();
    };
    PresenterConsole.prototype._onShowNotes = function () {
        var elem = this._proxyPresenter.document.querySelector('#notes');
        this.toggleButtonState(elem, true);
        var container = this._proxyPresenter.document.querySelector('#next-slide-container');
        this._notes.style.borderTopColor = this.slideShowColor;
        var notesSeparator = this._proxyPresenter.document.querySelector('#notes-separator');
        notesSeparator.style.color = this.slideShowColor;
        // show font scaler container on show notes
        var textScaler = this._proxyPresenter.document.querySelector('#textScaler');
        textScaler.style.display = 'flex';
        // Insert _notes before textScaler
        container.insertBefore(this._notes, textScaler);
    };
    PresenterConsole.prototype._onHideNotes = function (e) {
        var notesSeparator = this._proxyPresenter.document.querySelector('#notes-separator');
        notesSeparator.style.color = 'transparent';
        // hide font scaler container on hide notes
        var textScaler = this._proxyPresenter.document.querySelector('#textScaler');
        textScaler.style.display = 'none';
        this._notes.style.borderTopColor = 'transparent';
        this._notes.remove();
        var elem = this._proxyPresenter.document.querySelector('#notes');
        this.toggleButtonState(elem, false);
        if (e) {
            e.stopPropagation();
        }
    };
    PresenterConsole.prototype._disableButton = function (elem) {
        elem.disabled = true;
        elem.style.opacity = '0.5';
    };
    PresenterConsole.prototype._enableButton = function (elem) {
        elem.disabled = false;
        elem.style.opacity = '1';
    };
    PresenterConsole.prototype.toggleButtonState = function (elem, toggleOn) {
        if (toggleOn) {
            // Apply the 'selected' styles on show notes to display toggle effect on button
            elem.style.filter = 'invert(1)';
            elem.style.backgroundColor = 'black';
            elem.disable = true;
        }
        else {
            elem.style.filter = '';
            elem.style.backgroundColor = 'transparent';
            elem.disable = false;
        }
    };
    PresenterConsole.prototype._onTimer = function () {
        if (!this._proxyPresenter) {
            return;
        }
        if (!this._pause) {
            ++this._ticks;
        }
        this._proxyPresenter.requestAnimationFrame(this._drawClock.bind(this));
    };
    PresenterConsole.prototype._drawClock = function () {
        if (!this._proxyPresenter || !this._proxyPresenter.document) {
            return;
        }
        var sec, min, hour, elem;
        if (!this._pause) {
            sec = this._ticks % 60;
            min = Math.floor(this._ticks / 60);
            hour = Math.floor(min / 60);
            min = min % 60;
            elem = this._proxyPresenter.document.querySelector('#timer');
            if (elem) {
                elem.innerText =
                    String(hour).padStart(2, '0') +
                        ':' +
                        String(min).padStart(2, '0') +
                        ':' +
                        String(sec).padStart(2, '0');
            }
        }
        var dateTime = new Date();
        elem = this._proxyPresenter.document.querySelector('#today');
        if (elem) {
            elem.innerText = dateTime.toLocaleTimeString(String.Locale, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        }
        var next = this._proxyPresenter.document.querySelector('#next-presentation');
        if (this._ticks % 2 === 0 &&
            typeof this._lastIndex !== 'undefined' &&
            next) {
            var nextIndex = this._getNextVisibleSlide(this._lastIndex);
            this._proxyPresenter.setTimeout(L.bind(this._fetchPreview, this, nextIndex, next), 0);
        }
    };
    PresenterConsole.prototype._fetchPreview = function (index, elem) {
        if (index >= this._getSlidesCount()) {
            return;
        }
        var rect = elem.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
            return;
        }
        var preview = this._previews[index];
        if (preview) {
            this._lastIndex = index;
            return;
        }
        var size = this._map.getPreview(2000, 0, rect.width, rect.height, {
            fetchThumbnail: false,
            autoUpdate: false,
        });
        this._map.getPreview(2000, index, size.width, size.height, {
            autoUpdate: false,
            slideshow: true,
        });
    };
    PresenterConsole.prototype._onWindowClose = function () {
        if (this._proxyPresenter && !this._proxyPresenter.closed)
            this._proxyPresenter.close();
        window.removeEventListener('beforeunload', L.bind(this._onWindowClose, this));
        this._presenter._stopFullScreen();
    };
    PresenterConsole.prototype._onConsoleClose = function () {
        if (this._presenter._slideShowWindowProxy &&
            !this._presenter._slideShowWindowProxy.closed)
            this._presenter.slideshowWindowCleanUp();
        this._proxyPresenter.removeEventListener('resize', L.bind(this._onResize, this));
        this._proxyPresenter.removeEventListener('keydown', L.bind(this._onKeyDown, this));
        this._proxyPresenter.clearInterval(this._timer);
        this._proxyPresenter.close();
        delete this._proxyPresenter;
        delete this._currentIndex;
        delete this._lastIndex;
        delete this._previews;
        this._map.off('newslideshowframe', this._onNextFrame, this);
        this._map.off('transitionstart', this._onTransitionStart, this);
        this._map.off('transitionend', this._onTransitionEnd, this);
        this._map.off('tilepreview', this._onTilePreview, this);
    };
    PresenterConsole.prototype._resizeSlideView = function (viewContainerId, slideViewId) {
        var container = this._proxyPresenter.document.querySelector('#' + viewContainerId);
        if (!container) {
            return;
        }
        var rect = container.getBoundingClientRect();
        var size = this._map.getPreview(2000, 0, rect.width, rect.height, {
            fetchThumbnail: false,
            autoUpdate: false,
        });
        var slideView = this._proxyPresenter.document.querySelector('#' + slideViewId);
        if (slideView) {
            slideView.style.width = size.width + 'px';
            slideView.style.height = size.height + 'px';
        }
    };
    PresenterConsole.prototype._onResize = function () {
        if (!this._proxyPresenter) {
            return;
        }
        this._proxyPresenter.clearTimeout(this._resizeTimeout);
        this._resizeSlideView('current-slide-container', 'current-presentation');
        this._resizeSlideView('next-slide-container', 'next-presentation');
        // timeControlContainer should also maintain it's width based on current-slide-container width, better for responsive view
        var timeControlContainer = this._proxyPresenter.document.querySelector('#timer-container');
        if (timeControlContainer) {
            timeControlContainer.style.width = this._currentSlideCanvas.style.width;
        }
        this._resizeTimeout = this._proxyPresenter.setTimeout(function () {
            var previews = this._proxyPresenter.document.querySelector('#slides-preview');
            if (previews && typeof this._currentIndex !== 'undefined') {
                var preview = this._proxyPresenter.document.querySelector("#preview-slide-" + this._currentIndex);
                // 80vh
                var height = this._proxyPresenter.innerHeight * 0.8;
                // 25vw
                var width = this._proxyPresenter.innerWidth * 0.25;
                if (preview.width >= this._proxyPresenter.innerWidth ||
                    preview.height >= this._proxyPresenter.innerHeight ||
                    preview.width < width) {
                    this._resizePreviews(width, height);
                }
            }
        }.bind(this), 800);
    };
    PresenterConsole.prototype._onTransitionStart = function (e) {
        if (!this._proxyPresenter) {
            return;
        }
        this._currentIndex = e.slide;
        var isFirstSlide = this._currentIndex == 0;
        var elem = this._proxyPresenter.document.querySelector('#title-current');
        if (elem) {
            elem.innerText = _('Slide {0} of {1}')
                .replace('{0}', this._getVisibleIndex(e.slide) + 1)
                .replace('{1}', this._visibleSlidesCount);
        }
        if (isFirstSlide)
            this._disableButton(this._prevButton);
        else
            this._enableButton(this._prevButton);
        elem = this._proxyPresenter.document.querySelector('#next-presentation');
        if (elem) {
            var nextIndex = this._getNextVisibleSlide(this._currentIndex);
            this._fetchPreview(nextIndex, elem);
        }
    };
    PresenterConsole.prototype._onTransitionEnd = function (e) {
        if (!this._proxyPresenter) {
            return;
        }
        this._currentIndex = e.slide;
        if (this._notes) {
            var notes = this._presenter.getNotes(e.slide);
            var notesContentElem = this._notes.querySelector('#notes');
            notesContentElem.innerText = _('No Notes');
            if (notes && notes.toLowerCase() !== 'click to add notes'.toLowerCase())
                notesContentElem.innerText = notes;
        }
        var img = this._slides.querySelector("#preview-slide-" + this._currentIndex);
        if (img) {
            this._selectImg(img);
        }
        var next = this._proxyPresenter.document.querySelector('#next-presentation');
        this.drawNext(next);
    };
    PresenterConsole.prototype.drawNext = function (elem) {
        if (!this._proxyPresenter) {
            return;
        }
        if (!elem) {
            return;
        }
        if (this._currentIndex === undefined) {
            return;
        }
        var rect = elem.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
            this._proxyPresenter.requestAnimationFrame(this.drawNext.bind(this, elem));
            return;
        }
        var size = this._map.getPreview(2000, 0, rect.width, rect.height, {
            fetchThumbnail: false,
            autoUpdate: false,
        });
        var nextSlideIndex = this._getNextVisibleSlide(this._currentIndex);
        if (nextSlideIndex >= this._getSlidesCount()) {
            this.drawEnd(size, this._getRepeatDuration()).then(function (blob) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    elem.src = e.target.result;
                };
                reader.readAsDataURL(blob);
            });
            return;
        }
        var preview = this._previews[nextSlideIndex];
        if (!preview) {
            elem.src = document.querySelector('meta[name="previewImg"]').content;
        }
        else {
            elem.src = preview;
        }
        if (!preview || rect.width !== size.width || rect.height !== size.height) {
            this._map.getPreview(2000, nextSlideIndex, size.width, size.height, {
                autoUpdate: false,
                slideshow: true,
            });
            elem.style.width = size.width + 'px';
            elem.style.height = size.height + 'px';
        }
    };
    PresenterConsole.prototype.drawEnd = function (size, repeat) {
        var width = size.width;
        var height = size.height;
        var offscreen = new OffscreenCanvas(width, height);
        var ctx = offscreen.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'white';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (repeat > 0) {
            ctx.fillText(_('Repeat in {0} seconds').replace('{0}', repeat), width / 2, height / 2);
        }
        else {
            ctx.fillText(_('Click to exit presentation...'), width / 2, height / 2);
        }
        return offscreen.convertToBlob({ type: 'image/png' });
    };
    PresenterConsole.prototype._onNextFrame = function (e) {
        var bitmap = e.frame;
        if (!bitmap) {
            return;
        }
        // We need to resize the frame to the current slide canvas size explicitly.
        // In fact, in Firefox transferFromImageBitmap does not resize it
        // automatically to the set canvas size as it occurs in Chrome.
        // According to Firefox version we can have 2 different behavior:
        // on older versions (like 115) the frame is cropped wrt. the canvas size
        // on newer versions (like 121) the canvas is automatically resized to
        // frame size, the latter case can lead to worse performance.
        createImageBitmap(bitmap, {
            resizeWidth: this._currentSlideCanvas.width,
            resizeHeight: this._currentSlideCanvas.height,
        }).then(function (image) {
            if (this._proxyPresenter) {
                this._proxyPresenter.requestAnimationFrame(function (context, image) {
                    context.transferFromImageBitmap(image);
                }.bind(null, this._currentSlideContext, image));
            }
        }.bind(this));
    };
    PresenterConsole.prototype._onTilePreview = function (e) {
        if (!this._proxyPresenter) {
            return;
        }
        if (this._currentIndex === undefined) {
            return;
        }
        if (e.id !== '2000') {
            return;
        }
        var nextSlideIndex = this._getNextVisibleSlide(this._currentIndex);
        if (nextSlideIndex === e.part) {
            var next = this._proxyPresenter.document.querySelector('#next-presentation');
            if (next) {
                next.src = e.tile.src;
            }
        }
        this._previews[e.part] = e.tile.src;
        this._lastIndex = e.part;
        var img = this._slides.querySelector("#preview-slide-" + e.part);
        if (img) {
            img.src = e.tile.src;
            img.width = e.width;
            img.height = e.height;
        }
    };
    PresenterConsole.prototype._computeCanvas = function (canvas) {
        var rect = canvas.getBoundingClientRect();
        var size = this._presenter._slideCompositor.computeLayerResolution(rect.width, rect.height);
        size = this._presenter._slideCompositor.computeLayerSize(size[0], size[1]);
        canvas.width = size[0];
        canvas.height = size[1];
    };
    return PresenterConsole;
}());
SlideShow.PresenterConsole = PresenterConsole;
//# sourceMappingURL=PresenterConsole.js.map