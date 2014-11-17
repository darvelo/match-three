import game from 'game';

var App = {
    start: function () {
        game.showScreen('splash-screen');
        console.log('App started!');
    },
    game: game
};

export default App;
