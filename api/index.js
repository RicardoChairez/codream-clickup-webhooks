require("dotenv").config();
const express = require("express");
const twilio = require("twilio");

const app = express();
app.use(express.json());

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const accountPhone = process.env.TWILIO_PHONE;

const client = require("twilio")(accountSid, authToken);

app.post("/sms", async (req, res) => {
  try {
    console.log(res.body);
    const message = await client.messages.create({
      body: "Hi Chippy",
      from: accountPhone,
      to: "+14809979631",
    });
    // .then((message) => console.log(message.sid));

    console.log("Message sent:", message.sid);
    res.status(200).json({ message: "SMS sent", sid: message.sid });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Failed to send SMS" });
  }
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
