const Botkit = require('botkit');
const debug  = require('debug')('pubnubBot');

function PubNubBot(configuration) {
    let pubnub_botkit = Botkit.core(configuration || {});
    // let spawned_bots = [];

    pubnub_botkit.middleware.spawn.use((bot, next) => {
        bot.listenForNewConversations();
        next();
    });

    pubnub_botkit.defineBot(function(botkit, config) {
        let bot = {
            type: 'pubnub',
            botkit: botkit,
            config: config || {}
        };

        bot.startConversation = function(message, cb) {
            botkit.startConversation(this, message, cb);
        };

        bot.send = function(message, cb) {
            pubnub_botkit.config.pubnub.publish({
                channel: message.channel,
                message: message.text
            });
        };

        bot.reply = function(src, resp, cb) {
            let msg = {};

            if (typeof(resp) === 'string') {
                msg.text = resp;
            } else {
                msg = resp;
            }

            msg.channel = src.channel;

            bot.say(msg, cb);
        };

        bot.findConversation = function(message, cb) {
            debug('Looking for conversation');
            for (let t = 0; t < botkit.tasks.length; t++) {
                for (let c = 0; c < botkit.tasks[t].convos.length; c++) {
                    if (
                        botkit.tasks[t].convos[c].isActive() &&
                        botkit.tasks[t].convos[c].source_message.user === message.user
                    ) {
                        debug('Found existing conversation');
                        cb(botkit.tasks[t].convos[c]);
                        return;
                    }
                }
            }

            cb();
        };

        bot.listenForNewConversations = function() {
            pubnub_botkit.config.pubnub.addListener({
                message: (envelope) => {
                    // Opening new conversations
                    if(envelope.channel === 'new-conversations'){
                        debug('Received new-conversation message');
                        bot.listenToChannel(envelope.message.channel);
                    }
                }
            });

            pubnub_botkit.config.pubnub.subscribe({ channels: ['new-conversations'] });

            pubnub_botkit.startTicking();
        };

        bot.listenToChannel = function(channel) {
            debug(`Starting talking on "${channel}".`);

            pubnub_botkit.config.pubnub.addListener({
                message: (envelope) => {
                    if(envelope.channel === channel && envelope.publisher !== pubnub_botkit.config.pubnub.getUUID()) {
                        debug('Received message');
                        const message = {
                            text: envelope.message,
                            user: envelope.publisher,
                            channel: envelope.channel,
                            timestamp: envelope.timetoken
                        };

                        pubnub_botkit.receiveMessage(bot, message);
                    }
                }
            });

            pubnub_botkit.config.pubnub.subscribe({ channels: [channel] });
        };

        return bot;
    });

    return pubnub_botkit;
}

module.exports = PubNubBot;