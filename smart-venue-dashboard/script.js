// script.js - Simulates Real-Time Data Intelligence for RVIRE Dashboard

function executeAction(buttonElement, actionText) {
  // Store original text
  const originalText = buttonElement.innerText;
  
  // Update button state
  buttonElement.innerText = actionText;
  buttonElement.style.background = 'var(--success)';
  buttonElement.style.color = '#fff';
  buttonElement.style.pointerEvents = 'none';

  // Simulate cloud function delay
  setTimeout(() => {
    buttonElement.innerText = "✓ Action Deployed";
    buttonElement.style.opacity = '0.7';
    
    // Animate the parent alert item
    const alertItem = buttonElement.closest('.alert-item');
    if (alertItem) {
      alertItem.style.transition = 'all 0.5s ease';
      alertItem.style.borderLeftColor = 'var(--success)';
      alertItem.style.background = 'rgba(52, 168, 83, 0.05)';
      
      const tag = alertItem.querySelector('.rule-tag');
      if (tag) {
        tag.innerText = "RESOLVED";
        tag.style.background = "var(--success)";
      }
    }
  }, 1200);
}

// Simulate real-time attendee increment
setInterval(() => {
  const countEl = document.getElementById('total-count');
  if (countEl) {
    let current = parseInt(countEl.innerText.replace(/,/g, ''));
    // Randomly add 1 to 5 people every few seconds
    const addition = Math.floor(Math.random() * 5) + 1;
    current += addition;
    countEl.innerText = current.toLocaleString();
  }
}, 3500);

// Randomly slightly shift heatmap points to simulate crowd movement
setInterval(() => {
  const points = document.querySelectorAll('.heatmap-point');
  points.forEach(point => {
    const defaultTop = parseFloat(point.style.top || '50');
    const defaultLeft = parseFloat(point.style.left || '50');
    
    const randomOffsetTop = (Math.random() - 0.5) * 5;
    const randomOffsetLeft = (Math.random() - 0.5) * 5;
    
    // We only apply transform translation so it stacks with CSS animations safely
    point.style.transform = `translate(${randomOffsetLeft}px, ${randomOffsetTop}px)`;
  });
}, 2000);
