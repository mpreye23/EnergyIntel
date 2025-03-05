import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateRecommendations(deviceData: any): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an energy efficiency expert. Based on the device usage data provided, generate 3 specific, actionable recommendations to reduce energy consumption. Return the recommendations in JSON format as an array of strings.",
        },
        {
          role: "user",
          content: JSON.stringify(deviceData),
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.recommendations || [];
  } catch (error) {
    console.error("OpenAI API error:", error);
    return [
      "Consider turning off devices when not in use",
      "Schedule high-energy appliances during off-peak hours",
      "Monitor and adjust temperature settings regularly",
    ];
  }
}
