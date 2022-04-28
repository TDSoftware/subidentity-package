import { ApiPromise, WsProvider } from "@polkadot/api";
import "@polkadot/api-augment";
import { BasicIdentityInfo } from "./types/BasicIdentityInfo";
import {_paginate } from "./pagination";
import { Page } from "./types/Page";
import { Identity } from "./types/Identity";

export const apiPromises: { [wsAddress: string]: ApiPromise } = {};

/**
 * fetch identitites from a selected substrate based chain 
 * @param wsAddress Network end point URL
 * @param page requested page number
 * @param limit number of identity items per each page
 * @returns requested page with identitites
 */
export const getIdentities = async (wsAddress: string, page: number, limit: number): Promise<Page<Identity>> => {
    const api = _connectToWsProvider(wsAddress);
    const chain = (await (await api).rpc.system.chain());
    return _getBasicInfoOfIdentities((await api), chain.toString(), page, limit);
};

async function _connectToWsProvider(wsAddress: string): Promise<ApiPromise> {
    if(apiPromises[wsAddress]) {
        return apiPromises[wsAddress];
    }
    const wsProvider = new WsProvider(wsAddress);
    return await ApiPromise.create({provider: wsProvider});
}

async function _getBasicInfoOfIdentities(api: ApiPromise, chainName: string, page: number, limit: number): Promise<Page<Identity>> {
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
        if (Array.isArray(addressArray) && addressArray.length > 0) {
            address = `${addressArray[0]}`;
        }
        
        const basicInfo: BasicIdentityInfo = { display,  address, riot, twitter, web, legal, email };
        const chain = chainName;
        return {chain, basicInfo};
    });
    return _paginate(identities, page, limit);
}