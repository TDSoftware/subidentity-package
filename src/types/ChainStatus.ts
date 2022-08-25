export interface ChainStatus {
    status?: boolean;
    isArchiveNode?: boolean;
    implementsIdentityPallet: boolean;
    chainName: string;
    identitiesIndexed?: boolean;
    tokenDecimals?: number;
    tokenSymbol?: string;
}
