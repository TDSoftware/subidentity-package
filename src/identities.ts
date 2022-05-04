import { ApiPromise, WsProvider } from "@polkadot/api";
import "@polkadot/api-augment";
import { BasicIdentityInfo } from "./types/BasicIdentityInfo";
import {_paginate } from "./pagination";
import { Page } from "./types/Page";
import { Identity } from "./types/Identity";
import BigNumber from "bignumber.js";
import { Balance } from "./types/Balance";

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

/**
 * fetch an Identity from a selected substrate based chain and address
 * @param wsAddress Network end point URL
 * @param address 
 * @throws TypeError when the api is unable to find an identity with the input address 
 * @returns requested Identitity
 */
export const getIdentity = async (wsAddress: string, address: string): Promise<Identity> => {
    const api = _connectToWsProvider(wsAddress);
    let identity: any;
    if (api) {
        try {
            identity = await (await api).derive.accounts.identity(address);
        } catch(ex) {
            throw TypeError("Unable to find an identity with the provided address.");
        }
    }
    
    const judgements: string[] = [];
    if (identity && identity.judgements) {
        identity.judgements.forEach((judgement: any) => {
            judgements.push(judgement[1].toHuman());
        });
    }
    
    const { display, email, legal, riot, twitter, web } = identity;
    const basicInfo: BasicIdentityInfo = { display, address, riot, twitter, web, legal, email };
    const balance = await _getAccountBalance(await api, address);
    const chain = (await (await api).rpc.system.chain()).toString();
    return {chain, basicInfo, judgements, balance};
};

async function _getAccountBalance(api: ApiPromise, address: string): Promise<Balance> {
    // calculating total balance
    let balances: any, decimals: any, total = "";
    if(api) {
        balances = await api.derive.balances.account(address);
        if(api.registry){
            decimals = api.registry.chainDecimals;
            decimals = new BigNumber(decimals).toNumber();
        }
    }
    if(balances) {
        const { freeBalance, reservedBalance } = balances;
        const base = new BigNumber(10).pow(decimals);
        total = new BigNumber(freeBalance.toHex())
            .plus(reservedBalance.toHex())
            .div(base)
            .toFixed(2);
    }

    // extracting the token information from the chain
    let symbol = "";
    const properties = (await api.rpc.system.properties());
    if(properties){
        const { tokenSymbol } = properties.toHuman();
        if (tokenSymbol && Array.isArray(tokenSymbol) && tokenSymbol.length > 0) {
            symbol = tokenSymbol.shift() as string;
        }
    }
    
    const balance: Balance = { total, symbol };
    return balance;
}