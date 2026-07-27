const fs = require('fs');
let render = fs.readFileSync('assets/js/app-render.js', 'utf8');

// The syntax error is:
// :${window.getAlvoBtnHtml(i, j)}}
// It should be:
// :window.getAlvoBtnHtml(i, j)}
render = render.replace(/:\$\{window\.getAlvoBtnHtml\(i, j\)\}\}/g, ':window.getAlvoBtnHtml(i, j)}');

fs.writeFileSync('assets/js/app-render.js', render, 'utf8');
console.log("Fixed syntax error");
