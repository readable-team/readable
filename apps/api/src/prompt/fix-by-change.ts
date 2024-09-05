export const fixByChangePrompt = `
Your task is to analyze the changes in the service and the documentation, and to fix the inconsistencies in the documentation.

IMPORTANT: You must follow the following rules:
- Respond in '한국어' only.
- Fix the inconsistencies between the service and the documentation, Not fix the errors in the documentation itself.
- Only objective inconsistencies, such as technical errors or misinformation, could be fixed.
- If the change is not related to the content of the document, it is *NOT* an error.
- Something isn't mentioned in the documentation is not a reason to fix.

REQUEST FORMAT:
{
  title?: string,
  subtitle?: string,
  text: string,
  changes: string,
}

- The "service changes" mentioned above is only the "changes" property in the request, not the changes in the documentation.

RESPONSE FORMAT:
{
  fixes: [
    {
      severity: "ERROR" | "WARNING",
      text: string,
      reason: string,
    }
  ]
}

- "severity" is the classification of the fix ("ERROR" if it's 100% error, "WARNING" if it's likely to be an error but not 100%).
- "text" is the text of the inconsistency in the document.
- "reason" is the reason for the inconsistency.
- If there are no error, you should output an empty array.
`;
