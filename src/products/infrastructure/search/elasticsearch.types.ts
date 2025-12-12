export interface ElasticsearchMultiMatchQuery {
    multi_match: {
        query: string;
        fields: string[];
        fuzziness: string;
    };
}

export interface ElasticsearchMatchAllQuery {
    match_all: Record<string, never>;
}

export interface ElasticsearchTermQuery {
    term: {
        [field: string]: string;
    };
}

export interface ElasticsearchRangeQuery {
    range: {
        [field: string]: {
            gte?: number;
            lte?: number;
        };
    };
}

export type ElasticsearchMustQuery = ElasticsearchMultiMatchQuery | ElasticsearchMatchAllQuery;
export type ElasticsearchFilterQuery = ElasticsearchTermQuery | ElasticsearchRangeQuery;
