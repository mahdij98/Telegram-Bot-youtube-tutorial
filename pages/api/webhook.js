import { sendMessage } from "@/utils/telegram";

export const config = {
  maxDuration: 60,
};

const lotterySessions = {}; // Store lottery data for each chat

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).send("Method Not Allowed");
  }

  const message = req.body.message;
  const chatId = message.chat.id;
  const text = message.text?.toLowerCase();

  if (!text) return res.status(200).send("No text found in the message.");

  if (text.startsWith("/lottery")) {
    await sendMessage(chatId, "Enter the number of participants:");
    lotterySessions[chatId] = { stage: "waitingForCount", participants: [] };
  } 
  else if (lotterySessions[chatId]?.stage === "waitingForCount") {
    const count = parseInt(text, 10);
    if (!count || count <= 0) {
      return await sendMessage(chatId, "Please enter a valid number.");
    }
    lotterySessions[chatId].count = count;
    lotterySessions[chatId].stage = "waitingForNames";
    lotterySessions[chatId].collected = 0;
    await sendMessage(chatId, `Please enter the names of ${count} participants, one by one.`);
  } 
  else if (lotterySessions[chatId]?.stage === "waitingForNames") {
    lotterySessions[chatId].participants.push(text);
    lotterySessions[chatId].collected++;

    if (lotterySessions[chatId].collected < lotterySessions[chatId].count) {
      await sendMessage(chatId, `Added! ${lotterySessions[chatId].count - lotterySessions[chatId].collected} more to go.`);
    } else {
      lotterySessions[chatId].stage = "readyToStart";
      await sendMessage(chatId, `All names collected! Type /startLottery to pick a winner.`);
    }
  } 
  else if (text.startsWith("/startLottery") && lotterySessions[chatId]?.stage === "readyToStart") {
    const participants = lotterySessions[chatId].participants;
    const winner = participants[Math.floor(Math.random() * participants.length)];
    
    delete lotterySessions[chatId]; // Clear session

    await sendMessage(chatId, `The winner is: ||${winner}||`, { parse_mode: "MarkdownV2" }); // Telegram spoiler format
  }

  res.status(200).send("OK");
}
