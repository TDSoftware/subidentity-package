
export enum AccountActivityTypeEnum {
    ProVote = "PRO_VOTE", //vote aye
    ConVote = "CON_VOTE", //vote nay
    Info = "INFO",
    CouncilorMissed = "COUNCILOR_MISSED", //council member missed to do something
    Treasury = "TREASURY" //activities around the treasury
}


export interface AccountActivity {
    primaryObject: string;
    primaryObjectNumber: number;
    secondaryObject: string
    secondaryObjectNumber: number;
    additionalInfoType: string;
    additionalInfoValue: string
    activity: string;
    block: number;
    type: AccountActivityTypeEnum;
}
