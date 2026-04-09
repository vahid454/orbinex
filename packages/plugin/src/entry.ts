const script = document.currentScript;
if (!script) {
  console.error('Orbinex: No script tag found');
} else {
  // Detect if we're on localhost
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  
  // Set default engine URL based on environment
  const defaultEngineUrl = isLocalhost 
    ? 'http://localhost:3001' 
    : 'https://orbinex-engine.onrender.com';
  
  const config = {
    tenantId: script.dataset.tenant || 'test-tenant-001',
    engineUrl: script.dataset.engine || defaultEngineUrl,
    mode: (script.dataset.mode || 'bubble') as 'bubble' | 'panel' | 'fullpage',
    position: (script.dataset.position || 'bottom-right') as 'bottom-right' | 'bottom-left',
    primaryColor: script.dataset.color || '#6C5CE7',
    title: script.dataset.title || 'Orbinex AI',
    placeholder: script.dataset.placeholder || 'Ask me anything…',
    welcomeMessage: script.dataset.welcome || 'Hi! 👋 How can I help?',
  };
  
  console.log(`Orbinex: Connecting to engine at ${config.engineUrl}`);
  
  import('./widget').then(({ OrbinexWidget }) => {
    new OrbinexWidget(config).mount();
  });
}