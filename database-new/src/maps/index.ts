import { Entry } from 'soshiki-types'

export * from './text'
export * from './image'
export * from './video'

export type MalSyncLink = {
    identifier: string,
    page: string,
    title: string,
    url: string
}

export type Mapper = (malSyncLink: MalSyncLink) => Entry.Source | null