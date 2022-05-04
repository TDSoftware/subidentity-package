
import { apiPromises, getIdentities, implementsIdentityPallet, searchIdentities } from "./identities";
import { ApiPromiseMock, ApiPromiseMockWOIdentityPallet } from "./mockData";

const testWsAddress = "//test-address.yeah";
const testWSAddressWOIdentityPallet = "//test-address.yeah.WOIdentityPallet";

// Mock the ApiPromise from polkadot
apiPromises[testWsAddress] = ApiPromiseMock;
apiPromises[testWSAddressWOIdentityPallet] = ApiPromiseMockWOIdentityPallet;

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
        const entries = await searchIdentities(testWsAddress, "ake-nam", 1, 5);
        expect(Array.isArray(entries.items)).toBe(true);
        expect(entries.items.length).toBe(1);
        expect(entries.items[0].chain).toBe("Fake-ChainName");
        expect(entries.items[0].basicInfo.address).toBe("fake-address");
        expect(entries.items[0].basicInfo.display).toBe("fake-name");
        expect(entries.items[0].basicInfo.riot).toBe("fake-riot");
        expect(entries.items[0].basicInfo.twitter).toBe("fake-twitter");
        expect(entries.items[0].basicInfo.legal).toBe("fake-legal");
        expect(entries.items[0].basicInfo.web).toBe("fake-web");
        expect(entries.items[0].basicInfo.email).toBe("fake-email");
    });

    it("should search the queried identity and return empty result as a match is not found", async () => {
        const entries = await searchIdentities(testWsAddress, "faky-nam", 1, 5);
        expect(Array.isArray(entries.items)).toBe(true);
        expect(entries.items.length).toBe(0);
    });

    it("should return true for implementing identity pallet", async () => {
        const isImplementingIdentityPallet = await implementsIdentityPallet(testWsAddress);
        expect(isImplementingIdentityPallet).toBeTruthy();
    });

    it("should return false for implementing identity pallet", async () => {
        const isImplementingIdentityPallet = await implementsIdentityPallet(testWSAddressWOIdentityPallet);
        expect(isImplementingIdentityPallet).toBeFalsy();
    });

});
