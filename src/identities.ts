import { ApiPromise, WsProvider } from "@polkadot/api";
import "@polkadot/api-augment";
import { BasicIdentityInfo } from "./types/BasicIdentityInfo";
import { Identities } from "./types/Identities";

export const getIdentities = async (wsAddress: string): Promise<Identities> => {
    const api = _connectToWsProvider(wsAddress);
    return {
        chainName: ((await api).rpc.system.chain()).toString(),
        basicIdentityInfoList: _getBasicInfoOfIdentities(await api)
    };
};

async function _connectToWsProvider(wsAddress: string): Promise<ApiPromise> {
    //TODO: create global variable for wsProvider
    const wsProvider = new WsProvider(wsAddress);
    return await ApiPromise.create({provider: wsProvider});
}

async function _getBasicInfoOfIdentities(api: ApiPromise): Promise<BasicIdentityInfo[]> {
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
        return { display,  address, riot, twitter, web, legal, email };
    });
    return identities;
}