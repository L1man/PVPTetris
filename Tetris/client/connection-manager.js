class ConnectionManager
{
    constructor(tetrisManager)
    {
        this.conn = null;
        this.peers = new Map;
        this.chat = new Chat;

        this.tetrisManager = tetrisManager;
        this.localTetris = this.tetrisManager.instances[0];

        this.message = document.getElementById('message')
        this.handle = document.getElementById('handle')
        this.btn = document.getElementById('btn')
        this.output = document.getElementById('output')
        this.playerId = document.querySelector('.playerId')
        this.myId = '';
    }

    connect(address)
    {
        this.conn = new WebSocket(address);

        this.conn.addEventListener('open', () => {
            console.log('Connection established');
            this.initSession();
            this.watchEvents();
        });

        this.conn.addEventListener('message', event => {
            this.receive(event.data);
        });
    }

    initSession()
    {
        const sessionId = window.location.hash.split('#')[1];
        const state = this.localTetris.serialize();
        if (sessionId) {
            this.send({
                type: 'join-session',
                id: sessionId,
                state,
            });
        } else {
            this.send({
                type: 'create-session',
                state,
            });
        }
    }

    watchEvents()
    {
        const local = this.tetrisManager.instances[0];

        const player = local.player;
        ['pos', 'ghostPos','matrix', 'next_matrix', 'holdMatrix', 'score',].forEach(key => {
            player.events.listen(key, () => {
                this.send({
                    type: 'state-update',
                    fragment: 'player',
                    state: [key, player[key]],
                });
            });
        });

        const arena = local.arena;
        ['matrix'].forEach(key => {
            arena.events.listen(key, () => {
                this.send({
                    type: 'state-update',
                    fragment: 'arena',
                    state: [key, arena[key]],
                });
            });
        });
    
        const chat = local.chat;
        chat.events.listen('message', () => {
            this.send({
                type: 'chat-update',
                handleValue: chat.handleValue,
                messageValue: chat.messageValue
            })
        })
    }

    updateManager(peers)
    {
        const me = peers.you;
        this.myId = me;
        const clients = peers.clients.filter(client => me !== client.id);
        clients.forEach(client => {
            if (!this.peers.has(client.id)) {
                const tetris = this.tetrisManager.createPlayer();
                tetris.unserialize(client.state);
                this.peers.set(client.id, tetris);
            }
        });
        
        [...this.peers.entries()].forEach(([id, tetris]) => {
            if (!clients.some(client => client.id === id)) {
                this.tetrisManager.removePlayer(tetris);
                this.peers.delete(id);
            }
        });
        
        const local = this.tetrisManager.instances[0];
        const sorted = peers.clients.map(client => this.peers.get(client.id) || local);
        this.tetrisManager.sortPlayers(sorted);

        this.playerId.innerHTML = me;
    }

    updatePeer(id, fragment, [key, value])
    {
        if (!this.peers.has(id)) {
            throw new Error('Client does not exist', id);
        }

        const tetris = this.peers.get(id);
        tetris[fragment][key] = value;

        if (key === 'score') {
            tetris.updateScore(value);
        } else {
            tetris.draw();
            tetris.drawGrid();
        }
    }

    performAttack(senderId, receiverId, item) {
        
        const tetris = this.peers.get(receiverId) || this.localTetris;

        if (receiverId == this.myId) {
            console.log('I got attacked by ' + senderId + ' with ' + item);

            //Clear arena
            if (item === 'clear-arena') {
                tetris.player.clearArena();
            }
        }

    }

    receive(msg)
    {
        const data = JSON.parse(msg);
        if (data.type === 'session-created') {
            window.location.hash = data.id;
        }
        
        if (data.type === 'session-broadcast') {
            this.updateManager(data.peers);
        }

        if (data.type === 'state-update') {
            this.updatePeer(data.clientId, data.fragment, data.state);
        }

        if (data.type === 'chat-update') {
            this.chat.output.innerHTML += '<p><strong>' + data.handleValue + ': </strong>' + data.messageValue + '</p>';
        }

        if (data.type === 'attack') {
            this.performAttack(data.senderId, data.receiverId, data.item)
        }
    }

    send(data)
    {
        const msg = JSON.stringify(data);
        this.conn.send(msg);
    }
}