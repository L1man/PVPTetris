class Tetris
{
    constructor(element)
    {
        this.element = element;
        this.canvas = element.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
        this.context.scale(20, 20);

        this.arena = new Arena(10, 20);
        this.player = new Player(this);
        this.chat = new Chat;

        this.player.events.listen('score', score => {
            this.updateScore(score);
        });

        this.blocks = [
            null,
            document.getElementById('pink_square'),
            document.getElementById('yellow_square'),
            document.getElementById('orange_square'),
            document.getElementById('blue_square'),
            document.getElementById('cyan_square'),
            document.getElementById('green_square'),
            document.getElementById('red_square'),
        ];

        this.gblocks = [
            null,
            document.getElementById('gpink_square'),
            document.getElementById('gyellow_square'),
            document.getElementById('gorange_square'),
            document.getElementById('gblue_square'),
            document.getElementById('gcyan_square'),
            document.getElementById('ggreen_square'),
            document.getElementById('gred_square'),            
        ]

        let lastTime = 0;

        this._update = (time = 0) => {
            if (!this.player.fail && this.player.pause1) {

                const deltaTime = time - lastTime;
                lastTime = time;
    
                this.player.update(deltaTime);
    
                this.draw();
                this.drawGrid();
            }
            
            if (!this.player.pause1) {
                document.getElementById('pause', 'Exit_button').style.visibility = 'visible';
            }

            if (this.player.pause1) {
                document.getElementById('pause', 'Exit_button').style.visibility = 'hidden';
            }
            if (!this.player.pause1) {
                document.getElementById('Exit_button').style.visibility = 'visible';
            }

            if (this.player.pause1) {
                document.getElementById('Exit_button').style.visibility = 'hidden';
            }
            if (!this.player.pause1) {
                document.getElementById('soundplus_button').style.visibility = 'visible';
            }

            if (this.player.pause1) {
                document.getElementById('soundplus_button').style.visibility = 'hidden';
            }
            if (!this.player.pause1) {
                document.getElementById('soundneg_button').style.visibility = 'visible';
            }

            if (this.player.pause1) {
                document.getElementById('soundneg_button').style.visibility = 'hidden';
            }
            if (!this.player.pause1) {
                document.getElementById('rest_soundneg_button').style.visibility = 'visible';
            }

            if (this.player.pause1) {
                document.getElementById('rest_soundneg_button').style.visibility = 'hidden';
            }
            if (!this.player.pause1) {
                document.getElementById('rest_soundplus_button').style.visibility = 'visible';
            }

            if (this.player.pause1) {
                document.getElementById('rest_soundplus_button').style.visibility = 'hidden';
            }

            requestAnimationFrame(this._update);
        };
 
        this.updateScore(0);
    }

    draw()
    {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawMatrix(this.arena.matrix, {x: 5, y: 0});
        this.drawGhost(this.player.matrix, {x: this.player.ghostPos.x + 5, y: this.player.ghostPos.y});
        this.drawMatrix(this.player.matrix, {x: this.player.pos.x + 5, y: this.player.pos.y});
        this.drawMatrix(this.player.next_matrix, {x: 16, y: 1});
        this.drawMatrix(this.player.holdMatrix, {x: 1, y: 1});        

    }

    drawGrid()
    {
        for (var i = 5; i <= 15; i++) {
            for (var j = 0; j <= 20; j++) {
                

                this.context.strokeStyle = "#505050";
                this.context.lineWidth = 0.001;
                //Vertical lines
                this.context.beginPath();
                this.context.moveTo(i, 0);
                this.context.lineTo(i, 20);
                this.context.stroke();

                //Horizontal lines
                this.context.beginPath();
                this.context.moveTo(5, j);
                this.context.lineTo(15, j)
                this.context.stroke();

                this.context.lineWidth = 0.1
                this.context.strokeStyle = "#FFFFFF"
                //Frame
                this.context.beginPath();
                this.context.moveTo(5, 0);
                this.context.lineTo(5, 20);
                this.context.lineTo(15, 20);
                this.context.lineTo(15, 0);
                this.context.lineTo(5, 0);
                this.context.stroke();

            }
        }
    }

    drawMatrix(matrix, offset)
    {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.context.drawImage(this.blocks[value], x + offset.x,
                                     y + offset.y,
                                     1, 1);
                }
            });
        });
    }

    drawGhost(matrix, offset)
    {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.context.drawImage(this.gblocks[value], x + offset.x,
                                     y + offset.y,
                                     1, 1);
                }
            });
        });
    }

    run()
    {
        this._update();
    }

    serialize()
    {
        return {
            arena: {
                matrix: this.arena.matrix,
            },
            player: {
                matrix: this.player.matrix,
                next_matrix: this.player.next_matrix,
                ghostPos: this.player.ghostPos,
                holdMatrix: this.player.holdMatrix,
                pos: this.player.pos,
                score: this.player.score,
            },
        };
    }

    unserialize(state)
    {
        this.arena = Object.assign(state.arena);
        this.player = Object.assign(state.player);
        this.updateScore(this.player.score);
        this.draw();
    }

    updateScore(score)
    {
        this.element.querySelector('.score').innerText = score;
    }
}