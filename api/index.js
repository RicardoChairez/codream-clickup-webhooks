require("dotenv").config();
const express = require("express");
const { MessagingResponse } = require("twilio").twiml;
// const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());

const LOOM_REGEX = /https:\/\/www\.loom\.com\/share\/[\w-]+/i;
// const CLICKUP_API = "https://api.clickup.com/api/v2";
// const HEADERS = {
// Authorization: process.env.CLICKUP_TOKEN,
// };

app.post("/sms", async (req, res) => {
  const twiml = new MessagingResponse();
  const message = twiml.message();
  message.body(req.body);
  res.type("text/xml").send(twiml.toString());
  return;
  // const from = req.body.From.replace(/\D/g, ""); // normalize to digits only
  const messageBody = req.body.Body;
  console.log(messageBody);

  // console.log("📩 Incoming SMS from", from);

  const loomMatch = messageBody.match(LOOM_REGEX);
  if (!loomMatch) {
    twiml.message("❌ No Loom link found in your message.");
    return res.type("text/xml").send(twiml.toString());
  }

  const loomUrl = loomMatch[0];

  try {
    // const taskId = await findTaskIdByPhoneNumber(from);
    // if (!taskId) {
    // twiml.message("⚠️ No ClickUp task found for this phone number.");
    twiml.message(loomUrl);
    return res.type("text/xml").send(twiml.toString());
    // }

    // await updateLoomLink(taskId, loomUrl);

    twiml.message("✅ Loom link successfully added to your task.");
    res.type("text/xml").send(twiml.toString());
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    twiml.message("🚫 Something went wrong while updating the task.");
    res.type("text/xml").send(twiml.toString());
  }
});

// async function findTaskIdByPhoneNumber(phone) {
//   const response = await axios.get(
//     `${CLICKUP_API}/list/${process.env.CLICKUP_LIST_ID}/task`,
//     {
//       headers: HEADERS,
//       params: {
//         include_subtasks: true,
//       },
//     }
//   );

//   const tasks = response.data.tasks;

//   for (const task of tasks) {
//     const match = task.custom_fields.find(
//       (field) =>
//         field.id === process.env.PHONE_FIELD_ID &&
//         field.value?.replace(/\D/g, "") === phone
//     );

//     if (match) {
//       return task.id;
//     }
//   }

//   return null;
// }

// async function updateLoomLink(taskId, loomUrl) {
//   return axios.put(
//     `${CLICKUP_API}/task/${taskId}/field/${process.env.LOOM_FIELD_ID}`,
//     {
//       value: loomUrl,
//     },
//     { headers: HEADERS }
//   );
// }

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
