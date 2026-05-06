const fs = require('fs');
const p = 'e:/FULL STACK/cms/frontend/src/pages/superadmin/CreateAdmin.jsx';
let f = fs.readFileSync(p, 'utf8');

// Fix state
f = f.replace("password: '',\r\n    role: 'admin'", "role: 'admin'");
f = f.replace("password: '',\n    role: 'admin'", "role: 'admin'");

// Fix destructuring
f = f.replace("const { name, email, password, role } = formData", "const { name, email, role } = formData");

// Fix reset
f = f.replace("setFormData({ name: '', email: '', password: '', role: 'admin' })", "setFormData({ name: '', email: '', role: 'admin' })");

// Fix HTML block
const pwdBlockRegex = /\{\/\* Password \*\/\}.*?placeholder="Enter password"\s*\/>\s*<\/div>/s;
f = f.replace(pwdBlockRegex, '');

fs.writeFileSync(p, f);
console.log('done');
