import { Meinu } from "meinu"
import { config } from "dotenv"
import testflight from "./cmds/testflight.js"
import { Database } from "soshiki-database-new"
import sourcelist from "./cmds/sourcelist.js"
import trackerlist from "./cmds/trackerlist.js"
import testflight_alpha from "./cmds/testflight_alpha.js"

config()

export let database: Database

export class SoshikiBot extends Meinu {
    static async start(): Promise<SoshikiBot> {
        database = await Database.connect()
        return await new SoshikiBot({
            color: '#d84498',
            owners: ['531136800694075413'],
            name: 'Soshiki'
        }).register_commands([testflight, testflight_alpha, sourcelist, trackerlist]).init(process.env.TOKEN)
    }
}

SoshikiBot.start()