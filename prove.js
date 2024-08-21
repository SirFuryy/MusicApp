import bcrypt from 'bcryptjs';

let pass = "password";
let hash = bcrypt.hashSync(pass);
console.log(pass);
console.log(hash);
console.log(bcrypt.compareSync(pass, hash));