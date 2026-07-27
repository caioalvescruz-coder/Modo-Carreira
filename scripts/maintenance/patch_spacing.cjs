const fs = require('fs');

let render = fs.readFileSync('assets/js/app-render.js', 'utf8');

// Replace the bottom pagination in grid view
render = render.replace('}).join(\'\')) + paginationHtml;', '}).join(\'\')) + `<div style="padding-bottom: 120px; width: 100%; grid-column: 1/-1;">\${paginationHtml}</div>`;');

// Replace the bottom pagination in table view
render = render.replace('}).join(\'\')) + `</tbody></table></div>` + paginationHtml;', '}).join(\'\')) + `</tbody></table></div><div style="padding-bottom: 120px; width: 100%;">\${paginationHtml}</div>`;');

fs.writeFileSync('assets/js/app-render.js', render, 'utf8');
console.log('Added padding-bottom to bottom pagination.');
