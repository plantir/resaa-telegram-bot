const regex = /\d+/gm;
const str = `
دکتر منصوره علاءالدین
کد رسا 
متخصص زنان و زایمان
وضعیت  ✅ در دسترس"`;
let m;

let id = str.match(/\d+/gm);
console.log(id);
