function transform (element, value) {
    var style = element.style;

    if ('transform' in style) {
        style.transform = value;
    } else if ('webkitTransform' in style) {
        style.webkitTransform = value;
    } else if ('mozTransform' in style) {
        style.mozTransform = value;
    } else if ('msTransform' in style) {
        style.msTransform = value;
    }
}

export default transform;
