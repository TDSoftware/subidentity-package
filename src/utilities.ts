import { ApiPromise, WsProvider } from "@polkadot/api";

export const apiPromises: { [wsAddress: string]: ApiPromise } = {};

export async function _connectToWsProvider(wsAddress: string): Promise<ApiPromise> {
    if(apiPromises[wsAddress]) {
        return apiPromises[wsAddress];
    }
    const wsProvider = new WsProvider(wsAddress);
    const apiPromise = await ApiPromise.create({provider: wsProvider});
    apiPromises[wsAddress] = apiPromise;
    return apiPromise;
}

/**
 * check if the node of provided wsProvider is running on archive mode 
 * @param wsAddress Network end point URL
 * @returns true if node is running in archive mode
 */
export const isArchiveNode = async (wsAddress : string): Promise<boolean> => {
    const api = await _connectToWsProvider(wsAddress);
    const historyBlockHash = await api.rpc.chain.getBlockHash(1); //Hash of Block#1
    
    //Archive nodes have all the historical data of the blockchain since the genesis block
    try {
        //Query state of a history block
        await api.at(historyBlockHash);
    } catch(ex) {
        return false;
    }
    return true;
};

/**
 * fetch chain name from a selected substrate based chain 
 * @param wsAddress Network end point URL
 * @returns name of the requested chain
 */
export const getChainName = async (wsAddress : string): Promise<string> => {
    const api = await _connectToWsProvider(wsAddress);
    return (await api.rpc.system.chain()).toString();
};
