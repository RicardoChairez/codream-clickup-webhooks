require("dotenv").config();
const express = require("express");
const { MessagingResponse } = require("twilio").twiml;
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const LOOM_REGEX = /https:\/\/www\.loom\.com\/share\/[\w-]+/i;
const CLICKUP_API = "https://api.clickup.com/api/v2";
const HEADERS = {
  accept: "application/json",
  "content-type": "application/json",
  Authorization: "pk_94038958_KYJ2R3SMI7UEYZ0FH069SOR21A2E6YBW",
};

app.post("/sms", async (req, res) => {
  const twiml = new MessagingResponse();
  const from = String(req.body.From).replace(/\D/g, "");
  const messageBody = req.body.Body;

  // console.log("📩 Incoming SMS from", from);

  const loomMatch = messageBody.match(LOOM_REGEX);
  if (!loomMatch) {
    twiml.message("❌ No Loom link found in your message.");
    return res.type("text/xml").send(twiml.toString());
  }

  const loomUrl = loomMatch[0];

  try {
    const task = await findTaskIdByPhoneNumber(from);
    if (!task) {
      twiml.message("⚠️ No ClickUp task found for this phone number.");
      return res.type("text/xml").send(twiml.toString());
    }

    await updateLoomLink(task, loomUrl);

    twiml.message("Your loom has been received! Thank you.");
    res.type("text/xml").send(twiml.toString());
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    twiml.message("🚫 Something went wrong while updating the task.");
    res.type("text/xml").send(twiml.toString());
  }
});

async function findTaskIdByPhoneNumber(phone) {
  const response = await axios.get(`${CLICKUP_API}/list/901309149210/task`, {
    headers: HEADERS,
    params: {
      include_subtasks: true,
    },
  });

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

async function updateLoomLink(task, loomUrl) {
  var loomFieldID;
  for (const field of task.custom_fields) {
    if (field.name === "Loom") {
      loomFieldID = field.id;
      break;
    }
  }

  const options = {
    method: "POST",
    url: `${CLICKUP_API}/task/${task.id}/field/${loomFieldID}`,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: "pk_94038958_KYJ2R3SMI7UEYZ0FH069SOR21A2E6YBW",
    },
    data: { value: loomUrl },
  };

  return axios
    .request(options)
    .then((res) => console.log(res.data))
    .catch((err) => console.error(err));
}

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
