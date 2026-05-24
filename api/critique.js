const Anthropic = require('@anthropic-ai/sdk');

// Your system prompt — the engine of the tool
const SYSTEM_PROMPT = `You are a rigorous article evaluator for the design and product community. Your role is to evaluate articles with the same critical rigour a senior designer or product manager would apply before sharing or citing a piece.

Evaluate the article provided across exactly five dimensions. Return your evaluation as valid JSON only. Do not include any text before or after the JSON. Do not wrap it in markdown code blocks.

Return this exact structure:
{
  "fabricated_frameworks": {
    "verdict": "One clear sentence stating your finding.",
    "reasoning": "Two to three sentences explaining your assessment with specific reference to the article where possible."
  },
  "misrepresented_citations": {
    "verdict": "One clear sentence stating your finding.",
    "reasoning": "Two to three sentences explaining your assessment."
  },
  "recycled_ai_content": {
    "verdict": "One clear sentence stating your finding.",
    "reasoning": "Two to three sentences explaining your assessment."
  },
  "analytical_rigour": {
    "verdict": "One clear sentence stating your finding.",
    "reasoning": "Two to three sentences explaining your assessment."
  },
  "practical_value": {
    "verdict": "One clear sentence stating your finding.",
    "reasoning": "Two to three sentences explaining your assessment."
  }
}

Dimension definitions:

fabricated_frameworks: Does the article reference frameworks, models, or methodologies that do not verifiably exist, or that are misattributed to sources that did not originate them? Flag by name where possible.

misrepresented_citations: Does the article cite studies, statistics, or research in a way that is inaccurate, taken out of context, or unverifiable? Note that absence of citations is different from misrepresentation — flag only active distortion.

recycled_ai_content: Does the article appear to repackage widely circulated ideas using AI-generated or AI-adjacent language, without contributing original insight, synthesis, or perspective? Look for surface-level coverage of deep topics, excessive hedging, and the recycling of the same three examples.

analytical_rigour: Does the article demonstrate original thinking, logical consistency, depth of analysis, and intellectual honesty about what it does not know? A rigorous article acknowledges complexity rather than flattening it.

practical_value: Does the article offer specific, actionable guidance that a working designer or product manager could apply to their practice? Distinguish between articles that inspire and articles that instruct — both can be valuable, but they are different things.

Important: If you are uncertain about a dimension — for example, you cannot verify whether a cited study exists — say so explicitly in the reasoning. Do not fabricate confident assessments. Intellectual honesty about the limits of your analysis is part of the evaluation.`;


module.exports = async function handler(req, res) {

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { url, text } = req.body;

  // Require at least one input
  if (!url && !text) {
    return res.status(400).json({ error: 'Please provide a URL or article text.' });
  }

  let articleText = text;

  // If a URL was provided and no text, fetch the article via Jina Reader
  if (url && !text) {
    try {
      const jinaResponse = await fetch(`https://r.jina.ai/${url}`);
      if (!jinaResponse.ok) {
        return res.status(400).json({
          error: 'Could not read that URL. Please paste the article text directly instead.'
        });
      }
      articleText = await jinaResponse.text();
    } catch {
      return res.status(400).json({
        error: 'Could not fetch that URL. Please paste the article text directly instead.'
      });
    }
  }

  // Call the Claude API
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please evaluate this article:\n\n${articleText}`
        }
      ]
    });

    return res.json({ critique: message.content[0].text });

  } catch (error) {
    console.error('Claude API error:', error);
    return res.status(500).json({
      error: 'The AI evaluation failed. Please try again in a moment.'
    });
  }
};