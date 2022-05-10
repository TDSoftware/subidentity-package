import { ApiPromise } from "@polkadot/api";

// This is a mock for the expected ApiPromise response
// Can be used in tests, and can be extended
export const ApiPromiseMock = {
    rpc: {
        system: {
            chain: () => "Fake-ChainName" as unknown,
            properties: () => {
                return new Promise((resolve: (param: unknown) => void) => {
                    resolve({
                        toHuman(): any {
                            return {
                                tokenDecimals: [12],
                                tokenSymbol: ["KSM"]
                            };
                        }
                    });
                });
            }
        },
        chain: {
            getBlockHash: (blockNumber: number) => "0x00000000000000000000123456789" as unknown
        }
    },
    registry: {
        chainDecimals: [12]
    },
    query: {
        identity: {
            identityOf: {
                // TODO: separate this, randomize and clean up
                entries() {
                    return new Promise((resolve: (param: unknown[]) => void) => {
                        resolve([[{
                            toHuman(): any {
                                return ["fake-address"];
                            }
                        }, {
                            toHuman(): any {
                                return {
                                    info: {
                                        display: { Raw: "fake-name" },
                                        email: { Raw: "fake-email" },
                                        legal: { Raw: "fake-legal" },
                                        riot: { Raw: "fake-riot" },
                                        twitter: { Raw: "fake-twitter" },
                                        web: { Raw: "fake-web" }
                                    }
                                };
                            }
                        }]]);
                    });
                }
            }
        }
    },
    derive: {
        accounts: {
            identity() {
                return new Promise((resolve: (param: unknown) => void) => {
                    resolve({
                        display: "fake-name",
                        address: "fake-address",
                        riot: "fake-riot",
                        twitter: "fake-twitter",
                        web: "fake-web",
                        legal: "fake-legal",
                        email: "fake-email",
                        judgements: [["0", { toHuman(): string { return "Reasonable" } }], ["1", { toHuman(): string { return "Known Good" } }]]
                    });
                });
            }
        },
        balances: {
            account(address: string) {
                return new Promise((resolve: (param: unknown) => void) => {
                    resolve({
                        freeBalance: { toHex(): number { return 0x0000000000000000000067a20c15be6a } },
                        reservedBalance: { toHex(): number { return 0x000000000000000000000011d9b07d3c } }
                    });
                });
            }
        }
    },
    at: (blockHash: string ) => "fake-state-at-history-block" as unknown
} as ApiPromise;

// This is a mock for the expected ApiPromise response for a chain that does not implement the identity pallet
// Can be used in tests
export const ApiPromiseMockWOIdentityPallet = {
    rpc: {
        system: {
            chain: () => "Fake-ChainName" as unknown
        },
        chain: {
            getBlockHash: (blockNumber: number) => "0x00000000000000000000123456789" as unknown
        }
    },
    query: {}
} as ApiPromise;