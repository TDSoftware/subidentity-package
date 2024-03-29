import { getIdentities, getIdentity, implementsIdentityPallet, searchIdentities, getAccountBalance, getCompleteIdentities } from "./identities";
import { apiPromises } from "./utilities";

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
        expect(entries.totalItemsCount).toBe(1);
        expect(entries.totalPageCount).toBe(1);
        expect(entries.items.length).toBe(1);
    });

    it("should throw TypeError since pagination details are invalid", async () => {
        //to make sure, that the error was thrown
        expect.assertions(2);
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

    it("should throw an exception since the search key has special charaters", async () => {
        //to make sure, that the error was thrown
        expect.assertions(2);
        try {
            await searchIdentities(testWsAddress, "*?", 1, 5);
        } catch (error) {
            expect(error).toBeInstanceOf(TypeError);
            expect(error).toHaveProperty("message", "Your search key may contain special characters. Please try escaping them for search. e.g., /*");
        }
    });

    it("should return true for implementing identity pallet", async () => {
        const isImplementingIdentityPallet = await implementsIdentityPallet(testWsAddress);
        expect(isImplementingIdentityPallet).toBeTruthy();
    });

    it("should return false for implementing identity pallet", async () => {
        const isImplementingIdentityPallet = await implementsIdentityPallet(testWSAddressWOIdentityPallet);
        expect(isImplementingIdentityPallet).toBeFalsy();
    });

    it("should fetch requested identity", async () => {
        const entry = await getIdentity(testWsAddress, "fake-address");
        expect(entry.chain).toBe("Fake-ChainName");
        expect(entry.basicInfo.address).toBe("fake-address");
        expect(entry.basicInfo.display).toBe("fake-name");
        expect(entry.basicInfo.riot).toBe("fake-riot");
        expect(entry.basicInfo.twitter).toBe("fake-twitter");
        expect(entry.basicInfo.legal).toBe("fake-legal");
        expect(entry.basicInfo.web).toBe("fake-web");
        expect(entry.basicInfo.email).toBe("fake-email");
        expect(entry.judgements).toBeDefined();
        expect(entry.judgements!.length).toBe(2);
        expect(entry.judgements![0]).toBe("Reasonable");
        expect(entry.judgements![1]).toBe("Known Good");
        expect(entry.balance).toBeDefined();
        expect(entry.balance!.total).toBe("114.02");
        expect(entry.balance!.symbol).toBe("KSM");
    });

    it("should fetch all identities", async () => {
        const entry = await getCompleteIdentities(testWsAddress);
        expect(entry.length).toBe(1);
        expect(entry[0].chain).toBeUndefined();
        expect(entry[0].basicInfo.address).toBe("fake-address");
        expect(entry[0].basicInfo.display).toBe("fake-name");
        expect(entry[0].basicInfo.riot).toBe("fake-riot");
        expect(entry[0].basicInfo.twitter).toBe("fake-twitter");
        expect(entry[0].basicInfo.legal).toBe("fake-legal");
        expect(entry[0].basicInfo.web).toBe("fake-web");
        expect(entry[0].basicInfo.email).toBe("fake-email");
        expect(entry[0].judgements).toBeDefined();
        expect(entry[0].judgements!.length).toBe(2);
        expect(entry[0].judgements![0]).toBe("Reasonable");
        expect(entry[0].judgements![1]).toBe("Known Good");
        expect(entry[0].balance).toBeUndefined();
    });

    it("should throw error, since identity pallet is not implemented", async () => {
        //to make sure, that the error was thrown
        expect.assertions(2);
        try {
            await getCompleteIdentities(testWSAddressWOIdentityPallet);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty("message", "Can not fetch Identities for a chain that does not implement the identity pallet.");
        }
    });


    it("should fetch requested balance", async () => {
        const entry = await getAccountBalance(testWsAddress, "fake-address");
        expect(entry.total).toBe("114.02");
        expect(entry.symbol).toBe("KSM");
    });

    it("should throw Error since there is no balance for the account with this address", async () => {
        //to make sure, that the error was thrown
        expect.assertions(2);
        try {
            await getAccountBalance(testWsAddress, "another-fake-address");
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty("message", "Unable to find the balance for the provided address.");
        }
    });

});
