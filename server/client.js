class Client
{
    constructor(conn, id)
    {
        this.conn = conn;
        this.id = id;
        this.session = null;

        this.state = {
            arena: {
                matrix: [],
            },
            player: {
                matrix: [],
                next_matrix: [],
                holdMatrix: [],
                pos: {x: 0, y: 0},
                ghostPosition: {x: 0, y: 0},
                score: 0,
            },

        };
    }

    //Send to everyone except yourself
    broadcast(data)
    {
        if (!this.session) {
            throw new Error('Can not broadcast without session');
        }

        data.clientId = this.id;

        [...this.session.clients]
            .filter(client => client !== this)
            .forEach(client => client.send(data));
    }

    //Send to only yourself
    send(data)
    {
        const msg = JSON.stringify(data);
        this.conn.send(msg, function ack(err) {
		if (err) {
			console.log('Error sending message', msg, err);
		}
	});
    }
}

module.exports = Client;