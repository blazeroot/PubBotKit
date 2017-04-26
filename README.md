```
❯ DEBUG=*,-superagent node bot.js
```

Publish to `new-conversations` message `{"channel": "calculated-conversation"}`.
Use this link to open console: https://www.pubnub.com/docs/console?channel=new-conversations&origin=pubsub.pubnub.com&sub=demo&pub=demo

Use this link to open console to chat: https://www.pubnub.com/docs/console?channel=calculated-conversation&origin=pubsub.pubnub.com&sub=demo&pub=demo

Publish message: `"Hi"`. The bot should respond with `"Hello."`.

When you publish message `"who am i"` the bot will respond with `"I do not know your name yet!"`, but after this it hangs.