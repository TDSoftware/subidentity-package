import { BasicIdentityInfo } from "./BasicIdentityInfo";
import { Balance } from "./Balance";
import { AccountActivity } from "./AccountActivity";

export interface Identity {
    chain?: string;
    basicInfo: BasicIdentityInfo;
    judgements?: string[];
    balance?: Balance;
}

export interface DetailedIdentity extends Identity {
    treasury: AccountActivity[];
    governance: AccountActivity[];
}