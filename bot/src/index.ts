import { Meinu } from "meinu"
import { config } from "dotenv"
import testflight from "./cmds/testflight.js"
import { Database } from "soshiki-database-new"
import sourcelist from "./cmds/sourcelist.js"
import trackerlist from "./cmds/trackerlist.js"

config()

export let database: Database

export class SoshikiBot extends Meinu {
    static async start(): Promise<SoshikiBot> {
        const instance = new SoshikiBot({
            color: '#d84498',
            owners: ['531136800694075413'],
            specificGuildId: '1001523245691969590',
            name: 'Soshiki',
            guildCommands: [testflight, sourcelist, trackerlist]
        })
        await instance.init(process.env.TOKEN)
        database = await Database.connect()
        return instance
    }
}

SoshikiBot.start()