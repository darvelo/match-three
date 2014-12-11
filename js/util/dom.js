export function $ (id) {
    if (id[0] === '#') {
        id = id.slice(1);
    }

    return document.getElementById(id);
}

export function $$ (selector, ctx = document) {
    return ctx.querySelectorAll(selector);
}

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
