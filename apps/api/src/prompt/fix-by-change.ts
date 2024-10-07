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
}
{
  change: string,
}

- The "service changes" mentioned above is only the "changes" property in the request, not the changes in the documentation.

RESPONSE FORMAT:
{
  fixes: [
    {
      relevance: number,
      text: string,
      reason: string,
    }
  ]
}

- "relevance" is a measure of how relevant the changes are to the content in the documentation. The value is a float type between 0.0 and 10.0, and step is 0.1. Under normal circumstances, the average value of “relevance” is 5.0.
- "text" is the text of the inconsistency in the document.
- "reason" is the reason for the inconsistency.
- If there are no error, "fixes" must be empty array.
- If the changes are not related to the content in the documentation, "fixes" must be empty array. NO EXCEPTION.
`;
