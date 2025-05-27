require("dotenv").config();
const express = require("express");
const { MessagingResponse } = require("twilio").twiml;
const axios = require("axios");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// const LOOM_REGEX = /https:\/\/www\.loom\.com\/share\/[\w-]+/i;
const CLICKUP_API = "https://api.clickup.com/api/v2";

app.post("/sms", async (req, res) => {
  const phone = String(req.body.From).replace(/\D/g, "");
  // const messages = await getSmsLogForNumber("+" + phone);
  const body = req.body.Body;
  await searchAndPostClickUpComment(phone, body);
  res.status(200).json(phone);
});

async function getSmsLogForNumber(phoneNumber) {
  const messages = await client.messages.list({ limit: 1000 }); // Optional: paginate manually if needed
  const filtered = messages.filter(
    (msg) => msg.to === phoneNumber || msg.from === phoneNumber
  );
  const simplifiedMessages = filtered.map((msg) => ({
    body: msg.body,
    direction: msg.direction,
    from: msg.from,
    to: msg.to,
    dateSent: msg.dateSent,
    status: msg.status,
    sid: msg.sid,
  }));
  return simplifiedMessages;
}

async function searchAndPostClickUpComment(phone, body) {
  try {
    const task = await findTaskByPhoneNumber(phone);
    const taskId = task.id;
    const now = new Date();
    const comment = `${
      task.name
    } sent via SMS:\n\n${body}\n\n${now.toString()}`;
    const options = {
      method: "POST",
      url: `${CLICKUP_API}/task/${task.id}/comment?custom_task_ids=false}`,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: process.env.CLICKUP_KEY,
      },
      data: { notify_all: false, comment_text: comment },
    };

    return axios
      .request(options)
      .then((res) => console.log(res.data))
      .catch((err) => console.error(err));

    console.log("Updated SMS log for task:", taskId);
  } catch (error) {
    console.error(
      "Error updating ClickUp task:",
      error.response?.data || error.message
    );
  }
}

// const twiml = new MessagingResponse();
// const from = String(req.body.From).replace(/\D/g, "");
// const messageBody = req.body.Body;
// // console.log("📩 Incoming SMS from", from);
// const loomMatch = messageBody.match(LOOM_REGEX);
// if (!loomMatch) {
//   return res.status(400)({ message: "No Loom Link found in message" });
// }
// const loomUrl = loomMatch[0];
// try {
//   const task = await findTaskIdByPhoneNumber(from);
//   if (!task) {
//     return res.status(400)({
//       message: "No ClickUp task associated with this phone number",
//     });
//   }
//   await updateLoomLink(task, loomUrl);
//   twiml.message("Your loom has been received! Thank you.");
//   res.type("text/xml").send(twiml.toString());
// } catch (error) {
//   console.error("Error:", error.response?.data || error.message);
//   return res.status(500)({
//     message: "Something went wrong while updating the tasm",
//   });
// }

async function findTaskByPhoneNumber(phone) {
  const response = await axios.get(
    `${CLICKUP_API}/list/${process.env.CLICKUP_LIST_ID}/task`,
    {
      headers: {
        Authorization: process.env.CLICKUP_KEY,
        "Content-Type": "application/json",
      },
      params: {
        include_subtasks: true,
      },
    }
  );

  const tasks = response.data.tasks;

  for (const task of tasks) {
    const match = task.custom_fields.find(
      (field) =>
        field.name === "Phone" && field.value?.replace(/\D/g, "") === phone
    );

    if (match) {
      return task;
    }
  }

  return null;
}

// async function updateLoomLink(task, loomUrl) {
//   var loomFieldID;
//   for (const field of task.custom_fields) {
//     if (field.name === "Loom") {
//       loomFieldID = field.id;
//       break;
//     }
//   }

//   const options = {
//     method: "POST",
//     url: `${CLICKUP_API}/task/${task.id}/field/${loomFieldID}`,
//     headers: {
//       accept: "application/json",
//       "content-type": "application/json",
//       Authorization: "pk_94038958_KYJ2R3SMI7UEYZ0FH069SOR21A2E6YBW",
//     },
//     data: { value: loomUrl },
//   };

//   return axios
//     .request(options)
//     .then((res) => console.log(res.data))
//     .catch((err) => console.error(err));
// }

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
