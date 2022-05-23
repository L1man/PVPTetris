const tetrisManager = new TetrisManager(document);
const tetrisLocal = tetrisManager.createPlayer();
tetrisLocal.element.classList.add('local');
tetrisLocal.run();

const connectionManager = new ConnectionManager(tetrisManager);
connectionManager.connect('ws://' + window.location.hostname + ':9000');

const keyListener = (event) => {
    [
        [37, 39, 90, 38, 40, 32, 80, 67, 13], [65, 68, 69, 87, 83, 16, 80, 81, 13]       //left0, right1, counter clockwise rotation2, clockwise rotation3, softdrop4, harddrop5, pause6, hold7, enter chat8
        ].forEach((key, index) => {
        const player = tetrisLocal.player;
        const chat = tetrisLocal.chat

        if (event.type === 'keydown') {
            if (event.keyCode === key[0] && player.moving === false) {
                player.moving = true;
                player.move(-1);
            } else if (event.keyCode === key[1] && player.moving2 === false) {
                player.moving2 = true;
                player.move(1);
            } else if (event.keyCode === key[2] && player.rotate1 === false) {
                player.rotate1 = true
                player.rotate(-1);
            } else if (event.keyCode === key[3] && player.rotate2 === false) {
                player.rotate2 = true
                player.rotate(1);
            } else if (event.keyCode === key[6] && player.pause === false) {
                player.pause = true
                player.pause1 =! player.pause1
            } else if (event.keyCode === key[7] && player.hold === false) {
                player.hold = true;
                player.holdPiece();
            } else if (event.keyCode === key[8] && chat.enterDown === false) {
                chat.enterDown = true;
                chat.focused = !chat.focused;

                if (chat.focused) {
                    chat.message.focus();
                }
                
                if (!chat.focused) {
                    chat.sendMessage();
                    chat.message.blur();
                }
            }
        }
        
        if (event.type === 'keyup') {
            if (event.keyCode === key[0]) {
                player.moving = false
                player.repeating = false
            }
            if (event.keyCode === key[1]) {
                player.moving2 = false
                player.repeating2 = false;
            }
            if (event.keyCode === key[2]) {
                player.rotate1 = false
            }
            if (event.keyCode === key[3]) {
                player.rotate2 = false
            }
            if (event.keyCode === key[4]) {

            }
            if (event.keyCode === key[5]) {
                player.hard_drop = false
            }            
            if (event.keyCode === key[6]) {
                player.pause = false
            }
            if (event.keyCode === key[7]) {
                player.hold = false
            }
            if (event.keyCode === key[8]) {
                chat.enterDown = false;
            }
        }
        
        if (event.keyCode === key[4]) {
            if (event.type === 'keydown') {
                if (player.dropInterval !== player.DROP_FAST) {
                    player.drop();
                    player.dropInterval = player.DROP_FAST;
                }
            } else {
                player.dropInterval = player.DROP_SLOW;
            }
        }
        
        if (event.keyCode === key[5] && player.hard_drop == false) {
            if (event.type === 'keydown') {
                player.hardDrop();
                player.hard_drop = true;
            }
        }

        //Launch items (test, only to yourself)
        if (event.type === 'keydown') {
            if (event.keyCode === 48 ) {
                player.clearArena();
            }
        }        

        //Launch items

        if (event.type === 'keydown') {
            if (event.keyCode === 49 ) {
                player.sendItem(connectionManager.myId, connectionManager.myId)
            }
        }
        if (event.type === 'keydown') {
            if (event.keyCode === 50 ) {
                player.sendItem(connectionManager.myId, Array.from(connectionManager.peers.keys())[0])
            }
        }
        if (event.type === 'keydown') {
            if (event.keyCode === 51 ) {
                player.sendItem(connectionManager.myId, Array.from(connectionManager.peers.keys())[1])
            }
        }
        if (event.type === 'keydown') {
            if (event.keyCode === 52 ) {
                player.sendItem(connectionManager.myId, Array.from(connectionManager.peers.keys())[2])
            }
        }
        if (event.type === 'keydown') {
            if (event.keyCode === 53 ) {
                player.sendItem(connectionManager.myId, Array.from(connectionManager.peers.keys())[3])
            }
        }
        if (event.type === 'keydown') {
            if (event.keyCode === 54 ) {
                player.sendItem(connectionManager.myId, Array.from(connectionManager.peers.keys())[4])
            }
        }
    });
};

document.addEventListener('keydown', keyListener);
document.addEventListener('keyup', keyListener);