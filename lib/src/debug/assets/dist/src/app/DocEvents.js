// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
var DocEvents = /** @class */ (function () {
    function DocEvents() {
    }
    DocEvents.prototype.initiate = function () {
        this.container = document.getElementById(DocEvents.documentContainerId);
        if (!this.container)
            console.error('DocEvents initation failed.');
        // Resize event for a div element is not fired. We'll use a resize-observer for catching the event.
        new ResizeObserver(this.fire.bind(this, 'resize')).observe(this.container);
    };
    DocEvents.prototype.fire = function (eventType, details) {
        var newEvent = new CustomEvent(eventType, { detail: details });
        this.container.dispatchEvent(newEvent);
    };
    DocEvents.prototype.on = function (eventType, callback) {
        this.container.addEventListener(eventType, callback);
    };
    DocEvents.prototype.off = function (eventType, callback) {
        this.container.removeEventListener(eventType, callback);
    };
    DocEvents.documentContainerId = 'document-container';
    return DocEvents;
}());
app.definitions.events = DocEvents;
// Initiate
app.events = new DocEvents();
app.events.initiate();
//# sourceMappingURL=DocEvents.js.map