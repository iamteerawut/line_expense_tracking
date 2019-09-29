const line = require("@line/bot-sdk");
const express = require("express");

// create LINE SDK config from env variables
const config = {
  channelAccessToken:
    "3UnjnmWz+x6LRsArfDj8Gzy6aBddcRIWPJIgtCMstQXdAnyqDDmbWfI7Qi4NJbUSUN8d490IIV+rwIUvjjE44U7RMnNQWGpOLnCLC2uP/h9KVah9fnch+NHERIK7y1/UE1xIaLTQRc/doP95W6ux5wdB04t89/1O/w1cDnyilFU=",
  channelSecret: "2f02b59173d521aeeb8169caaeb5e0d3"
};

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
      direction: "ltr",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "Purchase",
            size: "lg",
            align: "start",
            weight: "bold",
            color: "#009813"
          },
          {
            type: "text",
            text: "฿ 100.00",
            size: "3xl",
            weight: "bold",
            color: "#000000"
          },
          {
            type: "text",
            text: "Rabbit Line Pay",
            size: "lg",
            weight: "bold",
            color: "#000000"
          },
          {
            type: "text",
            text: "2019.02.14 21:47 (GMT+0700)",
            size: "xs",
            color: "#B2B2B2"
          },
          {
            type: "text",
            text: "Payment complete.",
            margin: "lg",
            size: "lg",
            color: "#000000"
          }
        ]
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "separator",
            color: "#C3C3C3"
          },
          {
            type: "box",
            layout: "baseline",
            margin: "lg",
            contents: [
              {
                type: "text",
                text: "Merchant",
                align: "start",
                color: "#C3C3C3"
              },
              {
                type: "text",
                text: "BTS 01",
                align: "end",
                color: "#000000"
              }
            ]
          },
          {
            type: "box",
            layout: "baseline",
            margin: "lg",
            contents: [
              {
                type: "text",
                text: "New balance",
                color: "#C3C3C3"
              },
              {
                type: "text",
                text: "฿ 45.57",
                align: "end"
              }
            ]
          },
          {
            type: "separator",
            margin: "lg",
            color: "#C3C3C3"
          }
        ]
      },
      footer: {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "text",
            text: "View Details",
            size: "lg",
            align: "start",
            color: "#0084B6",
            action: {
              type: "uri",
              label: "View Details",
              uri: "https://google.co.th/"
            }
          }
        ]
      }
    },
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "message",
            label: "Yes",
            text: "Yes"
          }
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "No",
            text: "No"
          }
        },
        {
          type: "action",
          action: {
            type: "cameraRoll",
            label: "Send photo"
          }
        },
        {
          type: "action",
          action: {
            type: "camera",
            label: "Open camera"
          }
        }
      ]
    }
  };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
