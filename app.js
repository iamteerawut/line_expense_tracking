require("dotenv").config();
const line = require("@line/bot-sdk");
const express = require("express");

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.TOKEN,
  channelSecret: process.env.SECRET
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (
    event.type !== "message" ||
    event.message.type !== "text" ||
    event.replyToken === "00000000000000000000000000000000" ||
    event.replyToken === "ffffffffffffffffffffffffffffffff"
  ) {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  const echo = messageHandler(event.message.text);

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// create flex bubble
function createBubble(amount, category) {
  const date = new Date().toJSON().split("T")[0];
  const data = {
    type: "flex",
    altText: `฿${amount} used by ${category}`,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "TRACK EXPENSE",
            weight: "bold",
            color: "#1DB446",
            size: "lg"
          },
          {
            type: "text",
            text: `฿${amount}`,
            weight: "bold",
            size: "xxl",
            margin: "md"
          },
          {
            type: "text",
            text: `${category}`,
            size: "md",
            color: "#aaaaaa",
            wrap: true
          },
          {
            type: "separator",
            margin: "sm"
          },
          {
            type: "box",
            layout: "horizontal",
            margin: "md",
            contents: [
              {
                type: "text",
                text: `${date}`,
                color: "#aaaaaa",
                size: "xs",
                align: "end"
              }
            ]
          }
        ]
      }
    }
  };
  return data;
}

// message handler
function messageHandler(message) {
  let match;
  if ((match = message.match(/^([\d.]+)([tfghmol])$/i))) {
    const m = match;
    const enteredAmount = +m[1];
    const amount = enteredAmount.toFixed(2);
    const category = {
      t: "Transportation",
      f: "Food",
      g: "Game",
      h: "Health",
      m: "Miscellaneous",
      o: "Occasion",
      l: "Lodging"
    }[m[2].toLowerCase()];
    return createBubble(amount, category);
  }
}

// listen on port
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
