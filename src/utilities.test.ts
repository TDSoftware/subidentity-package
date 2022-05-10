import { apiPromises, isArchiveNode, getChainName } from "./utilities";
import { ApiPromiseMock } from "./mockData";

const testWsAddress = "//test-address.yeah";

// Mock the ApiPromise from polkadot
apiPromises[testWsAddress] = ApiPromiseMock;

describe("utilities.ts", () => {
    it("should return true since state for history block is available ", async () => {
        const archiveNode = await isArchiveNode(testWsAddress);
        expect(archiveNode).toBe(true);
    });

    it("should return the name of the substrate chain", async () => {
        const chainName = await getChainName(testWsAddress);
        expect(chainName).toBe("Fake-ChainName");
    });
});