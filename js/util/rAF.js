export var rAF = (function() {
    var startTime = Date.now();
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           function(callback) {
               return window.setTimeout(
                   function() {
                       callback(Date.now() - startTime);
                   }, 1000 / 60
               );
           };
})();

export default rAF;

export var cancelRAF = (function() {
    return window.cancelRequestAnimationFrame ||
           window.webkitCancelRequestAnimationFrame ||
           window.mozCancelRequestAnimationFrame ||
           window.clearTimeout;
})();
