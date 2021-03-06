import loadImage from 'util/loader/image';

import { fileWasLoaded, one } from 'util/loader/events';
export { one };

var numLoaded = 0;
var numLoading = 0;

function loaded (attach, resourceUrl, resource) {
    numLoaded++;

    if (attach && resourceUrl && resource) {
        attach[resourceUrl] = resource;
    }

    fileWasLoaded(resourceUrl);
}

export function load (resourceUrl, attach) {
    var isImage = /.+\.(jpg|png|gif)$/i.test(resourceUrl);

    numLoading++;

    if (isImage) {
        loadImage(resourceUrl, loaded.bind(null, attach, resourceUrl));
    }
}

export function getLoadProgress () {
    return (numLoading === 0) ? 0 : numLoaded / numLoading;
}
