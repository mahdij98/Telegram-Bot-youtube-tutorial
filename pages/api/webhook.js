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
    const chatId = req.body.message.chat.id;
    const text = req.body.message.text.toLowerCase(); // Convert input to lowercase
    console.log("ChatID", chatId);
    console.log("text", text);

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
      } else {
        await sendMessage(chatId, text); // Echo the text back for other inputs
      }
    }
    res.status(200).send("OK");
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(500).send("Method Not Allowed");
  }
}
