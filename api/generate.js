export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY not set" });
  }

  const { product, brand, audience, tone, platform, offer, formats } = req.body;

  const prompt = `You are an expert Meta (Facebook & Instagram) ads copywriter specializing in personal care and consumer products.

Generate high-converting Meta ad copy for the following product:

Product: ${product}
Brand: ${brand || "Unbranded"}
Target Audience: ${audience}
Tone: ${tone}
Platform: ${platform}
Special Offer/USP: ${offer || "None"}
Ad Formats Required: ${formats.join(", ")}

For each format, create compelling copy that stops the scroll. Follow Meta ads best practices:
- Headlines under 40 characters for Feed ads
- Primary text under 125 characters for mobile
- Strong emotional hooks
- Clear CTA

Respond ONLY with a valid JSON object:
{
  "headline": "<punchy headline under 40 chars>",
  "primaryText": "<engaging opening 1-2 sentences that hook the reader>",
  "description": "<supporting benefit statement>",
  "cta": "<one of: Shop Now, Learn More, Get Offer, Order Now, Sign Up>",
  "story": "<15-word hook for Instagram/Facebook Story format>",
  "carousel": [
    { "headline": "<card 1 headline>", "body": "<card 1 body, 1 sentence>" },
    { "headline": "<card 2 headline>", "body": "<card 2 body, 1 sentence>" },
    { "headline": "<card 3 headline>", "body": "<card 3 body, 1 sentence>" }
  ],
  "imagePrompt": "<detailed DALL-E/Midjourney style prompt for the ideal ad creative image>",
  "audienceInsight": "<one sentence on why this audience needs this product>",
  "hooks": ["<hook variant 1>", "<hook variant 2>", "<hook variant 3>"]
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.8,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );

    const data = await response.json();

    if (response.status === 429) {
      return res.status(429).json({ error: "rate_limited", message: "AI is busy — please try again in a minute." });
    }
    if (!response.ok) {
      throw new Error(data?.error?.message || `Gemini error ${response.status}`);
    }

    const parts = data.candidates?.[0]?.content?.parts || [];
    let text = parts.filter((p) => p.text && !p.thought).map((p) => p.text).join("");
    if (!text) text = parts.filter((p) => p.text).map((p) => p.text).join("");
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response: " + text.slice(0, 200));
    res.json(JSON.parse(jsonMatch[0]));
  } catch (e) {
    console.error("Gemini error:", e);
    res.status(500).json({ error: "Failed to generate ads", detail: String(e) });
  }
}
