import { bind } from 'util/dom';

var extension, sounds, activeSounds;

function cleanActive () {
    for (let i = activeSounds.length-1; i >= 0; --i) {
        if (activeSounds[i].ended) {
            activeSounds.splice(i, 1);
        }
    }
}

function createAudio (name) {
    var el = new Audio('sounds/' + name + '.' + extension);
    bind(el, 'ended', cleanActive);

    sounds[name] = sounds[name] || [];
    sounds[name].push(el);
    return el;
}

function getAudioElement (name) {
    if (sounds[name]) {
        for (let sound of sounds[name]) {
            if (sound.ended) {
                return sound;
            }
        }
    }

    return createAudio(name);
}

function formatTest () {
    var audio = new Audio();
    var exts = [
        ['ogg', 'audio/ogg; codecs="vorbis"'],
        ['mp3', 'audio/mpeg']
    ];

    for (let [ ext, mime ] of exts) {
        if (audio.canPlayType(mime) === 'probably') {
            return ext;
        }
    }

    for (let [ ext, mime ] of exts) {
        if (audio.canPlayType(mime) === 'maybe') {
            return ext;
        }
    }
}

export function play (name) {
    var sound = getAudioElement(name);
    sound.play();
    activeSounds.push(sound);
}

export function stop () {
    for (let sound of activeSounds) {
        sound.pause();
    }

    activeSounds.length = 0;
}

export function initialize () {
    extension = formatTest();

    if (!extension) {
        return;
    }

    sounds = {};
    activeSounds = [];
}
