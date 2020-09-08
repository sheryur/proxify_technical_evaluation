export enum Statuses {
    NEW = 'NEW',
    PROCESSING = 'PROCESSING',
    DONE = 'DONE',
    ERROR = 'ERROR',
}

export interface DBItem {
    id: number;
    url: string;
    status: Statuses;
    http_code: number | null;
}
