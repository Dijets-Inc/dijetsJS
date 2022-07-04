/**
 * @packageDocumentation
 * @module API-PlatformVM-SubnetAuth
 */
import { Buffer } from "buffer/";
import { Serializable, SerializedEncoding } from "../../utils";
export declare class SubnetAuth extends Serializable {
    protected _typeName: string;
    protected _typeID: number;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    /**
     * Returns the number of address indices as a number
     */
    getNumAddressIndices(): number;
    /**
     * Returns an array of AddressIndices as Buffers
     */
    getAddressIndices(): Buffer[];
    protected addressIndices: Buffer[];
    protected numAddressIndices: Buffer;
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[SubnetAuth]].
     */
    toBuffer(): Buffer;
    constructor(addressIndices?: Buffer[]);
}
//# sourceMappingURL=subnetauth.d.ts.map