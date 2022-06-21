import { ApiPromise, WsProvider } from "@polkadot/api";
import { Token } from "./types/Token";

export const apiPromises: { [wsAddress: string]: ApiPromise } = {};


/**
 * connect to wsProvider 
 * @param wsAddress Network endpoint URL
 * @returns ApiPromise instance using the supplied provider
 * @throws Error when the initial connection fails
 */
export async function connectToWsProvider(wsAddress: string): Promise<ApiPromise> {
    if (apiPromises[wsAddress]) {
        if (await apiPromises[wsAddress].isConnected) return apiPromises[wsAddress];
        else {
            apiPromises[wsAddress].disconnect();
            delete apiPromises[wsAddress];
        }
    }
    const wsProvider = new WsProvider(wsAddress);
    const apiPromise = new ApiPromise({ provider: wsProvider });
    try {
        await apiPromise.isReadyOrError;
        apiPromises[wsAddress] = apiPromise;
        return apiPromise;
    }
    catch (error) {
        //disconnect to prevent connection retries
        apiPromise.disconnect();
        throw new Error("Could not connect to endpoint.");
    }
}
/**
 * check if the node of provided wsProvider is running on archive mode 
 * @param wsAddress Network end point URL
 * @returns true if node is running in archive mode
 */
export const isArchiveNode = async (wsAddress: string): Promise<boolean> => {
    const api = await connectToWsProvider(wsAddress);
    const historyBlockHash = await api.rpc.chain.getBlockHash(1); //Hash of Block#1

    //Archive nodes have all the historical data of the blockchain since the genesis block
    try {
        //Query state of a history block
        await api.at(historyBlockHash);
    } catch (ex) {
        return false;
    }
    return true;
};

/**
 * fetch chain name from a selected substrate based chain 
 * @param wsAddress Network end point URL
 * @returns name of the requested chain
 */
export const getChainName = async (wsAddress: string): Promise<string> => {
    const api = await connectToWsProvider(wsAddress);
    return (await api.rpc.system.chain()).toString();
};

/**
 * fetch Token details of a selected substrate based chain 
 * @param wsAddress Network end point URL
 * @returns token symbol and decimals of the requested chain
 */
export const getTokenDetails = async (wsAddress: string): Promise<Token> => {
    const api = await connectToWsProvider(wsAddress);
    let symbol, decimals;
    const properties = (await api.rpc.system.properties());
    if (properties) {
        const { tokenSymbol, tokenDecimals } = properties.toHuman();
        if (tokenSymbol && Array.isArray(tokenSymbol) && tokenSymbol.length > 0)
            symbol = tokenSymbol.shift() as string;
        if (tokenDecimals && Array.isArray(tokenDecimals) && tokenDecimals.length > 0)
            decimals = Number(tokenDecimals.shift());
    }
    return { symbol, decimals };
};

