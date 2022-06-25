export interface Source {
    init(): Promise<void>;
    getSearchResults(query: string, page: number): Promise<PageResult>;
    getListing(name: string, page: number): Promise<PageResult>;
    getDetails(id: string): Promise<Details>;
    get
}