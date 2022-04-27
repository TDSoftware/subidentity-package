import { ApiPromise, WsProvider } from "@polkadot/api";
import "@polkadot/api-augment";
import { BasicIdentityInfo } from "./types/BasicIdentityInfo";
import { Identity } from "./types/Identity";

export const getIdentities = async (wsAddress: string): Promise<Identity[]> => {
    const api = _connectToWsProvider(wsAddress);
    const chain = (await (await api).rpc.system.chain());
    return _getBasicInfoOfIdentities((await api), chain.toString());
};

async function _connectToWsProvider(wsAddress: string): Promise<ApiPromise> {
    //TODO: create global variable for wsProvider
    const wsProvider = new WsProvider(wsAddress);
    return await ApiPromise.create({provider: wsProvider});
}

async function _getBasicInfoOfIdentities(api: ApiPromise, chainName: string): Promise<Identity[]> {
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
        
        const basicInfo: BasicIdentityInfo = { display,  address, riot, twitter, web, legal, email };
        const chain = chainName;
        return {chain, basicInfo};
    });
    return identities;
}