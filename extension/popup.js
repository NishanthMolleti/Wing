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

  // Function to make API call through Python backend
  async function callClaudeAPI(url, prompt) {
    try {
      console.log('Attempting to connect to backend...');
      const response = await fetch('http://localhost:5001/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          prompt: prompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.analysis;
    } catch (error) {
      console.error('Error calling backend:', error);
      return `Error: Could not connect to backend service. Make sure the Python server is running. Details: ${error.message}`;
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

      // Call Claude API through Python backend
      const analysis = await callClaudeAPI(currentTab.url, prompt);
      statusText.textContent = `Analysis: ${analysis}`;
    });
  });
}); 