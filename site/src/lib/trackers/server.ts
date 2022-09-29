import type { Tracker, Medium, TrackerRequest, TrackerResponse } from "soshiki-types";
import Cookie from "js-cookie";

export default class ServerTracker implements Tracker {
    async updateHistoryItem(medium: Medium, id: string, request: TrackerRequest): Promise<void> {
        await fetch(`https://api.soshiki.moe/history/${medium}/${id}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${Cookie.get("access")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request)
        });
    }

    async getHistoryItem(medium: Medium, id: string): Promise<TrackerResponse> {
        return await fetch(`https://api.soshiki.moe/history/${medium}/${id}`, {
            headers: { Authorization: `Bearer ${Cookie.get("access")}` }
        }).then(res => res.json()) as TrackerResponse ?? {};
    }

    async removeHistoryItem(medium: Medium, id: string): Promise<void> {
        await fetch(`https://api.soshiki.moe/history/${medium}/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${Cookie.get("access")}` }
        });
    }

    async getHistory(medium: Medium): Promise<TrackerResponse[]> {
        return await fetch(`https://api.soshiki.moe/history/${medium}`, {
            headers: { Authorization: `Bearer ${Cookie.get("access")}` }
        }).then(res => res.json()) as TrackerResponse[];
    }

    async addToLibrary(medium: Medium, id: string, category: string = ""): Promise<void> {
        await fetch(`https://api.soshiki.moe/library/${medium}/${id}`, {
            method: "PUT",
            headers: { 
                Authorization: `Bearer ${Cookie.get("access")}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ category })
        });
    }

    async removeFromLibrary(medium: Medium, id: string): Promise<void> {
        await fetch(`https://api.soshiki.moe/library/${medium}/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${Cookie.get("access")}` }
        });
    }

    async setLibraryCategory(medium: Medium, id: string, category?: string): Promise<void> {
        await fetch(`https://api.soshiki.moe/library/${medium}/${id}`, {
            method: "PATCH",
            headers: { 
                Authorization: `Bearer ${Cookie.get("access")}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ category: category ?? "" })
        });
    }

    async addLibraryCategory(medium: Medium, category: string): Promise<void> {
        await fetch(`https://api.soshiki.moe/library/${medium}/category/${category}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${Cookie.get("access")}` }
        });
    }

    async removeLibraryCategory(medium: Medium, category: string): Promise<void> {
        await fetch(`https://api.soshiki.moe/library/${medium}/category/${category}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${Cookie.get("access")}` }
        });
    }

    async getLibrary(medium: Medium): Promise<{[category: string]: string[]}> {
        return await fetch(`https://api.soshiki.moe/library/${medium}`, {
            headers: { Authorization: `Bearer ${Cookie.get("access")}` }
        }).then(res => res.json()) as {[category: string]: string[]};
    }
}