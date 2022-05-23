class Chat
{
    constructor() {

        this.events = new Events;
        
        this.message = document.getElementById('message')
        this.handle = document.getElementById('handle')
        this.btn = document.getElementById('btn')
        this.output = document.getElementById('output')

        this.enterDown = false;
        this.focused = false;

        this.handleValue = 'user';
        this.messageValue = '';

        //Button press
        this.btn.addEventListener('click', () => {
            this.sendMessage();
        });

    }
    
    sendMessage() {
        this.messageValue = this.message.value
        if (this.message.value != '') {
            this.messageValue = this.message.value
            this.events.emit('message', this.handleValue, this.messageValue);
        } else {
            console.log('message field is empty')
        }
        this.message.blur();
        this.focused = false;
        this.message.value = '';
    }
}
