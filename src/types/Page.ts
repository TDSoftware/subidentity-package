export interface Page<T> {
    totalItemsCount?: number;  
    totalPageCount?: number;
    previous?: number;
    next?: number;
    items: T[];
}