
// Import required Bot Framework classes.
const { ActivityHandler, CardFactory } = require('botbuilder');

// constant for the state of the user
const USER_CORREECT = 'Data_Correct';

class Bot extends ActivityHandler {
    constructor(userState) {
        super();
        // Creates a new user property accessor.
        this.Data_Correct = userState.createProperty(USER_CORREECT);

        this.userState = userState;
        var nombre, boletos;
        var itsCorrect = false;
        var edadState = true;
        // part 3
        this.onMessage(async (context, next) => {
            itsCorrect = await this.Data_Correct.get(context, false);

            if (itsCorrect === true && edadState === true) {
                // take the entry and decide what option the user choose
                const text = context.activity.text.toLowerCase();
                switch (text) {
                case '1':
                    await this.Data_Correct.set(context, false);
                    await context.sendActivity('Tell me your name.');
                    break;
                case '2':
                    await context.sendActivity(`Your name is:${ nombre } and you have reserved ${ boletos } tickets.`);
                    break;
                case '3':
                    await this.sendCard(context, nombre);
                    break;
                case '4':
                    await context.sendActivity('How many tickets, do you wanna buy?');
                    edadState = false;
                    break;
                default:
                    await context.sendActivity('Select a operation' +
                    '\x0A1. Modify my name' +
                    '\x0A2. Watch my information' +
                    '\x0A3. Movie showtimes' +
                    '\x0A4. Buy Tickets ');
                }
            }
            await next();
        });

        // part 2, check the name and if it's correct
        this.onMessage(async (context, next) => {
            const verificar = context.activity.text;
            // check if the user confirm his name
            if (verificar !== 'yes' && itsCorrect === false) {
                nombre = context.activity.text;
                await context.sendActivity(`Your name is: ${ nombre }, for continue typed "yes" `);
                await context.sendActivity('If your name its incorrect, typed again');
            } else if (itsCorrect === false) {
                await this.Data_Correct.set(context, true);
                await context.sendActivity(`Welcome: ${ nombre }`);
                await context.sendActivity('Select a operation' +
                '\x0A1. Modify my name' +
                '\x0A2. Watch my information' +
                '\x0A3. Movie showtimes' +
                '\x0A4. Buy Tickets ');
                edadState = true;
            }
            await next();
        });

        // part 4, for buy tickets
        this.onMessage(async (context, next) => {
            const verificarEdad = context.activity.text;
            if (verificarEdad !== 'ok' && edadState === false) {
                boletos = context.activity.text;
                await context.sendActivity(`You have: ${ boletos } reserved`);
                await context.sendActivity('If its correct, type "ok" and any key');
            } else {
                edadState = true;
                await next();
            }
            await next();
        });

        // part 1, its called when a new user connected to the bot.
        this.onMembersAdded(async (context, next) => {
            // Iterate over all new members added to the conversation
            for (const idx in context.activity.membersAdded) {
                // context.activity.membersAdded === context.activity.recipient.Id indicates the bot was added to the conversation, and the opposite indicates this is a user.
                if (context.activity.membersAdded[idx].id !== context.activity.recipient.id) {
                    await context.sendActivity('Welcome to Cinepolis! \x0A First, tell me your name: ');
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    // Override the ActivityHandler.run() method to save state changes after the bot logic completes.
    async run(context) {
        await super.run(context);

        // Save state changes
        await this.userState.saveChanges(context);
    }

    // the card, waiting and created hete
    async sendCard(context, nombre) {
        const card = CardFactory.adaptiveCard({
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            type: 'AdaptiveCard',
            version: '1.0',
            body: [
                {
                    type: 'TextBlock',
                    text: `Hello ${ nombre }, this are the popular movies today.`
                }
            ],
            actions: [
                {
                    type: 'Action.OpenUrl',
                    title: 'Ghostbuster',
                    url: 'https://cinepolis.com/pelicula/ghostbusters-el-legado'
                },
                {
                    type: 'Action.OpenUrl',
                    title: 'Encanto',
                    url: 'https://cinepolis.com/pelicula/encanto'
                },
                {
                    type: 'Action.OpenUrl',
                    title: 'Movie Showtimes',
                    url: 'https://cinepolis.com/cartelera/'
                }
            ]
        });
        await context.sendActivity({ attachments: [card] });
    }
}

module.exports.Bot = Bot;
