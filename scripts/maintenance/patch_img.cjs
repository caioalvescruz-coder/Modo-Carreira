const fs = require('fs');

let render = fs.readFileSync('assets/js/app-render.js', 'utf8');

const targetStr = '${j.img?`<img src="${j.img}" class="avatar-img">`:defSvg}';
const replacementStr = '${j.img?`<img src="${j.img}" class="avatar-img" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src=\'assets/camisa.png\';">`:defSvg}';

if (render.includes(targetStr)) {
    render = render.replace(targetStr, replacementStr);
    fs.writeFileSync('assets/js/app-render.js', render, 'utf8');
    console.log('Image tag patched successfully!');
} else {
    console.log('Target string not found!');
}
