export interface SearchQuery {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
}
