import { Page } from "./types/Page";

/**
  * @param allItems list of items to be paginated
  * @param page requested page number
  * @param limit number of items per page
  */
export async function _paginate(allItems: any[], page: number, limit: number): Promise<Page> {   
    const startIndex = (page -1) * limit;
    const endIndex = page * limit;
    const items: any[] = allItems.slice(startIndex, endIndex);
    let previous, next;
    if(startIndex > 0) {
        previous = page - 1;
    }
    if(endIndex < allItems.length) {
        next = page + 1;
    }
    return {previous, next, items};
}
