const bycript = require('bcryptjs')

const hashpassword = async (password) => {
    const salt = 10;
    const hashedpassword = await bycript.hash(password, salt)
    return hashedpassword;
}


module.exports = { hashpassword }