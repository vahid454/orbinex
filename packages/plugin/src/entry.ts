const script = document.currentScript;
if (!script) {
  console.error('Orbinex: No script tag found');
} else {
  const config = {
    tenantId: script.dataset.tenant || 'test-tenant-001',
    engineUrl: script.dataset.engine || 'https://orbinex-engine.onrender.com',
    mode: (script.dataset.mode || 'bubble') as 'bubble' | 'panel' | 'fullpage',
    position: (script.dataset.position || 'bottom-right') as 'bottom-right' | 'bottom-left',
    primaryColor: script.dataset.color || '#6C5CE7',
    title: script.dataset.title || 'Orbinex AI',
    placeholder: script.dataset.placeholder || 'Ask me anything…',
    welcomeMessage: script.dataset.welcome || 'Hi! 👋 How can I help?',
  };
  
  import('./widget').then(({ OrbinexWidget }) => {
    new OrbinexWidget(config).mount();
  });
}