import { Page } from "./types/Page";

/**
  * @param allItems list of items to be paginated
  * @param page requested page number
  * @param limit number of items per page
  */
export async function _paginate(allItems: any[], page: number, limit: number): Promise<Page<any>> {   
    const startIndex = (page -1) * limit;
    const endIndex = page * limit;
    const items: any[] = allItems.slice(startIndex, endIndex);
    const totalPageCount = Math.ceil(allItems.length/limit);
    const totalItemsCount = allItems.length;
    let previous, next;
    if(startIndex > 0) {
        previous = page - 1;
    }
    if(endIndex < totalItemsCount) {
        next = page + 1;
    }
    return {totalItemsCount, totalPageCount, previous, next, items};
}

export function _validatePaginationInput(page: number, limit: number): boolean {
    let isValid = false;
    if(page > 0 && limit > 0)
        isValid = true;
    return isValid;
}