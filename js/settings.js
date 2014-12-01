import { $ } from 'util/dom';

export default {
    rows: 8,
    cols: 8,
    baseScore: 100,
    numJewelTypes: 7,
    // element changes size based on screen size
    jewelSize: $('jewel-proto').getBoundingClientRect().width
};
