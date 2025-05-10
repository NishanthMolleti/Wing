document.addEventListener('DOMContentLoaded', function() {
  const actionButton = document.getElementById('actionButton');
  const statusText = document.getElementById('status');

  // Function to read the prompt file
  async function readPromptFile() {
    try {
      const response = await fetch(chrome.runtime.getURL('prompt.txt'));
      return await response.text();
    } catch (error) {
      console.error('Error reading prompt file:', error);
      return null;
    }
  }

  // Function to make API call to Claude
  async function callClaudeAPI(url, prompt) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `${prompt}\nURL: ${url}`
          }]
        })
      });

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      return 'Error: Could not get response from Claude AI';
    }
  }

  actionButton.addEventListener('click', async function() {
    // Get the current active tab
    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
      const currentTab = tabs[0];
      
      // Update the status text with the URL
      statusText.textContent = `Analyzing: ${currentTab.url}`;
      
      // Read the prompt file
      const prompt = await readPromptFile();
      if (!prompt) {
        statusText.textContent = 'Error: Could not read prompt file';
        return;
      }

      // Call Claude API
      const analysis = await callClaudeAPI(currentTab.url, prompt);
      statusText.textContent = `Analysis: ${analysis}`;
    });
  });
}); 