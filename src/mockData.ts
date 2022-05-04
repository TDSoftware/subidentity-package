import { ApiPromise } from "@polkadot/api";

// This is a mock for the expected ApiPromise response
// Can be used in tests, and can be extended
export const ApiPromiseMock = {
    rpc: {
        system: {
            chain: () => "Fake-ChainName" as unknown
        }
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
    }
} as ApiPromise;

// This is a mock for the expected ApiPromise response for a chain that does not implement the identity pallet
// Can be used in tests
export const ApiPromiseMockWOIdentityPallet = {
    rpc: {
        system: {
            chain: () => "Fake-ChainName" as unknown
        }
    },
    query: {}
} as ApiPromise;