import type { Tracker, Medium, TrackerRequest, TrackerResponse } from "soshiki-types";

export default class LocalTracker implements Tracker {
    async updateHistoryItem(medium: Medium, id: string, request: TrackerRequest): Promise<void> {
        let history = JSON.parse(window.localStorage.getItem("history") ?? "{}") as {[medium: string]: TrackerResponse[]};
        let partial = history[medium] ?? [];
        if (partial[id]) {
                partial[id].chapter = request.chapter ?? partial[id].chapter;
                partial[id].page = request.page ?? partial[id].page;
                partial[id].status = request.status ?? partial[id].status;
                partial[id].timestamp = request.timestamp ?? partial[id].timestamp;
                partial[id].episode = request.episode ?? partial[id].episode;
                partial[id].rating = request.rating ?? partial[id].rating;
        } else {
                partial[id] = request;
        }
        history[medium] = partial;
        window.localStorage.setItem("history", JSON.stringify(history));
    }

    async getHistoryItem(medium: Medium, id: string): Promise<TrackerResponse> {
        return (JSON.parse(window.localStorage.getItem("history") ?? "{}") as {[medium: string]: TrackerResponse[]})[medium].find(item => item.id === id) ?? {};
    }

    async removeHistoryItem(medium: Medium, id: string): Promise<void> {
        let history = JSON.parse(window.localStorage.getItem("history") ?? "{}") as {[medium: string]: TrackerResponse[]};
        let partial = history[medium] ?? [];
        let index = partial.findIndex(item => item.id === id);
        if (index !== -1) {
            delete partial[index];
            history[medium] = partial;
            window.localStorage.setItem("history", JSON.stringify(history));
        }
    }

    async getHistory(medium: Medium): Promise<TrackerResponse[]> {
        return (JSON.parse(window.localStorage.getItem("history") ?? "{}") as {[medium: string]: TrackerResponse[]})[medium] ?? [];
    }

    async addToLibrary(medium: Medium, id: string, category: string = ""): Promise<void> {
        let library = JSON.parse(window.localStorage.getItem("library") ?? "{}") as {[medium: string]: {[category: string]: string[]}};
        let partial = library[medium] ?? {};
        if (!partial[category]) partial[category] = [];
        if (!partial[category].includes(id)) {
            partial[category].push(id);
            library[medium] = partial;
            window.localStorage.setItem("library", JSON.stringify(library));
        }
    }

    async removeFromLibrary(medium: Medium, id: string): Promise<void> {
        let library = JSON.parse(window.localStorage.getItem("library") ?? "{}") as {[medium: string]: {[category: string]: string[]}};
        let partial = library[medium] ?? {};
        for (let category of Object.keys(partial)) {
            if (partial[category].includes(id)) {
                partial[category].splice(partial[category].indexOf(id), 1);
                library[medium] = partial;
                window.localStorage.setItem("library", JSON.stringify(library));
            }
        }
    }

    async setLibraryCategory(medium: Medium, id: string, category: string): Promise<void> {
        let categories = JSON.parse(window.localStorage.getItem("categories") ?? "{}") as {[medium: string]: {[category: string]: string[]}};
        let partial = categories[medium] ?? {};
        if (!partial[category]) partial[category] = [];
        if (!partial[category].includes(id)) {
            partial[category].push(id);
        }
        categories[medium] = partial;
        window.localStorage.setItem("categories", JSON.stringify(categories));
    }

    async addLibraryCategory(medium: Medium, category: string): Promise<void> {
        let categories = JSON.parse(window.localStorage.getItem("categories") ?? "{}") as {[medium: string]: {[category: string]: string[]}};
        let partial = categories[medium] ?? {};
        if (!partial[category]) partial[category] = [];
        categories[medium] = partial;
        window.localStorage.setItem("categories", JSON.stringify(categories));
    }

    async removeLibraryCategory(medium: Medium, category: string): Promise<void> {
        let categories = JSON.parse(window.localStorage.getItem("categories") ?? "{}") as {[medium: string]: {[category: string]: string[]}};
        let partial = categories[medium] ?? {};
        if (partial[category]) delete partial[category];
        categories[medium] = partial;
        window.localStorage.setItem("categories", JSON.stringify(categories));
    }

    async getLibrary(medium: Medium): Promise<{[category: string]: string[]}> {
        return (JSON.parse(window.localStorage.getItem("library") ?? "{}") as {[medium: string]: {[category: string]: string[]}})[medium] ?? {};
    }
}