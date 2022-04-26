import { BasicIdentityInfo } from "./identities";
import { mockIdentity } from "./mockData";

test("constructor unit of BasicIdentityInfo", async () => {
    const response = new BasicIdentityInfo(
        mockIdentity.display, 
        mockIdentity.address, 
        mockIdentity.riot, 
        mockIdentity.twitter, 
        mockIdentity.web, 
        mockIdentity.legal, 
        mockIdentity.email);

    expect(response.display).toBe(mockIdentity.display);
    expect(response.address).toBe(mockIdentity.address);
    expect(response.riot).toBe(mockIdentity.riot);
    expect(response.twitter).toBe(mockIdentity.twitter);
    expect(response.web).toBe(mockIdentity.web);
    expect(response.legal).toBe(mockIdentity.legal);
    expect(response.email).toBe(mockIdentity.email);
});