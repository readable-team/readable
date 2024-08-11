import { query, toEndpoint } from 'dns-query';

const endpoints = ['udp://8.8.8.8', 'udp://8.8.4.4', 'udp://1.1.1.1', 'udp://1.0.0.1'].map((v) => toEndpoint(v));

export const lookupCnames = async (domain: string) => {
  try {
    const { answers } = await query({ question: { type: 'CNAME', name: domain } }, { endpoints });
    if (!answers) {
      return [];
    }

    return answers.map((answer) => answer.data as string);
  } catch {
    return [];
  }
};
