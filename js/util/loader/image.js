export default function loadImage (url, callback) {
    var image = new Image();

    image.addEventListener('load', function () {
        callback(this);
    });

    image.src = url;
}
