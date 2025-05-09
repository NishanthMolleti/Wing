document.addEventListener('DOMContentLoaded', function() {
  const actionButton = document.getElementById('actionButton');
  const statusText = document.getElementById('status');

  actionButton.addEventListener('click', function() {
    // Get the current active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      
      // Update the status text
      statusText.textContent = `Current page: ${currentTab.title}`;
      
      // You can add more functionality here
      // For example, you could inject scripts into the page
      // or interact with the page content
    });
  });
}); 