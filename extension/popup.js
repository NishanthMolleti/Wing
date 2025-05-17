document.addEventListener('DOMContentLoaded', function() {
  const actionButton = document.getElementById('actionButton');
  const statusText = document.getElementById('status');

  // Function to update status with style
  function updateStatus(message, type = '') {
    statusText.textContent = message;
    statusText.className = type; // This will add the appropriate CSS class
  }

  // Function to format the analysis text
  function formatAnalysis(text) {
    // Split the text into lines and clean up
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Remove asterisks and clean up bullet points
        return line.replace(/\*\*/g, '')
                  .replace(/\*/g, '')
                  .replace(/^•\s*/, '• ')
                  .replace(/^-\s*/, '• ');
      });
    
    return lines.join('\n');
  }

  // Test backend connection
  async function testBackendConnection() {
    try {
      console.log('Testing backend connection...');
      updateStatus('Testing connection...', 'loading');
      const response = await fetch('https://web-production-2be9.up.railway.app/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          url: 'https://example.com',
          prompt: 'Test connection'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend connection successful:', data);
      updateStatus('Backend connection successful! Ready to analyze.', 'success');
    } catch (error) {
      console.error('Backend connection test failed:', error);
      updateStatus(`Backend connection failed: ${error.message}`, 'error');
    }
  }

  // Run connection test when popup opens
  testBackendConnection();

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
  async function callGeminiAPI(url, prompt) {
    try {
      console.log('Attempting to connect to backend...');
      updateStatus('Analyzing...', 'loading');
      const response = await fetch('https://web-production-2be9.up.railway.app/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
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
      return `Error: Could not connect to backend service. Details: ${error.message}`;
    }
  }

  actionButton.addEventListener('click', async function() {
    // Get the current active tab
    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
      const currentTab = tabs[0];
      const currentUrl = currentTab.url;
      
      // Update the status text with the URL
      updateStatus(`Analyzing: ${currentUrl}`, 'loading');
      
      // Read the prompt file
      const prompt = await readPromptFile();
      if (!prompt) {
        updateStatus('Error: Could not read prompt file', 'error');
        return;
      }

      // Call Gemini API through Python backend
      const analysis = await callGeminiAPI(currentUrl, prompt);
      if (analysis.startsWith('Error')) {
        updateStatus(analysis, 'error');
      } else {
        const formattedAnalysis = formatAnalysis(analysis);
        updateStatus(`URL: ${currentUrl}\n\nAnalysis:\n${formattedAnalysis}`, 'success');
      }
    });
  });
}); 