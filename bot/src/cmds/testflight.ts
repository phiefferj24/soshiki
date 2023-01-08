import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, Command, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "meinu";
import { database } from "../index.js";
import jwt from "jsonwebtoken"
import { readFileSync } from "fs"

const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

export default new Command({
    type: ApplicationCommandType.ChatInput,
    ownersOnly: true,
    name: "testflight",
    description: "Sends the TestFlight invite message"
}).addHandler('button', async (bot, int) => {
    if (int.customId === 'testflight-inviteButton') {
        return int.showModal(
            new ModalBuilder({
                title: "Invite",
                customId: "testflight-inviteModal",
                components: [
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder({
                            label: "Email",
                            customId: "testflight-emailTextInput",
                            style: TextInputStyle.Short
                        })
                    )
                ]
            })
        )
    } else {
        const tfUser = await database.getTestflightUser(int.user.id, undefined)
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
            await fetch(`https://api.appstoreconnect.apple.com/v1/betaTesters/${tfUser.id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            }).catch(error => {
                console.error(error)
                return null
            })
            await database.removeTestflightUser(int.user.id, undefined)
            return int.reply({
                content: "Removed from the TestFlight.",
                ephemeral: true
            })
        } else {
            return int.reply({
                content: "An error occurred. Try again, and if that fails, ping JimIsWayTooEpic.",
                ephemeral: true
            })
        }
    }
}).addHandler('modalSubmit', async (bot, int) => {
    const email = int.fields.getTextInputValue("testflight-emailTextInput").match(EMAIL_REGEX)?.[0]
    if (typeof email === 'undefined') {
        return int.reply({
            content: "Invalid email.",
            ephemeral: true
        })
    }
    const tfUser = await database.getTestflightUser(int.user.id, undefined)
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
        const response = await fetch("https://api.appstoreconnect.apple.com/v1/betaTesters", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        email: email
                    },
                    relationships: {
                        betaGroups: {
                            data: [
                                {
                                    id: process.env.TESTFLIGHT_BETA_GROUP,
                                    type: 'betaGroups'
                                }
                            ]
                        }
                    },
                    type: 'betaTesters'
                }
            })
        }).then(response => response.json()).catch(error => {
            console.error(error)
            return null
        })
        if (response === null) {
            return int.reply({
                content: "An error occurred. Try again, and if that fails, ping JimIsWayTooEpic.",
                ephemeral: true
            })
        }
        await database.addTestflightUser(int.user.id, email, response.data.id)
        return int.reply({
            content: "Invited! Check your email.",
            ephemeral: true
        })
    } else {
        return int.reply({
            content: "You were already invited. Click the button below to remove yourself from the TestFlight.",
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder({
                        label: "Remove Me",
                        customId: "testflight-removeButton",
                        style: ButtonStyle.Primary
                    })
                )
            ],
            ephemeral: true
        })
    }
}).addHandler('chatInput', async (bot, int) => {
    await int.deferReply()
    await int.channel?.send({
        embeds: [
            new EmbedBuilder({
                title: "Soshiki Beta",
                description: "Press the button below to invite yourself to Soshiki's TestFlight."
            })
        ],
        components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder({
                    label: "Invite Me",
                    customId: "testflight-inviteButton",
                    style: ButtonStyle.Primary
                })
            )
        ]
    })
    return int.deleteReply()
})