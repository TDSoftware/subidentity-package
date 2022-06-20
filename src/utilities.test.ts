import { apiPromises, isArchiveNode, getChainName, getTokenDetails, connectToWsProvider } from "./utilities";
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

    it("should return the token details of the substrate chain", async () => {
        const token = await getTokenDetails(testWsAddress);
        expect(token.symbol).toBe("KSM");
        expect(token.decimals).toBe(12);
    });

    it("should return the correct apiPromise mock for the address", async () => {
        const apiPromise = await connectToWsProvider(testWsAddress);
        expect(apiPromise).toBe(ApiPromiseMock);
    });

    it("should throw Error since address is not correct or mocked", async () => {
        try {
            await connectToWsProvider("another-fake-address");
            expect(true).toBe(false);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty("message", "Endpoint should start with 'ws://', received 'another-fake-address'");
        }
    });

});