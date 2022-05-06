import { ApiPromise, WsProvider } from "@polkadot/api";
import "@polkadot/api-augment";
import { BasicIdentityInfo } from "./types/BasicIdentityInfo";
import {_paginate, _validatePaginationInput } from "./pagination";
import { Page } from "./types/Page";
import { Identity } from "./types/Identity";
import BigNumber from "bignumber.js";
import { Balance } from "./types/Balance";
import { u8aToString } from "@polkadot/util";

export const apiPromises: { [wsAddress: string]: ApiPromise } = {};
export const tokenSymbol: { [wsAddress: string]: string } = {};

/**
 * check if chain of provided endpoint implements the identity pallet
 * @param wsAddress Network end point URL
 * @returns true if identity pallet is implemented
 */
export const implementsIdentityPallet = async (wsAddress: string): Promise<boolean> => {
    const api = await _connectToWsProvider(wsAddress);
    return typeof api.query.identity !== "undefined";
};


/**
 * fetch identitites from a selected substrate based chain 
 * @param wsAddress Network end point URL
 * @param page requested page number
 * @param limit number of identity items per each page
 * @throws TypeError when pagination details are invalid
 * @returns requested page with identitites
 */
export const getIdentities = async (wsAddress: string, page: number, limit: number): Promise<Page<Identity>> => {
    if(!_validatePaginationInput(page, limit))
        throw TypeError("Please provide valid page number or limit");
    const api = await _connectToWsProvider(wsAddress);
    const chain = (await api.rpc.system.chain());
    return _getIdentityEntries(api, chain.toString(), page, limit);
};

async function _connectToWsProvider(wsAddress: string): Promise<ApiPromise> {
    if(apiPromises[wsAddress]) {
        return apiPromises[wsAddress];
    }
    const wsProvider = new WsProvider(wsAddress);
    const apiPromise = await ApiPromise.create({provider: wsProvider});
    apiPromises[wsAddress] = apiPromise;
    return apiPromise;
}

async function _getIdentityEntries(api: ApiPromise, chainName: string, page: number, limit: number): Promise<Page<Identity>> {
    const entries = await _getBasicInfoOfIdentities(api);
    const identities: Identity[] = [];
    entries.forEach(function(value) {
        const basicInfo: BasicIdentityInfo = value;
        const chain = chainName;
        const identity : Identity = { chain, basicInfo };
        identities.push(identity);
    });
    return _paginate(identities, page, limit);
}

async function _getBasicInfoOfIdentities(api: ApiPromise): Promise<BasicIdentityInfo[]> {
    const list = await api.query.identity.identityOf.entries();
    return list.map((identity: any) => {
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
        let parsedDisplay = "";
        if (display && /^0x/.test(display)) {
            const {
                info: { display }
            } = identity[1].unwrap();
            parsedDisplay = u8aToString(display.asRaw.toU8a(true));
        }
        return {
            display: parsedDisplay || display,
            address,
            riot,
            twitter,
            web,
            legal,
            email
        };
    });
}

/**
 * search for identitites in a selected substrate based chain 
 * @param wsAddress Network end point URL
 * @param query search key
 * @param page requested page number
 * @param limit number of identity items per each page
 * @throws TypeError when pagination details are invalid
 * @returns requested page with identitites matching search query
 */
export const searchIdentities = async (wsAddress: string, query: string, page: number, limit: number): Promise<Page<Identity>> => {
    if(!_validatePaginationInput(page, limit))
        throw TypeError("Please provide valid page number or limit");
    if(!query) {
        return getIdentities(wsAddress, page, limit);
    }
    const searchResults: Identity[] = [];
    const api = await _connectToWsProvider(wsAddress);
    const chainName = ((await api.rpc.system.chain())).toString();
    query = query.trim();

    const [fromIndex, fromFields] = await Promise.all([
        _getIdentityFromIndex(api, query),
        _getIdentityFromFields(api, query)
    ]);
    if (fromIndex) {
        const basicInfo: BasicIdentityInfo = fromIndex;
        const chain = chainName;
        const ident : Identity = { chain, basicInfo };
        searchResults.push(ident);
    }
    fromFields.forEach(function(value) {
        const basicInfo: BasicIdentityInfo = value;
        const chain = chainName;
        const identity : Identity = { chain, basicInfo };
        searchResults.push(identity);
    });
    return _paginate(searchResults, page, limit);
};

async function _getIdentityFromIndex(
    api: ApiPromise,
    index: string
): Promise<BasicIdentityInfo|undefined> {
    try {
        const numberRegex = new RegExp("^[0-9]+$");
        if(!numberRegex.test(index)) return;
        const accountData = await api.query.indices.accounts(index);
        const account = accountData.toHuman();
        if (Array.isArray(account)) {
            const address = account[0]?.toString();
            const identity = await api.derive.accounts.identity(address);
            //check if Account has an identity
            if(!Object.prototype.hasOwnProperty.call(identity, "display")) return;
            return {
                ...identity,
                address
            };
        }
    } catch (ex) {
        return;
    }
}

async function _getIdentityFromFields(
    api: ApiPromise,
    field: string
): Promise<BasicIdentityInfo[]> {
    const allIdentities = await _getBasicInfoOfIdentities(api);
    const query = new RegExp(`${field}`, "i");
    let identities = allIdentities;
    if (field) {
        identities = allIdentities
            .filter((user: BasicIdentityInfo) => {
                const {
                    display,
                    address,
                    riot,
                    twitter,
                    web,
                    legal,
                    email
                } = user;
                switch (true) {
                    case display && query.test(display):
                        return true;
                    case email && query.test(email):
                        return true;
                    case legal && query.test(legal):
                        return true;
                    case riot && query.test(riot):
                        return true;
                    case twitter && query.test(twitter):
                        return true;
                    case web && query.test(web):
                        return true;
                    case address && query.test(address):
                        return true;
                    default:
                        return false;
                }
            })
            .sort((a: BasicIdentityInfo, b: BasicIdentityInfo) => {
                const nameA =
                    (a.legal && a.legal.toLowerCase()) ||
                    (a.display && a.display.toLowerCase()) ||
                    a.address || "";
                const nameB =
                    (b.legal && b.legal.toLowerCase()) ||
                    (b.display && b.display.toLowerCase()) ||
                    b.address || "";
                switch (true) {
                    case query.test(nameA) && query.test(nameB) && nameA > nameB:
                        return 1;
                    case query.test(nameA) && query.test(nameB) && nameB > nameA:
                        return -1;
                    case query.test(nameA) && !query.test(nameB):
                        return -1;
                    case !query.test(nameA) && query.test(nameB):
                        return 1;
                    case nameA > nameB:
                        return 1;
                    case nameB > nameA:
                        return -1;
                    default:
                        return 0;
                }
            });
    }
    return identities;
}

/**
 * fetch an Identity from a selected substrate based chain and address
 * @param wsAddress Network end point URL
 * @param address 
 * @throws TypeError when the api is unable to find an identity with the input address 
 * @returns requested Identitity
 */
export const getIdentity = async (wsAddress: string, address: string): Promise<Identity> => {
    const api = await _connectToWsProvider(wsAddress);
    let identity: any;
    if (api) {
        try {
            identity = await api.derive.accounts.identity(address);
            if(!Object.prototype.hasOwnProperty.call(identity, "display")) throw TypeError;
        } catch(ex) {
            throw TypeError("Unable to find an identity with the provided address.");
        }
    }

    //process judgements
    const judgements: string[] = [];
    if (identity && identity.judgements) {
        let judgement;
        identity.judgements.forEach((item: any) => {
            judgement = item[1].toHuman();
            if(typeof judgement === "object")
                judgements.push((Array.from(new Map(Object.entries(judgement)).keys())).toString());
            else
                judgements.push(judgement);
        });
    }

    const { display, email, legal, riot, twitter, web } = identity;
    const basicInfo: BasicIdentityInfo = { display, address, riot, twitter, web, legal, email };
    const balance = await _getAccountBalance(api, address, wsAddress);
    const chain = (await api.rpc.system.chain()).toString();
    return {chain, basicInfo, judgements, balance};
};

async function _getAccountBalance(api: ApiPromise, address: string, wsAddress: string): Promise<Balance> {
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
    if(tokenSymbol[wsAddress]) {
        symbol = tokenSymbol[wsAddress];
    } else {
        const properties = (await api.rpc.system.properties());
        if(properties){
            const { tokenSymbol } = properties.toHuman();
            if (tokenSymbol && Array.isArray(tokenSymbol) && tokenSymbol.length > 0) {
                symbol = tokenSymbol.shift() as string;
            }
        }
        tokenSymbol[wsAddress] = symbol;
    }

    const balance: Balance = { total, symbol };
    return balance;
}