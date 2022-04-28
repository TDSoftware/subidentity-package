import { Page } from "./Page";
import { Identity } from "./Identity";

export interface IdentityPage extends Page {
    items: Identity[];
}