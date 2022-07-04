"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serialization = exports.Serializable = exports.SERIALIZATIONVERSION = void 0;
/**
 * @packageDocumentation
 * @module Utils-Serialization
 */
const bintools_1 = __importDefault(require("../utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer/");
const isomorphic_dompurify_1 = __importDefault(require("isomorphic-dompurify"));
const helperfunctions_1 = require("./helperfunctions");
const errors_1 = require("../utils/errors");
exports.SERIALIZATIONVERSION = 0;
class Serializable {
    constructor() {
        this._typeName = undefined;
        this._typeID = undefined;
        this._codecID = undefined;
    }
    /**
     * Used in serialization. TypeName is a string name for the type of object being output.
     */
    getTypeName() {
        return this._typeName;
    }
    /**
     * Used in serialization. Optional. TypeID is a number for the typeID of object being output.
     */
    getTypeID() {
        return this._typeID;
    }
    /**
     * Used in serialization. Optional. TypeID is a number for the typeID of object being output.
     */
    getCodecID() {
        return this._codecID;
    }
    /**
     * Sanitize to prevent cross scripting attacks.
     */
    sanitizeObject(obj) {
        for (const k in obj) {
            if (typeof obj[`${k}`] === "object" && obj[`${k}`] !== null) {
                this.sanitizeObject(obj[`${k}`]);
            }
            else if (typeof obj[`${k}`] === "string") {
                obj[`${k}`] = isomorphic_dompurify_1.default.sanitize(obj[`${k}`]);
            }
        }
        return obj;
    }
    //sometimes the parent class manages the fields
    //these are so you can say super.serialize(encoding)
    serialize(encoding) {
        return {
            _typeName: isomorphic_dompurify_1.default.sanitize(this._typeName),
            _typeID: typeof this._typeID === "undefined" ? null : this._typeID,
            _codecID: typeof this._codecID === "undefined" ? null : this._codecID
        };
    }
    deserialize(fields, encoding) {
        fields = this.sanitizeObject(fields);
        if (typeof fields["_typeName"] !== "string") {
            throw new errors_1.TypeNameError("Error - Serializable.deserialize: _typeName must be a string, found: " +
                typeof fields["_typeName"]);
        }
        if (fields["_typeName"] !== this._typeName) {
            throw new errors_1.TypeNameError("Error - Serializable.deserialize: _typeName mismatch -- expected: " +
                this._typeName +
                " -- received: " +
                fields["_typeName"]);
        }
        if (typeof fields["_typeID"] !== "undefined" &&
            fields["_typeID"] !== null) {
            if (typeof fields["_typeID"] !== "number") {
                throw new errors_1.TypeIdError("Error - Serializable.deserialize: _typeID must be a number, found: " +
                    typeof fields["_typeID"]);
            }
            if (fields["_typeID"] !== this._typeID) {
                throw new errors_1.TypeIdError("Error - Serializable.deserialize: _typeID mismatch -- expected: " +
                    this._typeID +
                    " -- received: " +
                    fields["_typeID"]);
            }
        }
        if (typeof fields["_codecID"] !== "undefined" &&
            fields["_codecID"] !== null) {
            if (typeof fields["_codecID"] !== "number") {
                throw new errors_1.CodecIdError("Error - Serializable.deserialize: _codecID must be a number, found: " +
                    typeof fields["_codecID"]);
            }
            if (fields["_codecID"] !== this._codecID) {
                throw new errors_1.CodecIdError("Error - Serializable.deserialize: _codecID mismatch -- expected: " +
                    this._codecID +
                    " -- received: " +
                    fields["_codecID"]);
            }
        }
    }
}
exports.Serializable = Serializable;
class Serialization {
    constructor() {
        this.bintools = bintools_1.default.getInstance();
    }
    /**
     * Retrieves the Serialization singleton.
     */
    static getInstance() {
        if (!Serialization.instance) {
            Serialization.instance = new Serialization();
        }
        return Serialization.instance;
    }
    /**
     * Convert {@link https://github.com/feross/buffer|Buffer} to [[SerializedType]]
     *
     * @param vb {@link https://github.com/feross/buffer|Buffer}
     * @param type [[SerializedType]]
     * @param ...args remaining arguments
     * @returns type of [[SerializedType]]
     */
    bufferToType(vb, type, ...args) {
        if (type === "BN") {
            return new bn_js_1.default(vb.toString("hex"), "hex");
        }
        else if (type === "Buffer") {
            if (args.length == 1 && typeof args[0] === "number") {
                vb = buffer_1.Buffer.from(vb.toString("hex").padStart(args[0] * 2, "0"), "hex");
            }
            return vb;
        }
        else if (type === "bech32") {
            return this.bintools.addressToString(args[0], args[1], vb);
        }
        else if (type === "nodeID") {
            return (0, helperfunctions_1.bufferToNodeIDString)(vb);
        }
        else if (type === "privateKey") {
            return (0, helperfunctions_1.bufferToPrivateKeyString)(vb);
        }
        else if (type === "cb58") {
            return this.bintools.cb58Encode(vb);
        }
        else if (type === "base58") {
            return this.bintools.bufferToB58(vb);
        }
        else if (type === "base64") {
            return vb.toString("base64");
        }
        else if (type === "hex") {
            return vb.toString("hex");
        }
        else if (type === "decimalString") {
            return new bn_js_1.default(vb.toString("hex"), "hex").toString(10);
        }
        else if (type === "number") {
            return new bn_js_1.default(vb.toString("hex"), "hex").toNumber();
        }
        else if (type === "utf8") {
            return vb.toString("utf8");
        }
        return undefined;
    }
    /**
     * Convert [[SerializedType]] to {@link https://github.com/feross/buffer|Buffer}
     *
     * @param v type of [[SerializedType]]
     * @param type [[SerializedType]]
     * @param ...args remaining arguments
     * @returns {@link https://github.com/feross/buffer|Buffer}
     */
    typeToBuffer(v, type, ...args) {
        if (type === "BN") {
            let str = v.toString("hex");
            if (args.length == 1 && typeof args[0] === "number") {
                return buffer_1.Buffer.from(str.padStart(args[0] * 2, "0"), "hex");
            }
            return buffer_1.Buffer.from(str, "hex");
        }
        else if (type === "Buffer") {
            return v;
        }
        else if (type === "bech32") {
            return this.bintools.stringToAddress(v, ...args);
        }
        else if (type === "nodeID") {
            return (0, helperfunctions_1.NodeIDStringToBuffer)(v);
        }
        else if (type === "privateKey") {
            return (0, helperfunctions_1.privateKeyStringToBuffer)(v);
        }
        else if (type === "cb58") {
            return this.bintools.cb58Decode(v);
        }
        else if (type === "base58") {
            return this.bintools.b58ToBuffer(v);
        }
        else if (type === "base64") {
            return buffer_1.Buffer.from(v, "base64");
        }
        else if (type === "hex") {
            if (v.startsWith("0x")) {
                v = v.slice(2);
            }
            return buffer_1.Buffer.from(v, "hex");
        }
        else if (type === "decimalString") {
            let str = new bn_js_1.default(v, 10).toString("hex");
            if (args.length == 1 && typeof args[0] === "number") {
                return buffer_1.Buffer.from(str.padStart(args[0] * 2, "0"), "hex");
            }
            return buffer_1.Buffer.from(str, "hex");
        }
        else if (type === "number") {
            let str = new bn_js_1.default(v, 10).toString("hex");
            if (args.length == 1 && typeof args[0] === "number") {
                return buffer_1.Buffer.from(str.padStart(args[0] * 2, "0"), "hex");
            }
            return buffer_1.Buffer.from(str, "hex");
        }
        else if (type === "utf8") {
            if (args.length == 1 && typeof args[0] === "number") {
                let b = buffer_1.Buffer.alloc(args[0]);
                b.write(v);
                return b;
            }
            return buffer_1.Buffer.from(v, "utf8");
        }
        return undefined;
    }
    /**
     * Convert value to type of [[SerializedType]] or [[SerializedEncoding]]
     *
     * @param value
     * @param encoding [[SerializedEncoding]]
     * @param intype [[SerializedType]]
     * @param outtype [[SerializedType]]
     * @param ...args remaining arguments
     * @returns type of [[SerializedType]] or [[SerializedEncoding]]
     */
    encoder(value, encoding, intype, outtype, ...args) {
        if (typeof value === "undefined") {
            throw new errors_1.UnknownTypeError("Error - Serializable.encoder: value passed is undefined");
        }
        if (encoding !== "display") {
            outtype = encoding;
        }
        const vb = this.typeToBuffer(value, intype, ...args);
        return this.bufferToType(vb, outtype, ...args);
    }
    /**
     * Convert value to type of [[SerializedType]] or [[SerializedEncoding]]
     *
     * @param value
     * @param encoding [[SerializedEncoding]]
     * @param intype [[SerializedType]]
     * @param outtype [[SerializedType]]
     * @param ...args remaining arguments
     * @returns type of [[SerializedType]] or [[SerializedEncoding]]
     */
    decoder(value, encoding, intype, outtype, ...args) {
        if (typeof value === "undefined") {
            throw new errors_1.UnknownTypeError("Error - Serializable.decoder: value passed is undefined");
        }
        if (encoding !== "display") {
            intype = encoding;
        }
        const vb = this.typeToBuffer(value, intype, ...args);
        return this.bufferToType(vb, outtype, ...args);
    }
    serialize(serialize, vm, encoding = "display", notes = undefined) {
        if (typeof notes === "undefined") {
            notes = serialize.getTypeName();
        }
        return {
            vm,
            encoding,
            version: exports.SERIALIZATIONVERSION,
            notes,
            fields: serialize.serialize(encoding)
        };
    }
    deserialize(input, output) {
        output.deserialize(input.fields, input.encoding);
    }
}
exports.Serialization = Serialization;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXphdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9zZXJpYWxpemF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILGlFQUF3QztBQUN4QyxrREFBc0I7QUFDdEIsb0NBQWdDO0FBQ2hDLGdGQUE0QztBQUM1Qyx1REFLMEI7QUFDMUIsNENBS3dCO0FBR1gsUUFBQSxvQkFBb0IsR0FBVyxDQUFDLENBQUE7QUF5QjdDLE1BQXNCLFlBQVk7SUFBbEM7UUFDWSxjQUFTLEdBQVcsU0FBUyxDQUFBO1FBQzdCLFlBQU8sR0FBVyxTQUFTLENBQUE7UUFDM0IsYUFBUSxHQUFXLFNBQVMsQ0FBQTtJQXFHeEMsQ0FBQztJQW5HQzs7T0FFRztJQUNILFdBQVc7UUFDVCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUE7SUFDdkIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUztRQUNQLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtJQUNyQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxVQUFVO1FBQ1IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFBO0lBQ3RCLENBQUM7SUFFRDs7T0FFRztJQUNILGNBQWMsQ0FBQyxHQUFXO1FBQ3hCLEtBQUssTUFBTSxDQUFDLElBQUksR0FBRyxFQUFFO1lBQ25CLElBQUksT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLFFBQVEsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDM0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7YUFDakM7aUJBQU0sSUFBSSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssUUFBUSxFQUFFO2dCQUMxQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxH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UUFBUSxDQUFBO1NBQ2xCO1FBQ0QsTUFBTSxFQUFFLEdBQVcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDNUQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtJQUNoRCxDQUFDO0lBRUQsU0FBUyxDQUNQLFNBQXVCLEVBQ3ZCLEVBQVUsRUFDVixXQUErQixTQUFTLEVBQ3hDLFFBQWdCLFNBQVM7UUFFekIsSUFBSSxPQUFPLEtBQUssS0FBSyxXQUFXLEVBQUU7WUFDaEMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtTQUNoQztRQUNELE9BQU87WUFDTCxFQUFFO1lBQ0YsUUFBUTtZQUNSLE9BQU8sRUFBRSw0QkFBb0I7WUFDN0IsS0FBSztZQUNMLE1BQU0sRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztTQUN0QyxDQUFBO0lBQ0gsQ0FBQztJQUVELFdBQVcsQ0FBQyxLQUFpQixFQUFFLE1BQW9CO1FBQ2pELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDbEQsQ0FBQztDQUNGO0FBbE1ELHNDQWtNQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIFV0aWxzLVNlcmlhbGl6YXRpb25cbiAqL1xuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgQk4gZnJvbSBcImJuLmpzXCJcbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBET01QdXJpZnkgZnJvbSBcImlzb21vcnBoaWMtZG9tcHVyaWZ5XCJcbmltcG9ydCB7XG4gIE5vZGVJRFN0cmluZ1RvQnVmZmVyLFxuICBwcml2YXRlS2V5U3RyaW5nVG9CdWZmZXIsXG4gIGJ1ZmZlclRvTm9kZUlEU3RyaW5nLFxuICBidWZmZXJUb1ByaXZhdGVLZXlTdHJpbmdcbn0gZnJvbSBcIi4vaGVscGVyZnVuY3Rpb25zXCJcbmltcG9ydCB7XG4gIENvZGVjSWRFcnJvcixcbiAgVHlwZUlkRXJyb3IsXG4gIFR5cGVOYW1lRXJyb3IsXG4gIFVua25vd25UeXBlRXJyb3Jcbn0gZnJvbSBcIi4uL3V0aWxzL2Vycm9yc1wiXG5pbXBvcnQgeyBTZXJpYWxpemVkIH0gZnJvbSBcIi4uL2NvbW1vblwiXG5cbmV4cG9ydCBjb25zdCBTRVJJQUxJWkFUSU9OVkVSU0lPTjogbnVtYmVyID0gMFxuZXhwb3J0IHR5cGUgU2VyaWFsaXplZFR5cGUgPVxuICB8IFwiaGV4XCJcbiAgfCBcIkJOXCJcbiAgfCBcIkJ1ZmZlclwiXG4gIHwgXCJiZWNoMzJcIlxuICB8IFwibm9kZUlEXCJcbiAgfCBcInByaXZhdGVLZXlcIlxuICB8IFwiY2I1OFwiXG4gIHwgXCJiYXNlNThcIlxuICB8IFwiYmFzZTY0XCJcbiAgfCBcImRlY2ltYWxTdHJpbmdcIlxuICB8IFwibnVtYmVyXCJcbiAgfCBcInV0ZjhcIlxuXG5leHBvcnQgdHlwZSBTZXJpYWxpemVkRW5jb2RpbmcgPVxuICB8IFwiaGV4XCJcbiAgfCBcImNiNThcIlxuICB8IFwiYmFzZTU4XCJcbiAgfCBcImJhc2U2NFwiXG4gIHwgXCJkZWNpbWFsU3RyaW5nXCJcbiAgfCBcIm51bWJlclwiXG4gIHwgXCJ1dGY4XCJcbiAgfCBcImRpc3BsYXlcIlxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU2VyaWFsaXphYmxlIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZTogc3RyaW5nID0gdW5kZWZpbmVkXG4gIHByb3RlY3RlZCBfdHlwZUlEOiBudW1iZXIgPSB1bmRlZmluZWRcbiAgcHJvdGVjdGVkIF9jb2RlY0lEOiBudW1iZXIgPSB1bmRlZmluZWRcblxuICAvKipcbiAgICogVXNlZCBpbiBzZXJpYWxpemF0aW9uLiBUeXBlTmFtZSBpcyBhIHN0cmluZyBuYW1lIGZvciB0aGUgdHlwZSBvZiBvYmplY3QgYmVpbmcgb3V0cHV0LlxuICAgKi9cbiAgZ2V0VHlwZU5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZU5hbWVcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIGluIHNlcmlhbGl6YXRpb24uIE9wdGlvbmFsLiBUeXBlSUQgaXMgYSBudW1iZXIgZm9yIHRoZSB0eXBlSUQgb2Ygb2JqZWN0IGJlaW5nIG91dHB1dC5cbiAgICovXG4gIGdldFR5cGVJRCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSURcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIGluIHNlcmlhbGl6YXRpb24uIE9wdGlvbmFsLiBUeXBlSUQgaXMgYSBudW1iZXIgZm9yIHRoZSB0eXBlSUQgb2Ygb2JqZWN0IGJlaW5nIG91dHB1dC5cbiAgICovXG4gIGdldENvZGVjSUQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29kZWNJRFxuICB9XG5cbiAgLyoqXG4gICAqIFNhbml0aXplIHRvIHByZXZlbnQgY3Jvc3Mgc2NyaXB0aW5nIGF0dGFja3MuXG4gICAqL1xuICBzYW5pdGl6ZU9iamVjdChvYmo6IG9iamVjdCk6IG9iamVjdCB7XG4gICAgZm9yIChjb25zdCBrIGluIG9iaikge1xuICAgICAgaWYgKHR5cGVvZiBvYmpbYCR7a31gXSA9PT0gXCJvYmplY3RcIiAmJiBvYmpbYCR7a31gXSAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnNhbml0aXplT2JqZWN0KG9ialtgJHtrfWBdKVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqW2Ake2t9YF0gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgb2JqW2Ake2t9YF0gPSBET01QdXJpZnkuc2FuaXRpemUob2JqW2Ake2t9YF0pXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmpcbiAgfVxuXG4gIC8vc29tZXRpbWVzIHRoZSBwYXJlbnQgY2xhc3MgbWFuYWdlcyB0aGUgZmllbGRzXG4gIC8vdGhlc2UgYXJlIHNvIHlvdSBjYW4gc2F5IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgc2VyaWFsaXplKGVuY29kaW5nPzogU2VyaWFsaXplZEVuY29kaW5nKTogb2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgX3R5cGVOYW1lOiBET01QdXJpZnkuc2FuaXRpemUodGhpcy5fdHlwZU5hbWUpLFxuICAgICAgX3R5cGVJRDogdHlwZW9mIHRoaXMuX3R5cGVJRCA9PT0gXCJ1bmRlZmluZWRcIiA/IG51bGwgOiB0aGlzLl90eXBlSUQsXG4gICAgICBfY29kZWNJRDogdHlwZW9mIHRoaXMuX2NvZGVjSUQgPT09IFwidW5kZWZpbmVkXCIgPyBudWxsIDogdGhpcy5fY29kZWNJRFxuICAgIH1cbiAgfVxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc/OiBTZXJpYWxpemVkRW5jb2RpbmcpOiB2b2lkIHtcbiAgICBmaWVsZHMgPSB0aGlzLnNhbml0aXplT2JqZWN0KGZpZWxkcylcbiAgICBpZiAodHlwZW9mIGZpZWxkc1tcIl90eXBlTmFtZVwiXSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgdGhyb3cgbmV3IFR5cGVOYW1lRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBTZXJpYWxpemFibGUuZGVzZXJpYWxpemU6IF90eXBlTmFtZSBtdXN0IGJlIGEgc3RyaW5nLCBmb3VuZDogXCIgK1xuICAgICAgICAgIHR5cGVvZiBmaWVsZHNbXCJfdHlwZU5hbWVcIl1cbiAgICAgIClcbiAgICB9XG4gICAgaWYgKGZpZWxkc1tcIl90eXBlTmFtZVwiXSAhPT0gdGhpcy5fdHlwZU5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlTmFtZUVycm9yKFxuICAgICAgICBcIkVycm9yIC0gU2VyaWFsaXphYmxlLmRlc2VyaWFsaXplOiBfdHlwZU5hbWUgbWlzbWF0Y2ggLS0gZXhwZWN0ZWQ6IFwiICtcbiAgICAgICAgICB0aGlzLl90eXBlTmFtZSArXG4gICAgICAgICAgXCIgLS0gcmVjZWl2ZWQ6IFwiICtcbiAgICAgICAgICBmaWVsZHNbXCJfdHlwZU5hbWVcIl1cbiAgICAgIClcbiAgICB9XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIGZpZWxkc1tcIl90eXBlSURcIl0gIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgIGZpZWxkc1tcIl90eXBlSURcIl0gIT09IG51bGxcbiAgICApIHtcbiAgICAgIGlmICh0eXBlb2YgZmllbGRzW1wiX3R5cGVJRFwiXSAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUlkRXJyb3IoXG4gICAgICAgICAgXCJFcnJvciAtIFNlcmlhbGl6YWJsZS5kZXNlcmlhbGl6ZTogX3R5cGVJRCBtdXN0IGJlIGEgbnVtYmVyLCBmb3VuZDogXCIgK1xuICAgICAgICAgICAgdHlwZW9mIGZpZWxkc1tcIl90eXBlSURcIl1cbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgaWYgKGZpZWxkc1tcIl90eXBlSURcIl0gIT09IHRoaXMuX3R5cGVJRCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUlkRXJyb3IoXG4gICAgICAgICAgXCJFcnJvciAtIFNlcmlhbGl6YWJsZS5kZXNlcmlhbGl6ZTogX3R5cGVJRCBtaXNtYXRjaCAtLSBleHBlY3RlZDogXCIgK1xuICAgICAgICAgICAgdGhpcy5fdHlwZUlEICtcbiAgICAgICAgICAgIFwiIC0tIHJlY2VpdmVkOiBcIiArXG4gICAgICAgICAgICBmaWVsZHNbXCJfdHlwZUlEXCJdXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIGZpZWxkc1tcIl9jb2RlY0lEXCJdICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICBmaWVsZHNbXCJfY29kZWNJRFwiXSAhPT0gbnVsbFxuICAgICkge1xuICAgICAgaWYgKHR5cGVvZiBmaWVsZHNbXCJfY29kZWNJRFwiXSAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICB0aHJvdyBuZXcgQ29kZWNJZEVycm9yKFxuICAgICAgICAgIFwiRXJyb3IgLSBTZXJpYWxpemFibGUuZGVzZXJpYWxpemU6IF9jb2RlY0lEIG11c3QgYmUgYSBudW1iZXIsIGZvdW5kOiBcIiArXG4gICAgICAgICAgICB0eXBlb2YgZmllbGRzW1wiX2NvZGVjSURcIl1cbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgaWYgKGZpZWxkc1tcIl9jb2RlY0lEXCJdICE9PSB0aGlzLl9jb2RlY0lEKSB7XG4gICAgICAgIHRocm93IG5ldyBDb2RlY0lkRXJyb3IoXG4gICAgICAgICAgXCJFcnJvciAtIFNlcmlhbGl6YWJsZS5kZXNlcmlhbGl6ZTogX2NvZGVjSUQgbWlzbWF0Y2ggLS0gZXhwZWN0ZWQ6IFwiICtcbiAgICAgICAgICAgIHRoaXMuX2NvZGVjSUQgK1xuICAgICAgICAgICAgXCIgLS0gcmVjZWl2ZWQ6IFwiICtcbiAgICAgICAgICAgIGZpZWxkc1tcIl9jb2RlY0lEXCJdXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNlcmlhbGl6YXRpb24ge1xuICBwcml2YXRlIHN0YXRpYyBpbnN0YW5jZTogU2VyaWFsaXphdGlvblxuXG4gIHByaXZhdGUgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5iaW50b29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbiAgfVxuICBwcml2YXRlIGJpbnRvb2xzOiBCaW5Ub29sc1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIFNlcmlhbGl6YXRpb24gc2luZ2xldG9uLlxuICAgKi9cbiAgc3RhdGljIGdldEluc3RhbmNlKCk6IFNlcmlhbGl6YXRpb24ge1xuICAgIGlmICghU2VyaWFsaXphdGlvbi5pbnN0YW5jZSkge1xuICAgICAgU2VyaWFsaXphdGlvbi5pbnN0YW5jZSA9IG5ldyBTZXJpYWxpemF0aW9uKClcbiAgICB9XG4gICAgcmV0dXJuIFNlcmlhbGl6YXRpb24uaW5zdGFuY2VcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHRvIFtbU2VyaWFsaXplZFR5cGVdXVxuICAgKlxuICAgKiBAcGFyYW0gdmIge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICogQHBhcmFtIHR5cGUgW1tTZXJpYWxpemVkVHlwZV1dXG4gICAqIEBwYXJhbSAuLi5hcmdzIHJlbWFpbmluZyBhcmd1bWVudHNcbiAgICogQHJldHVybnMgdHlwZSBvZiBbW1NlcmlhbGl6ZWRUeXBlXV1cbiAgICovXG4gIGJ1ZmZlclRvVHlwZSh2YjogQnVmZmVyLCB0eXBlOiBTZXJpYWxpemVkVHlwZSwgLi4uYXJnczogYW55W10pOiBhbnkge1xuICAgIGlmICh0eXBlID09PSBcIkJOXCIpIHtcbiAgICAgIHJldHVybiBuZXcgQk4odmIudG9TdHJpbmcoXCJoZXhcIiksIFwiaGV4XCIpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcIkJ1ZmZlclwiKSB7XG4gICAgICBpZiAoYXJncy5sZW5ndGggPT0gMSAmJiB0eXBlb2YgYXJnc1swXSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICB2YiA9IEJ1ZmZlci5mcm9tKHZiLnRvU3RyaW5nKFwiaGV4XCIpLnBhZFN0YXJ0KGFyZ3NbMF0gKiAyLCBcIjBcIiksIFwiaGV4XCIpXG4gICAgICB9XG4gICAgICByZXR1cm4gdmJcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiYmVjaDMyXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmJpbnRvb2xzLmFkZHJlc3NUb1N0cmluZyhhcmdzWzBdLCBhcmdzWzFdLCB2YilcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwibm9kZUlEXCIpIHtcbiAgICAgIHJldHVybiBidWZmZXJUb05vZGVJRFN0cmluZyh2YilcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwicHJpdmF0ZUtleVwiKSB7XG4gICAgICByZXR1cm4gYnVmZmVyVG9Qcml2YXRlS2V5U3RyaW5nKHZiKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJjYjU4XCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmJpbnRvb2xzLmNiNThFbmNvZGUodmIpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImJhc2U1OFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW50b29scy5idWZmZXJUb0I1OCh2YilcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiYmFzZTY0XCIpIHtcbiAgICAgIHJldHVybiB2Yi50b1N0cmluZyhcImJhc2U2NFwiKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJoZXhcIikge1xuICAgICAgcmV0dXJuIHZiLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImRlY2ltYWxTdHJpbmdcIikge1xuICAgICAgcmV0dXJuIG5ldyBCTih2Yi50b1N0cmluZyhcImhleFwiKSwgXCJoZXhcIikudG9TdHJpbmcoMTApXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcIm51bWJlclwiKSB7XG4gICAgICByZXR1cm4gbmV3IEJOKHZiLnRvU3RyaW5nKFwiaGV4XCIpLCBcImhleFwiKS50b051bWJlcigpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcInV0ZjhcIikge1xuICAgICAgcmV0dXJuIHZiLnRvU3RyaW5nKFwidXRmOFwiKVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBbW1NlcmlhbGl6ZWRUeXBlXV0gdG8ge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICpcbiAgICogQHBhcmFtIHYgdHlwZSBvZiBbW1NlcmlhbGl6ZWRUeXBlXV1cbiAgICogQHBhcmFtIHR5cGUgW1tTZXJpYWxpemVkVHlwZV1dXG4gICAqIEBwYXJhbSAuLi5hcmdzIHJlbWFpbmluZyBhcmd1bWVudHNcbiAgICogQHJldHVybnMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICovXG4gIHR5cGVUb0J1ZmZlcih2OiBhbnksIHR5cGU6IFNlcmlhbGl6ZWRUeXBlLCAuLi5hcmdzOiBhbnlbXSk6IEJ1ZmZlciB7XG4gICAgaWYgKHR5cGUgPT09IFwiQk5cIikge1xuICAgICAgbGV0IHN0cjogc3RyaW5nID0gKHYgYXMgQk4pLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICBpZiAoYXJncy5sZW5ndGggPT0gMSAmJiB0eXBlb2YgYXJnc1swXSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICByZXR1cm4gQnVmZmVyLmZyb20oc3RyLnBhZFN0YXJ0KGFyZ3NbMF0gKiAyLCBcIjBcIiksIFwiaGV4XCIpXG4gICAgICB9XG4gICAgICByZXR1cm4gQnVmZmVyLmZyb20oc3RyLCBcImhleFwiKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJCdWZmZXJcIikge1xuICAgICAgcmV0dXJuIHZcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiYmVjaDMyXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyh2LCAuLi5hcmdzKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJub2RlSURcIikge1xuICAgICAgcmV0dXJuIE5vZGVJRFN0cmluZ1RvQnVmZmVyKHYpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcInByaXZhdGVLZXlcIikge1xuICAgICAgcmV0dXJuIHByaXZhdGVLZXlTdHJpbmdUb0J1ZmZlcih2KVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJjYjU4XCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmJpbnRvb2xzLmNiNThEZWNvZGUodilcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiYmFzZTU4XCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmJpbnRvb2xzLmI1OFRvQnVmZmVyKHYpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImJhc2U2NFwiKSB7XG4gICAgICByZXR1cm4gQnVmZmVyLmZyb20odiBhcyBzdHJpbmcsIFwiYmFzZTY0XCIpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImhleFwiKSB7XG4gICAgICBpZiAoKHYgYXMgc3RyaW5nKS5zdGFydHNXaXRoKFwiMHhcIikpIHtcbiAgICAgICAgdiA9ICh2IGFzIHN0cmluZykuc2xpY2UoMilcbiAgICAgIH1cbiAgICAgIHJldHVybiBCdWZmZXIuZnJvbSh2IGFzIHN0cmluZywgXCJoZXhcIilcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiZGVjaW1hbFN0cmluZ1wiKSB7XG4gICAgICBsZXQgc3RyOiBzdHJpbmcgPSBuZXcgQk4odiBhcyBzdHJpbmcsIDEwKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09IDEgJiYgdHlwZW9mIGFyZ3NbMF0gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHN0ci5wYWRTdGFydChhcmdzWzBdICogMiwgXCIwXCIpLCBcImhleFwiKVxuICAgICAgfVxuICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHN0ciwgXCJoZXhcIilcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIGxldCBzdHI6IHN0cmluZyA9IG5ldyBCTih2LCAxMCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PSAxICYmIHR5cGVvZiBhcmdzWzBdID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHJldHVybiBCdWZmZXIuZnJvbShzdHIucGFkU3RhcnQoYXJnc1swXSAqIDIsIFwiMFwiKSwgXCJoZXhcIilcbiAgICAgIH1cbiAgICAgIHJldHVybiBCdWZmZXIuZnJvbShzdHIsIFwiaGV4XCIpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcInV0ZjhcIikge1xuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09IDEgJiYgdHlwZW9mIGFyZ3NbMF0gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgbGV0IGI6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhhcmdzWzBdKVxuICAgICAgICBiLndyaXRlKHYpXG4gICAgICAgIHJldHVybiBiXG4gICAgICB9XG4gICAgICByZXR1cm4gQnVmZmVyLmZyb20odiwgXCJ1dGY4XCIpXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHZhbHVlIHRvIHR5cGUgb2YgW1tTZXJpYWxpemVkVHlwZV1dIG9yIFtbU2VyaWFsaXplZEVuY29kaW5nXV1cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqIEBwYXJhbSBlbmNvZGluZyBbW1NlcmlhbGl6ZWRFbmNvZGluZ11dXG4gICAqIEBwYXJhbSBpbnR5cGUgW1tTZXJpYWxpemVkVHlwZV1dXG4gICAqIEBwYXJhbSBvdXR0eXBlIFtbU2VyaWFsaXplZFR5cGVdXVxuICAgKiBAcGFyYW0gLi4uYXJncyByZW1haW5pbmcgYXJndW1lbnRzXG4gICAqIEByZXR1cm5zIHR5cGUgb2YgW1tTZXJpYWxpemVkVHlwZV1dIG9yIFtbU2VyaWFsaXplZEVuY29kaW5nXV1cbiAgICovXG4gIGVuY29kZXIoXG4gICAgdmFsdWU6IGFueSxcbiAgICBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nLFxuICAgIGludHlwZTogU2VyaWFsaXplZFR5cGUsXG4gICAgb3V0dHlwZTogU2VyaWFsaXplZFR5cGUsXG4gICAgLi4uYXJnczogYW55W11cbiAgKTogYW55IHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aHJvdyBuZXcgVW5rbm93blR5cGVFcnJvcihcbiAgICAgICAgXCJFcnJvciAtIFNlcmlhbGl6YWJsZS5lbmNvZGVyOiB2YWx1ZSBwYXNzZWQgaXMgdW5kZWZpbmVkXCJcbiAgICAgIClcbiAgICB9XG4gICAgaWYgKGVuY29kaW5nICE9PSBcImRpc3BsYXlcIikge1xuICAgICAgb3V0dHlwZSA9IGVuY29kaW5nXG4gICAgfVxuICAgIGNvbnN0IHZiOiBCdWZmZXIgPSB0aGlzLnR5cGVUb0J1ZmZlcih2YWx1ZSwgaW50eXBlLCAuLi5hcmdzKVxuICAgIHJldHVybiB0aGlzLmJ1ZmZlclRvVHlwZSh2Yiwgb3V0dHlwZSwgLi4uYXJncylcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHZhbHVlIHRvIHR5cGUgb2YgW1tTZXJpYWxpemVkVHlwZV1dIG9yIFtbU2VyaWFsaXplZEVuY29kaW5nXV1cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqIEBwYXJhbSBlbmNvZGluZyBbW1NlcmlhbGl6ZWRFbmNvZGluZ11dXG4gICAqIEBwYXJhbSBpbnR5cGUgW1tTZXJpYWxpemVkVHlwZV1dXG4gICAqIEBwYXJhbSBvdXR0eXBlIFtbU2VyaWFsaXplZFR5cGVdXVxuICAgKiBAcGFyYW0gLi4uYXJncyByZW1haW5pbmcgYXJndW1lbnRzXG4gICAqIEByZXR1cm5zIHR5cGUgb2YgW1tTZXJpYWxpemVkVHlwZV1dIG9yIFtbU2VyaWFsaXplZEVuY29kaW5nXV1cbiAgICovXG4gIGRlY29kZXIoXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nLFxuICAgIGludHlwZTogU2VyaWFsaXplZFR5cGUsXG4gICAgb3V0dHlwZTogU2VyaWFsaXplZFR5cGUsXG4gICAgLi4uYXJnczogYW55W11cbiAgKTogYW55IHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aHJvdyBuZXcgVW5rbm93blR5cGVFcnJvcihcbiAgICAgICAgXCJFcnJvciAtIFNlcmlhbGl6YWJsZS5kZWNvZGVyOiB2YWx1ZSBwYXNzZWQgaXMgdW5kZWZpbmVkXCJcbiAgICAgIClcbiAgICB9XG4gICAgaWYgKGVuY29kaW5nICE9PSBcImRpc3BsYXlcIikge1xuICAgICAgaW50eXBlID0gZW5jb2RpbmdcbiAgICB9XG4gICAgY29uc3QgdmI6IEJ1ZmZlciA9IHRoaXMudHlwZVRvQnVmZmVyKHZhbHVlLCBpbnR5cGUsIC4uLmFyZ3MpXG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyVG9UeXBlKHZiLCBvdXR0eXBlLCAuLi5hcmdzKVxuICB9XG5cbiAgc2VyaWFsaXplKFxuICAgIHNlcmlhbGl6ZTogU2VyaWFsaXphYmxlLFxuICAgIHZtOiBzdHJpbmcsXG4gICAgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiZGlzcGxheVwiLFxuICAgIG5vdGVzOiBzdHJpbmcgPSB1bmRlZmluZWRcbiAgKTogU2VyaWFsaXplZCB7XG4gICAgaWYgKHR5cGVvZiBub3RlcyA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbm90ZXMgPSBzZXJpYWxpemUuZ2V0VHlwZU5hbWUoKVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgdm0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIHZlcnNpb246IFNFUklBTElaQVRJT05WRVJTSU9OLFxuICAgICAgbm90ZXMsXG4gICAgICBmaWVsZHM6IHNlcmlhbGl6ZS5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgfVxuICB9XG5cbiAgZGVzZXJpYWxpemUoaW5wdXQ6IFNlcmlhbGl6ZWQsIG91dHB1dDogU2VyaWFsaXphYmxlKSB7XG4gICAgb3V0cHV0LmRlc2VyaWFsaXplKGlucHV0LmZpZWxkcywgaW5wdXQuZW5jb2RpbmcpXG4gIH1cbn1cbiJdfQ==