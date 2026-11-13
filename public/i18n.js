// Shared by the interactive examples and interest form; static copy is translated at build time.
window.leafchefLanguage = document.documentElement.lang || 'en';
window.leafchefTranslate = text => window.leafchefMessages?.[text] ?? text;
