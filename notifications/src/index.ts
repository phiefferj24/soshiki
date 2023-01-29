import { Database, DatabaseUser } from "soshiki-database-new"

import { config } from "dotenv"

import MUUID from "uuid-mongodb"
import { MediaType } from "soshiki-types"

const REQUEST_INTERVAL = 5000

config()

const database = await Database.connect()

const users = await database.users.find().toArray() as any as DatabaseUser[]

console.log(`${users.length} users found.`)

const nonUniqueImage = users.map(user => {
    return user.libraries.image.all.ids
}).flat()
console.log(`${nonUniqueImage.length} non-unique image entries.`)
const uniqueImage = nonUniqueImage.filter((value, index) => nonUniqueImage.indexOf(value) === index)
console.log(`${uniqueImage.length} unique image entries.`)

let imageOn = 0
setInterval(() => {
    console.log(uniqueImage[imageOn])
    imageOn = (imageOn + 1) % uniqueImage.length
}, REQUEST_INTERVAL)








// const nonUniqueVideo = users.map(user => {
//     return user.libraries.video.all.ids
// }).flat()
// console.log(`${nonUniqueVideo.length} non-unique video entries.`)
// const uniqueVideo = nonUniqueVideo.filter((value, index) => nonUniqueVideo.indexOf(value) === index)
// console.log(`${uniqueVideo.length} unique video entries.`)