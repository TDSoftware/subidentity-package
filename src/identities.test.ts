import { apiPromises, getIdentities } from "./identities";
import { ApiPromiseMock } from "./mockData";

const testWsAddress = "//test-address.yeah";

// Mock the ApiPromise from polkadot
apiPromises[testWsAddress] = ApiPromiseMock;

describe("identities.ts", () => {

    it("should give correct identity entries in response", async () => {
        const entries = await getIdentities(testWsAddress);
        expect(Array.isArray(entries)).toBe(true);
        expect(entries.length).toBe(1);
        expect(entries[0].chain).toBe("Fake-ChainName");
        expect(entries[0].basicInfo.display).toBe("fake-name");
    });

    // TODO: add some more tests with more fake data

});
