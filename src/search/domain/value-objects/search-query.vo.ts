export interface SearchQuery {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    subcategory?: string;
    limit?: number;
    offset?: number;
    sort?: 'price' | 'name' | 'stock' | 'createdAt' | 'relevance';
    order?: 'asc' | 'desc';
}
