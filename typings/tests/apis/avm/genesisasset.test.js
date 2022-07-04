"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bn_js_1 = __importDefault(require("bn.js"));
const outputs_1 = require("../../../src/apis/avm/outputs");
const initialstates_1 = require("../../../src/apis/avm/initialstates");
const avm_1 = require("../../../src/apis/avm");
const utils_1 = require("../../../src/utils");
/**
 * @ignore
 */
const serialization = utils_1.Serialization.getInstance();
describe("AVM", () => {
    test("GenesisAsset", () => {
        const m = "2Zc54v4ek37TEwu4LiV3j41PUMRd6acDDU3ZCVSxE7X";
        const mHex = "66726f6d20736e6f77666c616b6520746f206176616c616e636865";
        const blockchainIDHex = "0000000000000000000000000000000000000000000000000000000000000000";
        const hex = "hex";
        const cb58 = "cb58";
        const bech32 = "bech32";
        const memo = serialization.typeToBuffer(m, cb58);
        const amount = new bn_js_1.default(0);
        const address = "X-local18jma8ppw3nhx5r4ap8clazz0dps7rv5u00z96u";
        const addressBuf = serialization.typeToBuffer(address, bech32);
        const threshold = 1;
        const locktime = new bn_js_1.default(0);
        const assetAlias = "asset1";
        const name = "asset1";
        const symbol = "MFCA";
        const denomination = 1;
        const outs = [];
        const ins = [];
        const vcapSecpOutput = new outputs_1.SECPTransferOutput(amount, [addressBuf], locktime, threshold);
        const initialStates = new initialstates_1.InitialStates();
        initialStates.addOutput(vcapSecpOutput);
        const genesisAsset = new avm_1.GenesisAsset(assetAlias, name, symbol, denomination, initialStates, memo);
        const genesisAsset2 = new avm_1.GenesisAsset();
        genesisAsset2.fromBuffer(genesisAsset.toBuffer());
        expect(genesisAsset.toBuffer().toString("hex")).toBe(genesisAsset2.toBuffer().toString("hex"));
        expect(genesisAsset.getTypeName()).toBe("GenesisAsset");
        expect(genesisAsset.getTypeID()).toBeUndefined();
        expect(genesisAsset.getCodecID()).toBeUndefined();
        expect(genesisAsset.getNetworkID()).toBe(utils_1.DefaultNetworkID);
        expect(genesisAsset.getName()).toBe(name);
        expect(genesisAsset.getAssetAlias()).toBe(assetAlias);
        expect(genesisAsset.getSymbol()).toBe(symbol);
        expect(genesisAsset.getDenomination()).toBe(denomination);
        expect(genesisAsset.getBlockchainID().toString(hex)).toBe(blockchainIDHex);
        expect(genesisAsset.getIns()).toEqual(outs);
        expect(genesisAsset.getOuts()).toEqual(ins);
        expect(genesisAsset.getInitialStates()).toStrictEqual(initialStates);
        expect(genesisAsset.getMemo().toString(hex)).toBe(mHex);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXNpc2Fzc2V0LnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0cy9hcGlzL2F2bS9nZW5lc2lzYXNzZXQudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGtEQUFzQjtBQUV0QiwyREFHc0M7QUFDdEMsdUVBQW1FO0FBQ25FLCtDQUF1RTtBQUN2RSw4Q0FLMkI7QUFFM0I7O0dBRUc7QUFDSCxNQUFNLGFBQWEsR0FBa0IscUJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNoRSxRQUFRLENBQUMsS0FBSyxFQUFFLEdBQVMsRUFBRTtJQUN6QixJQUFJLENBQUMsY0FBYyxFQUFFLEdBQVMsRUFBRTtRQUM5QixNQUFNLENBQUMsR0FBVyw2Q0FBNkMsQ0FBQTtRQUMvRCxNQUFNLElBQUksR0FDUix3REFBd0QsQ0FBQTtRQUMxRCxNQUFNLGVBQWUsR0FDbkIsa0VBQWtFLENBQUE7UUFDcEUsTUFBTSxHQUFHLEdBQXVCLEtBQUssQ0FBQTtRQUNyQyxNQUFNLElBQUksR0FBbUIsTUFBTSxDQUFBO1FBQ25DLE1BQU0sTUFBTSxHQUFtQixRQUFRLENBQUE7UUFDdkMsTUFBTSxJQUFJLEdBQVcsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDeEQsTUFBTSxNQUFNLEdBQU8sSUFBSSxlQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDNUIsTUFBTSxPQUFPLEdBQVcsZ0RBQWdELENBQUE7UUFDeEUsTUFBTSxVQUFVLEdBQVcsYUFBYSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDdEUsTUFBTSxTQUFTLEdBQVcsQ0FBQyxDQUFBO1FBQzNCLE1BQU0sUUFBUSxHQUFPLElBQUksZUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzlCLE1BQU0sVUFBVSxHQUFXLFFBQVEsQ0FBQTtRQUNuQyxNQUFNLElBQUksR0FBVyxRQUFRLENBQUE7UUFDN0IsTUFBTSxNQUFNLEdBQVcsTUFBTSxDQUFBO1FBQzdCLE1BQU0sWUFBWSxHQUFXLENBQUMsQ0FBQTtRQUM5QixNQUFNLElBQUksR0FBeUIsRUFBRSxDQUFBO1FBQ3JDLE1BQU0sR0FBRyxHQUF3QixFQUFFLENBQUE7UUFDbkMsTUFBTSxjQUFjLEdBQUcsSUFBSSw0QkFBa0IsQ0FDM0MsTUFBTSxFQUNOLENBQUMsVUFBVSxDQUFDLEVBQ1osUUFBUSxFQUNSLFNBQVMsQ0FDVixDQUFBO1FBQ0QsTUFBTSxhQUFhLEdBQWtCLElBQUksNkJBQWEsRUFBRSxDQUFBO1FBQ3hELGFBQWEsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUE7UUFDdkMsTUFBTSxZQUFZLEdBQWlCLElBQUksa0JBQVksQ0FDakQsVUFBVSxFQUNWLElBQUksRUFDSixNQUFNLEVBQ04sWUFBWSxFQUNaLGFBQWEsRUFDYixJQUFJLENBQ0wsQ0FBQTtRQUNELE1BQU0sYUFBYSxHQUFpQixJQUFJLGtCQUFZLEVBQUUsQ0FBQTtRQUN0RCxhQUFhLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1FBQ2pELE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUNsRCxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUN6QyxDQUFBO1FBQ0QsTUFBTSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQTtRQUN2RCxNQUFNLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUE7UUFDaEQsTUFBTSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFBO1FBQ2pELE1BQU0sQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsd0JBQWdCLENBQUMsQ0FBQTtRQUMxRCxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3pDLE1BQU0sQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDckQsTUFBTSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUM3QyxNQUFNLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQ3pELE1BQU0sQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFBO1FBQzFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDM0MsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUMzQyxNQUFNLENBQUMsWUFBWSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUE7UUFDcEUsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDekQsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCTiBmcm9tIFwiYm4uanNcIlxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IHtcbiAgU0VDUFRyYW5zZmVyT3V0cHV0LFxuICBUcmFuc2ZlcmFibGVPdXRwdXRcbn0gZnJvbSBcIi4uLy4uLy4uL3NyYy9hcGlzL2F2bS9vdXRwdXRzXCJcbmltcG9ydCB7IEluaXRpYWxTdGF0ZXMgfSBmcm9tIFwiLi4vLi4vLi4vc3JjL2FwaXMvYXZtL2luaXRpYWxzdGF0ZXNcIlxuaW1wb3J0IHsgR2VuZXNpc0Fzc2V0LCBUcmFuc2ZlcmFibGVJbnB1dCB9IGZyb20gXCIuLi8uLi8uLi9zcmMvYXBpcy9hdm1cIlxuaW1wb3J0IHtcbiAgRGVmYXVsdE5ldHdvcmtJRCxcbiAgU2VyaWFsaXphdGlvbixcbiAgU2VyaWFsaXplZEVuY29kaW5nLFxuICBTZXJpYWxpemVkVHlwZVxufSBmcm9tIFwiLi4vLi4vLi4vc3JjL3V0aWxzXCJcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcbmRlc2NyaWJlKFwiQVZNXCIsICgpOiB2b2lkID0+IHtcbiAgdGVzdChcIkdlbmVzaXNBc3NldFwiLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3QgbTogc3RyaW5nID0gXCIyWmM1NHY0ZWszN1RFd3U0TGlWM2o0MVBVTVJkNmFjRERVM1pDVlN4RTdYXCJcbiAgICBjb25zdCBtSGV4OiBzdHJpbmcgPVxuICAgICAgXCI2NjcyNmY2ZDIwNzM2ZTZmNzc2NjZjNjE2YjY1MjA3NDZmMjA2MTc2NjE2YzYxNmU2MzY4NjVcIlxuICAgIGNvbnN0IGJsb2NrY2hhaW5JREhleDogc3RyaW5nID1cbiAgICAgIFwiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMFwiXG4gICAgY29uc3QgaGV4OiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiXG4gICAgY29uc3QgY2I1ODogU2VyaWFsaXplZFR5cGUgPSBcImNiNThcIlxuICAgIGNvbnN0IGJlY2gzMjogU2VyaWFsaXplZFR5cGUgPSBcImJlY2gzMlwiXG4gICAgY29uc3QgbWVtbzogQnVmZmVyID0gc2VyaWFsaXphdGlvbi50eXBlVG9CdWZmZXIobSwgY2I1OClcbiAgICBjb25zdCBhbW91bnQ6IEJOID0gbmV3IEJOKDApXG4gICAgY29uc3QgYWRkcmVzczogc3RyaW5nID0gXCJYLWxvY2FsMThqbWE4cHB3M25oeDVyNGFwOGNsYXp6MGRwczdydjV1MDB6OTZ1XCJcbiAgICBjb25zdCBhZGRyZXNzQnVmOiBCdWZmZXIgPSBzZXJpYWxpemF0aW9uLnR5cGVUb0J1ZmZlcihhZGRyZXNzLCBiZWNoMzIpXG4gICAgY29uc3QgdGhyZXNob2xkOiBudW1iZXIgPSAxXG4gICAgY29uc3QgbG9ja3RpbWU6IEJOID0gbmV3IEJOKDApXG4gICAgY29uc3QgYXNzZXRBbGlhczogc3RyaW5nID0gXCJhc3NldDFcIlxuICAgIGNvbnN0IG5hbWU6IHN0cmluZyA9IFwiYXNzZXQxXCJcbiAgICBjb25zdCBzeW1ib2w6IHN0cmluZyA9IFwiTUZDQVwiXG4gICAgY29uc3QgZGVub21pbmF0aW9uOiBudW1iZXIgPSAxXG4gICAgY29uc3Qgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXVxuICAgIGNvbnN0IGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IFtdXG4gICAgY29uc3QgdmNhcFNlY3BPdXRwdXQgPSBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KFxuICAgICAgYW1vdW50LFxuICAgICAgW2FkZHJlc3NCdWZdLFxuICAgICAgbG9ja3RpbWUsXG4gICAgICB0aHJlc2hvbGRcbiAgICApXG4gICAgY29uc3QgaW5pdGlhbFN0YXRlczogSW5pdGlhbFN0YXRlcyA9IG5ldyBJbml0aWFsU3RhdGVzKClcbiAgICBpbml0aWFsU3RhdGVzLmFkZE91dHB1dCh2Y2FwU2VjcE91dHB1dClcbiAgICBjb25zdCBnZW5lc2lzQXNzZXQ6IEdlbmVzaXNBc3NldCA9IG5ldyBHZW5lc2lzQXNzZXQoXG4gICAgICBhc3NldEFsaWFzLFxuICAgICAgbmFtZSxcbiAgICAgIHN5bWJvbCxcbiAgICAgIGRlbm9taW5hdGlvbixcbiAgICAgIGluaXRpYWxTdGF0ZXMsXG4gICAgICBtZW1vXG4gICAgKVxuICAgIGNvbnN0IGdlbmVzaXNBc3NldDI6IEdlbmVzaXNBc3NldCA9IG5ldyBHZW5lc2lzQXNzZXQoKVxuICAgIGdlbmVzaXNBc3NldDIuZnJvbUJ1ZmZlcihnZW5lc2lzQXNzZXQudG9CdWZmZXIoKSlcbiAgICBleHBlY3QoZ2VuZXNpc0Fzc2V0LnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoXG4gICAgICBnZW5lc2lzQXNzZXQyLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICApXG4gICAgZXhwZWN0KGdlbmVzaXNBc3NldC5nZXRUeXBlTmFtZSgpKS50b0JlKFwiR2VuZXNpc0Fzc2V0XCIpXG4gICAgZXhwZWN0KGdlbmVzaXNBc3NldC5nZXRUeXBlSUQoKSkudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KGdlbmVzaXNBc3NldC5nZXRDb2RlY0lEKCkpLnRvQmVVbmRlZmluZWQoKVxuICAgIGV4cGVjdChnZW5lc2lzQXNzZXQuZ2V0TmV0d29ya0lEKCkpLnRvQmUoRGVmYXVsdE5ldHdvcmtJRClcbiAgICBleHBlY3QoZ2VuZXNpc0Fzc2V0LmdldE5hbWUoKSkudG9CZShuYW1lKVxuICAgIGV4cGVjdChnZW5lc2lzQXNzZXQuZ2V0QXNzZXRBbGlhcygpKS50b0JlKGFzc2V0QWxpYXMpXG4gICAgZXhwZWN0KGdlbmVzaXNBc3NldC5nZXRTeW1ib2woKSkudG9CZShzeW1ib2wpXG4gICAgZXhwZWN0KGdlbmVzaXNBc3NldC5nZXREZW5vbWluYXRpb24oKSkudG9CZShkZW5vbWluYXRpb24pXG4gICAgZXhwZWN0KGdlbmVzaXNBc3NldC5nZXRCbG9ja2NoYWluSUQoKS50b1N0cmluZyhoZXgpKS50b0JlKGJsb2NrY2hhaW5JREhleClcbiAgICBleHBlY3QoZ2VuZXNpc0Fzc2V0LmdldElucygpKS50b0VxdWFsKG91dHMpXG4gICAgZXhwZWN0KGdlbmVzaXNBc3NldC5nZXRPdXRzKCkpLnRvRXF1YWwoaW5zKVxuICAgIGV4cGVjdChnZW5lc2lzQXNzZXQuZ2V0SW5pdGlhbFN0YXRlcygpKS50b1N0cmljdEVxdWFsKGluaXRpYWxTdGF0ZXMpXG4gICAgZXhwZWN0KGdlbmVzaXNBc3NldC5nZXRNZW1vKCkudG9TdHJpbmcoaGV4KSkudG9CZShtSGV4KVxuICB9KVxufSlcbiJdfQ==