const line = require("@line/bot-sdk");
const express = require("express");
const Airtable = require("airtable");

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.LINE_TOKEN,
  channelSecret: process.env.LINE_SECRET
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
async function handleEvent(event) {
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
  const echo = await messageHandler(event.message.text);

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

async function recordExpense(amount, category) {
  const date = new Date().toJSON().split("T")[0];
  const table = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN })
    .base("appLhxBgLIBdcxn2z")
    .table("Uc68ae504e2766ba1fdee724be2c875d4");
  const record = await table.create(
    {
      Date: date,
      Category: category,
      Amount: amount
    },
    { typecast: true }
  );
  const data = {
    type: "flex",
    altText: `฿${amount} used for ${category}`,
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
            size: "sm"
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
            size: "xs",
            color: "#aaaaaa",
            wrap: true
          },
          {
            type: "separator",
            margin: "md"
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
      },
      styles: {
        footer: {
          separator: true
        }
      }
    }
  };
  return data;
}

async function getExepense(message) {
  const date = new Date().toJSON().split("T")[0];
  const table = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN })
    .base("appLhxBgLIBdcxn2z")
    .table("Uc68ae504e2766ba1fdee724be2c875d4");
  const tableData = await table.select().all();
  const total = records =>
    records.map(r => +r.get("Amount") || 0).reduce((a, b) => a + b, 0);
  const firstDate = tableData
    .map(r => r.get("Date"))
    .reduce((a, b) => (a < b ? a : b), date);
  const todayUsage = total(tableData.filter(r => r.get("Date") === date));
  const totalUsage = total(tableData);
  if ((message = "td")) {
    const data = {
      type: "flex",
      altText: `Today Usage is ฿${todayUsage}`,
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
              size: "sm"
            },
            {
              type: "text",
              text: `฿${todayUsage}`,
              weight: "bold",
              size: "xxl",
              margin: "md"
            },
            {
              type: "text",
              text: `Today Usage`,
              size: "xs",
              color: "#aaaaaa",
              wrap: true
            },
            {
              type: "separator",
              margin: "md"
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
        },
        styles: {
          footer: {
            separator: true
          }
        }
      }
    };
  }
  if ((message = "to")) {
    const data = {
      type: "flex",
      altText: `Total Usage is ฿${totalUsage}`,
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
              size: "sm"
            },
            {
              type: "text",
              text: `฿${totalUsage}`,
              weight: "bold",
              size: "xxl",
              margin: "md"
            },
            {
              type: "text",
              text: `Total Usage`,
              size: "xs",
              color: "#aaaaaa",
              wrap: true
            },
            {
              type: "separator",
              margin: "md"
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
        },
        styles: {
          footer: {
            separator: true
          }
        }
      }
    };
  }
  return data;
}
// message handler
async function messageHandler(message) {
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
    return await recordExpense(amount, category);
  }
  if ((message = "td")) {
    return getExepense(message);
  }
  if ((message = "to")) {
    return getExepense(message);
  }
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
