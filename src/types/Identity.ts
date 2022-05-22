import { BasicIdentityInfo } from "./BasicIdentityInfo";
import { Balance } from "./Balance";

export interface Identity {
    chain?: string;
    basicInfo: BasicIdentityInfo;
    judgements?: string[];
    balance?: Balance;
}