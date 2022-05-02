import { apiPromises, getIdentities, searchIdentities } from "./identities";
import { ApiPromiseMock } from "./mockData";

const testWsAddress = "//test-address.yeah";

// Mock the ApiPromise from polkadot
apiPromises[testWsAddress] = ApiPromiseMock;

describe("identities.ts", () => {

    it("should give correct identity entries in response", async () => {
        const entries = await getIdentities(testWsAddress, 1, 5);
        expect(Array.isArray(entries.items)).toBe(true);
        expect(entries.items.length).toBe(1);
        expect(entries.items[0].chain).toBe("Fake-ChainName");
        expect(entries.items[0].basicInfo.display).toBe("fake-name");
        expect(entries.items[0].basicInfo.address).toBe("fake-address");
        expect(entries.items[0].basicInfo.email).toBe("fake-email");
        expect(entries.items[0].basicInfo.legal).toBe("fake-legal");
        expect(entries.items[0].basicInfo.riot).toBe("fake-riot");
        expect(entries.items[0].basicInfo.twitter).toBe("fake-twitter");
        expect(entries.items[0].basicInfo.web).toBe("fake-web");
    });

    // TODO: add some more tests with more fake data

    it("should give correct previous and next pages", async () => {
        const entries = await getIdentities(testWsAddress, 1, 5);
        expect(entries.next).toBe(undefined);
        expect(entries.previous).toBe(undefined);
    });

    it("should throw TypeError since pagination details are invalid", async () => {
        try {
            await getIdentities(testWsAddress, -1, -5);
        } catch (error) {
            expect(error).toBeInstanceOf(TypeError);
            expect(error).toHaveProperty("message", "Please provide valid page number or limit");
        }
    });

    it("should search the queried identity and return the result in response", async () => {
        const entries = await searchIdentities(testWsAddress, "fake-name", 1, 5);
        expect(Array.isArray(entries.items)).toBe(true);
        expect(entries.items.length).toBe(1);
        expect(entries.items[0].chain).toBe("Fake-ChainName");
        expect(entries.items[0].basicInfo.address).toBe("fake-address");
        console.log(entries.items[0]);
    });
});
