// shim for browsers without Navigation API
export var now = (function () {
    var perf = window.performance;

    if (perf && perf.now) {
        return perf.now.bind(perf);
    }

    return Date.now;
})();

export default now;
