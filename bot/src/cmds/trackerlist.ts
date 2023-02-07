import { ApplicationCommandOptionType, ApplicationCommandType, Command, EmbedBuilder } from "meinu";

export default new Command({
    type: ApplicationCommandType.ChatInput,
    ownersOnly: true,
    name: "trackerlist",
    description: "Sends a tracker list embed",
    options: [
        {
            name: 'name',
            description: 'The name of the list',
            required: true,
            type: ApplicationCommandOptionType.String
        },
        {
            name: 'author',
            description: 'The author of the list',
            required: true,
            type: ApplicationCommandOptionType.String
        },
        {
            name: 'url',
            description: 'The url of the list',
            required: true,
            type: ApplicationCommandOptionType.String
        },
    ]
}).addHandler('chatInput', async (bot, int) => {
    await int.deferReply()
    const name = int.options.getString("name") 
    const author = int.options.getString("author") 
    const url = int.options.getString("url") 
    if (typeof name === 'string' && typeof author === 'string' && typeof url === 'string')
    await int.channel?.send({
        embeds: [
            new EmbedBuilder({
                title: name,
                fields: [
                    {
                        name: "Author",
                        value: author
                    },
                    {
                        name: "List URL",
                        value: `[${url}](${url})`
                    }
                ]
            })
        ]
    })
    return int.deleteReply()
})