"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const evm_1 = require("../../../src/apis/evm");
const constants_1 = require("../../../src/utils/constants");
const constants_2 = require("../../../src/utils/constants");
const evm_2 = require("../../../src/apis/evm");
const bn_js_1 = __importDefault(require("bn.js"));
const src_1 = require("src");
const networkID = 1337;
const cHexAddress1 = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC";
const bintools = src_1.BinTools.getInstance();
const cHexAddress2 = "0xecC3B2968B277b837a81A7181e0b94EB1Ca54EdE";
const antAssetID = "F4MyJcUvq3Rxbqgd4Zs8sUpvwLHApyrp4yxJXe2bAV86Vvp38";
const djtxAssetID = constants_1.Defaults.network[networkID].X.djtxAssetID;
const txID = "QVb7DtKjcwVYLFWHgnGSdzQtQSc29KeRBYFNCBnbFu6dFqX7z";
const blockchainID = constants_1.Defaults.network[networkID].C.blockchainID;
const sourcechainID = constants_1.Defaults.network[networkID].X.blockchainID;
let evmOutputs;
let importedIns;
const fee = constants_1.Defaults.network[networkID].C.txFee;
beforeEach(() => {
    evmOutputs = [];
    importedIns = [];
});
describe("EVM Transactions", () => {
    describe("ImportTx", () => {
        test("Multiple DJTX EVMOutput fail", () => {
            const outputidx = src_1.Buffer.from("");
            const input = new evm_1.SECPTransferInput(constants_2.ONEDJTX);
            const xferin = new evm_1.TransferableInput(bintools.cb58Decode(txID), outputidx, bintools.cb58Decode(djtxAssetID), input);
            importedIns.push(xferin);
            // Creating 2 outputs with the same address and DJTX assetID is invalid
            let evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEDJTX, djtxAssetID);
            evmOutputs.push(evmOutput);
            evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEDJTX, djtxAssetID);
            evmOutputs.push(evmOutput);
            expect(() => {
                new evm_1.ImportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(sourcechainID), importedIns, evmOutputs);
            }).toThrow("Error - ImportTx: duplicate (address, assetId) pair found in outputs: (0x8db97c7cece249c2b98bdc0226cc4c2a57bf52fc, BUuypiq2wyuLMvyhzFXcPyxPMCgSp7eeDohhQRqTChoBjKziC)");
        });
        test("Multiple DJTX EVMOutput success", () => {
            const outputidx = src_1.Buffer.from("");
            const input = new evm_1.SECPTransferInput(constants_2.ONEDJTX);
            const xferin = new evm_1.TransferableInput(bintools.cb58Decode(txID), outputidx, bintools.cb58Decode(djtxAssetID), input);
            importedIns.push(xferin);
            // Creating 2 outputs with different addresses valid
            let evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEDJTX.div(new bn_js_1.default(3)), djtxAssetID);
            evmOutputs.push(evmOutput);
            evmOutput = new evm_2.EVMOutput(cHexAddress2, constants_2.ONEDJTX.div(new bn_js_1.default(3)), djtxAssetID);
            evmOutputs.push(evmOutput);
            const importTx = new evm_1.ImportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(sourcechainID), importedIns, evmOutputs);
            expect(importTx).toBeInstanceOf(evm_1.ImportTx);
            expect(importTx.getSourceChain().toString("hex")).toBe(bintools.cb58Decode(sourcechainID).toString("hex"));
        });
        test("Multiple ANT EVMOutput fail", () => {
            const outputidx = src_1.Buffer.from("");
            const input = new evm_1.SECPTransferInput(new bn_js_1.default(507));
            const xferin = new evm_1.TransferableInput(bintools.cb58Decode(txID), outputidx, bintools.cb58Decode(djtxAssetID), input);
            importedIns.push(xferin);
            // Creating 2 outputs with the same address and ANT assetID is invalid
            let evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEDJTX, antAssetID);
            evmOutputs.push(evmOutput);
            evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEDJTX, antAssetID);
            evmOutputs.push(evmOutput);
            expect(() => {
                new evm_1.ImportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(sourcechainID), importedIns, evmOutputs);
            }).toThrow("Error - ImportTx: duplicate (address, assetId) pair found in outputs: (0x8db97c7cece249c2b98bdc0226cc4c2a57bf52fc, F4MyJcUvq3Rxbqgd4Zs8sUpvwLHApyrp4yxJXe2bAV86Vvp38)");
        });
        test("Multiple ANT EVMOutput success", () => {
            const outputidx = src_1.Buffer.from("");
            const input = new evm_1.SECPTransferInput(fee);
            const xferin = new evm_1.TransferableInput(bintools.cb58Decode(txID), outputidx, bintools.cb58Decode(djtxAssetID), input);
            importedIns.push(xferin);
            let evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEDJTX, antAssetID);
            evmOutputs.push(evmOutput);
            evmOutput = new evm_2.EVMOutput(cHexAddress2, constants_2.ONEDJTX, antAssetID);
            evmOutputs.push(evmOutput);
            const importTx = new evm_1.ImportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(sourcechainID), importedIns, evmOutputs);
            expect(importTx).toBeInstanceOf(evm_1.ImportTx);
        });
        test("Single ANT EVMOutput fail", () => {
            const outputidx = src_1.Buffer.from("");
            const input = new evm_1.SECPTransferInput(new bn_js_1.default(0));
            const xferin = new evm_1.TransferableInput(bintools.cb58Decode(txID), outputidx, bintools.cb58Decode(djtxAssetID), input);
            importedIns.push(xferin);
            // If the output is a non-djtx assetID then don't subtract a fee
            const evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEDJTX, antAssetID);
            evmOutputs.push(evmOutput);
            const baseFee = new bn_js_1.default(25000000000);
            expect(() => {
                new evm_1.ImportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(sourcechainID), importedIns, evmOutputs, baseFee);
            }).toThrow("Error - 25000000000 nDJTX required for fee and only 0 nDJTX provided");
        });
        test("Single ANT EVMOutput success", () => {
            const outputidx = src_1.Buffer.from("");
            const input = new evm_1.SECPTransferInput(constants_2.ONEDJTX);
            const xferin = new evm_1.TransferableInput(bintools.cb58Decode(txID), outputidx, bintools.cb58Decode(djtxAssetID), input);
            importedIns.push(xferin);
            const evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEDJTX, antAssetID);
            evmOutputs.push(evmOutput);
            const importTx = new evm_1.ImportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(sourcechainID), importedIns, evmOutputs);
            expect(importTx).toBeInstanceOf(evm_1.ImportTx);
        });
        test("Single DJTX EVMOutput fail", () => {
            const outputidx = src_1.Buffer.from("");
            const input = new evm_1.SECPTransferInput(new bn_js_1.default(507));
            const xferin = new evm_1.TransferableInput(bintools.cb58Decode(txID), outputidx, bintools.cb58Decode(djtxAssetID), input);
            importedIns.push(xferin);
            const evmOutput = new evm_2.EVMOutput(cHexAddress1, new bn_js_1.default(0), djtxAssetID);
            evmOutputs.push(evmOutput);
            const baseFee = new bn_js_1.default(25000000000);
            expect(() => {
                new evm_1.ImportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(sourcechainID), importedIns, evmOutputs, baseFee);
            }).toThrow("Error - 25000000000 nDJTX required for fee and only 507 nDJTX provided");
        });
        test("Single DJTX EVMOutput success", () => {
            const outputidx = src_1.Buffer.from("");
            const input = new evm_1.SECPTransferInput(constants_2.ONEDJTX);
            const xferin = new evm_1.TransferableInput(bintools.cb58Decode(txID), outputidx, bintools.cb58Decode(djtxAssetID), input);
            importedIns.push(xferin);
            const evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEDJTX.sub(constants_1.MILLIDJTX), djtxAssetID);
            evmOutputs.push(evmOutput);
            const importTx = new evm_1.ImportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(sourcechainID), importedIns, evmOutputs);
            expect(importTx).toBeInstanceOf(evm_1.ImportTx);
        });
    });
    describe("ExportTx", () => {
        test("getDestinationChain", () => {
            const exportTx = new evm_1.ExportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(constants_1.PlatformChainID));
            expect(exportTx).toBeInstanceOf(evm_1.ExportTx);
            expect(exportTx.getDestinationChain().toString("hex")).toBe(bintools.cb58Decode(constants_1.PlatformChainID).toString("hex"));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHgudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3RzL2FwaXMvZXZtL3R4LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwrQ0FLOEI7QUFDOUIsNERBSXFDO0FBQ3JDLDREQUFzRDtBQUN0RCwrQ0FBaUQ7QUFDakQsa0RBQXNCO0FBQ3RCLDZCQUFzQztBQUN0QyxNQUFNLFNBQVMsR0FBVyxJQUFJLENBQUE7QUFDOUIsTUFBTSxZQUFZLEdBQVcsNENBQTRDLENBQUE7QUFDekUsTUFBTSxRQUFRLEdBQWEsY0FBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sWUFBWSxHQUFXLDRDQUE0QyxDQUFBO0FBQ3pFLE1BQU0sVUFBVSxHQUFXLG1EQUFtRCxDQUFBO0FBQzlFLE1BQU0sV0FBVyxHQUFXLG9CQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUE7QUFDckUsTUFBTSxJQUFJLEdBQVcsbURBQW1ELENBQUE7QUFDeEUsTUFBTSxZQUFZLEdBQVcsb0JBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQTtBQUN2RSxNQUFNLGFBQWEsR0FBVyxvQkFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFBO0FBQ3hFLElBQUksVUFBdUIsQ0FBQTtBQUMzQixJQUFJLFdBQWdDLENBQUE7QUFDcEMsTUFBTSxHQUFHLEdBQU8sb0JBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQTtBQUVuRCxVQUFVLENBQUMsR0FBUyxFQUFFO0lBQ3BCLFVBQVUsR0FBRyxFQUFFLENBQUE7SUFDZixXQUFXLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLENBQUMsQ0FBQyxDQUFBO0FBRUYsUUFBUSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFB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VSxFQUFFLEdBQUcsRUFBRTtRQUN4QixJQUFJLENBQUMscUJBQXFCLEVBQUUsR0FBUyxFQUFFO1lBQ3JDLE1BQU0sUUFBUSxHQUFhLElBQUksY0FBUSxDQUNyQyxTQUFTLEVBQ1QsUUFBUSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFDakMsUUFBUSxDQUFDLFVBQVUsQ0FBQywyQkFBZSxDQUFDLENBQ3JDLENBQUE7WUFDRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsY0FBYyxDQUFDLGNBQVEsQ0FBQyxDQUFBO1lBQ3pDLE1BQU0sQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQ3pELFFBQVEsQ0FBQyxVQUFVLENBQUMsMkJBQWUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FDckQsQ0FBQTtRQUNILENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEV4cG9ydFR4LFxuICBJbXBvcnRUeCxcbiAgU0VDUFRyYW5zZmVySW5wdXQsXG4gIFRyYW5zZmVyYWJsZUlucHV0XG59IGZyb20gXCIuLi8uLi8uLi9zcmMvYXBpcy9ldm1cIlxuaW1wb3J0IHtcbiAgRGVmYXVsdHMsXG4gIE1JTExJREpUWCxcbiAgUGxhdGZvcm1DaGFpbklEXG59IGZyb20gXCIuLi8uLi8uLi9zcmMvdXRpbHMvY29uc3RhbnRzXCJcbmltcG9ydCB7IE9ORURKVFggfSBmcm9tIFwiLi4vLi4vLi4vc3JjL3V0aWxzL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBFVk1PdXRwdXQgfSBmcm9tIFwiLi4vLi4vLi4vc3JjL2FwaXMvZXZtXCJcbmltcG9ydCBCTiBmcm9tIFwiYm4uanNcIlxuaW1wb3J0IHsgQmluVG9vbHMsIEJ1ZmZlciB9IGZyb20gXCJzcmNcIlxuY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSAxMzM3XG5jb25zdCBjSGV4QWRkcmVzczE6IHN0cmluZyA9IFwiMHg4ZGI5N0M3Y0VjRTI0OWMyYjk4YkRDMDIyNkNjNEMyQTU3QkY1MkZDXCJcbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IGNIZXhBZGRyZXNzMjogc3RyaW5nID0gXCIweGVjQzNCMjk2OEIyNzdiODM3YTgxQTcxODFlMGI5NEVCMUNhNTRFZEVcIlxuY29uc3QgYW50QXNzZXRJRDogc3RyaW5nID0gXCJGNE15SmNVdnEzUnhicWdkNFpzOHNVcHZ3TEhBcHlycDR5eEpYZTJiQVY4NlZ2cDM4XCJcbmNvbnN0IGRqdHhBc3NldElEOiBzdHJpbmcgPSBEZWZhdWx0cy5uZXR3b3JrW25ldHdvcmtJRF0uWC5kanR4QXNzZXRJRFxuY29uc3QgdHhJRDogc3RyaW5nID0gXCJRVmI3RHRLamN3VllMRldIZ25HU2R6UXRRU2MyOUtlUkJZRk5DQm5iRnU2ZEZxWDd6XCJcbmNvbnN0IGJsb2NrY2hhaW5JRDogc3RyaW5nID0gRGVmYXVsdHMubmV0d29ya1tuZXR3b3JrSURdLkMuYmxvY2tjaGFpbklEXG5jb25zdCBzb3VyY2VjaGFpbklEOiBzdHJpbmcgPSBEZWZhdWx0cy5uZXR3b3JrW25ldHdvcmtJRF0uWC5ibG9ja2NoYWluSURcbmxldCBldm1PdXRwdXRzOiBFVk1PdXRwdXRbXVxubGV0IGltcG9ydGVkSW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdXG5jb25zdCBmZWU6IEJOID0gRGVmYXVsdHMubmV0d29ya1tuZXR3b3JrSURdLkMudHhGZWVcblxuYmVmb3JlRWFjaCgoKTogdm9pZCA9PiB7XG4gIGV2bU91dHB1dHMgPSBbXVxuICBpbXBvcnRlZElucyA9IFtdXG59KVxuXG5kZXNjcmliZShcIkVWTSBUcmFuc2FjdGlvbnNcIiwgKCkgPT4ge1xuICBkZXNjcmliZShcIkltcG9ydFR4XCIsICgpID0+IHtcbiAgICB0ZXN0KFwiTXVsdGlwbGUgREpUWCBFVk1PdXRwdXQgZmFpbFwiLCAoKTogdm9pZCA9PiB7XG4gICAgICBjb25zdCBvdXRwdXRpZHg6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKFwiXCIpXG4gICAgICBjb25zdCBpbnB1dDogU0VDUFRyYW5zZmVySW5wdXQgPSBuZXcgU0VDUFRyYW5zZmVySW5wdXQoT05FREpUWClcbiAgICAgIGNvbnN0IHhmZXJpbjogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQoXG4gICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUodHhJRCksXG4gICAgICAgIG91dHB1dGlkeCxcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShkanR4QXNzZXRJRCksXG4gICAgICAgIGlucHV0XG4gICAgICApXG4gICAgICBpbXBvcnRlZElucy5wdXNoKHhmZXJpbilcbiAgICAgIC8vIENyZWF0aW5nIDIgb3V0cHV0cyB3aXRoIHRoZSBzYW1lIGFkZHJlc3MgYW5kIERKVFggYXNzZXRJRCBpcyBpbnZhbGlkXG4gICAgICBsZXQgZXZtT3V0cHV0OiBFVk1PdXRwdXQgPSBuZXcgRVZNT3V0cHV0KFxuICAgICAgICBjSGV4QWRkcmVzczEsXG4gICAgICAgIE9ORURKVFgsXG4gICAgICAgIGRqdHhBc3NldElEXG4gICAgICApXG4gICAgICBldm1PdXRwdXRzLnB1c2goZXZtT3V0cHV0KVxuICAgICAgZXZtT3V0cHV0ID0gbmV3IEVWTU91dHB1dChjSGV4QWRkcmVzczEsIE9ORURKVFgsIGRqdHhBc3NldElEKVxuICAgICAgZXZtT3V0cHV0cy5wdXNoKGV2bU91dHB1dClcblxuICAgICAgZXhwZWN0KCgpOiB2b2lkID0+IHtcbiAgICAgICAgbmV3IEltcG9ydFR4KFxuICAgICAgICAgIG5ldHdvcmtJRCxcbiAgICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKGJsb2NrY2hhaW5JRCksXG4gICAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShzb3VyY2VjaGFpbklEKSxcbiAgICAgICAgICBpbXBvcnRlZElucyxcbiAgICAgICAgICBldm1PdXRwdXRzXG4gICAgICAgIClcbiAgICAgIH0pLnRvVGhyb3coXG4gICAgICAgIFwiRXJyb3IgLSBJbXBvcnRUeDogZHVwbGljYXRlIChhZGRyZXNzLCBhc3NldElkKSBwYWlyIGZvdW5kIGluIG91dHB1dHM6ICgweDhkYjk3YzdjZWNlMjQ5YzJiOThiZGMwMjI2Y2M0YzJhNTdiZjUyZmMsIEJVdXlwaXEyd3l1TE12eWh6RlhjUHl4UE1DZ1NwN2VlRG9oaFFScVRDaG9Cakt6aUMpXCJcbiAgICAgIClcbiAgICB9KVxuXG4gICAgdGVzdChcIk11bHRpcGxlIERKVFggRVZNT3V0cHV0IHN1Y2Nlc3NcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgY29uc3Qgb3V0cHV0aWR4OiBCdWZmZXIgPSBCdWZmZXIuZnJvbShcIlwiKVxuICAgICAgY29uc3QgaW5wdXQ6IFNFQ1BUcmFuc2ZlcklucHV0ID0gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KE9ORURKVFgpXG4gICAgICBjb25zdCB4ZmVyaW46IFRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFRyYW5zZmVyYWJsZUlucHV0KFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKHR4SUQpLFxuICAgICAgICBvdXRwdXRpZHgsXG4gICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoZGp0eEFzc2V0SUQpLFxuICAgICAgICBpbnB1dFxuICAgICAgKVxuICAgICAgaW1wb3J0ZWRJbnMucHVzaCh4ZmVyaW4pXG4gICAgICAvLyBDcmVhdGluZyAyIG91dHB1dHMgd2l0aCBkaWZmZXJlbnQgYWRkcmVzc2VzIHZhbGlkXG4gICAgICBsZXQgZXZtT3V0cHV0OiBFVk1PdXRwdXQgPSBuZXcgRVZNT3V0cHV0KFxuICAgICAgICBjSGV4QWRkcmVzczEsXG4gICAgICAgIE9ORURKVFguZGl2KG5ldyBCTigzKSksXG4gICAgICAgIGRqdHhBc3NldElEXG4gICAgICApXG4gICAgICBldm1PdXRwdXRzLnB1c2goZXZtT3V0cHV0KVxuICAgICAgZXZtT3V0cHV0ID0gbmV3IEVWTU91dHB1dChcbiAgICAgICAgY0hleEFkZHJlc3MyLFxuICAgICAgICBPTkVESlRYLmRpdihuZXcgQk4oMykpLFxuICAgICAgICBkanR4QXNzZXRJRFxuICAgICAgKVxuICAgICAgZXZtT3V0cHV0cy5wdXNoKGV2bU91dHB1dClcblxuICAgICAgY29uc3QgaW1wb3J0VHg6IEltcG9ydFR4ID0gbmV3IEltcG9ydFR4KFxuICAgICAgICBuZXR3b3JrSUQsXG4gICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoYmxvY2tjaGFpbklEKSxcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShzb3VyY2VjaGFpbklEKSxcbiAgICAgICAgaW1wb3J0ZWRJbnMsXG4gICAgICAgIGV2bU91dHB1dHNcbiAgICAgIClcbiAgICAgIGV4cGVjdChpbXBvcnRUeCkudG9CZUluc3RhbmNlT2YoSW1wb3J0VHgpXG4gICAgICBleHBlY3QoaW1wb3J0VHguZ2V0U291cmNlQ2hhaW4oKS50b1N0cmluZyhcImhleFwiKSkudG9CZShcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShzb3VyY2VjaGFpbklEKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgKVxuICAgIH0pXG5cbiAgICB0ZXN0KFwiTXVsdGlwbGUgQU5UIEVWTU91dHB1dCBmYWlsXCIsICgpOiB2b2lkID0+IHtcbiAgICAgIGNvbnN0IG91dHB1dGlkeDogQnVmZmVyID0gQnVmZmVyLmZyb20oXCJcIilcbiAgICAgIGNvbnN0IGlucHV0OiBTRUNQVHJhbnNmZXJJbnB1dCA9IG5ldyBTRUNQVHJhbnNmZXJJbnB1dChuZXcgQk4oNTA3KSlcbiAgICAgIGNvbnN0IHhmZXJpbjogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQoXG4gICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUodHhJRCksXG4gICAgICAgIG91dHB1dGlkeCxcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShkanR4QXNzZXRJRCksXG4gICAgICAgIGlucHV0XG4gICAgICApXG4gICAgICBpbXBvcnRlZElucy5wdXNoKHhmZXJpbilcbiAgICAgIC8vIENyZWF0aW5nIDIgb3V0cHV0cyB3aXRoIHRoZSBzYW1lIGFkZHJlc3MgYW5kIEFOVCBhc3NldElEIGlzIGludmFsaWRcbiAgICAgIGxldCBldm1PdXRwdXQ6IEVWTU91dHB1dCA9IG5ldyBFVk1PdXRwdXQoXG4gICAgICAgIGNIZXhBZGRyZXNzMSxcbiAgICAgICAgT05FREpUWCxcbiAgICAgICAgYW50QXNzZXRJRFxuICAgICAgKVxuICAgICAgZXZtT3V0cHV0cy5wdXNoKGV2bU91dHB1dClcbiAgICAgIGV2bU91dHB1dCA9IG5ldyBFVk1PdXRwdXQoY0hleEFkZHJlc3MxLCBPTkVESlRYLCBhbnRBc3NldElEKVxuICAgICAgZXZtT3V0cHV0cy5wdXNoKGV2bU91dHB1dClcbiAgICAgIGV4cGVjdCgoKTogdm9pZCA9PiB7XG4gICAgICAgIG5ldyBJbXBvcnRUeChcbiAgICAgICAgICBuZXR3b3JrSUQsXG4gICAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLFxuICAgICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoc291cmNlY2hhaW5JRCksXG4gICAgICAgICAgaW1wb3J0ZWRJbnMsXG4gICAgICAgICAgZXZtT3V0cHV0c1xuICAgICAgICApXG4gICAgICB9KS50b1Rocm93KFxuICAgICAgICBcIkVycm9yIC0gSW1wb3J0VHg6IGR1cGxpY2F0ZSAoYWRkcmVzcywgYXNzZXRJZCkgcGFpciBmb3VuZCBpbiBvdXRwdXRzOiAoMHg4ZGI5N2M3Y2VjZTI0OWMyYjk4YmRjMDIyNmNjNGMyYTU3YmY1MmZjLCBGNE15SmNVdnEzUnhicWdkNFpzOHNVcHZ3TEhBcHlycDR5eEpYZTJiQVY4NlZ2cDM4KVwiXG4gICAgICApXG4gICAgfSlcblxuICAgIHRlc3QoXCJNdWx0aXBsZSBBTlQgRVZNT3V0cHV0IHN1Y2Nlc3NcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgY29uc3Qgb3V0cHV0aWR4OiBCdWZmZXIgPSBCdWZmZXIuZnJvbShcIlwiKVxuICAgICAgY29uc3QgaW5wdXQ6IFNFQ1BUcmFuc2ZlcklucHV0ID0gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KGZlZSlcbiAgICAgIGNvbnN0IHhmZXJpbjogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQoXG4gICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUodHhJRCksXG4gICAgICAgIG91dHB1dGlkeCxcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShkanR4QXNzZXRJRCksXG4gICAgICAgIGlucHV0XG4gICAgICApXG4gICAgICBpbXBvcnRlZElucy5wdXNoKHhmZXJpbilcbiAgICAgIGxldCBldm1PdXRwdXQ6IEVWTU91dHB1dCA9IG5ldyBFVk1PdXRwdXQoXG4gICAgICAgIGNIZXhBZGRyZXNzMSxcbiAgICAgICAgT05FREpUWCxcbiAgICAgICAgYW50QXNzZXRJRFxuICAgICAgKVxuICAgICAgZXZtT3V0cHV0cy5wdXNoKGV2bU91dHB1dClcbiAgICAgIGV2bU91dHB1dCA9IG5ldyBFVk1PdXRwdXQoY0hleEFkZHJlc3MyLCBPTkVESlRYLCBhbnRBc3NldElEKVxuICAgICAgZXZtT3V0cHV0cy5wdXNoKGV2bU91dHB1dClcblxuICAgICAgY29uc3QgaW1wb3J0VHg6IEltcG9ydFR4ID0gbmV3IEltcG9ydFR4KFxuICAgICAgICBuZXR3b3JrSUQsXG4gICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoYmxvY2tjaGFpbklEKSxcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShzb3VyY2VjaGFpbklEKSxcbiAgICAgICAgaW1wb3J0ZWRJbnMsXG4gICAgICAgIGV2bU91dHB1dHNcbiAgICAgIClcbiAgICAgIGV4cGVjdChpbXBvcnRUeCkudG9CZUluc3RhbmNlT2YoSW1wb3J0VHgpXG4gICAgfSlcblxuICAgIHRlc3QoXCJTaW5nbGUgQU5UIEVWTU91dHB1dCBmYWlsXCIsICgpOiB2b2lkID0+IHtcbiAgICAgIGNvbnN0IG91dHB1dGlkeDogQnVmZmVyID0gQnVmZmVyLmZyb20oXCJcIilcbiAgICAgIGNvbnN0IGlucHV0OiBTRUNQVHJhbnNmZXJJbnB1dCA9IG5ldyBTRUNQVHJhbnNmZXJJbnB1dChuZXcgQk4oMCkpXG4gICAgICBjb25zdCB4ZmVyaW46IFRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFRyYW5zZmVyYWJsZUlucHV0KFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKHR4SUQpLFxuICAgICAgICBvdXRwdXRpZHgsXG4gICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoZGp0eEFzc2V0SUQpLFxuICAgICAgICBpbnB1dFxuICAgICAgKVxuICAgICAgaW1wb3J0ZWRJbnMucHVzaCh4ZmVyaW4pXG5cbiAgICAgIC8vIElmIHRoZSBvdXRwdXQgaXMgYSBub24tZGp0eCBhc3NldElEIHRoZW4gZG9uJ3Qgc3VidHJhY3QgYSBmZWVcbiAgICAgIGNvbnN0IGV2bU91dHB1dDogRVZNT3V0cHV0ID0gbmV3IEVWTU91dHB1dChcbiAgICAgICAgY0hleEFkZHJlc3MxLFxuICAgICAgICBPTkVESlRYLFxuICAgICAgICBhbnRBc3NldElEXG4gICAgICApXG4gICAgICBldm1PdXRwdXRzLnB1c2goZXZtT3V0cHV0KVxuICAgICAgY29uc3QgYmFzZUZlZTogQk4gPSBuZXcgQk4oMjUwMDAwMDAwMDApXG4gICAgICBleHBlY3QoKCk6IHZvaWQgPT4ge1xuICAgICAgICBuZXcgSW1wb3J0VHgoXG4gICAgICAgICAgbmV0d29ya0lELFxuICAgICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoYmxvY2tjaGFpbklEKSxcbiAgICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKHNvdXJjZWNoYWluSUQpLFxuICAgICAgICAgIGltcG9ydGVkSW5zLFxuICAgICAgICAgIGV2bU91dHB1dHMsXG4gICAgICAgICAgYmFzZUZlZVxuICAgICAgICApXG4gICAgICB9KS50b1Rocm93KFxuICAgICAgICBcIkVycm9yIC0gMjUwMDAwMDAwMDAgbkRKVFggcmVxdWlyZWQgZm9yIGZlZSBhbmQgb25seSAwIG5ESlRYIHByb3ZpZGVkXCJcbiAgICAgIClcbiAgICB9KVxuXG4gICAgdGVzdChcIlNpbmdsZSBBTlQgRVZNT3V0cHV0IHN1Y2Nlc3NcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgY29uc3Qgb3V0cHV0aWR4OiBCdWZmZXIgPSBCdWZmZXIuZnJvbShcIlwiKVxuICAgICAgY29uc3QgaW5wdXQ6IFNFQ1BUcmFuc2ZlcklucHV0ID0gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KE9ORURKVFgpXG4gICAgICBjb25zdCB4ZmVyaW46IFRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFRyYW5zZmVyYWJsZUlucHV0KFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKHR4SUQpLFxuICAgICAgICBvdXRwdXRpZHgsXG4gICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoZGp0eEFzc2V0SUQpLFxuICAgICAgICBpbnB1dFxuICAgICAgKVxuICAgICAgaW1wb3J0ZWRJbnMucHVzaCh4ZmVyaW4pXG4gICAgICBjb25zdCBldm1PdXRwdXQ6IEVWTU91dHB1dCA9IG5ldyBFVk1PdXRwdXQoXG4gICAgICAgIGNIZXhBZGRyZXNzMSxcbiAgICAgICAgT05FREpUWCxcbiAgICAgICAgYW50QXNzZXRJRFxuICAgICAgKVxuICAgICAgZXZtT3V0cHV0cy5wdXNoKGV2bU91dHB1dClcbiAgICAgIGNvbnN0IGltcG9ydFR4OiBJbXBvcnRUeCA9IG5ldyBJbXBvcnRUeChcbiAgICAgICAgbmV0d29ya0lELFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKGJsb2NrY2hhaW5JRCksXG4gICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoc291cmNlY2hhaW5JRCksXG4gICAgICAgIGltcG9ydGVkSW5zLFxuICAgICAgICBldm1PdXRwdXRzXG4gICAgICApXG4gICAgICBleHBlY3QoaW1wb3J0VHgpLnRvQmVJbnN0YW5jZU9mKEltcG9ydFR4KVxuICAgIH0pXG5cbiAgICB0ZXN0KFwiU2luZ2xlIERKVFggRVZNT3V0cHV0IGZhaWxcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgY29uc3Qgb3V0cHV0aWR4OiBCdWZmZXIgPSBCdWZmZXIuZnJvbShcIlwiKVxuICAgICAgY29uc3QgaW5wdXQ6IFNFQ1BUcmFuc2ZlcklucHV0ID0gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KG5ldyBCTig1MDcpKVxuICAgICAgY29uc3QgeGZlcmluOiBUcmFuc2ZlcmFibGVJbnB1dCA9IG5ldyBUcmFuc2ZlcmFibGVJbnB1dChcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZSh0eElEKSxcbiAgICAgICAgb3V0cHV0aWR4LFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKGRqdHhBc3NldElEKSxcbiAgICAgICAgaW5wdXRcbiAgICAgIClcbiAgICAgIGltcG9ydGVkSW5zLnB1c2goeGZlcmluKVxuXG4gICAgICBjb25zdCBldm1PdXRwdXQ6IEVWTU91dHB1dCA9IG5ldyBFVk1PdXRwdXQoXG4gICAgICAgIGNIZXhBZGRyZXNzMSxcbiAgICAgICAgbmV3IEJOKDApLFxuICAgICAgICBkanR4QXNzZXRJRFxuICAgICAgKVxuICAgICAgZXZtT3V0cHV0cy5wdXNoKGV2bU91dHB1dClcbiAgICAgIGNvbnN0IGJhc2VGZWU6IEJOID0gbmV3IEJOKDI1MDAwMDAwMDAwKVxuICAgICAgZXhwZWN0KCgpOiB2b2lkID0+IHtcbiAgICAgICAgbmV3IEltcG9ydFR4KFxuICAgICAgICAgIG5ldHdvcmtJRCxcbiAgICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKGJsb2NrY2hhaW5JRCksXG4gICAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShzb3VyY2VjaGFpbklEKSxcbiAgICAgICAgICBpbXBvcnRlZElucyxcbiAgICAgICAgICBldm1PdXRwdXRzLFxuICAgICAgICAgIGJhc2VGZWVcbiAgICAgICAgKVxuICAgICAgfSkudG9UaHJvdyhcbiAgICAgICAgXCJFcnJvciAtIDI1MDAwMDAwMDAwIG5ESlRYIHJlcXVpcmVkIGZvciBmZWUgYW5kIG9ubHkgNTA3IG5ESlRYIHByb3ZpZGVkXCJcbiAgICAgIClcbiAgICB9KVxuXG4gICAgdGVzdChcIlNpbmdsZSBESlRYIEVWTU91dHB1dCBzdWNjZXNzXCIsICgpOiB2b2lkID0+IHtcbiAgICAgIGNvbnN0IG91dHB1dGlkeDogQnVmZmVyID0gQnVmZmVyLmZyb20oXCJcIilcbiAgICAgIGNvbnN0IGlucHV0OiBTRUNQVHJhbnNmZXJJbnB1dCA9IG5ldyBTRUNQVHJhbnNmZXJJbnB1dChPTkVESlRYKVxuICAgICAgY29uc3QgeGZlcmluOiBUcmFuc2ZlcmFibGVJbnB1dCA9IG5ldyBUcmFuc2ZlcmFibGVJbnB1dChcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZSh0eElEKSxcbiAgICAgICAgb3V0cHV0aWR4LFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKGRqdHhBc3NldElEKSxcbiAgICAgICAgaW5wdXRcbiAgICAgIClcbiAgICAgIGltcG9ydGVkSW5zLnB1c2goeGZlcmluKVxuICAgICAgY29uc3QgZXZtT3V0cHV0OiBFVk1PdXRwdXQgPSBuZXcgRVZNT3V0cHV0KFxuICAgICAgICBjSGV4QWRkcmVzczEsXG4gICAgICAgIE9ORURKVFguc3ViKE1JTExJREpUWCksXG4gICAgICAgIGRqdHhBc3NldElEXG4gICAgICApXG4gICAgICBldm1PdXRwdXRzLnB1c2goZXZtT3V0cHV0KVxuICAgICAgY29uc3QgaW1wb3J0VHg6IEltcG9ydFR4ID0gbmV3IEltcG9ydFR4KFxuICAgICAgICBuZXR3b3JrSUQsXG4gICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoYmxvY2tjaGFpbklEKSxcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShzb3VyY2VjaGFpbklEKSxcbiAgICAgICAgaW1wb3J0ZWRJbnMsXG4gICAgICAgIGV2bU91dHB1dHNcbiAgICAgIClcbiAgICAgIGV4cGVjdChpbXBvcnRUeCkudG9CZUluc3RhbmNlT2YoSW1wb3J0VHgpXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoXCJFeHBvcnRUeFwiLCAoKSA9PiB7XG4gICAgdGVzdChcImdldERlc3RpbmF0aW9uQ2hhaW5cIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgY29uc3QgZXhwb3J0VHg6IEV4cG9ydFR4ID0gbmV3IEV4cG9ydFR4KFxuICAgICAgICBuZXR3b3JrSUQsXG4gICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoYmxvY2tjaGFpbklEKSxcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShQbGF0Zm9ybUNoYWluSUQpXG4gICAgICApXG4gICAgICBleHBlY3QoZXhwb3J0VHgpLnRvQmVJbnN0YW5jZU9mKEV4cG9ydFR4KVxuICAgICAgZXhwZWN0KGV4cG9ydFR4LmdldERlc3RpbmF0aW9uQ2hhaW4oKS50b1N0cmluZyhcImhleFwiKSkudG9CZShcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShQbGF0Zm9ybUNoYWluSUQpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICApXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=