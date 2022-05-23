class Player
{
    constructor(tetris)
    {

        //Values that might be modified
        
        this.DROP_SLOW = 1000;
        this.DROP_FAST = 25;
        this.timeBeforeAutoShift = 80;
        this.timeBetweenAutoShifts = 40;
        this.timeBeforeMergeAfterCollide = 500;
        this.dropInterval = this.DROP_SLOW;

        //If something is happening or not       
        this.fail = false;
        this.pause1 = true;
        
        this.rotate1 = false;
        this.rotate2 = false;
        this.hard_drop = false;
        this.pause = false;
        this.hold = false;
        this.moving = false;
        this.moving2 = false;
        this.repeating = false;
        this.repeating2 = false;
        this.mergeTimeouting = false;
        
        //Timeouts and intervals
        this.repeatTimeout = null;
        this.repeatInterval = null;
        this.repeatTimeout2 = null;
        this.repeatInterval2 = null;
        this.mergeTimeout = null;
        this.forceMergeTimeout = null;
        this.forceMergeing = false;
        this.mergeOnNextCollide = false;

        //Something

        this.events = new Events;

        this.tetris = tetris;
        this.arena = tetris.arena;

        this.dropCounter = 0;

        this.pos = {x: 0, y: 0};
        this.ghostPos = {x: 0, y: 0};
        this.matrix = null;
        this.next_matrix = null;
        this.holdMatrix = [];
        this.score = 0;
        
        this.bag = ['I', 'L', 'J', 'O', 'T', 'S', 'Z'];
        this.shuffleArray(this.bag)

        this.heldPiece = null
        this.heldCooldown = false;
        this.currentPiece

        //items

        this.reset();
    }

    createPiece(type) {
        if (type === 'T') {
            return [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0],
            ];
        } else if (type === 'O') {
            return [
                [2, 2],
                [2, 2],
            ];
        } else if (type === 'L') {
            return [
                [0, 0, 3],
                [3, 3, 3],
                [0, 0, 0],
            ];
        } else if (type === 'J') {
            return [
                [4, 0, 0],
                [4, 4, 4],
                [0, 0, 0],
            ];
        } else if (type === 'I') {
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        } else if (type === 'S') {
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        } else if (type === 'Z') {
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
        }
    }

//When blocks collide
    drop()
    {
        if (!this.fail && this.pause1) {
            this.pos.y++;
            this.dropCounter = 0;
            if (this.arena.collide(this)) {
                this.pos.y--;

                if(!this.mergeTimeouting) {
                    this.mergeTimeouting = true;
                    this.mergeTimeout = setTimeout(() => {
                        clearTimeout(this.forceMergeTimeout)
                        this.arena.merge(this);
                        this.reset();
                        this.score += this.arena.sweep();
                        this.events.emit('score', this.score);
                    }, this.timeBeforeMergeAfterCollide)
                }

                if(!this.forceMergeing) {
                    this.forceMergeing = true;
                    this.forceMergeTimeout = setTimeout(() => {
                        this.mergeOnNextCollide = true;
                    }, 1000)
                }

                if(this.mergeOnNextCollide) {
                    this.arena.merge(this);
                    this.reset();
                    this.score += this.arena.sweep();
                    this.events.emit('score', this.score);
                }

                return;
            }
            this.updateGhost();
            this.events.emit('pos', this.pos);
            this.events.emit('ghostPos', this.ghostPos);
        }
    }

    move(dir)
    {
        if (!this.fail && this.pause1) {
            this.pos.x += dir;
            if (this.arena.collide(this)) {
                this.pos.x -= dir;
                return;
            }

            this.updateGhost();
            this.events.emit('pos', this.pos);
            this.events.emit('ghostPos', this.ghostPos);
        }
    }
    
    holdPiece()
    {
        if (!this.fail && this.pause1 && !this.heldCooldown) {
            if(this.heldPiece !== null) {
                this.bag.unshift(this.heldPiece)
            }
            this.heldPiece = this.currentPiece
            this.holdMatrix = this.createPiece(this.currentPiece)
            this.reset();
            this.heldCooldown = true;
        }
        this.events.emit('holdMatrix', this.holdMatrix);
    }
    
    hardDrop() 
    {
        if (!this.fail && this.pause1) {
            while (!this.arena.collide(this)) {
                this.pos.y++;
            }
    
            if (this.arena.collide(this)) {
                this.pos.y--;
                this.arena.merge(this);
                this.reset();
                this.score += this.arena.sweep();
                this.events.emit('score', this.score);
            }
        }
    }

//When game over and create new block
    reset()
    {
        this.mergeTimeouting = false;
        this.forceMergeing = false;
        this.mergeOnNextCollide = false;
        clearTimeout(this.mergeTimeout);
        clearTimeout(this.forceMergeTimeout);

        if (this.bag.length < 2) {
            this.next_bag = ['I', 'L', 'J', 'O', 'T', 'S', 'Z'];
            this.shuffleArray(this.next_bag);
            this.bag = [...this.bag, ...this.next_bag];
        }

        this.matrix = this.createPiece(this.bag[0]);
        this.next_matrix = this.createPiece(this.bag[1]);
        this.currentPiece = this.bag[0];

        this.bag.shift();
        
        this.pos.y = 0;
        this.pos.x = (this.arena.matrix[0].length / 2 | 0) -
        (this.matrix[0].length / 2 | 0);

        this.heldCooldown = false;

        if (this.arena.collide(this)) {
            this.fail =! this.fail;
            this.events.emit('score', this.score);
            if (this.fail) {
                document.getElementById("game_over").style.visibility = "visible";
            }
        }
        this.updateGhost();
        this.events.emit('pos', this.pos);
        this.events.emit('ghostPos', this.ghostPos);
        this.events.emit('matrix', this.matrix);
        this.events.emit('next_matrix', this.next_matrix);
        this.events.emit('holdMatrix', this.holdMatrix);
    }

    rotate(dir)
    {
        if (!this.fail && this.pause1) {
            const pos = this.pos.x;
            let offset = 1;
            this._rotateMatrix(this.matrix, dir);
            while (this.arena.collide(this)) {
                this.pos.x += offset;
                offset = -(offset + (offset > 0 ? 1 : -1));
                if (offset > this.matrix[0].length) {
                    this._rotateMatrix(this.matrix, -dir);
                    this.pos.x = pos;
                    return;
                }
            }
            this.updateGhost();
            this.events.emit('pos', this.pos);
            this.events.emit('ghostPos', this.ghostPos);
            this.events.emit('matrix', this.matrix);
        }
    }

    _rotateMatrix(matrix, dir)
    {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x],
                ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
            }
        }

        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    getGhostPosY()
    {
        while (!this.arena.ghostCollide(this)) {
            this.ghostPos.y++
        }
        this.ghostPos.y--
    }

    shuffleArray(array) {      //Fisher Yates algorithm
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }

        return array;
    }

    updateGhost() {
        this.ghostMatrix = this.matrix
        this.ghostPos.x = this.pos.x
        this.getGhostPosY()  
    }

    update(deltaTime)
    {
        if (!this.fail && this.pause1) {

            if (this.score >= 100) {
                this.dropCounter += 40
            }
            if (this.score >= 200) {
                this.dropCounter += 40
            }
            if (this.score >= 300) {
                this.dropCounter += 40
            }
            if (this.score >= 400) {
                this.dropCounter += 40
            }

            this.dropCounter += deltaTime;
            if (this.dropCounter > this.dropInterval) {
                this.drop();
            }
    
            this.ghostMatrix = this.matrix
            this.ghostPos.x = this.pos.x
            this.getGhostPosY()

            //Repeat move

            if (this.moving && !this.repeating) {
                this.repeating = true;
                this.repeatTimeout = setTimeout(() => {
                    this.repeatInterval = setInterval(() => {
                        this.move(-1)
                    }, this.timeBetweenAutoShifts);
                }, this.timeBeforeAutoShift);
            }

            if (!this.moving) {
                clearTimeout(this.repeatTimeout);
                clearInterval(this.repeatInterval);
            }

            if (this.moving2 && !this.repeating2) {
                this.repeating2 = true;
                this.repeatTimeout2 = setTimeout(() => {
                    this.repeatInterval2 = setInterval(() => {
                        this.move(1)
                    }, this.timeBetweenAutoShifts);
                }, this.timeBeforeAutoShift);
            }

            if (!this.moving2) {
                clearTimeout(this.repeatTimeout2);
                clearInterval(this.repeatInterval2);
            }

            //Clear merge timeout when moving
            
            if (this.rotate1 || this.rotate2 || this.moving || this.moving2 || this.hard_drop || this.hold) {
                clearTimeout(this.mergeTimeout)
                this.mergeTimeouting = false;
            }
        }
    }

//Items
    clearArena() {
        this.arena.clear();
    }

    slowDrop() {
        this.dropInterval *= 2;
        setTimeout(() => {
            this.dropInterval /= 2;
        }, 10000)
    }

    fastDrop() {
        this.dropInterval /= 2;
        setTimeout(() => {
            this.dropInterval *= 2;
        }, 10000)
    }

//Send items to server
    sendItem(senderId, receiverId) {
        connectionManager.send({
            type: 'attack',
            senderId: senderId,
            receiverId: receiverId,
            item: "clear-arena",
        });
    }
}

myAudio = new Audio('audios/Tetris.mp3');
myAudio.volume = 0.2

if (typeof myAudio. loop == 'boolean') 
{
    myAudio. loop = true;
}
myAudio.play();
if (myAudio.volume <= 0.5){
//något fel här
}

function plusfunction() {
    myAudio.volume = myAudio.volume + 0.1
    console.log(myAudio.volume)
}

function negfunction() {
    myAudio.volume = myAudio.volume - 0.1
    console.log(myAudio.volume)
}