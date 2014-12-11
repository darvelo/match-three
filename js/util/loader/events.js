import is from 'util/is';

var registry = {};

function getRegister (name) {
    return registry[name];
}

function getOrCreateRegister (name) {
    return registry[name] || (registry[name] = {
        loaded: false,
        objects: [],
    });
}

export function one (name, callback, context = null) {
    var register = getOrCreateRegister(name);
    var objects = register.objects;
    var i = 0;

    if (register.loaded) {
        setTimeout(callback.bind(context));
        return;
    }

    for (i = 0; i < objects.length; ++i) {
        if (objects[i].type === 'one' && objects[i].callback === callback) {
            return;
        }
    }

    objects.push({
        type: 'one',
        callback: callback,
        wrapper: callback.bind(context),
    });
}

function fireCallbacks (register) {
    register = is(register, 'Object') ? register : getOrCreateRegister(register);
    register.loaded = true;

    var i = 0;
    var objects = register.objects;
    var cbObj;

    while (i < objects.length) {
        cbObj = objects[i];

        cbObj.wrapper();

        // removing callbacks changes the register's length.
        // increment i only if the length hasn't decreased by 1 due to splice
        if (cbObj.type === 'one') {
            objects.splice(i, 1);
        } else {
            i++;
        }
    }
}

export function fileWasLoaded (filename) {
    var register = getRegister(filename);

    if (register) {
        fireCallbacks(register);
    }
}
