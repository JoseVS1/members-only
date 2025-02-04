const bcrypt = require("bcryptjs");

async function validPassword(password, userPassword) {
    const match = await bcrypt.compare(password, userPassword);
    return match;
}
async function genPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
};

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;