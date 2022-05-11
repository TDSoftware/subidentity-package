import { apiPromises, isArchiveNode, getChainName } from "./utilities";
import { ApiPromiseMock, ApiPromiseMockWOIdentityPallet } from "./mockData";

const testWsAddress = "//test-address.yeah";
const testWSAddressWOIdentityPallet = "//test-address.yeah.WOIdentityPallet";

// Mock the ApiPromise from polkadot
apiPromises[testWsAddress] = ApiPromiseMock;
apiPromises[testWSAddressWOIdentityPallet] = ApiPromiseMockWOIdentityPallet;

describe("utilities.ts", () => {
    it("should return true since state for history block is available ", async () => {
        const archiveNode = await isArchiveNode(testWsAddress);
        expect(archiveNode).toBe(true);
    });

    it("should return false since state for history block is not available ", async () => {
        const archiveNode = await isArchiveNode(testWSAddressWOIdentityPallet);
        expect(archiveNode).toBe(false);
    });

    it("should return the name of the substrate chain", async () => {
        const chainName = await getChainName(testWsAddress);
        expect(chainName).toBe("Fake-ChainName");
    });
});