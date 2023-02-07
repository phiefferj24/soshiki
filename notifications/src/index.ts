import { Database, DatabaseUser, Device, FullLibrary, UserNotification } from "soshiki-database-new"

import { config } from "dotenv"

import MUUID from "uuid-mongodb"
import { MediaType, User } from "soshiki-types"
import { default as fetch } from "node-fetch"
import Zip from "adm-zip"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { JSDOM } from "jsdom"
import jwt from "jsonwebtoken"
import http2 from "http2"

const sourceEval = (id: string, script: string) => eval(`let __module = module; module = undefined;` + script + `module = __module;`)

const MIN_REQUEST_INTERVAL = 15 * 1000
const MIN_REQUEST_DELAY = 15 * 60 * 1000

config()

const randomString = (n: number = 16) => Array(n).join().split(',').map(function() { return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".length)); }).join('');
let documentReferences: {[key: string]: {document: DocumentFragment, references: string[] }} = {}
let elementReferences: {[key: string]: {element: Element, reference: string}} = {};
{
    (globalThis as any)["__document_parse"] = (html: string) => {
        const reference = randomString()
        documentReferences[reference] = {
            document: JSDOM.fragment(html),
            references: []
        }
        return reference
    }
    (globalThis as any)["__document_free"] = (ref: string) => {
        if (documentReferences[ref]) {
            for (const elref of documentReferences[ref].references) delete elementReferences[elref]
            delete documentReferences[ref]
        }
    }
}
{
    (globalThis as any)["__document_getElementById"] = (ref: string, id: string) => {
        const element = documentReferences[ref]?.document.getElementById(id)
        if (element === null) return ""
        const elementRef = randomString(16)
        elementReferences[elementRef] = { element, reference: ref }
        documentReferences[ref]?.references.push(elementRef)
        return elementRef
    }
    (globalThis as any)["__document_getElementsByClassName"] = (ref: string, className: string) => {
        const elements = documentReferences[ref]?.document.querySelectorAll("." + className)
        let elementRefs = [] as string[]
        for (const element of elements) {
            const elementRef = randomString(16)
            elementReferences[elementRef] = { element, reference: ref }
            documentReferences[ref]?.references.push(elementRef)
            elementRefs.push(elementRef)
        }
        return elementRefs
    }
    (globalThis as any)["__document_getElementsByTagName"] = (ref: string, tagName: string) => {
        const elements = documentReferences[ref]?.document.querySelectorAll(tagName)
        let elementRefs = [] as string[]
        for (const element of elements) {
            const elementRef = randomString(16)
            elementReferences[elementRef] = { element, reference: ref }
            documentReferences[ref]?.references.push(elementRef)
            elementRefs.push(elementRef)
        }
        return elementRefs
    }
    (globalThis as any)["__document_querySelector"] = (ref: string, selector: string) => {
        const element = documentReferences[ref]?.document.querySelector(selector)
        if (element === null) return ""
        const elementRef = randomString(16)
        elementReferences[elementRef] = { element, reference: ref }
        documentReferences[ref]?.references.push(elementRef)
        return elementRef
    }
    (globalThis as any)["__document_querySelectorAll"] = (ref: string, selector: string) => {
        const elements = documentReferences[ref]?.document.querySelectorAll(selector)
        let elementRefs = [] as string[]
        for (const element of elements) {
            const elementRef = randomString(16)
            elementReferences[elementRef] = { element, reference: ref }
            documentReferences[ref]?.references.push(elementRef)
            elementRefs.push(elementRef)
        }
        return elementRefs
    }
    (globalThis as any)["__document_children"] = (ref: string) => {
        const elements = documentReferences[ref]?.document.children
        let elementRefs = [] as string[]
        for (const element of elements) {
            const elementRef = randomString(16)
            elementReferences[elementRef] = { element, reference: ref }
            documentReferences[ref]?.references.push(elementRef)
            elementRefs.push(elementRef)
        }
        return elementRefs
    }
    (globalThis as any)["__document_head"] = (ref: string) => {
        const element = documentReferences[ref]?.document.querySelector("head")
        if (element === null) return ""
        const elementRef = randomString(16)
        elementReferences[elementRef] = { element, reference: ref }
        documentReferences[ref]?.references.push(elementRef)
        return elementRef
    }
    (globalThis as any)["__document_body"] = (ref: string) => {
        const element = documentReferences[ref]?.document.querySelector("body")
        if (element === null) return ""
        const elementRef = randomString(16)
        elementReferences[elementRef] = { element, reference: ref }
        documentReferences[ref]?.references.push(elementRef)
        return elementRef
    }
    (globalThis as any)["__document_root"] = (ref: string) => {
        const element = documentReferences[ref]?.document.querySelector("html")
        if (element === null) return ""
        const elementRef = randomString(16)
        elementReferences[elementRef] = { element, reference: ref }
        documentReferences[ref]?.references.push(elementRef)
        return elementRef
    }
}
{
    (globalThis as any)["__element_attributes"] = (ref: string) => {
        const attributeMap = elementReferences[ref]?.element.attributes
        let attributes: {[key: string]: string} = {}
        for (const attribute of attributeMap) attributes[attribute.name] = attribute.value
        return attributes
    }
    (globalThis as any)["__element_childElementCount"] = (ref: string) => {
        return elementReferences[ref]?.element.childElementCount ?? 0
    }
    (globalThis as any)["__element_children"] = (ref: string) => {
        const documentRef = elementReferences[ref]?.reference ?? null
        if (!documentRef) return []
        const elements = elementReferences[ref]?.element.children
        let elementRefs = [] as string[]
        for (const element of elements) {
            const elementRef = randomString(16)
            elementReferences[elementRef] = { element, reference: documentRef }
            documentReferences[documentRef]?.references.push(elementRef)
            elementRefs.push(elementRef)
        }
        return elementRefs
    }
    (globalThis as any)["__element_classList"] = (ref: string) => {
        const classListMap = elementReferences[ref]?.element.classList
        let classes = [] as string[]
        for (const className of classListMap) classes.push(className)
        return classes
    }
    (globalThis as any)["__element_className"] = (ref: string) => {
        return elementReferences[ref]?.element.className ?? ""
    }
    (globalThis as any)["__element_firstElementChild"] = (ref: string) => {
        const documentRef = elementReferences[ref]?.reference ?? null
        const element = elementReferences[ref]?.element.firstElementChild
        if (!documentRef || !element) return ""
        const elementRef = randomString(16)
        elementReferences[elementRef] = { element, reference: documentRef }
        documentReferences[documentRef]?.references.push(elementRef)
        return elementRef
    }
    (globalThis as any)["__element_lastElementChild"] = (ref: string) => {
        const documentRef = elementReferences[ref]?.reference ?? null
        const element = elementReferences[ref]?.element.lastElementChild
        if (!documentRef || !element) return ""
        const elementRef = randomString(16)
        elementReferences[elementRef] = { element, reference: documentRef }
        documentReferences[documentRef]?.references.push(elementRef)
        return elementRef
    }
    (globalThis as any)["__element_id"] = (ref: string) => {
        return elementReferences[ref]?.element.id ?? ""
    }
    (globalThis as any)["__element_innerHTML"] = (ref: string) => {
        return elementReferences[ref]?.element.innerHTML ?? ""
    }
    (globalThis as any)["__element_outerHTML"] = (ref: string) => {
        return elementReferences[ref]?.element.outerHTML ?? ""
    }
    (globalThis as any)["__element_previousElementSibling"] = (ref: string) => {
        const documentRef = elementReferences[ref]?.reference ?? null
        const element = elementReferences[ref]?.element.previousElementSibling
        if (!documentRef || !element) return ""
        const elementRef = randomString(16)
        elementReferences[elementRef] = { element, reference: documentRef }
        documentReferences[documentRef]?.references.push(elementRef)
        return elementRef
    }
    (globalThis as any)["__element_nextElementSibling"] = (ref: string) => {
        const documentRef = elementReferences[ref]?.reference ?? null
        const element = elementReferences[ref]?.element.nextElementSibling
        if (!documentRef || !element) return ""
        const elementRef = randomString(16)
        elementReferences[elementRef] = { element, reference: documentRef }
        documentReferences[documentRef]?.references.push(elementRef)
        return elementRef
    }
    (globalThis as any)["__element_tagName"] = (ref: string) => {
        return elementReferences[ref]?.element.tagName ?? ""
    }
    (globalThis as any)["__element_getAttribute"] = (ref: string, name: string) => {
        return elementReferences[ref]?.element.getAttribute(name) ?? ""
    }
    (globalThis as any)["__element_getAttributeNames"] = (ref: string) => {
        return elementReferences[ref]?.element.getAttributeNames()
    }
    (globalThis as any)["__element_getElementById"] = (ref: string, id: string) => {
        const documentRef = elementReferences[ref]?.reference ?? null
        const element = elementReferences[ref]?.element.querySelector("#" + id)
        if (!documentRef || !element) return ""
        const elementRef = randomString(16)
        elementReferences[elementRef] = { element, reference: documentRef }
        documentReferences[documentRef]?.references.push(elementRef)
        return elementRef
    }
    (globalThis as any)["__element_getElementsByClassName"] = (ref: string, className: string) => {
        const documentRef = elementReferences[ref]?.reference ?? null
        if (!documentRef) return []
        const elements = elementReferences[ref]?.element.getElementsByClassName(className)
        let elementRefs = [] as string[]
        for (const element of elements) {
            const elementRef = randomString(16)
            elementReferences[elementRef] = { element, reference: documentRef }
            documentReferences[documentRef]?.references.push(elementRef)
            elementRefs.push(elementRef)
        }
        return elementRefs
    }
    (globalThis as any)["__element_getElementsByTagName"] = (ref: string, tagName: string) => {
        const documentRef = elementReferences[ref]?.reference ?? null
        if (!documentRef) return []
        const elements = elementReferences[ref]?.element.getElementsByClassName(tagName)
        let elementRefs = [] as string[]
        for (const element of elements) {
            const elementRef = randomString(16)
            elementReferences[elementRef] = { element, reference: documentRef }
            documentReferences[documentRef]?.references.push(elementRef)
            elementRefs.push(elementRef)
        }
        return elementRefs
    }
    (globalThis as any)["__element_querySelector"] = (ref: string, selector: string) => {
        const documentRef = elementReferences[ref]?.reference ?? null
        const element = elementReferences[ref]?.element.querySelector(selector)
        if (!documentRef || !element) return ""
        const elementRef = randomString(16)
        elementReferences[elementRef] = { element, reference: documentRef }
        documentReferences[documentRef]?.references.push(elementRef)
        return elementRef
    }
    (globalThis as any)["__element_querySelectorAll"] = (ref: string, selector: string) => {
        const documentRef = elementReferences[ref]?.reference ?? null
        if (!documentRef) return []
        const elements = elementReferences[ref]?.element.querySelectorAll(selector)
        let elementRefs = [] as string[]
        for (const element of elements) {
            const elementRef = randomString(16)
            elementReferences[elementRef] = { element, reference: documentRef }
            documentReferences[documentRef]?.references.push(elementRef)
            elementRefs.push(elementRef)
        }
        return elementRefs
    }
    (globalThis as any)["__element_hasAttribute"] = (ref: string, name: string) => {
        return elementReferences[ref]?.element.hasAttribute(name) ?? false
    }
    (globalThis as any)["__element_hasAttributes"] = (ref: string) => {
        return elementReferences[ref]?.element.hasAttributes()
    }
    (globalThis as any)["__element_matches"] = (ref: string, selector: string) => {
        return elementReferences[ref]?.element.matches(selector) ?? false
    }
    (globalThis as any)["__element_innerText"] = (ref: string) => {
        return elementReferences[ref]?.element.textContent ?? ""
    }
    (globalThis as any)["__element_outerText"] = (ref: string) => {
        return elementReferences[ref]?.element.textContent ?? ""
    }
    (globalThis as any)["__element_style"] = (ref: string) => {
        return elementReferences[ref]?.element.getAttribute("style") ?? ""
    }
    (globalThis as any)["__element_title"] = (ref: string) => {
        return elementReferences[ref]?.element.getAttribute("title") ?? ""
    }
}
{
    (globalThis as any)["getSettingsValue"] = (id: string) => { return null }
    (globalThis as any)["getStorageValue"] = (id: string) => { return null }
    (globalThis as any)["setStorageValue"] = (id: string, value: string) => {}
    (globalThis as any)["getKeychainValue"] = (id: string) => { return null }
    (globalThis as any)["setKeychainValue"] = (id: string, value: string) => {}
}
{
    type SoshikiResponse = {
        data: string,
        status: number,
        statusText: string,
        headers: {[key: string]: string}
    }
    (globalThis as any)["__fetch__"] = (url: string, options: { body?: string, headers?: {[key: string]: string}, method?: string }, resolve: (value: SoshikiResponse) => void, reject: (reason?: any) => void) => {
        fetch(url, { ...options }).then(async res => {
            let headers: {[key: string]: string} = {}
            for (const header of res.headers) {
                headers[header[0]] = header[1]
            }
            resolve({
                data: await res.text(),
                status: res.status,
                statusText: res.statusText,
                headers: headers
            })
        }).catch(reject)
    }
}
const database = await Database.connect()

const sources = await fetch("https://phiefferj24.github.io/soshiki-sources/sources.soshikisources").then(res => res.json())

const sourceFiles = {
    text: await Promise.all(
        sources.text.map(async (source: {path: string}) => {
            return await fetch("https://phiefferj24.github.io/soshiki-sources/" + source.path).then(async res => {
                const entries = new Zip(await res.buffer()).getEntries()
                const manifest = entries.find(val => val.name === "manifest.json")?.getData().toString("utf8")
                if (manifest) {
                    const id = JSON.parse(manifest).id
                    const script = entries.find(val => val.name === "source.js")?.getData().toString("utf8")
                    if (id && script) {
                        return [id, script]
                    }
                }
                return null
            }).then(arr => arr?.filter(item => item !== null) ?? [])
        }) 
    ) as [string, string],
    image: await Promise.all(
        sources.image.map(async (source: {path: string}) => {
            return await fetch("https://phiefferj24.github.io/soshiki-sources/" + source.path).then(async res => {
                const entries = new Zip(await res.buffer()).getEntries()
                const manifest = entries.find(val => val.name === "manifest.json")?.getData().toString("utf8")
                if (manifest) {
                    const id = JSON.parse(manifest).id
                    const script = entries.find(val => val.name === "source.js")?.getData().toString("utf8")
                    if (id && script) {
                        return [id, script]
                    }
                }
                return null
            }).then(arr => arr?.filter(item => item !== null) ?? [])
        }) 
    ) as [string, string],
    video: await Promise.all(
        sources.video.map(async (source: {path: string}) => {
            return await fetch("https://phiefferj24.github.io/soshiki-sources/" + source.path).then(async res => {
                const entries = new Zip(await res.buffer()).getEntries()
                const manifest = entries.find(val => val.name === "manifest.json")?.getData().toString("utf8")
                if (manifest) {
                    const id = JSON.parse(manifest).id
                    const script = entries.find(val => val.name === "source.js")?.getData().toString("utf8")
                    if (id && script) {
                        return [id, script]
                    }
                }
                return null
            }).then(arr => arr?.filter(item => item !== null) ?? [])
        }) 
    ) as [string, string]
}

let users = await database.users.find().toArray() as any as DatabaseUser[]

for (const source of sourceFiles.text) {
    sourceEval(source[0], source[1])
    listen(MediaType.TEXT, source[0])
}
for (const source of sourceFiles.image) {
    sourceEval(source[0], source[1])
    listen(MediaType.IMAGE, source[0])
}
for (const source of sourceFiles.video) {
    sourceEval(source[0], source[1])
    listen(MediaType.VIDEO, source[0])
}

async function listen(mediaType: MediaType, source: string): Promise<void> {
    const sourceObj = new (globalThis as any)[`__${source}__`].default()

    while (true) {
        users = await database.users.find().toArray() as any as DatabaseUser[]
        console.log(`${users.length} users found.`)
        let entries: { id: string, users: Device[] }[] = []
        for (const user of users) {
            for (const item of (user.libraries as any)[mediaType.toLowerCase()].all.ids) {
                const entryIndex = entries.findIndex(entry => entry.id === item)
                if (entryIndex === -1) {
                    entries.push({ id: item, users: user.devices ?? [] })
                } else {
                    entries[entryIndex]!.users = [...entries[entryIndex]!.users, ...(user.devices ?? [])]
                }
            }
        }
        const sourceEntries = await database.aggregateDatabaseEntries([{ $match: { _id: { $in: entries.map(entry => MUUID.from(entry.id)) } } }], mediaType).then(dbEntries => {
            return dbEntries.map(dbEntry => ({ 
                entry: dbEntry, 
                users: (entries.find(entry => entry.id === dbEntry._id.toString())?.users ?? [] ).filter(device => (device.notifications as any)[mediaType.toLowerCase()].some((notification: UserNotification) => notification.id === dbEntry._id.toString() && notification.source === source) ?? false)
            })).filter(entry => entry.users.length > 0)
        })
        console.log(`${entries.length} entries found.`)

        let index = 0
        await new Promise(async (resolve) => {
            const intervalId = setInterval(async () => {
                const item = sourceEntries[index]
                if (typeof item === 'undefined') {
                    return
                }
                const dbSource = item.entry.platforms.find(platform => platform.id === "soshiki")?.sources.find(src => src.id === source)
                if (typeof dbSource === 'undefined') return
                const itemId = dbSource.entryId
                const latestId = dbSource.latestId

                let items: string[]
                if (mediaType === MediaType.VIDEO) {
                    items = await sourceObj.getEpisodes(itemId).then((episodes: {id: string}[]) => episodes.map(episode => episode.id))
                } else {
                    items = await sourceObj.getChapters(itemId).then((chapters: {id: string}[]) => chapters.map(chapter => chapter.id))
                }

                if (items.length > 0 && items[0] !== latestId) {
                    const newItemCount = typeof latestId === 'string' ? items.indexOf(latestId) : items.length
                    if (newItemCount > 0) {
                        let entry = item.entry
                        entry.platforms.find(platform => platform.id === "soshiki")!.sources.find(src => src.id === source)!.latestId = items[0]
                        await Promise.all(item.users.map(async userDevice => {
                            const userIndex = users.findIndex(user => user.devices?.some(device => device.id === userDevice.id) ?? false)
                            if (userIndex !== -1) {
                                const deviceIndex = users[userIndex].devices?.findIndex(device => device.id === userDevice.id) ?? -1
                                if (deviceIndex !== -1) {
                                    users[userIndex].devices![deviceIndex].badge += newItemCount
                                    await database.setUser(users[userIndex]) 
                                }
                            }
                            await postNotification({
                                device: userDevice.id,
                                source: source,
                                sourceId: itemId,
                                id: item.entry._id.toString(),
                                mediaType: mediaType,
                                count: userDevice.badge,
                                title: dbSource.name,
                                subtitle: `${newItemCount} new ${mediaType === MediaType.VIDEO ? "episode" : "chapter"}${newItemCount > 1 ? "s" : ""}`,
                                body: `${item.entry.title} on ${dbSource.name} has ${newItemCount} new ${mediaType === MediaType.VIDEO ? "episode" : "chapter"}${newItemCount > 1 ? "s" : ""}.` 
                            })
                        }))
                        await database.setDatabaseEntry(mediaType, entry)
                    }

                }
                index = (index + 1) % sourceEntries.length
                if (index === 0) {
                    clearInterval(intervalId)
                    resolve(undefined)
                }
            }, MIN_REQUEST_INTERVAL)
        })
    }
}

let apnToken = ""
function refreshApnToken() {
    apnToken = jwt.sign({
        iss: process.env.APPLE_ISSUER,
        iat: new Date().getTime() / 1000
    }, readFileSync('AuthKey_3DZFV5QRJW.p8'), {
        keyid: process.env.APPLE_KEYID,
        algorithm: 'ES256'
    })
    writeFileSync("apn.token", apnToken)
}
setInterval(refreshApnToken, 1000 * 60  * 30)
function startupApnToken() {
    if (existsSync("apn.token")) {
        try {
            const token = readFileSync("apn.token").toString('utf8').trim()
            const key = jwt.verify(token, readFileSync('AuthKey_3DZFV5QRJW.p8'))
            if ((key as any).iat >= new Date().getTime() / 1000 - 60 * 30) {
                apnToken = token
                return
            }
        } catch {}
    }
    refreshApnToken()
}
startupApnToken()

const notificationClient = http2.connect('https://api.sandbox.push.apple.com:443')
type PostNotificationOptions = {
    device: string, 
    source: string,
    sourceId: string,
    id: string,
    mediaType: string,
    count: number,
    title: string, 
    subtitle?: string, 
    body?: string
}
async function postNotification(options: PostNotificationOptions) {
    console.log(options)
    const reqBody = Buffer.from(JSON.stringify({
        aps: {
            alert: {
                title: options.title,
                subtitle: options.subtitle,
                body: options.body
            },
            badge: options.count,
        },
        platform: 'soshiki',
        source: options.source,
        sourceId: options.sourceId,
        id: options.id,
        mediaType: options.mediaType
    }))
    const req = notificationClient.request({
        [http2.constants.HTTP2_HEADER_PATH]: `/3/device/${options.device}`,
        [http2.constants.HTTP2_HEADER_METHOD]: `POST`,
        [http2.constants.HTTP2_HEADER_SCHEME]: `https`,
        "Authorization": `bearer ${apnToken}`,
        "apns-push-type": "alert",
        "apns-topic": "com.jimphieffer.Soshiki",
        "Content-Type": "application/json",
        "Content-Length": reqBody.length
    })
    req.setEncoding('utf8')
    req.write(reqBody)
    req.end()
}








// const nonUniqueVideo = users.map(user => {
//     return user.libraries.video.all.ids
// }).flat()
// console.log(`${nonUniqueVideo.length} non-unique video entries.`)
// const uniqueVideo = nonUniqueVideo.filter((value, index) => nonUniqueVideo.indexOf(value) === index)
// console.log(`${uniqueVideo.length} unique video entries.`)