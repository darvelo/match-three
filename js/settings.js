export default {
    rows: 8,
    cols: 8,
    baseScore: 100,
    numJewelTypes: 7,
    baseLevelTimer: 60000,

    controls: {
        KEY_UP: 'moveUp',
        KEY_LEFT: 'moveLeft',
        KEY_DOWN: 'moveDown',
        KEY_RIGHT: 'moveRight',
        KEY_ENTER: 'selectJewel',
        KEY_SPACE: 'selectJewel',
        CLICK: 'selectJewel',
        TOUCH: 'selectJewel',
    },
};
