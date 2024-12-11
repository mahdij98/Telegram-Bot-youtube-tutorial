// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { cricketCommand } from "@/utils/commands/cricket";
import { helpCommand } from "@/utils/commands/help";
import { pingCommand } from "@/utils/commands/ping";
import { sendMessage } from "@/utils/telegram";

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method == "POST") {
    const message = req.body.message;
    const chatId = message.chat.id;
    const text = message.text?.toLowerCase(); // Convert input to lowercase

    console.log("ChatID", chatId);
    console.log("text", text);

    // Check if it's a group message
    if (!text) {
      res.status(200).send("No text found in the message.");
      return;
    }

    if (message.chat.type === "group" || message.chat.type === "supergroup") {
      console.log("Message received from a group.");
    }

    // Respond only to specific commands or patterns
    if (text.startsWith("/start") || text.startsWith("/help")) {
      await helpCommand(chatId);
    } else if (text.startsWith("/ping")) {
      await pingCommand(chatId);
    } else if (text.startsWith("/cricket")) {
      await cricketCommand(chatId);
    } else {
      // Custom handling for "test" followed by a number
      const match = text.match(/^test(\d+)$/);
      if (match) {
        const number = parseInt(match[1], 10); // Extract the number
        const incrementedNumber = number + 1; // Increment the number
        const responseText = `test${incrementedNumber}`;
        await sendMessage(chatId, responseText); // Send the response
      }
      // Do nothing for other inputs
    }

    res.status(200).send("OK");
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(500).send("Method Not Allowed");
  }
}
