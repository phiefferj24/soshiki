import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, Command, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "meinu";
import { database } from "../index.js";
import jwt from "jsonwebtoken"
import { default as fetch } from "node-fetch"
import { readFileSync } from "fs"
import * as apple from "apple-connect"

const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

export default new Command({
    type: ApplicationCommandType.ChatInput,
    ownersOnly: false,
    name: "testflight_alpha",
    description: "Sends the TestFlight Alpha invite message"
}).addHandler('button', async (bot, int) => {
    if (int.customId === 'testflight_alpha-inviteButton') {
        const tfBetaUser = await database.getTestflightUser(int.user.id, undefined)
        if (tfBetaUser === null) {
            return int.reply({
                content: "You need to be in the beta TestFlight group first before you can join the alpha.",
                ephemeral: true
            })
        }
        const tfUser = await database.getTestflightAlphaUser(int.user.id, undefined)
        const token = jwt.sign({
            iss: process.env.TESTFLIGHT_ISSUER,
            iat: new Date().getTime() / 1000,
            exp: new Date().getTime() / 1000 + 300,
            aud: 'appstoreconnect-v1'
        }, readFileSync('AuthKey_N847R8TYXC.p8'), {
            keyid: process.env.TESTFLIGHT_KEYID,
            algorithm: 'ES256'
        })
        if (tfUser === null) {
            const response = await fetch(`https://api.appstoreconnect.apple.com/v1/betaGroups/${process.env.TESTFLIGHT_ALPHA_GROUP}/relationships/betaTesters`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: [
                        {
                            id: tfBetaUser.id,
                            type: 'betaTesters'
                        }
                    ]
                })
            }).catch(error => {
                console.error(error)
                return null
            })
            if (response?.status !== 204) {
                return int.reply({
                    content: "An error occurred. Try again, and if that fails, ping JimIsWayTooEpic.",
                    ephemeral: true
                })
            }
            console.log(JSON.stringify(response, null, 2))
            await database.addTestflightAlphaUser(int.user.id, tfBetaUser.email, tfBetaUser.id)
            return int.reply({
                content: "Added! New builds should appear in your app.",
                ephemeral: true
            })
        } else {
            return int.reply({
                content: "You were already invited. Click the button below to remove yourself from the alpha group.",
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder({
                            label: "Remove Me",
                            customId: "testflight_alpha-removeButton",
                            style: ButtonStyle.Primary
                        })
                    )
                ],
                ephemeral: true
            })
        }
    } else {
        const tfUser = await database.getTestflightAlphaUser(int.user.id, undefined)
        const token = jwt.sign({
            iss: process.env.TESTFLIGHT_ISSUER,
            iat: new Date().getTime() / 1000,
            exp: new Date().getTime() / 1000 + 300,
            aud: 'appstoreconnect-v1'
        }, readFileSync('AuthKey_N847R8TYXC.p8'), {
            keyid: process.env.TESTFLIGHT_KEYID,
            algorithm: 'ES256'
        })
        if (tfUser !== null) {
            const response = await fetch(`https://api.appstoreconnect.apple.com/v1/betaGroups/${process.env.TESTFLIGHT_ALPHA_GROUP}/relationships/betaTesters`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: [
                        {
                            id: tfUser.id,
                            type: 'betaTesters'
                        }
                    ]
                })
            }).catch(error => {
                console.error(error)
                return null
            })
            await database.removeTestflightAlphaUser(int.user.id, undefined)
            return int.reply({
                content: "Removed from the alpha TestFlight group.",
                ephemeral: true
            })
        } else {
            return int.reply({
                content: "An error occurred. Try again, and if that fails, ping JimIsWayTooEpic.",
                ephemeral: true
            })
        }
    }
}).addHandler('chatInput', async (bot, int) => {
    await int.deferReply()
    await int.channel?.send({
        embeds: [
            new EmbedBuilder({
                title: "Soshiki Alpha",
                description: "Press the button below to invite yourself to Soshiki's Alpha TestFlight group.\n\n**Note that this group contains only the alpha app builds and should not be used if you are looking for a stable experience.**"
            })
        ],
        components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder({
                    label: "Invite Me",
                    customId: "testflight_alpha-inviteButton",
                    style: ButtonStyle.Primary
                })
            )
        ]
    })
    return int.deleteReply()
})