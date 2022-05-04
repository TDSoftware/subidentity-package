import { ApiPromise } from "@polkadot/api";

// This is a mock for the expected ApiPromise response
// Can be used in tests, and can be extended
export const ApiPromiseMock = {
    rpc: {
        system: {
            chain: () => "Fake-ChainName" as unknown,
            properties: () => {
                [{
                    toHuman(): any {
                        return ["fake-property"];
                    }
                }];
            }
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
    },
    derive: {
        accounts: {
            identity(): any {
                return {
                    basicInfo: {
                        display: "fake-name",
                        address: "fake-address",
                        riot: "fake-riot",
                        twitter: "fake-twitter",
                        web: "fake-web",
                        legal: "fake-legal", 
                        email: "fake-email"                    
                    }
                };
            }
        },
        balances: {
            account(address: string){ "fake-balance" }
        }
    }
} as ApiPromise;