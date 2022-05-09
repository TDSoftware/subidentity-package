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
 * By default a Substrate node will only keep state for the last 256 blocks, unless it is explicitly run in archive mode. 
 * This means that querying state further back than the pruning period will result in an error returned from the Node.
 * This method uses this information to identify if a node is running in archive or full mode.
 */
export const isArchiveNode = async (wsAddress : string): Promise<boolean> => {
    const api = await _connectToWsProvider(wsAddress);
    const historyBlockHash = await api.rpc.chain.getBlockHash(1); //Hash of Block#1
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
