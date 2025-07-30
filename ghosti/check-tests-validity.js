require('dotenv').config();
const { OpenAI } = require('openai');
const { JIRA_BASE_URL } = require('./constants');
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const LLM_API_KEY = process.env.LLM_API_KEY;
const BRANCH_NAME = process.env.BRANCH_NAME;
const TASK_NAME_REGEX = /\bdex-\d{4,}\b/gi;
const TASK_NAME = BRANCH_NAME.match(TASK_NAME_REGEX)?.[0];
const openai = new OpenAI({ apiKey: LLM_API_KEY });

/**
 * 
 * @returns {Promise<[string, string[]]>}
 */
const getJiraTicketInformation = async () => {
  if (!TASK_NAME) {
    return [];
  }

  try {
    const res = await fetch(`${JIRA_BASE_URL}/rest/api/2/issue/${TASK_NAME}?fields=description,comment`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')}`,
        "Accept"       : 'application/json',
      },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const description = data.fields?.description;
    const comments = data.fields?.comment?.comments?.map(comment => comment.body);

    return [description, comments];
  } catch (e) {
    console.error(e);
  }

  return [];
};

const ticketData = getJiraTicketInformation();

/**
 * 
 * @param {object} screenshotsInfo
 * @param {string} screenshotsInfo.baseScreenshotUrl
 * @param {{w: number, h: number}} screenshotsInfo.dims
 * @returns {Promise<string>} -> feedback as to whether the test failing can be accepted or not
 */
const askWithImage = async (screenshotsInfo) => {

  if (!TASK_NAME) {
    return 'Unable to identify Jira ticket with correct format from branch name. Final verdict: FAIL';
  }

  const {
    baseScreenshotUrl,
    dims
  } = screenshotsInfo;

  try {
    const [description, comments] = await ticketData;
    if (!description) {
      return 'Failed fetching Jira description. Final verdict: FAIL';
    }

    const response = await openai.chat.completions.create({
      model: "o4-mini",  
      messages: [
        { 
          role: "system",
          content: `
            Act as a Senior QA Engineer. Decide whether the snapshot test changes are justified per the Jira ticket.
            Reply in exactly one line: either "Final verdict: FAIL" or "Final verdict: PASS"
          `.trim()
        },
        { 
          role: "user", 
          content: [
            { 
              type: 'text',
              text: `
                Context: A snapshot test has just failed. Baseline dimensions: ${dims.w}×${dims.h}px.
                Analyze whether any of these changes violate the Jira acceptance criteria.
                The image difference has been attatched to the message.
                Ticket description: ${description}
                Comments (chronological):
                ${comments.join("\n")}
              `.trim(),
            },
            {
              type: 'image_url',
              image_url: {
                url: baseScreenshotUrl,
              }
            }
          ]
        }
      ]
    });

    return response?.choices?.[0]?.message?.content;
  } catch (e) {
    return `Failed due to this error: ${e}. Final verdict: FAIL`
  }
}

module.exports = {
  askWithImage
};
