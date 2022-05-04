import { ApiPromise, WsProvider } from "@polkadot/api";
import "@polkadot/api-augment";
import { BasicIdentityInfo } from "./types/BasicIdentityInfo";
import {_paginate, _validatePaginationInput } from "./pagination";
import { Page } from "./types/Page";
import { Identity } from "./types/Identity";

export const apiPromises: { [wsAddress: string]: ApiPromise } = {};

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
    const api = _connectToWsProvider(wsAddress);
    const chain = (await (await api).rpc.system.chain());
    return _getIdentityEntries((await api), chain.toString(), page, limit);
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
        return {
            display,
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
            const {
                display, 
                email,
                legal,
                riot,
                twitter,
                web
            } = identity;
            return {
                display,
                address,
                riot,
                twitter,
                web,
                legal,
                email
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