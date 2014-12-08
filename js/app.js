import board from 'board';
import game from 'game';
import is from 'util/is';

var App = {
    board,
    game,

    util: {
        is,
    },

    start() {
        this.game.setup();
        this.game.showScreen('splash-screen');
        console.log('App started!');
    },
};

export default App;
