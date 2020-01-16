var $builtinmodule = function (name) {
    // var elementClass;
    var mod = {};

    mod.doFNCall = new Sk.builtin.func(function (fnName) {
        const restArgs = Array.prototype.slice.call(arguments, 1);
        window[Sk.ffi.remapToJs(fnName)].apply(window, restArgs);
        return Sk.builtin.none.none$;
    });

    mod.doFNCallReturnString = new Sk.builtin.func(function (fnName) {
        const restArgs = Array.prototype.slice.call(arguments, 1);
        return new Sk.builtin.str(window[Sk.ffi.remapToJs(fnName)].apply(window, restArgs));
    });

    return mod;
}