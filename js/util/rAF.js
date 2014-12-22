export var rAF = (function() {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame;
})();

export default rAF;

export var cancelRAF = (function() {
    return window.cancelAnimationFrame ||
           window.cancelRequestAnimationFrame ||
           window.webkitCancelRequestAnimationFrame ||
           window.mozCancelRequestAnimationFrame;
})();
