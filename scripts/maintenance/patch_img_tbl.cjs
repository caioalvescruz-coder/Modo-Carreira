const fs = require('fs');

let render = fs.readFileSync('assets/js/app-render.js', 'utf8');

const targetStrTbl = 'const tblImg = j.img ? `<img src="${j.img}" style="width:24px;height:24px;vertical-align:middle;object-fit:contain;margin-right:5px;border-radius:4px">` : tblSvg;';
const replacementStrTbl = 'const tblImg = j.img ? `<img src="${j.img}" style="width:24px;height:24px;vertical-align:middle;object-fit:contain;margin-right:5px;border-radius:4px" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src=\'assets/camisa.png\';">` : tblSvg;';

if (render.includes(targetStrTbl)) {
    render = render.replace(targetStrTbl, replacementStrTbl);
    fs.writeFileSync('assets/js/app-render.js', render, 'utf8');
    console.log('Table Image tag patched successfully!');
} else {
    console.log('Table Target string not found!');
}
