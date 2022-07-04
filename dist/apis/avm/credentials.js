"use strict";
/**
 * @packageDocumentation
 * @module API-AVM-Credentials
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFTCredential = exports.SECPCredential = exports.SelectCredentialClass = void 0;
const constants_1 = require("./constants");
const credentials_1 = require("../../common/credentials");
const errors_1 = require("../../utils/errors");
/**
 * Takes a buffer representing the credential and returns the proper [[Credential]] instance.
 *
 * @param credid A number representing the credential ID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Credential]]-extended class.
 */
const SelectCredentialClass = (credid, ...args) => {
    if (credid === constants_1.AVMConstants.SECPCREDENTIAL ||
        credid === constants_1.AVMConstants.SECPCREDENTIAL_CODECONE) {
        return new SECPCredential(...args);
    }
    if (credid === constants_1.AVMConstants.NFTCREDENTIAL ||
        credid === constants_1.AVMConstants.NFTCREDENTIAL_CODECONE) {
        return new NFTCredential(...args);
    }
    /* istanbul ignore next */
    throw new errors_1.CredIdError("Error - SelectCredentialClass: unknown credid");
};
exports.SelectCredentialClass = SelectCredentialClass;
class SECPCredential extends credentials_1.Credential {
    constructor() {
        super(...arguments);
        this._typeName = "SECPCredential";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0
            ? constants_1.AVMConstants.SECPCREDENTIAL
            : constants_1.AVMConstants.SECPCREDENTIAL_CODECONE;
    }
    //serialize and deserialize both are inherited
    /**
     * Set the codecID
     *
     * @param codecID The codecID to set
     */
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new errors_1.CodecIdError("Error - SECPCredential.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID =
            this._codecID === 0
                ? constants_1.AVMConstants.SECPCREDENTIAL
                : constants_1.AVMConstants.SECPCREDENTIAL_CODECONE;
    }
    getCredentialID() {
        return this._typeID;
    }
    clone() {
        let newbase = new SECPCredential();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new SECPCredential(...args);
    }
    select(id, ...args) {
        let newbasetx = (0, exports.SelectCredentialClass)(id, ...args);
        return newbasetx;
    }
}
exports.SECPCredential = SECPCredential;
class NFTCredential extends credentials_1.Credential {
    constructor() {
        super(...arguments);
        this._typeName = "NFTCredential";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0
            ? constants_1.AVMConstants.NFTCREDENTIAL
            : constants_1.AVMConstants.NFTCREDENTIAL_CODECONE;
    }
    //serialize and deserialize both are inherited
    /**
     * Set the codecID
     *
     * @param codecID The codecID to set
     */
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new errors_1.CodecIdError("Error - NFTCredential.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID =
            this._codecID === 0
                ? constants_1.AVMConstants.NFTCREDENTIAL
                : constants_1.AVMConstants.NFTCREDENTIAL_CODECONE;
    }
    getCredentialID() {
        return this._typeID;
    }
    clone() {
        let newbase = new NFTCredential();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new NFTCredential(...args);
    }
    select(id, ...args) {
        let newbasetx = (0, exports.SelectCredentialClass)(id, ...args);
        return newbasetx;
    }
}
exports.NFTCredential = NFTCredential;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlZGVudGlhbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9hdm0vY3JlZGVudGlhbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7O0FBRUgsMkNBQTBDO0FBQzFDLDBEQUFxRDtBQUNyRCwrQ0FBOEQ7QUFFOUQ7Ozs7OztHQU1HO0FBQ0ksTUFBTSxxQkFBcUIsR0FBRyxDQUNuQyxNQUFjLEVBQ2QsR0FBRyxJQUFXLEVBQ0YsRUFBRTtJQUNkLElBQ0UsTUFBTSxLQUFLLHdCQUFZLENBQUMsY0FBYztRQUN0QyxNQUFNLEtBQUssd0JBQVksQ0FBQyx1QkFBdUIsRUFDL0M7UUFDQSxPQUFPLElBQUksY0FBYyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUE7S0FDbkM7SUFDRCxJQUNFLE1BQU0sS0FBSyx3QkFBWSxDQUFDLGFBQWE7UUFDckMsTUFBTSxLQUFLLHdCQUFZLENBQUMsc0JBQXNCLEVBQzlDO1FBQ0EsT0FBTyxJQUFJLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBO0tBQ2xDO0lBQ0QsMEJBQTBCO0lBQzFCLE1BQU0sSUFBSSxvQkFBVyxDQUFDLCtDQUErQyxDQUFDLENBQUE7QUFDeEUsQ0FBQyxDQUFBO0FBbEJZLFFBQUEscUJBQXFCLHlCQWtCakM7QUFFRCxNQUFhLGNBQWUsU0FBUSx3QkFBVTtJQUE5Qzs7UUFDWSxjQUFTLEdBQUcsZ0JBQWdCLENBQUE7UUFDNUIsYUFBUSxHQUFHLHdCQUFZLENBQUMsV0FBVyxDQUFBO1FBQ25DLFlBQU8sR0FDZixJQUFJLENBQUMsUUFBUSxLQUFLLENBQUM7WUFDakIsQ0FBQyxDQUFDLHdCQUFZLENBQUMsY0FBYztZQUM3QixDQUFDLENBQUMsd0JBQVksQ0FBQyx1QkFBdUIsQ0FBQTtJQXlDNUMsQ0FBQztJQXZDQyw4Q0FBOEM7SUFFOUM7Ozs7T0FJRztJQUNILFVBQVUsQ0FBQyxPQUFlO1FBQ3hCLElBQUksT0FBTyxLQUFLLENBQUMsSUFBSSxPQUFPLEtBQUssQ0FBQyxFQUFFO1lBQ2xDLDBCQUEwQjtZQUMxQixNQUFNLElBQUkscUJBQVksQ0FDcEIsaUZBQWlGLENBQ2xGLENBQUE7U0FDRjtRQUNELElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFBO1FBQ3ZCLElBQUksQ0FBQyxPQUFPO1lBQ1YsSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDO2dCQUNqQixDQUFDLENBQUMsd0JBQVksQ0FBQyxjQUFjO2dCQUM3QixDQUFDLENBQUMsd0JBQVksQ0FBQyx1QkFBdUIsQ0FBQTtJQUM1QyxDQUFDO0lBRUQsZUFBZTtRQUNiLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtJQUNyQixDQUFDO0lBRUQsS0FBSztRQUNILElBQUksT0FBTyxHQUFtQixJQUFJLGNBQWMsRUFBRSxDQUFBO1FBQ2xELE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7UUFDbkMsT0FBTyxPQUFlLENBQUE7SUFDeEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFHLElBQVc7UUFDbkIsT0FBTyxJQUFJLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBUyxDQUFBO0lBQzVDLENBQUM7SUFFRCxNQUFNLENBQUMsRUFBVSxFQUFFLEdBQUcsSUFBVztRQUMvQixJQUFJLFNBQVMsR0FBZSxJQUFBLDZCQUFxQixFQUFDLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQzlELE9BQU8sU0FBUyxDQUFBO0lBQ2xCLENBQUM7Q0FDRjtBQS9DRCx3Q0ErQ0M7QUFFRCxNQUFhLGFBQWMsU0FBUSx3QkFBVTtJQUE3Qzs7UUFDWSxjQUFTLEdBQUcsZUFBZSxDQUFBO1FBQzNCLGFBQVEsR0FBRyx3QkFBWSxDQUFDLFdBQVcsQ0FBQTtRQUNuQyxZQUFPLEdBQ2YsSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyx3QkFBWSxDQUFDLGFBQWE7WUFDNUIsQ0FBQyxDQUFDLHdCQUFZLENBQUMsc0JBQXNCLENBQUE7SUF5QzNDLENBQUM7SUF2Q0MsOENBQThDO0lBRTlDOzs7O09BSUc7SUFDSCxVQUFVLENBQUMsT0FBZTtRQUN4QixJQUFJLE9BQU8sS0FBSyxDQUFDLElBQUksT0FBTyxLQUFLLENBQUMsRUFBRTtZQUNsQywwQkFBMEI7WUFDMUIsTUFBTSxJQUFJLHFCQUFZLENBQ3BCLGdGQUFnRixDQUNqRixDQUFBO1NBQ0Y7UUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQTtRQUN2QixJQUFJLENBQUMsT0FBTztZQUNWLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQztnQkFDakIsQ0FBQyxDQUFDLHdCQUFZLENBQUMsYUFBYTtnQkFDNUIsQ0FBQyxDQUFDLHdCQUFZLENBQUMsc0JBQXNCLENBQUE7SUFDM0MsQ0FBQztJQUVELGVBQWU7UUFDYixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUE7SUFDckIsQ0FBQztJQUVELEtBQUs7UUFDSCxJQUFJLE9BQU8sR0FBa0IsSUFBSSxhQUFhLEVBQUUsQ0FBQTtRQUNoRCxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1FBQ25DLE9BQU8sT0FBZSxDQUFBO0lBQ3hCLENBQUM7SUFFRCxNQUFNLENBQUMsR0FBRyxJQUFXO1FBQ25CLE9BQU8sSUFBSSxhQUFhLENBQUMsR0FBRyxJQUFJLENBQVMsQ0FBQTtJQUMzQyxDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQVUsRUFBRSxHQUFHLElBQVc7UUFDL0IsSUFBSSxTQUFTLEdBQWUsSUFBQSw2QkFBcUIsRUFBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUM5RCxPQUFPLFNBQVMsQ0FBQTtJQUNsQixDQUFDO0NBQ0Y7QUEvQ0Qsc0NBK0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLUFWTS1DcmVkZW50aWFsc1xuICovXG5cbmltcG9ydCB7IEFWTUNvbnN0YW50cyB9IGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBDcmVkZW50aWFsIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9jcmVkZW50aWFsc1wiXG5pbXBvcnQgeyBDcmVkSWRFcnJvciwgQ29kZWNJZEVycm9yIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2Vycm9yc1wiXG5cbi8qKlxuICogVGFrZXMgYSBidWZmZXIgcmVwcmVzZW50aW5nIHRoZSBjcmVkZW50aWFsIGFuZCByZXR1cm5zIHRoZSBwcm9wZXIgW1tDcmVkZW50aWFsXV0gaW5zdGFuY2UuXG4gKlxuICogQHBhcmFtIGNyZWRpZCBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIGNyZWRlbnRpYWwgSUQgcGFyc2VkIHByaW9yIHRvIHRoZSBieXRlcyBwYXNzZWQgaW5cbiAqXG4gKiBAcmV0dXJucyBBbiBpbnN0YW5jZSBvZiBhbiBbW0NyZWRlbnRpYWxdXS1leHRlbmRlZCBjbGFzcy5cbiAqL1xuZXhwb3J0IGNvbnN0IFNlbGVjdENyZWRlbnRpYWxDbGFzcyA9IChcbiAgY3JlZGlkOiBudW1iZXIsXG4gIC4uLmFyZ3M6IGFueVtdXG4pOiBDcmVkZW50aWFsID0+IHtcbiAgaWYgKFxuICAgIGNyZWRpZCA9PT0gQVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMIHx8XG4gICAgY3JlZGlkID09PSBBVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUxfQ09ERUNPTkVcbiAgKSB7XG4gICAgcmV0dXJuIG5ldyBTRUNQQ3JlZGVudGlhbCguLi5hcmdzKVxuICB9XG4gIGlmIChcbiAgICBjcmVkaWQgPT09IEFWTUNvbnN0YW50cy5ORlRDUkVERU5USUFMIHx8XG4gICAgY3JlZGlkID09PSBBVk1Db25zdGFudHMuTkZUQ1JFREVOVElBTF9DT0RFQ09ORVxuICApIHtcbiAgICByZXR1cm4gbmV3IE5GVENyZWRlbnRpYWwoLi4uYXJncylcbiAgfVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICB0aHJvdyBuZXcgQ3JlZElkRXJyb3IoXCJFcnJvciAtIFNlbGVjdENyZWRlbnRpYWxDbGFzczogdW5rbm93biBjcmVkaWRcIilcbn1cblxuZXhwb3J0IGNsYXNzIFNFQ1BDcmVkZW50aWFsIGV4dGVuZHMgQ3JlZGVudGlhbCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlNFQ1BDcmVkZW50aWFsXCJcbiAgcHJvdGVjdGVkIF9jb2RlY0lEID0gQVZNQ29uc3RhbnRzLkxBVEVTVENPREVDXG4gIHByb3RlY3RlZCBfdHlwZUlEID1cbiAgICB0aGlzLl9jb2RlY0lEID09PSAwXG4gICAgICA/IEFWTUNvbnN0YW50cy5TRUNQQ1JFREVOVElBTFxuICAgICAgOiBBVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUxfQ09ERUNPTkVcblxuICAvL3NlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgYm90aCBhcmUgaW5oZXJpdGVkXG5cbiAgLyoqXG4gICAqIFNldCB0aGUgY29kZWNJRFxuICAgKlxuICAgKiBAcGFyYW0gY29kZWNJRCBUaGUgY29kZWNJRCB0byBzZXRcbiAgICovXG4gIHNldENvZGVjSUQoY29kZWNJRDogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKGNvZGVjSUQgIT09IDAgJiYgY29kZWNJRCAhPT0gMSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBDb2RlY0lkRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBTRUNQQ3JlZGVudGlhbC5zZXRDb2RlY0lEOiBpbnZhbGlkIGNvZGVjSUQuIFZhbGlkIGNvZGVjSURzIGFyZSAwIGFuZCAxLlwiXG4gICAgICApXG4gICAgfVxuICAgIHRoaXMuX2NvZGVjSUQgPSBjb2RlY0lEXG4gICAgdGhpcy5fdHlwZUlEID1cbiAgICAgIHRoaXMuX2NvZGVjSUQgPT09IDBcbiAgICAgICAgPyBBVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUxcbiAgICAgICAgOiBBVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUxfQ09ERUNPTkVcbiAgfVxuXG4gIGdldENyZWRlbnRpYWxJRCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSURcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGxldCBuZXdiYXNlOiBTRUNQQ3JlZGVudGlhbCA9IG5ldyBTRUNQQ3JlZGVudGlhbCgpXG4gICAgbmV3YmFzZS5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3YmFzZSBhcyB0aGlzXG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IFNFQ1BDcmVkZW50aWFsKC4uLmFyZ3MpIGFzIHRoaXNcbiAgfVxuXG4gIHNlbGVjdChpZDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IENyZWRlbnRpYWwge1xuICAgIGxldCBuZXdiYXNldHg6IENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoaWQsIC4uLmFyZ3MpXG4gICAgcmV0dXJuIG5ld2Jhc2V0eFxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBORlRDcmVkZW50aWFsIGV4dGVuZHMgQ3JlZGVudGlhbCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIk5GVENyZWRlbnRpYWxcIlxuICBwcm90ZWN0ZWQgX2NvZGVjSUQgPSBBVk1Db25zdGFudHMuTEFURVNUQ09ERUNcbiAgcHJvdGVjdGVkIF90eXBlSUQgPVxuICAgIHRoaXMuX2NvZGVjSUQgPT09IDBcbiAgICAgID8gQVZNQ29uc3RhbnRzLk5GVENSRURFTlRJQUxcbiAgICAgIDogQVZNQ29uc3RhbnRzLk5GVENSRURFTlRJQUxfQ09ERUNPTkVcblxuICAvL3NlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgYm90aCBhcmUgaW5oZXJpdGVkXG5cbiAgLyoqXG4gICAqIFNldCB0aGUgY29kZWNJRFxuICAgKlxuICAgKiBAcGFyYW0gY29kZWNJRCBUaGUgY29kZWNJRCB0byBzZXRcbiAgICovXG4gIHNldENvZGVjSUQoY29kZWNJRDogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKGNvZGVjSUQgIT09IDAgJiYgY29kZWNJRCAhPT0gMSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBDb2RlY0lkRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBORlRDcmVkZW50aWFsLnNldENvZGVjSUQ6IGludmFsaWQgY29kZWNJRC4gVmFsaWQgY29kZWNJRHMgYXJlIDAgYW5kIDEuXCJcbiAgICAgIClcbiAgICB9XG4gICAgdGhpcy5fY29kZWNJRCA9IGNvZGVjSURcbiAgICB0aGlzLl90eXBlSUQgPVxuICAgICAgdGhpcy5fY29kZWNJRCA9PT0gMFxuICAgICAgICA/IEFWTUNvbnN0YW50cy5ORlRDUkVERU5USUFMXG4gICAgICAgIDogQVZNQ29uc3RhbnRzLk5GVENSRURFTlRJQUxfQ09ERUNPTkVcbiAgfVxuXG4gIGdldENyZWRlbnRpYWxJRCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSURcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGxldCBuZXdiYXNlOiBORlRDcmVkZW50aWFsID0gbmV3IE5GVENyZWRlbnRpYWwoKVxuICAgIG5ld2Jhc2UuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpXG4gICAgcmV0dXJuIG5ld2Jhc2UgYXMgdGhpc1xuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIG5ldyBORlRDcmVkZW50aWFsKC4uLmFyZ3MpIGFzIHRoaXNcbiAgfVxuXG4gIHNlbGVjdChpZDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IENyZWRlbnRpYWwge1xuICAgIGxldCBuZXdiYXNldHg6IENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoaWQsIC4uLmFyZ3MpXG4gICAgcmV0dXJuIG5ld2Jhc2V0eFxuICB9XG59XG4iXX0=