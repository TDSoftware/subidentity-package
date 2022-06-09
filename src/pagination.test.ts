import { Page } from "./types/Page";
import { _paginate, _validatePaginationInput } from "./pagination";


describe("pagination.ts", () => {

    it("should give correct previous and next pages for first page", async () => {
        const items = [1, 2, 3, 4, 5, 6, 7];
        const pageNumber = 1;
        const limit = 3;
        const page = await _paginate(items, pageNumber, limit);
        expect(page.totalItemsCount).toBe(7);
        expect(page.previous).toBe(undefined);
        expect(page.next).toBe(2);
        expect(page.totalPageCount).toBe(3);
        expect(page.items.length).toBe(limit);
    });

    it("should give correct previous and next pages for middle page", async () => {
        const items = [1, 2, 3, 4, 5, 6, 7];
        const pageNumber = 2;
        const limit = 3;
        const page = await _paginate(items, pageNumber, limit);
        expect(page.totalItemsCount).toBe(7);
        expect(page.previous).toBe(1);
        expect(page.next).toBe(3);
        expect(page.totalPageCount).toBe(3);
        expect(page.items.length).toBe(limit);
    });

    it("should give correct previous and next pages for last page", async () => {
        const items = [1, 2, 3, 4, 5, 6, 7];
        const pageNumber = 3;
        const limit = 3;
        const page = await _paginate(items, pageNumber, limit);
        expect(page.totalItemsCount).toBe(7);
        expect(page.previous).toBe(2);
        expect(page.next).toBe(undefined);
        expect(page.totalPageCount).toBe(3);
        expect(page.items.length).toBe(1);
    });

    it("Validation of pagination should be false, as pagination details are invalid", async () => {
        let isValid = _validatePaginationInput(-1, -5);
        expect(isValid).toBeFalsy();
        isValid = _validatePaginationInput(1, -5);
        expect(isValid).toBeFalsy();
        isValid = _validatePaginationInput(-1, 5);
        expect(isValid).toBeFalsy();
    });

    it("Validation of pagination should be true, as pagination details are valid", async () => {
        const isValid = _validatePaginationInput(1, 5);
        expect(isValid).toBeTruthy();
    });
});