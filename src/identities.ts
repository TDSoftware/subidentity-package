import { ApiPromise, WsProvider } from "@polkadot/api";
import "@polkadot/api-augment";

export type IdentitiesResponse = {
    chainName: string;
    basicIdentityInfoList: Promise<BasicIdentityInfo[]>;
}

export class BasicIdentityInfo {
    display!: string;
    address!: string;
    riot!: string;
    twitter!: string;
    web!: string;
    legal!: string;
    email!: string;

    constructor(display:string, address: string, riot: string, twitter: string, web: string, legal: string, email: string) {
        this.display = display;
        this.address = address;
        this.riot = riot;
        this.twitter = twitter;
        this.web = web;
        this.legal = legal;
        this.email = email;
    }
}

export const getIdentityResponse = async (wsAddress: string): Promise<IdentitiesResponse> => {
    const api = connectToWsProvider(wsAddress);
    return {
        chainName: ((await api).rpc.system.chain()).toString(),
        basicIdentityInfoList: getBasicInfoOfIdentities(await api)
    };
};

async function connectToWsProvider(wsAddress: string): Promise<ApiPromise> {
    //TODO: create global variable for wsProvider
    const wsProvider = new WsProvider(wsAddress);
    return await ApiPromise.create({provider: wsProvider});
}

async function getBasicInfoOfIdentities(api: ApiPromise): Promise<BasicIdentityInfo[]> {
    const list = await api.query.identity.identityOf.entries();
    const identities = list.map((identity: any) => {
        const {
            display: {Raw: display},
            email: {Raw: email},
            legal: {Raw: legal},
            riot: {Raw: riot},
            twitter: {Raw: twitter},
            web: {Raw: web}
        } = identity[1].toHuman().info;
        const addressArray = identity[0].toHuman();
        let address = "";
        if (Array.isArray(addressArray)) {
            address = `${addressArray[0]}`;
        }
        return new BasicIdentityInfo(display,  address, riot, twitter, web, legal, email); 
    });
    return identities;
}