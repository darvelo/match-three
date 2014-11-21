export var $ = document.getElementById.bind(document);
export var $$ = document.querySelectorAll.bind(document);
export function bind (element, event, handler) {
    var elStr = element;

    if (typeof element === 'string') {
        element = $$(element)[0];
    }

    if (!element) {
        throw new Error('Could not addEventListener: element "' + elStr + '" did not exist!');
    }

    element.addEventListener(event, handler, false);
}
