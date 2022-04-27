import { BasicIdentityInfo } from "./BasicIdentityInfo";

export interface Identities {
    chainName: string;
    basicIdentityInfoList: Promise<BasicIdentityInfo[]>;
}