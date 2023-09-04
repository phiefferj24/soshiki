// See https://kit.svelte.dev/docs/types#app

import type { Database } from "../../database-new/src";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: Database
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
