import jwt from "jsonwebtoken"
import { readFileSync } from "fs"
import dotenv from "dotenv"
dotenv.config()

const token = jwt.sign({
    iss: process.env.TESTFLIGHT_ISSUER,
    iat: new Date().getTime() / 1000,
    exp: new Date().getTime() / 1000 + 300,
    aud: 'appstoreconnect-v1'
}, readFileSync('AuthKey_N847R8TYXC.p8'), {
    keyid: process.env.TESTFLIGHT_KEYID,
    algorithm: 'ES256'
})
console.log(token)