/**
 * AI Provider Abstraction
 * Switch between mock, Anthropic Claude, or OpenAI via AI_PROVIDER env var
 */

// ── MOCK provider ─────────────────────────────────────────────
async function mockProvider(userPrompt) {
  // Simulate realistic latency (3–8 seconds)
  const delay = 3000 + Math.random() * 5000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // 10% random failure rate to test error handling
  if (Math.random() < 0.1) {
    throw new Error('Mock provider: simulated random failure');
  }

  const concepts = [
    `NEON DYNASTY × CHAOS — A campaign born from contradiction. Imagine a fragrance where ancient ritual meets neon excess. The visual language: gilded masks dissolving into circuit boards, velvet darkness punctured by violet light. Scent notes of burnt amber, cold titanium, and forbidden orchid. Tagline: "Wear the future. Haunt the past."`,
    `VOID LUXE — Not a perfume. A manifesto. Bottled in obsidian glass that catches no reflection. The scent is absence itself — negative space made tactile. Hints of ozone, black rose, and something that smells like the moment before everything changes. Tagline: "Some things defy description. This is one of them."`,
    `SYNTHETIC BLOOM — The algorithm dreamed of gardens it never had. A campaign in three acts: decay, rebirth, transcendence. Every frame saturated to the edge of illegibility. Flowers made of fiber optic cable. Dew drops of liquid mercury. Scent: green tea ash, mango static, and deep cosmos. Tagline: "Nature had its turn. Now it's ours."`,
    `GHOST PROTOCOL — A luxury fragrance for those who move between worlds. Campaign set in abandoned server farms overtaken by rare botanicals. Models wear couture sewn from decommissioned satellite panels. Scent pyramid: top notes of ozone and bergamot, heart of dark iris and burnt cedar, base of vetiver and encrypted secrets. Tagline: "They'll smell you coming. They'll never catch you."`,
    `CHROMATIC EXCESS — Too much has never felt this right. A campaign that breaks every rule of luxury advertising — oversaturated, overloud, overwhelmingly beautiful. Scent: pink pepper, electric citrus, titanium musk, and something that smells like winning. Tagline: "Restraint is for people without taste."`,
  ];

  return concepts[Math.floor(Math.random() * concepts.length)];
}

// ── Anthropic Claude provider ──────────────────────────────────
async function anthropicProvider(userPrompt) {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: `You are a wildly creative advertising director specializing in luxury fashion and fragrance campaigns. 

Creative challenge: "${userPrompt}"

Generate a bold, evocative campaign concept in 150-200 words. Include:
- A punchy campaign title
- The visual/aesthetic direction
- Key scent notes or product qualities
- A memorable tagline

Be maximalist, unexpected, and unforgettable. Avoid clichés.`,
      },
    ],
  });

  return response.content[0].text;
}

// ── OpenAI provider ────────────────────────────────────────────
async function openaiProvider(userPrompt) {
  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 600,
    messages: [
      {
        role: 'system',
        content: 'You are a wildly creative advertising director specializing in luxury fashion and fragrance campaigns. Be maximalist, unexpected, and unforgettable.',
      },
      {
        role: 'user',
        content: `Creative challenge: "${userPrompt}"\n\nGenerate a bold campaign concept (150-200 words) with title, visual direction, product qualities, and a tagline.`,
      },
    ],
  });

  return response.choices[0].message.content;
}

// ── Main export ────────────────────────────────────────────────
async function callAIProvider(userPrompt) {
  const provider = process.env.AI_PROVIDER || 'mock';

  console.log(`🤖 AI call using provider: ${provider}`);

  switch (provider) {
    case 'anthropic':
      return anthropicProvider(userPrompt);
    case 'openai':
      return openaiProvider(userPrompt);
    case 'mock':
    default:
      return mockProvider(userPrompt);
  }
}

module.exports = { callAIProvider };
