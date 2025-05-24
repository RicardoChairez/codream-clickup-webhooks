const express = require("express");
const { MessagingResponse } = require("twilio").twiml;

const app = express();
app.use(express.json());

app.post("/sms", (req, res) => {
  const twiml = new MessagingResponse();

  const message = twiml.message();
  message.body("The Robots are coming! Head for the hills!");
  // message.media(
  //   "https://farm8.staticflickr.com/7090/6941316406_80b4d6d50e_z_d.jpg"
  // );

  res.type("text/xml").send(twiml.toString());
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;

// require("dotenv").config();
// const express = require("express");
// // const twilio = require("twilio");

// const app = express();
// app.use(express.json());

// const accountSid = process.env.TWILIO_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const accountPhone = process.env.TWILIO_PHONE;

// const client = require("twilio")(accountSid, authToken);

// app.post("/sms", async (req, res) => {
//   try {
//     console.log(res.body);
//     const message = await client.messages.create({
//       body: res.body,
//       from: accountPhone,
//       to: "+14809979631",
//     });
//     // .then((message) => console.log(message.sid));

//     console.log("Message sent:", message.sid);
//     res.status(200).json(res.body);
//   } catch (err) {
//     console.error("Error:", err.message);
//     res.status(500).json({ error: "Failed to send SMS" });
//   }
// });

// app.listen(3000, () => console.log("Server ready on port 3000."));

// module.exports = app;
