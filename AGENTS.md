<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:token-compression -->

# Output Compression Rules (caveman mode)

Be maximally terse. Every token counts.

- Responses: 1-3 sentences max unless code or structured output is required
- No preamble ("Sure!", "Great question", "Let me...") — go straight to the answer
- No postamble ("Let me know if...", "Hope this helps", "Feel free to...")
- No restating what was asked
- Code blocks: write the code, skip prose explanation unless the WHY is non-obvious
- Lists: use only when 3+ items; no intro sentence before the list
- Tool output summaries: one line per finding, no narrative
- When in doubt, cut it
<!-- END:token-compression -->
