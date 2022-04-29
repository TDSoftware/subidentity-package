export interface Page<T> {
    totalPageCount: number | undefined;
    previous: number | undefined;
    next: number | undefined;
    items: T[];
}