"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Base58 = void 0;
/**
 * @packageDocumentation
 * @module Utils-Base58
 */
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer/");
const errors_1 = require("../utils/errors");
/**
 * A Base58 class that uses the cross-platform Buffer module. Built so that Typescript
 * will accept the code.
 *
 * ```js
 * let b58:Base58 = new Base58();
 * let str:string = b58.encode(somebuffer);
 * let buff:Buffer = b58.decode(somestring);
 * ```
 */
class Base58 {
    constructor() {
        this.b58alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        this.alphabetIdx0 = "1";
        this.b58 = [
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 255, 255, 255, 255, 255, 255,
            255, 9, 10, 11, 12, 13, 14, 15, 16, 255, 17, 18, 19, 20, 21, 255, 22, 23,
            24, 25, 26, 27, 28, 29, 30, 31, 32, 255, 255, 255, 255, 255, 255, 33, 34,
            35, 36, 37, 38, 39, 40, 41, 42, 43, 255, 44, 45, 46, 47, 48, 49, 50, 51, 52,
            53, 54, 55, 56, 57, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255
        ];
        this.big58Radix = new bn_js_1.default(58);
        this.bigZero = new bn_js_1.default(0);
        /**
         * Encodes a {@link https://github.com/feross/buffer|Buffer} as a base-58 string
         *
         * @param buff A {@link https://github.com/feross/buffer|Buffer} to encode
         *
         * @returns A base-58 string.
         */
        this.encode = (buff) => {
            let x = new bn_js_1.default(buff.toString("hex"), "hex", "be");
            let answer = ""; // = Buffer.alloc(buff.length*136/100, 0);
            while (x.cmp(this.bigZero) > 0) {
                const mod = x.mod(this.big58Radix);
                x = x.div(this.big58Radix);
                answer += this.b58alphabet[mod.toNumber()];
            }
            for (let i = 0; i < buff.length; i++) {
                if (buff.readUInt8(i) !== 0) {
                    break;
                }
                answer += this.alphabetIdx0;
            }
            return answer.split("").reverse().join("");
        };
        /**
         * Decodes a base-58 into a {@link https://github.com/feross/buffer|Buffer}
         *
         * @param b A base-58 string to decode
         *
         * @returns A {@link https://github.com/feross/buffer|Buffer} from the decoded string.
         */
        this.decode = (b) => {
            const answer = new bn_js_1.default(0);
            const j = new bn_js_1.default(1);
            for (let i = b.length - 1; i >= 0; i--) {
                const tmp = this.b58[b.charCodeAt(i)];
                if (tmp === 255) {
                    throw new errors_1.Base58Error("Error - Base58.decode: not a valid base58 string");
                }
                const scratch = new bn_js_1.default(tmp);
                scratch.imul(j);
                answer.iadd(scratch);
                j.imul(this.big58Radix);
            }
            /* we need to make sure the prefaced 0's are put back to be even in this string */
            let anshex = answer.toString("hex");
            anshex = anshex.length % 2 ? `0${anshex}` : anshex;
            /**
             * We need to replace all zeros that were removed during our conversation process.
             * This ensures the buffer returns is the appropriate length.
             */
            const tmpval = buffer_1.Buffer.from(anshex, "hex");
            let numZeros;
            for (numZeros = 0; numZeros < b.length; numZeros++) {
                if (b[`${numZeros}`] !== this.alphabetIdx0) {
                    break;
                }
            }
            const xlen = numZeros + tmpval.length;
            const result = buffer_1.Buffer.alloc(xlen, 0);
            tmpval.copy(result, numZeros);
            return result;
        };
    }
    /**
     * Retrieves the Base58 singleton.
     */
    static getInstance() {
        if (!Base58.instance) {
            Base58.instance = new Base58();
        }
        return Base58.instance;
    }
}
exports.Base58 = Base58;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZTU4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL2Jhc2U1OC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxrREFBc0I7QUFDdEIsb0NBQWdDO0FBQ2hDLDRDQUE2QztBQUU3Qzs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFhLE1BQU07SUFHakI7UUFZVSxnQkFBVyxHQUNuQiw0REFBNEQsQ0FBQTtRQUVwRCxpQkFBWSxHQUFHLEdBQUcsQ0FBQTtRQUVsQixRQUFHLEdBQUc7WUFDZCxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7WUFDekUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO1lBQ3pFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztZQUN6RSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO1lBQzNFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRTtZQUN4RSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRTtZQUN4RSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO1lBQzNFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7WUFDekUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO1lBQ3pFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztZQUN6RSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7WUFDekUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO1lBQ3pFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztZQUN6RSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7WUFDekUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO1lBQ3pFLEdBQUcsRUFB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QU0sTUFBTSxHQUFXLGVBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFBO1lBQ2pELElBQUksUUFBZ0IsQ0FBQTtZQUNwQixLQUFLLFFBQVEsR0FBRyxDQUFDLEVBQUUsUUFBUSxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEVBQUU7Z0JBQ2xELElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUMsS0FBSyxJQUFJLENBQUMsWUFBWSxFQUFFO29CQUMxQyxNQUFLO2lCQUNOO2FBQ0Y7WUFDRCxNQUFNLElBQUksR0FBVyxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQTtZQUM3QyxNQUFNLE1BQU0sR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQTtZQUM1QyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtZQUU3QixPQUFPLE1BQU0sQ0FBQTtRQUNmLENBQUMsQ0FBQTtJQTlHc0IsQ0FBQztJQUV4Qjs7T0FFRztJQUNILE1BQU0sQ0FBQyxXQUFXO1FBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ3BCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQTtTQUMvQjtRQUNELE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQTtJQUN4QixDQUFDO0NBcUdGO0FBbEhELHdCQWtIQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIFV0aWxzLUJhc2U1OFxuICovXG5pbXBvcnQgQk4gZnJvbSBcImJuLmpzXCJcbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCB7IEJhc2U1OEVycm9yIH0gZnJvbSBcIi4uL3V0aWxzL2Vycm9yc1wiXG5cbi8qKlxuICogQSBCYXNlNTggY2xhc3MgdGhhdCB1c2VzIHRoZSBjcm9zcy1wbGF0Zm9ybSBCdWZmZXIgbW9kdWxlLiBCdWlsdCBzbyB0aGF0IFR5cGVzY3JpcHRcbiAqIHdpbGwgYWNjZXB0IHRoZSBjb2RlLlxuICpcbiAqIGBgYGpzXG4gKiBsZXQgYjU4OkJhc2U1OCA9IG5ldyBCYXNlNTgoKTtcbiAqIGxldCBzdHI6c3RyaW5nID0gYjU4LmVuY29kZShzb21lYnVmZmVyKTtcbiAqIGxldCBidWZmOkJ1ZmZlciA9IGI1OC5kZWNvZGUoc29tZXN0cmluZyk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIEJhc2U1OCB7XG4gIHByaXZhdGUgc3RhdGljIGluc3RhbmNlOiBCYXNlNThcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge31cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBCYXNlNTggc2luZ2xldG9uLlxuICAgKi9cbiAgc3RhdGljIGdldEluc3RhbmNlKCk6IEJhc2U1OCB7XG4gICAgaWYgKCFCYXNlNTguaW5zdGFuY2UpIHtcbiAgICAgIEJhc2U1OC5pbnN0YW5jZSA9IG5ldyBCYXNlNTgoKVxuICAgIH1cbiAgICByZXR1cm4gQmFzZTU4Lmluc3RhbmNlXG4gIH1cblxuICBwcm90ZWN0ZWQgYjU4YWxwaGFiZXQ6IHN0cmluZyA9XG4gICAgXCIxMjM0NTY3ODlBQkNERUZHSEpLTE1OUFFSU1RVVldYWVphYmNkZWZnaGlqa21ub3BxcnN0dXZ3eHl6XCJcblxuICBwcm90ZWN0ZWQgYWxwaGFiZXRJZHgwID0gXCIxXCJcblxuICBwcm90ZWN0ZWQgYjU4ID0gW1xuICAgIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsXG4gICAgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSxcbiAgICAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LFxuICAgIDI1NSwgMjU1LCAyNTUsIDI1NSwgMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSxcbiAgICAyNTUsIDksIDEwLCAxMSwgMTIsIDEzLCAxNCwgMTUsIDE2LCAyNTUsIDE3LCAxOCwgMTksIDIwLCAyMSwgMjU1LCAyMiwgMjMsXG4gICAgMjQsIDI1LCAyNiwgMjcsIDI4LCAyOSwgMzAsIDMxLCAzMiwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMzMsIDM0LFxuICAgIDM1LCAzNiwgMzcsIDM4LCAzOSwgNDAsIDQxLCA0MiwgNDMsIDI1NSwgNDQsIDQ1LCA0NiwgNDcsIDQ4LCA0OSwgNTAsIDUxLCA1MixcbiAgICA1MywgNTQsIDU1LCA1NiwgNTcsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LFxuICAgIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsXG4gICAgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSxcbiAgICAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LFxuICAgIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsXG4gICAgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSxcbiAgICAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LFxuICAgIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsXG4gICAgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDI1NSxcbiAgICAyNTUsIDI1NVxuICBdXG5cbiAgcHJvdGVjdGVkIGJpZzU4UmFkaXg6IEJOID0gbmV3IEJOKDU4KVxuXG4gIHByb3RlY3RlZCBiaWdaZXJvOiBCTiA9IG5ldyBCTigwKVxuXG4gIC8qKlxuICAgKiBFbmNvZGVzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gYXMgYSBiYXNlLTU4IHN0cmluZ1xuICAgKlxuICAgKiBAcGFyYW0gYnVmZiBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHRvIGVuY29kZVxuICAgKlxuICAgKiBAcmV0dXJucyBBIGJhc2UtNTggc3RyaW5nLlxuICAgKi9cbiAgZW5jb2RlID0gKGJ1ZmY6IEJ1ZmZlcik6IHN0cmluZyA9PiB7XG4gICAgbGV0IHg6IEJOID0gbmV3IEJOKGJ1ZmYudG9TdHJpbmcoXCJoZXhcIiksIFwiaGV4XCIsIFwiYmVcIilcbiAgICBsZXQgYW5zd2VyOiBzdHJpbmcgPSBcIlwiIC8vID0gQnVmZmVyLmFsbG9jKGJ1ZmYubGVuZ3RoKjEzNi8xMDAsIDApO1xuICAgIHdoaWxlICh4LmNtcCh0aGlzLmJpZ1plcm8pID4gMCkge1xuICAgICAgY29uc3QgbW9kOiBCTiA9IHgubW9kKHRoaXMuYmlnNThSYWRpeClcbiAgICAgIHggPSB4LmRpdih0aGlzLmJpZzU4UmFkaXgpXG4gICAgICBhbnN3ZXIgKz0gdGhpcy5iNThhbHBoYWJldFttb2QudG9OdW1iZXIoKV1cbiAgICB9XG5cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgYnVmZi5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGJ1ZmYucmVhZFVJbnQ4KGkpICE9PSAwKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBhbnN3ZXIgKz0gdGhpcy5hbHBoYWJldElkeDBcbiAgICB9XG4gICAgcmV0dXJuIGFuc3dlci5zcGxpdChcIlwiKS5yZXZlcnNlKCkuam9pbihcIlwiKVxuICB9XG5cbiAgLyoqXG4gICAqIERlY29kZXMgYSBiYXNlLTU4IGludG8gYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKlxuICAgKiBAcGFyYW0gYiBBIGJhc2UtNTggc3RyaW5nIHRvIGRlY29kZVxuICAgKlxuICAgKiBAcmV0dXJucyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZyb20gdGhlIGRlY29kZWQgc3RyaW5nLlxuICAgKi9cbiAgZGVjb2RlID0gKGI6IHN0cmluZyk6IEJ1ZmZlciA9PiB7XG4gICAgY29uc3QgYW5zd2VyOiBCTiA9IG5ldyBCTigwKVxuICAgIGNvbnN0IGo6IEJOID0gbmV3IEJOKDEpXG5cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSBiLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCB0bXA6IG51bWJlciA9IHRoaXMuYjU4W2IuY2hhckNvZGVBdChpKV1cbiAgICAgIGlmICh0bXAgPT09IDI1NSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZTU4RXJyb3IoXG4gICAgICAgICAgXCJFcnJvciAtIEJhc2U1OC5kZWNvZGU6IG5vdCBhIHZhbGlkIGJhc2U1OCBzdHJpbmdcIlxuICAgICAgICApXG4gICAgICB9XG4gICAgICBjb25zdCBzY3JhdGNoOiBCTiA9IG5ldyBCTih0bXApXG4gICAgICBzY3JhdGNoLmltdWwoailcbiAgICAgIGFuc3dlci5pYWRkKHNjcmF0Y2gpXG4gICAgICBqLmltdWwodGhpcy5iaWc1OFJhZGl4KVxuICAgIH1cblxuICAgIC8qIHdlIG5lZWQgdG8gbWFrZSBzdXJlIHRoZSBwcmVmYWNlZCAwJ3MgYXJlIHB1dCBiYWNrIHRvIGJlIGV2ZW4gaW4gdGhpcyBzdHJpbmcgKi9cbiAgICBsZXQgYW5zaGV4ID0gYW5zd2VyLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgYW5zaGV4ID0gYW5zaGV4Lmxlbmd0aCAlIDIgPyBgMCR7YW5zaGV4fWAgOiBhbnNoZXhcblxuICAgIC8qKlxuICAgICAqIFdlIG5lZWQgdG8gcmVwbGFjZSBhbGwgemVyb3MgdGhhdCB3ZXJlIHJlbW92ZWQgZHVyaW5nIG91ciBjb252ZXJzYXRpb24gcHJvY2Vzcy5cbiAgICAgKiBUaGlzIGVuc3VyZXMgdGhlIGJ1ZmZlciByZXR1cm5zIGlzIHRoZSBhcHByb3ByaWF0ZSBsZW5ndGguXG4gICAgICovXG4gICAgY29uc3QgdG1wdmFsOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShhbnNoZXgsIFwiaGV4XCIpXG4gICAgbGV0IG51bVplcm9zOiBudW1iZXJcbiAgICBmb3IgKG51bVplcm9zID0gMDsgbnVtWmVyb3MgPCBiLmxlbmd0aDsgbnVtWmVyb3MrKykge1xuICAgICAgaWYgKGJbYCR7bnVtWmVyb3N9YF0gIT09IHRoaXMuYWxwaGFiZXRJZHgwKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHhsZW46IG51bWJlciA9IG51bVplcm9zICsgdG1wdmFsLmxlbmd0aFxuICAgIGNvbnN0IHJlc3VsdDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKHhsZW4sIDApXG4gICAgdG1wdmFsLmNvcHkocmVzdWx0LCBudW1aZXJvcylcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxufVxuIl19