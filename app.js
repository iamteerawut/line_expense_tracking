const line = require("@line/bot-sdk");
const express = require("express");

// create LINE SDK config from env variables
const config = {
  channelAccessToken:
    "3UnjnmWz+x6LRsArfDj8Gzy6aBddcRIWPJIgtCMstQXdAnyqDDmbWfI7Qi4NJbUSUN8d490IIV+rwIUvjjE44U7RMnNQWGpOLnCLC2uP/h9KVah9fnch+NHERIK7y1/UE1xIaLTQRc/doP95W6ux5wdB04t89/1O/w1cDnyilFU=",
  channelSecret: "2f02b59173d521aeeb8169caaeb5e0d3"
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => {
      res.json(result);
    })
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
  const echo = {
    type: "flex",
    altText: "Test Flexbox",
    contents: {
      type: "bubble",
      styles: {
        header: {},
        body: {},
        footer: {}
      },
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "TRACK EXPENSE",
            size: "lg",
            weight: "bold",
            color: "#1DB446",
            align: "start"
          }
        ]
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "฿500",
            size: "xxl",
            weight: "bold",
            color: "#000000"
          },
          {
            type: "text",
            text: "Food & Beverage",
            size: "lg",
            weight: "bold",
            color: "#000000"
          },
          {
            type: "text",
            text: "2019.02.14 21:47 (GMT+0700)",
            size: "xs",
            color: "#B2B2B2"
          }
        ]
      },
      footer: {
        type: "box",
        layout: "horizontal",
        margin: "lg",
        contents: [
          {
            type: "text",
            text: "Total",
            size: "md",
            weight: "bold",
            color: "#0084B6",
            align: "start"
          },
          {
            type: "text",
            text: "฿500",
            color: "#000000",
            size: "md",
            weight: "bold",
            align: "end"
          }
        ]
      }
    }
  };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// function MessageHandler() {
//     if ((match = message.match(/^[\d.]+j?[tfghmol]$/i))) {
//         const m = match;
//         const amount = (+m[1] * (m[2])).toFixed(2);
//         const category = {
//             t: 'transportation',
//             f: 'food',
//             g: 'game',
//             h: 'health',
//             m: 'miscellaneous',
//             o: 'occasion',
//             l: 'lodging'
//         }[m[3].toLowerCase()];
//         const remarks = m[2];
//         return await recordExpense(context, amount, category, remarks);
//     }
// }

// listen on port
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
