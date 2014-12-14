import now from 'util/now';

export var rAF = (function() {
    var startTime = now();
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           function(callback) {
               return window.setTimeout(
                   function() {
                       callback(now() - startTime);
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
