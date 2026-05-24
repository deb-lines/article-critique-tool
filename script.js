// This runs when the user clicks "Critique this article"
async function submitCritique() {

    // Collect what the user typed
    const url = document.getElementById('url-input').value.trim();
    const text = document.getElementById('text-input').value.trim();
  
    // If they typed nothing, show an error
    if (!url && !text) {
      showError('Please paste a URL or article text before submitting.');
      return;
    }
  
    // Show the loading state
    showLoading();
  
    try {
      // Send the data to our serverless function
      const response = await fetch('/api/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url, text: text })
      });
  
      // If something went wrong on the server, show an error
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong. Please try again.');
      }
  
      // Get the critique from the response
      const data = await response.json();
  
      // Display it
      displayCritique(data.critique);
  
    } catch (error) {
      showError(error.message);
    }
  }
  
  
  // This takes Claude's response and displays it as five sections
  function displayCritique(critiqueText) {
    hideAll();
  
    let critique;
  
    // Strip markdown code fences if the model added them anyway
    let raw = critiqueText.trim();
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    }

    // Try to parse it as JSON
    try {
      critique = JSON.parse(raw);
    } catch {
      showError('The response was not in the expected format. Please try again.');
      return;
    }
  
    // The five dimensions we expect
    const labels = {
      fabricated_frameworks: 'Fabricated Frameworks',
      misrepresented_citations: 'Misrepresented Citations',
      recycled_ai_content: 'Recycled AI Content',
      analytical_rigour: 'Analytical Rigour',
      practical_value: 'Practical Value'
    };
  
    const dimensionsContainer = document.getElementById('dimensions');
    dimensionsContainer.innerHTML = '';
  
    // For each dimension, create a card and add it to the page
    for (const [key, label] of Object.entries(labels)) {
      const dimension = critique[key];
  
      if (!dimension) continue; // Skip if missing
  
      const card = document.createElement('div');
      card.className = 'dimension';
      card.innerHTML = `
        <h3>${label}</h3>
        <p class="verdict">${dimension.verdict || 'No verdict returned.'}</p>
        <p class="reasoning">${dimension.reasoning || 'No reasoning returned.'}</p>
      `;
      dimensionsContainer.appendChild(card);
    }
  
    document.getElementById('output').classList.remove('hidden');
  }
  
  
  // Show the loading state, hide everything else
  function showLoading() {
    hideAll();
    document.getElementById('loading').classList.remove('hidden');
  }
  
  
  // Show an error message, hide everything else
  function showError(message) {
    hideAll();
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-state').classList.remove('hidden');
  }
  
  
  // Hide all the state panels
  function hideAll() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
    document.getElementById('output').classList.add('hidden');
  }
  
  
  // Copy the critique text to clipboard
  function copyOutput() {
    const dimensionsContainer = document.getElementById('dimensions');
    navigator.clipboard.writeText(dimensionsContainer.innerText).then(() => {
      const btn = document.getElementById('copy-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy critique to clipboard'; }, 2000);
    });
  }