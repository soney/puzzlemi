var $builtinmodule = function (name) {
    var elementClass;
    var mod = {};

    mod.doFNCall = new Sk.builtin.func(function (fnName) {
        const restArgs = Array.prototype.slice.call(arguments, 1);
        window[Sk.ffi.remapToJs(fnName)].apply(window, restArgs);
        return Sk.builtin.none.none$;
    });

    return mod;
}