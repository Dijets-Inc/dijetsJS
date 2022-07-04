"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jest_mock_axios_1 = __importDefault(require("jest-mock-axios"));
const src_1 = require("src");
const api_1 = require("../../../src/apis/avm/api");
const keychain_1 = require("../../../src/apis/avm/keychain");
const buffer_1 = require("buffer/");
const bn_js_1 = __importDefault(require("bn.js"));
const bintools_1 = __importDefault(require("../../../src/utils/bintools"));
const utxos_1 = require("../../../src/apis/avm/utxos");
const inputs_1 = require("../../../src/apis/avm/inputs");
const create_hash_1 = __importDefault(require("create-hash"));
const tx_1 = require("../../../src/apis/avm/tx");
const constants_1 = require("../../../src/apis/avm/constants");
const outputs_1 = require("../../../src/apis/avm/outputs");
const ops_1 = require("../../../src/apis/avm/ops");
const bech32 = __importStar(require("bech32"));
const payload_1 = require("../../../src/utils/payload");
const initialstates_1 = require("../../../src/apis/avm/initialstates");
const constants_2 = require("../../../src/utils/constants");
const helperfunctions_1 = require("../../../src/utils/helperfunctions");
const output_1 = require("../../../src/common/output");
const minterset_1 = require("../../../src/apis/avm/minterset");
const constants_3 = require("../../../src/utils/constants");
const persistenceoptions_1 = require("../../../src/utils/persistenceoptions");
const constants_4 = require("../../../src/utils/constants");
const serialization_1 = require("../../../src/utils/serialization");
const utils_1 = require("src/utils");
const utils_2 = require("src/utils");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
const dumpSerailization = false;
const display = "display";
const serialzeit = (aThing, name) => {
    if (dumpSerailization) {
        console.log(JSON.stringify(serialization.serialize(aThing, "avm", "hex", name + " -- Hex Encoded")));
        console.log(JSON.stringify(serialization.serialize(aThing, "avm", "display", name + " -- Human-Readable")));
    }
};
describe("AVMAPI", () => {
    const networkID = 1337;
    const blockchainID = constants_2.Defaults.network[networkID].X.blockchainID;
    const ip = "127.0.0.1";
    const port = 9650;
    const protocol = "https";
    const username = "AvaLabs";
    const password = "password";
    const avalanche = new src_1.Avalanche(ip, port, protocol, networkID, undefined, undefined, undefined, true);
    let api;
    let alias;
    const addrA = `X-${bech32.bech32.encode(avalanche.getHRP(), bech32.bech32.toWords(bintools.cb58Decode("B6D4v1VtPYLbiUvYXtW4Px8oE9imC2vGW")))}`;
    const addrB = `X-${bech32.bech32.encode(avalanche.getHRP(), bech32.bech32.toWords(bintools.cb58Decode("P5wdRuZeaDt28eHMP5S3w9ZdoBfo7wuzF")))}`;
    const addrC = `X-${bech32.bech32.encode(avalanche.getHRP(), bech32.bech32.toWords(bintools.cb58Decode("6Y3kysjF9jnHnYkdS9yGAuoHyae2eNmeV")))}`;
    beforeAll(() => {
        api = new api_1.AVMAPI(avalanche, "/ext/bc/X", blockchainID);
        alias = api.getBlockchainAlias();
    });
    afterEach(() => {
        jest_mock_axios_1.default.reset();
    });
    test("fails to send with incorrect username", () => __awaiter(void 0, void 0, void 0, function* () {
        const memo = "hello world";
        const incorrectUserName = "asdfasdfsa";
        const message = `problem retrieving user: incorrect password for user "${incorrectUserName}"`;
        const result = api.send(incorrectUserName, password, "assetId", 10, addrA, [addrB], addrA, memo);
        const payload = {
            result: {
                code: -32000,
                message,
                data: null
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response["code"]).toBe(-32000);
        expect(response["message"]).toBe(message);
    }));
    test("fails to send with incorrect Password", () => __awaiter(void 0, void 0, void 0, function* () {
        const memo = "hello world";
        const incorrectPassword = "asdfasdfsa";
        const message = `problem retrieving user: incorrect password for user "${incorrectPassword}"`;
        const result = api.send(username, incorrectPassword, "assetId", 10, addrA, [addrB], addrA, memo);
        const payload = {
            result: {
                code: -32000,
                message,
                data: null
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response["code"]).toBe(-32000);
        expect(response["message"]).toBe(message);
    }));
    test("can Send 1", () => __awaiter(void 0, void 0, void 0, function* () {
        const txId = "asdfhvl234";
        const memo = "hello world";
        const changeAddr = "X-local1";
        const result = api.send(username, password, "assetId", 10, addrA, [addrB], addrA, memo);
        const payload = {
            result: {
                txID: txId,
                changeAddr: changeAddr
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response["txID"]).toBe(txId);
        expect(response["changeAddr"]).toBe(changeAddr);
    }));
    test("can Send 2", () => __awaiter(void 0, void 0, void 0, function* () {
        const txId = "asdfhvl234";
        const memo = buffer_1.Buffer.from("hello world");
        const changeAddr = "X-local1";
        const result = api.send(username, password, bintools.b58ToBuffer("6h2s5de1VC65meajE1L2PjvZ1MXvHc3F6eqPCGKuDt4MxiweF"), new bn_js_1.default(10), addrA, [addrB], addrA, memo);
        const payload = {
            result: {
                txID: txId,
                changeAddr: changeAddr
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response["txID"]).toBe(txId);
        expect(response["changeAddr"]).toBe(changeAddr);
    }));
    test("can Send Multiple", () => __awaiter(void 0, void 0, void 0, function* () {
        const txId = "asdfhvl234";
        const memo = "hello world";
        const changeAddr = "X-local1";
        const result = api.sendMultiple(username, password, [{ assetID: "assetId", amount: 10, to: addrA }], [addrB], addrA, memo);
        const payload = {
            result: {
                txID: txId,
                changeAddr: changeAddr
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response["txID"]).toBe(txId);
        expect(response["changeAddr"]).toBe(changeAddr);
    }));
    test("refreshBlockchainID", () => __awaiter(void 0, void 0, void 0, function* () {
        const n3bcID = constants_2.Defaults.network[3].X["blockchainID"];
        const n1337bcID = constants_2.Defaults.network[1337].X["blockchainID"];
        const testAPI = new api_1.AVMAPI(avalanche, "/ext/bc/avm", n3bcID);
        const bc1 = testAPI.getBlockchainID();
        expect(bc1).toBe(n3bcID);
        testAPI.refreshBlockchainID();
        const bc2 = testAPI.getBlockchainID();
        expect(bc2).toBe(n1337bcID);
        testAPI.refreshBlockchainID(n3bcID);
        const bc3 = testAPI.getBlockchainID();
        expect(bc3).toBe(n3bcID);
    }));
    test("listAddresses", () => __awaiter(void 0, void 0, void 0, function* () {
        const addresses = [addrA, addrB];
        const result = api.listAddresses(username, password);
        const payload = {
            result: {
                addresses
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(addresses);
    }));
    test("importKey", () => __awaiter(void 0, void 0, void 0, function* () {
        const address = addrC;
        const result = api.importKey(username, password, "key");
        const payload = {
            result: {
                address
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(address);
    }));
    test("getBalance", () => __awaiter(void 0, void 0, void 0, function* () {
        const balance = new bn_js_1.default("100", 10);
        const respobj = {
            balance,
            utxoIDs: [
                {
                    txID: "LUriB3W919F84LwPMMw4sm2fZ4Y76Wgb6msaauEY7i1tFNmtv",
                    outputIndex: 0
                }
            ]
        };
        const result = api.getBalance(addrA, "ATH");
        const payload = {
            result: respobj
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(response)).toBe(JSON.stringify(respobj));
    }));
    test("getBalance includePartial", () => __awaiter(void 0, void 0, void 0, function* () {
        const balance = new bn_js_1.default("100", 10);
        const respobj = {
            balance,
            utxoIDs: [
                {
                    txID: "LUriB3W919F84LwPMMw4sm2fZ4Y76Wgb6msaauEY7i1tFNmtv",
                    outputIndex: 0
                }
            ]
        };
        const result = api.getBalance(addrA, "ATH", true);
        const payload = {
            result: respobj
        };
        const responseObj = {
            data: payload
        };
        const expectedRequestPayload = {
            id: 1,
            method: "avm.getBalance",
            params: {
                address: addrA,
                assetID: "ATH",
                includePartial: true
            },
            jsonrpc: "2.0"
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        const calledWith = {
            baseURL: "https://127.0.0.1:9650",
            data: '{"id":9,"method":"avm.getBalance","params":{"address":"X-custom1d6kkj0qh4wcmus3tk59npwt3rluc6en755a58g","assetID":"ATH","includePartial":true},"jsonrpc":"2.0"}',
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            },
            method: "POST",
            params: {},
            responseType: "json",
            url: "/ext/bc/X"
        };
        expect(jest_mock_axios_1.default.request).toBeCalledWith(calledWith);
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(response)).toBe(JSON.stringify(respobj));
    }));
    test("exportKey", () => __awaiter(void 0, void 0, void 0, function* () {
        const key = "sdfglvlj2h3v45";
        const result = api.exportKey(username, password, addrA);
        const payload = {
            result: {
                privateKey: key
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(key);
    }));
    test("export", () => __awaiter(void 0, void 0, void 0, function* () {
        const amount = new bn_js_1.default(100);
        const to = "abcdef";
        const assetID = "DJTX";
        const username = "Robert";
        const password = "Paulson";
        const txID = "valid";
        const result = api.export(username, password, to, amount, assetID);
        const payload = {
            result: {
                txID: txID
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(txID);
    }));
    test("import", () => __awaiter(void 0, void 0, void 0, function* () {
        const to = "abcdef";
        const username = "Robert";
        const password = "Paulson";
        const txID = "valid";
        const result = api.import(username, password, to, blockchainID);
        const payload = {
            result: {
                txID: txID
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(txID);
    }));
    test("createAddress", () => __awaiter(void 0, void 0, void 0, function* () {
        const alias = "randomalias";
        const result = api.createAddress(username, password);
        const payload = {
            result: {
                address: alias
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(alias);
    }));
    test("createFixedCapAsset", () => __awaiter(void 0, void 0, void 0, function* () {
        const kp = new keychain_1.KeyPair(avalanche.getHRP(), alias);
        kp.importKey(buffer_1.Buffer.from("ef9bf2d4436491c153967c9709dd8e82795bdb9b5ad44ee22c2903005d1cf676", "hex"));
        const denomination = 0;
        const assetID = "8a5d2d32e68bc50036e4d086044617fe4a0a0296b274999ba568ea92da46d533";
        const initialHolders = [
            {
                address: "7sik3Pr6r1FeLrvK1oWwECBS8iJ5VPuSh",
                amount: "10000"
            },
            {
                address: "7sik3Pr6r1FeLrvK1oWwECBS8iJ5VPuSh",
                amount: "50000"
            }
        ];
        const result = api.createFixedCapAsset(username, password, "Some Coin", "SCC", denomination, initialHolders);
        const payload = {
            result: {
                assetID: assetID
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(assetID);
    }));
    test("createVariableCapAsset", () => __awaiter(void 0, void 0, void 0, function* () {
        const kp = new keychain_1.KeyPair(avalanche.getHRP(), alias);
        kp.importKey(buffer_1.Buffer.from("ef9bf2d4436491c153967c9709dd8e82795bdb9b5ad44ee22c2903005d1cf676", "hex"));
        const denomination = 0;
        const assetID = "8a5d2d32e68bc50036e4d086044617fe4a0a0296b274999ba568ea92da46d533";
        const minterSets = [
            {
                minters: ["4peJsFvhdn7XjhNF4HWAQy6YaJts27s9q"],
                threshold: 1
            },
            {
                minters: [
                    "dcJ6z9duLfyQTgbjq2wBCowkvcPZHVDF",
                    "2fE6iibqfERz5wenXE6qyvinsxDvFhHZk",
                    "7ieAJbfrGQbpNZRAQEpZCC1Gs1z5gz4HU"
                ],
                threshold: 2
            }
        ];
        const result = api.createVariableCapAsset(username, password, "Some Coin", "SCC", denomination, minterSets);
        const payload = {
            result: {
                assetID: assetID
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(assetID);
    }));
    test("mint 1", () => __awaiter(void 0, void 0, void 0, function* () {
        const username = "Collin";
        const password = "Cusce";
        const amount = 2;
        const assetID = "f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7";
        const to = "dcJ6z9duLfyQTgbjq2wBCowkvcPZHVDF";
        const minters = [
            "dcJ6z9duLfyQTgbjq2wBCowkvcPZHVDF",
            "2fE6iibqfERz5wenXE6qyvinsxDvFhHZk",
            "7ieAJbfrGQbpNZRAQEpZCC1Gs1z5gz4HU"
        ];
        const result = api.mint(username, password, amount, assetID, to, minters);
        const payload = {
            result: {
                txID: "sometx"
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe("sometx");
    }));
    test("mint 2", () => __awaiter(void 0, void 0, void 0, function* () {
        const username = "Collin";
        const password = "Cusce";
        const amount = new bn_js_1.default(1);
        const assetID = buffer_1.Buffer.from("f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7", "hex");
        const to = "dcJ6z9duLfyQTgbjq2wBCowkvcPZHVDF";
        const minters = [
            "dcJ6z9duLfyQTgbjq2wBCowkvcPZHVDF",
            "2fE6iibqfERz5wenXE6qyvinsxDvFhHZk",
            "7ieAJbfrGQbpNZRAQEpZCC1Gs1z5gz4HU"
        ];
        const result = api.mint(username, password, amount, assetID, to, minters);
        const payload = {
            result: {
                txID: "sometx"
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe("sometx");
    }));
    test("getTx", () => __awaiter(void 0, void 0, void 0, function* () {
        const txid = "f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7";
        const result = api.getTx(txid);
        const payload = {
            result: {
                tx: "sometx"
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe("sometx");
    }));
    test("getTxStatus", () => __awaiter(void 0, void 0, void 0, function* () {
        const txid = "f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7";
        const result = api.getTxStatus(txid);
        const payload = {
            result: {
                status: "accepted"
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe("accepted");
    }));
    test("getAssetDescription as string", () => __awaiter(void 0, void 0, void 0, function* () {
        const assetID = buffer_1.Buffer.from("8a5d2d32e68bc50036e4d086044617fe4a0a0296b274999ba568ea92da46d533", "hex");
        const assetidstr = bintools.cb58Encode(assetID);
        const result = api.getAssetDescription(assetidstr);
        const payload = {
            result: {
                name: "Collin Coin",
                symbol: "CKC",
                assetID: assetidstr,
                denomination: "10"
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response.name).toBe("Collin Coin");
        expect(response.symbol).toBe("CKC");
        expect(response.assetID.toString("hex")).toBe(assetID.toString("hex"));
        expect(response.denomination).toBe(10);
    }));
    test("getAssetDescription as Buffer", () => __awaiter(void 0, void 0, void 0, function* () {
        const assetID = buffer_1.Buffer.from("8a5d2d32e68bc50036e4d086044617fe4a0a0296b274999ba568ea92da46d533", "hex");
        const assetidstr = bintools.cb58Encode(buffer_1.Buffer.from("8a5d2d32e68bc50036e4d086044617fe4a0a0296b274999ba568ea92da46d533", "hex"));
        const result = api.getAssetDescription(assetID);
        const payload = {
            result: {
                name: "Collin Coin",
                symbol: "CKC",
                assetID: assetidstr,
                denomination: "11"
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response.name).toBe("Collin Coin");
        expect(response.symbol).toBe("CKC");
        expect(response.assetID.toString("hex")).toBe(assetID.toString("hex"));
        expect(response.denomination).toBe(11);
    }));
    test("getUTXOs", () => __awaiter(void 0, void 0, void 0, function* () {
        // Payment
        const OPUTXOstr1 = bintools.cb58Encode(buffer_1.Buffer.from("000038d1b9f1138672da6fb6c35125539276a9acc2a668d63bea6ba3c795e2edb0f5000000013e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd3558000000070000000000004dd500000000000000000000000100000001a36fd0c2dbcab311731dde7ef1514bd26fcdc74d", "hex"));
        const OPUTXOstr2 = bintools.cb58Encode(buffer_1.Buffer.from("0000c3e4823571587fe2bdfc502689f5a8238b9d0ea7f3277124d16af9de0d2d9911000000003e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd355800000007000000000000001900000000000000000000000100000001e1b6b6a4bad94d2e3f20730379b9bcd6f176318e", "hex"));
        const OPUTXOstr3 = bintools.cb58Encode(buffer_1.Buffer.from("0000f29dba61fda8d57a911e7f8810f935bde810d3f8d495404685bdb8d9d8545e86000000003e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd355800000007000000000000001900000000000000000000000100000001e1b6b6a4bad94d2e3f20730379b9bcd6f176318e", "hex"));
        const set = new utxos_1.UTXOSet();
        set.add(OPUTXOstr1);
        set.addArray([OPUTXOstr2, OPUTXOstr3]);
        const persistOpts = new persistenceoptions_1.PersistanceOptions("test", true, "union");
        expect(persistOpts.getMergeRule()).toBe("union");
        let addresses = set
            .getAddresses()
            .map((a) => api.addressFromBuffer(a));
        let result = api.getUTXOs(addresses, api.getBlockchainID(), 0, undefined, persistOpts);
        const payload = {
            result: {
                numFetched: 3,
                utxos: [OPUTXOstr1, OPUTXOstr2, OPUTXOstr3],
                stopIndex: { address: "a", utxo: "b" }
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        let response = (yield result).utxos;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(response.getAllUTXOStrings().sort())).toBe(JSON.stringify(set.getAllUTXOStrings().sort()));
        addresses = set.getAddresses().map((a) => api.addressFromBuffer(a));
        result = api.getUTXOs(addresses, api.getBlockchainID(), 0, undefined, persistOpts);
        jest_mock_axios_1.default.mockResponse(responseObj);
        response = (yield result).utxos;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(2);
        expect(JSON.stringify(response.getAllUTXOStrings().sort())).toBe(JSON.stringify(set.getAllUTXOStrings().sort()));
    }));
    describe("Transactions", () => {
        let set;
        let keymgr2;
        let keymgr3;
        let addrs1;
        let addrs2;
        let addrs3;
        let addressbuffs = [];
        let addresses = [];
        let utxos;
        let inputs;
        let outputs;
        let ops;
        let amnt = 10000;
        const assetID = buffer_1.Buffer.from((0, create_hash_1.default)("sha256").update("mary had a little lamb").digest());
        const NFTassetID = buffer_1.Buffer.from((0, create_hash_1.default)("sha256")
            .update("I can't stand it, I know you planned it, I'mma set straight this Watergate.")
            .digest());
        let secpbase1;
        let secpbase2;
        let secpbase3;
        let initialState;
        let nftpbase1;
        let nftpbase2;
        let nftpbase3;
        let nftInitialState;
        let nftutxoids = [];
        let fungutxoids = [];
        let avm;
        const fee = 10;
        const name = "Mortycoin is the dumb as a sack of hammers.";
        const symbol = "morT";
        const denomination = 8;
        let secpMintOut1;
        let secpMintOut2;
        let secpMintTXID;
        let secpMintUTXO;
        let secpMintXferOut1;
        let secpMintXferOut2;
        let secpMintOp;
        let xfersecpmintop;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            avm = new api_1.AVMAPI(avalanche, "/ext/bc/X", blockchainID);
            const result = avm.getDJTXAssetID(true);
            const payload = {
                result: {
                    name,
                    symbol,
                    assetID: bintools.cb58Encode(assetID),
                    denomination: denomination
                }
            };
            const responseObj = {
                data: payload
            };
            jest_mock_axios_1.default.mockResponse(responseObj);
            yield result;
            set = new utxos_1.UTXOSet();
            avm.newKeyChain();
            keymgr2 = new keychain_1.KeyChain(avalanche.getHRP(), alias);
            keymgr3 = new keychain_1.KeyChain(avalanche.getHRP(), alias);
            addrs1 = [];
            addrs2 = [];
            addrs3 = [];
            utxos = [];
            inputs = [];
            outputs = [];
            ops = [];
            nftutxoids = [];
            fungutxoids = [];
            const pload = buffer_1.Buffer.alloc(1024);
            pload.write("All you Trekkies and TV addicts, Don't mean to diss don't mean to bring static.", 0, 1024, "utf8");
            for (let i = 0; i < 3; i++) {
                addrs1.push(avm.addressFromBuffer(avm.keyChain().makeKey().getAddress()));
                addrs2.push(avm.addressFromBuffer(keymgr2.makeKey().getAddress()));
                addrs3.push(avm.addressFromBuffer(keymgr3.makeKey().getAddress()));
            }
            const amount = constants_4.ONEDJTX.mul(new bn_js_1.default(amnt));
            addressbuffs = avm.keyChain().getAddresses();
            addresses = addressbuffs.map((a) => avm.addressFromBuffer(a));
            const locktime = new bn_js_1.default(54321);
            const threshold = 3;
            for (let i = 0; i < 5; i++) {
                let txid = buffer_1.Buffer.from((0, create_hash_1.default)("sha256")
                    .update(bintools.fromBNToBuffer(new bn_js_1.default(i), 32))
                    .digest());
                let txidx = buffer_1.Buffer.alloc(4);
                txidx.writeUInt32BE(i, 0);
                const out = new outputs_1.SECPTransferOutput(amount, addressbuffs, locktime, threshold);
                const xferout = new outputs_1.TransferableOutput(assetID, out);
                outputs.push(xferout);
                const u = new utxos_1.UTXO();
                u.fromBuffer(buffer_1.Buffer.concat([u.getCodecIDBuffer(), txid, txidx, xferout.toBuffer()]));
                fungutxoids.push(u.getUTXOID());
                utxos.push(u);
                txid = u.getTxID();
                txidx = u.getOutputIdx();
                const asset = u.getAssetID();
                const input = new inputs_1.SECPTransferInput(amount);
                const xferinput = new inputs_1.TransferableInput(txid, txidx, asset, input);
                inputs.push(xferinput);
                const nout = new outputs_1.NFTTransferOutput(1000 + i, pload, addressbuffs, locktime, threshold);
                const op = new ops_1.NFTTransferOperation(nout);
                const nfttxid = buffer_1.Buffer.from((0, create_hash_1.default)("sha256")
                    .update(bintools.fromBNToBuffer(new bn_js_1.default(1000 + i), 32))
                    .digest());
                const nftutxo = new utxos_1.UTXO(constants_1.AVMConstants.LATESTCODEC, nfttxid, 1000 + i, NFTassetID, nout);
                nftutxoids.push(nftutxo.getUTXOID());
                const xferop = new ops_1.TransferableOperation(NFTassetID, [nftutxo.getUTXOID()], op);
                ops.push(xferop);
                utxos.push(nftutxo);
            }
            set.addArray(utxos);
            secpbase1 = new outputs_1.SECPTransferOutput(new bn_js_1.default(777), addrs3.map((a) => avm.parseAddress(a)), (0, helperfunctions_1.UnixNow)(), 1);
            secpbase2 = new outputs_1.SECPTransferOutput(new bn_js_1.default(888), addrs2.map((a) => avm.parseAddress(a)), (0, helperfunctions_1.UnixNow)(), 1);
            secpbase3 = new outputs_1.SECPTransferOutput(new bn_js_1.default(999), addrs2.map((a) => avm.parseAddress(a)), (0, helperfunctions_1.UnixNow)(), 1);
            initialState = new initialstates_1.InitialStates();
            initialState.addOutput(secpbase1, constants_1.AVMConstants.SECPFXID);
            initialState.addOutput(secpbase2, constants_1.AVMConstants.SECPFXID);
            initialState.addOutput(secpbase3, constants_1.AVMConstants.SECPFXID);
            nftpbase1 = new outputs_1.NFTMintOutput(0, addrs1.map((a) => api.parseAddress(a)), locktime, 1);
            nftpbase2 = new outputs_1.NFTMintOutput(1, addrs2.map((a) => api.parseAddress(a)), locktime, 1);
            nftpbase3 = new outputs_1.NFTMintOutput(2, addrs3.map((a) => api.parseAddress(a)), locktime, 1);
            nftInitialState = new initialstates_1.InitialStates();
            nftInitialState.addOutput(nftpbase1, constants_1.AVMConstants.NFTFXID);
            nftInitialState.addOutput(nftpbase2, constants_1.AVMConstants.NFTFXID);
            nftInitialState.addOutput(nftpbase3, constants_1.AVMConstants.NFTFXID);
            secpMintOut1 = new outputs_1.SECPMintOutput(addressbuffs, new bn_js_1.default(0), 1);
            secpMintOut2 = new outputs_1.SECPMintOutput(addressbuffs, new bn_js_1.default(0), 1);
            secpMintTXID = buffer_1.Buffer.from((0, create_hash_1.default)("sha256")
                .update(bintools.fromBNToBuffer(new bn_js_1.default(1337), 32))
                .digest());
            secpMintUTXO = new utxos_1.UTXO(constants_1.AVMConstants.LATESTCODEC, secpMintTXID, 0, assetID, secpMintOut1);
            secpMintXferOut1 = new outputs_1.SECPTransferOutput(new bn_js_1.default(123), addrs3.map((a) => avm.parseAddress(a)), (0, helperfunctions_1.UnixNow)(), 2);
            secpMintXferOut2 = new outputs_1.SECPTransferOutput(new bn_js_1.default(456), [avm.parseAddress(addrs2[0])], (0, helperfunctions_1.UnixNow)(), 1);
            secpMintOp = new ops_1.SECPMintOperation(secpMintOut1, secpMintXferOut1);
            set.add(secpMintUTXO);
            xfersecpmintop = new ops_1.TransferableOperation(assetID, [secpMintUTXO.getUTXOID()], secpMintOp);
        }));
        test("getDefaultMintTxFee", () => {
            expect(avm.getDefaultMintTxFee().toString()).toBe("1000000");
        });
        test("signTx", () => __awaiter(void 0, void 0, void 0, function* () {
            const txu1 = yield avm.buildBaseTx(set, new bn_js_1.default(amnt), bintools.cb58Encode(assetID), addrs3, addrs1, addrs1);
            const txu2 = set.buildBaseTx(networkID, bintools.cb58Decode(blockchainID), new bn_js_1.default(amnt), assetID, addrs3.map((a) => avm.parseAddress(a)), addrs1.map((a) => avm.parseAddress(a)), addrs1.map((a) => avm.parseAddress(a)), avm.getTxFee(), assetID, undefined, (0, helperfunctions_1.UnixNow)(), new bn_js_1.default(0), 1);
            const tx1 = avm.signTx(txu1);
            const tx2 = avm.signTx(txu2);
            expect(tx2.toBuffer().toString("hex")).toBe(tx1.toBuffer().toString("hex"));
            expect(tx2.toString()).toBe(tx1.toString());
        }));
        test("buildBaseTx1", () => __awaiter(void 0, void 0, void 0, function* () {
            const txu1 = yield avm.buildBaseTx(set, new bn_js_1.default(amnt), bintools.cb58Encode(assetID), addrs3, addrs1, addrs1, new payload_1.UTF8Payload("hello world").getContent());
            const memobuf = buffer_1.Buffer.from("hello world");
            const txu2 = set.buildBaseTx(networkID, bintools.cb58Decode(blockchainID), new bn_js_1.default(amnt), assetID, addrs3.map((a) => avm.parseAddress(a)), addrs1.map((a) => avm.parseAddress(a)), addrs1.map((a) => avm.parseAddress(a)), avm.getTxFee(), assetID, memobuf, (0, helperfunctions_1.UnixNow)(), new bn_js_1.default(0), 1);
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
        }));
        test("DOMPurifyCleanObject", () => __awaiter(void 0, void 0, void 0, function* () {
            const txu1 = yield avm.buildBaseTx(set, new bn_js_1.default(amnt), bintools.cb58Encode(assetID), addrs3, addrs1, addrs1);
            const tx1 = avm.signTx(txu1);
            const tx1obj = tx1.serialize("hex");
            const sanitized = tx1.sanitizeObject(tx1obj);
            expect(tx1obj).toStrictEqual(sanitized);
        }));
        test("DOMPurifyDirtyObject", () => __awaiter(void 0, void 0, void 0, function* () {
            const dirtyDom = "<img src=x onerror=alert(1)//>";
            const sanitizedString = `<img src="x">`;
            const txu1 = yield avm.buildBaseTx(set, new bn_js_1.default(amnt), bintools.cb58Encode(assetID), addrs3, addrs1, addrs1);
            const tx1 = avm.signTx(txu1);
            const tx1obj = tx1.serialize("hex");
            const dirtyObj = Object.assign(Object.assign({}, tx1obj), { dirtyDom: dirtyDom });
            const sanitizedObj = tx1.sanitizeObject(dirtyObj);
            expect(sanitizedString).toBe(sanitizedObj.dirtyDom);
        }));
        test("buildBaseTx2", () => __awaiter(void 0, void 0, void 0, function* () {
            const txu1 = yield avm.buildBaseTx(set, new bn_js_1.default(amnt).sub(new bn_js_1.default(100)), bintools.cb58Encode(assetID), addrs3, addrs1, addrs2, new payload_1.UTF8Payload("hello world"));
            const txu2 = set.buildBaseTx(networkID, bintools.cb58Decode(blockchainID), new bn_js_1.default(amnt).sub(new bn_js_1.default(100)), assetID, addrs3.map((a) => avm.parseAddress(a)), addrs1.map((a) => avm.parseAddress(a)), addrs2.map((a) => avm.parseAddress(a)), avm.getTxFee(), assetID, new payload_1.UTF8Payload("hello world").getPayload(), (0, helperfunctions_1.UnixNow)(), new bn_js_1.default(0), 1);
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const outies = txu1
                .getTransaction()
                .getOuts()
                .sort(outputs_1.TransferableOutput.comparator());
            expect(outies.length).toBe(2);
            const outaddr0 = outies[0]
                .getOutput()
                .getAddresses()
                .map((a) => avm.addressFromBuffer(a));
            const outaddr1 = outies[1]
                .getOutput()
                .getAddresses()
                .map((a) => avm.addressFromBuffer(a));
            const testaddr2 = JSON.stringify(addrs2.sort());
            const testaddr3 = JSON.stringify(addrs3.sort());
            const testout0 = JSON.stringify(outaddr0.sort());
            const testout1 = JSON.stringify(outaddr1.sort());
            expect((testaddr2 == testout0 && testaddr3 == testout1) ||
                (testaddr3 == testout0 && testaddr2 == testout1)).toBe(true);
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "BaseTx");
        }));
        test("issueTx Serialized", () => __awaiter(void 0, void 0, void 0, function* () {
            const txu = yield avm.buildBaseTx(set, new bn_js_1.default(amnt), bintools.cb58Encode(assetID), addrs3, addrs1, addrs1);
            const tx = avm.signTx(txu);
            const txid = "f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7";
            const result = avm.issueTx(tx.toString());
            const payload = {
                result: {
                    txID: txid
                }
            };
            const responseObj = {
                data: payload
            };
            jest_mock_axios_1.default.mockResponse(responseObj);
            const response = yield result;
            expect(response).toBe(txid);
        }));
        test("issueTx Buffer", () => __awaiter(void 0, void 0, void 0, function* () {
            const txu = yield avm.buildBaseTx(set, new bn_js_1.default(amnt), bintools.cb58Encode(assetID), addrs3, addrs1, addrs1);
            const tx = avm.signTx(txu);
            const txid = "f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7";
            const result = avm.issueTx(tx.toBuffer());
            const payload = {
                result: {
                    txID: txid
                }
            };
            const responseObj = {
                data: payload
            };
            jest_mock_axios_1.default.mockResponse(responseObj);
            const response = yield result;
            expect(response).toBe(txid);
        }));
        test("issueTx Class Tx", () => __awaiter(void 0, void 0, void 0, function* () {
            const txu = yield avm.buildBaseTx(set, new bn_js_1.default(amnt), bintools.cb58Encode(assetID), addrs3, addrs1, addrs1);
            const tx = avm.signTx(txu);
            const txid = "f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7";
            const result = avm.issueTx(tx);
            const payload = {
                result: {
                    txID: txid
                }
            };
            const responseObj = {
                data: payload
            };
            jest_mock_axios_1.default.mockResponse(responseObj);
            const response = yield result;
            expect(response).toBe(txid);
        }));
        test("buildCreateAssetTx - Fixed Cap", () => __awaiter(void 0, void 0, void 0, function* () {
            avm.setCreationTxFee(new bn_js_1.default(fee));
            const txu1 = yield avm.buildCreateAssetTx(set, addrs1, addrs2, initialState, name, symbol, denomination);
            const txu2 = set.buildCreateAssetTx(avalanche.getNetworkID(), bintools.cb58Decode(avm.getBlockchainID()), addrs1.map((a) => avm.parseAddress(a)), addrs2.map((a) => avm.parseAddress(a)), initialState, name, symbol, denomination, undefined, utils_1.CENTIDJTX, assetID);
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "CreateAssetTx");
        }));
        test("buildCreateAssetTx - Variable Cap", () => __awaiter(void 0, void 0, void 0, function* () {
            avm.setCreationTxFee(new bn_js_1.default(constants_2.Defaults.network[12345].P["creationTxFee"]));
            const mintOutputs = [secpMintOut1, secpMintOut2];
            const txu1 = yield avm.buildCreateAssetTx(set, addrs1, addrs2, initialState, name, symbol, denomination, mintOutputs);
            const txu2 = set.buildCreateAssetTx(avalanche.getNetworkID(), bintools.cb58Decode(avm.getBlockchainID()), addrs1.map((a) => avm.parseAddress(a)), addrs2.map((a) => avm.parseAddress(a)), initialState, name, symbol, denomination, mintOutputs, avm.getCreationTxFee(), assetID);
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
        }));
        test("buildSECPMintTx", () => __awaiter(void 0, void 0, void 0, function* () {
            avm.setTxFee(new bn_js_1.default(fee));
            const newMinter = new outputs_1.SECPMintOutput(addrs3.map((a) => avm.parseAddress(a)), new bn_js_1.default(0), 1);
            const txu1 = yield avm.buildSECPMintTx(set, newMinter, secpMintXferOut1, addrs1, addrs2, secpMintUTXO.getUTXOID());
            const txu2 = set.buildSECPMintTx(avalanche.getNetworkID(), bintools.cb58Decode(avm.getBlockchainID()), newMinter, secpMintXferOut1, addrs1.map((a) => avm.parseAddress(a)), addrs2.map((a) => avm.parseAddress(a)), secpMintUTXO.getUTXOID(), utils_2.MILLIDJTX, assetID);
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "SECPMintTx");
        }));
        test("buildCreateNFTAssetTx", () => __awaiter(void 0, void 0, void 0, function* () {
            avm.setCreationTxFee(new bn_js_1.default(constants_2.Defaults.network[12345].P["creationTxFee"]));
            const minterSets = [new minterset_1.MinterSet(1, addrs1)];
            const locktime = new bn_js_1.default(0);
            const txu1 = yield avm.buildCreateNFTAssetTx(set, addrs1, addrs2, minterSets, name, symbol, new payload_1.UTF8Payload("hello world"), (0, helperfunctions_1.UnixNow)(), locktime);
            const txu2 = set.buildCreateNFTAssetTx(avalanche.getNetworkID(), bintools.cb58Decode(avm.getBlockchainID()), addrs1.map((a) => avm.parseAddress(a)), addrs2.map((a) => avm.parseAddress(a)), minterSets, name, symbol, avm.getCreationTxFee(), assetID, new payload_1.UTF8Payload("hello world").getPayload(), (0, helperfunctions_1.UnixNow)(), locktime);
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "CreateNFTAssetTx");
        }));
        test("buildCreateNFTMintTx", () => __awaiter(void 0, void 0, void 0, function* () {
            avm.setTxFee(new bn_js_1.default(fee));
            const groupID = 0;
            const locktime = new bn_js_1.default(0);
            const threshold = 1;
            const payload = buffer_1.Buffer.from("Avalanche");
            const addrbuff1 = addrs1.map((a) => avm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => avm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => avm.parseAddress(a));
            const outputOwners = [];
            const oo = new output_1.OutputOwners(addrbuff3, locktime, threshold);
            outputOwners.push();
            const txu1 = yield avm.buildCreateNFTMintTx(set, oo, addrs1, addrs2, nftutxoids, groupID, payload, undefined, (0, helperfunctions_1.UnixNow)());
            const txu2 = set.buildCreateNFTMintTx(avalanche.getNetworkID(), bintools.cb58Decode(avm.getBlockchainID()), [oo], addrbuff1, addrbuff2, nftutxoids, groupID, payload, avm.getTxFee(), assetID, undefined, (0, helperfunctions_1.UnixNow)());
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            outputOwners.push(oo);
            outputOwners.push(new output_1.OutputOwners(addrbuff3, locktime, threshold + 1));
            const txu3 = yield avm.buildCreateNFTMintTx(set, outputOwners, addrs1, addrs2, nftutxoids, groupID, payload, undefined, (0, helperfunctions_1.UnixNow)());
            const txu4 = set.buildCreateNFTMintTx(avalanche.getNetworkID(), bintools.cb58Decode(avm.getBlockchainID()), outputOwners, addrbuff1, addrbuff2, nftutxoids, groupID, payload, avm.getTxFee(), assetID, undefined, (0, helperfunctions_1.UnixNow)());
            expect(txu4.toBuffer().toString("hex")).toBe(txu3.toBuffer().toString("hex"));
            expect(txu4.toString()).toBe(txu3.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "CreateNFTMintTx");
        }));
        test("buildNFTTransferTx", () => __awaiter(void 0, void 0, void 0, function* () {
            avm.setTxFee(new bn_js_1.default(fee));
            const pload = buffer_1.Buffer.alloc(1024);
            pload.write("All you Trekkies and TV addicts, Don't mean to diss don't mean to bring static.", 0, 1024, "utf8");
            const addrbuff1 = addrs1.map((a) => avm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => avm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => avm.parseAddress(a));
            const txu1 = yield avm.buildNFTTransferTx(set, addrs3, addrs1, addrs2, nftutxoids[1], new payload_1.UTF8Payload("hello world"), (0, helperfunctions_1.UnixNow)(), new bn_js_1.default(0), 1);
            const txu2 = set.buildNFTTransferTx(networkID, bintools.cb58Decode(blockchainID), addrbuff3, addrbuff1, addrbuff2, [nftutxoids[1]], avm.getTxFee(), assetID, new payload_1.UTF8Payload("hello world").getPayload(), (0, helperfunctions_1.UnixNow)(), new bn_js_1.default(0), 1);
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "NFTTransferTx");
        }));
        test("buildImportTx", () => __awaiter(void 0, void 0, void 0, function* () {
            const locktime = new bn_js_1.default(0);
            const threshold = 1;
            avm.setTxFee(new bn_js_1.default(fee));
            const addrbuff1 = addrs1.map((a) => avm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => avm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => avm.parseAddress(a));
            const fungutxo = set.getUTXO(fungutxoids[1]);
            const fungutxostr = fungutxo.toString();
            const result = avm.buildImportTx(set, addrs1, constants_3.PlatformChainID, addrs3, addrs1, addrs2, new payload_1.UTF8Payload("hello world"), (0, helperfunctions_1.UnixNow)(), locktime, threshold);
            const payload = {
                result: {
                    utxos: [fungutxostr]
                }
            };
            const responseObj = {
                data: payload
            };
            jest_mock_axios_1.default.mockResponse(responseObj);
            const txu1 = yield result;
            const txu2 = set.buildImportTx(networkID, bintools.cb58Decode(blockchainID), addrbuff3, addrbuff1, addrbuff2, [fungutxo], bintools.cb58Decode(constants_3.PlatformChainID), avm.getTxFee(), yield avm.getDJTXAssetID(), new payload_1.UTF8Payload("hello world").getPayload(), (0, helperfunctions_1.UnixNow)(), locktime, threshold);
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "ImportTx");
        }));
        test("buildExportTx", () => __awaiter(void 0, void 0, void 0, function* () {
            avm.setTxFee(new bn_js_1.default(fee));
            const addrbuff1 = addrs1.map((a) => avm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => avm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => avm.parseAddress(a));
            const amount = new bn_js_1.default(90);
            const type = "bech32";
            const txu1 = yield avm.buildExportTx(set, amount, bintools.cb58Decode(constants_3.PlatformChainID), addrbuff3.map((a) => serialization.bufferToType(a, type, avalanche.getHRP(), "P")), addrs1, addrs2, new payload_1.UTF8Payload("hello world"), (0, helperfunctions_1.UnixNow)());
            const txu2 = set.buildExportTx(networkID, bintools.cb58Decode(blockchainID), amount, assetID, addrbuff3, addrbuff1, addrbuff2, bintools.cb58Decode(constants_3.PlatformChainID), avm.getTxFee(), assetID, new payload_1.UTF8Payload("hello world").getPayload(), (0, helperfunctions_1.UnixNow)());
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const txu3 = yield avm.buildExportTx(set, amount, constants_3.PlatformChainID, addrs3, addrs1, addrs2, new payload_1.UTF8Payload("hello world"), (0, helperfunctions_1.UnixNow)());
            const txu4 = set.buildExportTx(networkID, bintools.cb58Decode(blockchainID), amount, assetID, addrbuff3, addrbuff1, addrbuff2, undefined, avm.getTxFee(), assetID, new payload_1.UTF8Payload("hello world").getPayload(), (0, helperfunctions_1.UnixNow)());
            expect(txu4.toBuffer().toString("hex")).toBe(txu3.toBuffer().toString("hex"));
            expect(txu4.toString()).toBe(txu3.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "ExportTx");
        }));
        test("buildGenesis", () => __awaiter(void 0, void 0, void 0, function* () {
            const genesisData = {
                genesisData: {
                    assetAlias1: {
                        name: "human readable name",
                        symbol: "AVAL",
                        initialState: {
                            fixedCap: [
                                {
                                    amount: 1000,
                                    address: "A"
                                },
                                {
                                    amount: 5000,
                                    address: "B"
                                }
                            ]
                        }
                    },
                    assetAliasCanBeAnythingUnique: {
                        name: "human readable name",
                        symbol: "AVAL",
                        initialState: {
                            variableCap: [
                                {
                                    minters: ["A", "B"],
                                    threshold: 1
                                },
                                {
                                    minters: ["A", "B", "C"],
                                    threshold: 2
                                }
                            ]
                        }
                    }
                }
            };
            const bytes = "111TNWzUtHKoSvxohjyfEwE2X228ZDGBngZ4mdMUVMnVnjtnawW1b1zbAhzyAM1v6d7ECNj6DXsT7qDmhSEf3DWgXRj7ECwBX36ZXFc9tWVB2qHURoUfdDvFsBeSRqatCmj76eZQMGZDgBFRNijRhPNKUap7bCeKpHDtuCZc4YpPkd4mR84dLL2AL1b4K46eirWKMaFVjA5btYS4DnyUx5cLpAq3d35kEdNdU5zH3rTU18S4TxYV8voMPcLCTZ3h4zRsM5jW1cUzjWVvKg7uYS2oR9qXRFcgy1gwNTFZGstySuvSF7MZeZF4zSdNgC4rbY9H94RVhqe8rW7MXqMSZB6vBTB2BpgF6tNFehmYxEXwjaKRrimX91utvZe9YjgGbDr8XHsXCnXXg4ZDCjapCy4HmmRUtUoAduGNBdGVMiwE9WvVbpMFFcNfgDXGz9NiatgSnkxQALTHvGXXm8bn4CoLFzKnAtq3KwiWqHmV3GjFYeUm3m8Zee9VDfZAvDsha51acxfto1htstxYu66DWpT36YT18WSbxibZcKXa7gZrrsCwyzid8CCWw79DbaLCUiq9u47VqofG1kgxwuuyHb8NVnTgRTkQASSbj232fyG7YeX4mAvZY7a7K7yfSyzJaXdUdR7aLeCdLP6mbFDqUMrN6YEkU2X8d4Ck3T";
            const result = api.buildGenesis(genesisData);
            const payload = {
                result: {
                    bytes: bytes
                }
            };
            const responseObj = {
                data: payload
            };
            jest_mock_axios_1.default.mockResponse(responseObj);
            const response = yield result;
            expect(response).toBe(bytes);
        }));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0cy9hcGlzL2F2bS9hcGkudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0VBQXVDO0FBQ3ZDLDZCQUErQjtBQUMvQixtREFBa0Q7QUFDbEQsNkRBQWtFO0FBQ2xFLG9DQUFnQztBQUNoQyxrREFBc0I7QUFDdEIsMkVBQWtEO0FBQ2xELHVEQUEyRDtBQUMzRCx5REFHcUM7QUFDckMsOERBQW9DO0FBQ3BDLGlEQUF5RDtBQUN6RCwrREFBOEQ7QUFDOUQsMkRBTXNDO0FBQ3RDLG1EQUlrQztBQUNsQywrQ0FBZ0M7QUFDaEMsd0RBQXdEO0FBQ3hELHVFQUFtRTtBQUNuRSw0REFBdUQ7QUFDdkQsd0VBQTREO0FBQzVELHVEQUF5RDtBQUN6RCwrREFBMkQ7QUFDM0QsNERBQThEO0FBQzlELDhFQUEwRTtBQUMxRSw0REFBc0Q7QUFDdEQsb0VBS3lDO0FBT3pDLHFDQUFxQztBQUNyQyxxQ0FBcUM7QUFFckM7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFrQiw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2hFLE1BQU0saUJBQWlCLEdBQVksS0FBSyxDQUFBO0FBQ3hDLE1BQU0sT0FBTyxHQUF1QixTQUFTLENBQUE7QUFFN0MsTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFvQixFQUFFLElBQVksRUFBUSxFQUFFO0lBQzlELElBQUksaUJBQWlCLEVBQUU7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FDVCxJQUFJLENBQUMsU0FBUyxDQUNaLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxHQUFHLGlCQUFpQixDQUFDLENBQ3hFLENBQ0YsQ0FBQTtRQUNELE9B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QUMsQ0FBQTtJQUNKLENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbW9ja0F4aW9zIGZyb20gXCJqZXN0LW1vY2stYXhpb3NcIlxuaW1wb3J0IHsgQXZhbGFuY2hlIH0gZnJvbSBcInNyY1wiXG5pbXBvcnQgeyBBVk1BUEkgfSBmcm9tIFwiLi4vLi4vLi4vc3JjL2FwaXMvYXZtL2FwaVwiXG5pbXBvcnQgeyBLZXlQYWlyLCBLZXlDaGFpbiB9IGZyb20gXCIuLi8uLi8uLi9zcmMvYXBpcy9hdm0va2V5Y2hhaW5cIlxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uLy4uLy4uL3NyYy91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBVVFhPU2V0LCBVVFhPIH0gZnJvbSBcIi4uLy4uLy4uL3NyYy9hcGlzL2F2bS91dHhvc1wiXG5pbXBvcnQge1xuICBUcmFuc2ZlcmFibGVJbnB1dCxcbiAgU0VDUFRyYW5zZmVySW5wdXRcbn0gZnJvbSBcIi4uLy4uLy4uL3NyYy9hcGlzL2F2bS9pbnB1dHNcIlxuaW1wb3J0IGNyZWF0ZUhhc2ggZnJvbSBcImNyZWF0ZS1oYXNoXCJcbmltcG9ydCB7IFVuc2lnbmVkVHgsIFR4IH0gZnJvbSBcIi4uLy4uLy4uL3NyYy9hcGlzL2F2bS90eFwiXG5pbXBvcnQgeyBBVk1Db25zdGFudHMgfSBmcm9tIFwiLi4vLi4vLi4vc3JjL2FwaXMvYXZtL2NvbnN0YW50c1wiXG5pbXBvcnQge1xuICBUcmFuc2ZlcmFibGVPdXRwdXQsXG4gIFNFQ1BUcmFuc2Zlck91dHB1dCxcbiAgTkZUTWludE91dHB1dCxcbiAgTkZUVHJhbnNmZXJPdXRwdXQsXG4gIFNFQ1BNaW50T3V0cHV0XG59IGZyb20gXCIuLi8uLi8uLi9zcmMvYXBpcy9hdm0vb3V0cHV0c1wiXG5pbXBvcnQge1xuICBORlRUcmFuc2Zlck9wZXJhdGlvbixcbiAgVHJhbnNmZXJhYmxlT3BlcmF0aW9uLFxuICBTRUNQTWludE9wZXJhdGlvblxufSBmcm9tIFwiLi4vLi4vLi4vc3JjL2FwaXMvYXZtL29wc1wiXG5pbXBvcnQgKiBhcyBiZWNoMzIgZnJvbSBcImJlY2gzMlwiXG5pbXBvcnQgeyBVVEY4UGF5bG9hZCB9IGZyb20gXCIuLi8uLi8uLi9zcmMvdXRpbHMvcGF5bG9hZFwiXG5pbXBvcnQgeyBJbml0aWFsU3RhdGVzIH0gZnJvbSBcIi4uLy4uLy4uL3NyYy9hcGlzL2F2bS9pbml0aWFsc3RhdGVzXCJcbmltcG9ydCB7IERlZmF1bHRzIH0gZnJvbSBcIi4uLy4uLy4uL3NyYy91dGlscy9jb25zdGFudHNcIlxuaW1wb3J0IHsgVW5peE5vdyB9IGZyb20gXCIuLi8uLi8uLi9zcmMvdXRpbHMvaGVscGVyZnVuY3Rpb25zXCJcbmltcG9ydCB7IE91dHB1dE93bmVycyB9IGZyb20gXCIuLi8uLi8uLi9zcmMvY29tbW9uL291dHB1dFwiXG5pbXBvcnQgeyBNaW50ZXJTZXQgfSBmcm9tIFwiLi4vLi4vLi4vc3JjL2FwaXMvYXZtL21pbnRlcnNldFwiXG5pbXBvcnQgeyBQbGF0Zm9ybUNoYWluSUQgfSBmcm9tIFwiLi4vLi4vLi4vc3JjL3V0aWxzL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBQZXJzaXN0YW5jZU9wdGlvbnMgfSBmcm9tIFwiLi4vLi4vLi4vc3JjL3V0aWxzL3BlcnNpc3RlbmNlb3B0aW9uc1wiXG5pbXBvcnQgeyBPTkVESlRYIH0gZnJvbSBcIi4uLy4uLy4uL3NyYy91dGlscy9jb25zdGFudHNcIlxuaW1wb3J0IHtcbiAgU2VyaWFsaXphYmxlLFxuICBTZXJpYWxpemF0aW9uLFxuICBTZXJpYWxpemVkRW5jb2RpbmcsXG4gIFNlcmlhbGl6ZWRUeXBlXG59IGZyb20gXCIuLi8uLi8uLi9zcmMvdXRpbHMvc2VyaWFsaXphdGlvblwiXG5pbXBvcnQgeyBIdHRwUmVzcG9uc2UgfSBmcm9tIFwiamVzdC1tb2NrLWF4aW9zL2Rpc3QvbGliL21vY2stYXhpb3MtdHlwZXNcIlxuaW1wb3J0IHtcbiAgR2V0QmFsYW5jZVJlc3BvbnNlLFxuICBTZW5kTXVsdGlwbGVSZXNwb25zZSxcbiAgU2VuZFJlc3BvbnNlXG59IGZyb20gXCJzcmMvYXBpcy9hdm0vaW50ZXJmYWNlc1wiXG5pbXBvcnQgeyBDRU5USURKVFggfSBmcm9tIFwic3JjL3V0aWxzXCJcbmltcG9ydCB7IE1JTExJREpUWCB9IGZyb20gXCJzcmMvdXRpbHNcIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuY29uc3QgZHVtcFNlcmFpbGl6YXRpb246IGJvb2xlYW4gPSBmYWxzZVxuY29uc3QgZGlzcGxheTogU2VyaWFsaXplZEVuY29kaW5nID0gXCJkaXNwbGF5XCJcblxuY29uc3Qgc2VyaWFsemVpdCA9IChhVGhpbmc6IFNlcmlhbGl6YWJsZSwgbmFtZTogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGlmIChkdW1wU2VyYWlsaXphdGlvbikge1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIHNlcmlhbGl6YXRpb24uc2VyaWFsaXplKGFUaGluZywgXCJhdm1cIiwgXCJoZXhcIiwgbmFtZSArIFwiIC0tIEhleCBFbmNvZGVkXCIpXG4gICAgICApXG4gICAgKVxuICAgIGNvbnNvbGUubG9nKFxuICAgICAgSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIHNlcmlhbGl6YXRpb24uc2VyaWFsaXplKFxuICAgICAgICAgIGFUaGluZyxcbiAgICAgICAgICBcImF2bVwiLFxuICAgICAgICAgIFwiZGlzcGxheVwiLFxuICAgICAgICAgIG5hbWUgKyBcIiAtLSBIdW1hbi1SZWFkYWJsZVwiXG4gICAgICAgIClcbiAgICAgIClcbiAgICApXG4gIH1cbn1cblxuZGVzY3JpYmUoXCJBVk1BUElcIiwgKCk6IHZvaWQgPT4ge1xuICBjb25zdCBuZXR3b3JrSUQ6IG51bWJlciA9IDEzMzdcbiAgY29uc3QgYmxvY2tjaGFpbklEOiBzdHJpbmcgPSBEZWZhdWx0cy5uZXR3b3JrW25ldHdvcmtJRF0uWC5ibG9ja2NoYWluSURcbiAgY29uc3QgaXA6IHN0cmluZyA9IFwiMTI3LjAuMC4xXCJcbiAgY29uc3QgcG9ydDogbnVtYmVyID0gOTY1MFxuICBjb25zdCBwcm90b2NvbDogc3RyaW5nID0gXCJodHRwc1wiXG5cbiAgY29uc3QgdXNlcm5hbWU6IHN0cmluZyA9IFwiQXZhTGFic1wiXG4gIGNvbnN0IHBhc3N3b3JkOiBzdHJpbmcgPSBcInBhc3N3b3JkXCJcblxuICBjb25zdCBhdmFsYW5jaGU6IEF2YWxhbmNoZSA9IG5ldyBBdmFsYW5jaGUoXG4gICAgaXAsXG4gICAgcG9ydCxcbiAgICBwcm90b2NvbCxcbiAgICBuZXR3b3JrSUQsXG4gICAgdW5kZWZpbmVkLFxuICAgIHVuZGVmaW5lZCxcbiAgICB1bmRlZmluZWQsXG4gICAgdHJ1ZVxuICApXG4gIGxldCBhcGk6IEFWTUFQSVxuICBsZXQgYWxpYXM6IHN0cmluZ1xuXG4gIGNvbnN0IGFkZHJBOiBzdHJpbmcgPSBgWC0ke2JlY2gzMi5iZWNoMzIuZW5jb2RlKFxuICAgIGF2YWxhbmNoZS5nZXRIUlAoKSxcbiAgICBiZWNoMzIuYmVjaDMyLnRvV29yZHMoXG4gICAgICBiaW50b29scy5jYjU4RGVjb2RlKFwiQjZENHYxVnRQWUxiaVV2WVh0VzRQeDhvRTlpbUMydkdXXCIpXG4gICAgKVxuICApfWBcbiAgY29uc3QgYWRkckI6IHN0cmluZyA9IGBYLSR7YmVjaDMyLmJlY2gzMi5lbmNvZGUoXG4gICAgYXZhbGFuY2hlLmdldEhSUCgpLFxuICAgIGJlY2gzMi5iZWNoMzIudG9Xb3JkcyhcbiAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoXCJQNXdkUnVaZWFEdDI4ZUhNUDVTM3c5WmRvQmZvN3d1ekZcIilcbiAgICApXG4gICl9YFxuICBjb25zdCBhZGRyQzogc3RyaW5nID0gYFgtJHtiZWNoMzIuYmVjaDMyLmVuY29kZShcbiAgICBhdmFsYW5jaGUuZ2V0SFJQKCksXG4gICAgYmVjaDMyLmJlY2gzMi50b1dvcmRzKFxuICAgICAgYmludG9vbHMuY2I1OERlY29kZShcIjZZM2t5c2pGOWpuSG5Za2RTOXlHQXVvSHlhZTJlTm1lVlwiKVxuICAgIClcbiAgKX1gXG5cbiAgYmVmb3JlQWxsKCgpOiB2b2lkID0+IHtcbiAgICBhcGkgPSBuZXcgQVZNQVBJKGF2YWxhbmNoZSwgXCIvZXh0L2JjL1hcIiwgYmxvY2tjaGFpbklEKVxuICAgIGFsaWFzID0gYXBpLmdldEJsb2NrY2hhaW5BbGlhcygpXG4gIH0pXG5cbiAgYWZ0ZXJFYWNoKCgpOiB2b2lkID0+IHtcbiAgICBtb2NrQXhpb3MucmVzZXQoKVxuICB9KVxuXG4gIHRlc3QoXCJmYWlscyB0byBzZW5kIHdpdGggaW5jb3JyZWN0IHVzZXJuYW1lXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBtZW1vOiBzdHJpbmcgPSBcImhlbGxvIHdvcmxkXCJcbiAgICBjb25zdCBpbmNvcnJlY3RVc2VyTmFtZTogc3RyaW5nID0gXCJhc2RmYXNkZnNhXCJcbiAgICBjb25zdCBtZXNzYWdlOiBzdHJpbmcgPSBgcHJvYmxlbSByZXRyaWV2aW5nIHVzZXI6IGluY29ycmVjdCBwYXNzd29yZCBmb3IgdXNlciBcIiR7aW5jb3JyZWN0VXNlck5hbWV9XCJgXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPFNlbmRSZXNwb25zZT4gPSBhcGkuc2VuZChcbiAgICAgIGluY29ycmVjdFVzZXJOYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBcImFzc2V0SWRcIixcbiAgICAgIDEwLFxuICAgICAgYWRkckEsXG4gICAgICBbYWRkckJdLFxuICAgICAgYWRkckEsXG4gICAgICBtZW1vXG4gICAgKVxuXG4gICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIGNvZGU6IC0zMjAwMCxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgZGF0YTogbnVsbFxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IG9iamVjdCA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2VbXCJjb2RlXCJdKS50b0JlKC0zMjAwMClcbiAgICBleHBlY3QocmVzcG9uc2VbXCJtZXNzYWdlXCJdKS50b0JlKG1lc3NhZ2UpXG4gIH0pXG5cbiAgdGVzdChcImZhaWxzIHRvIHNlbmQgd2l0aCBpbmNvcnJlY3QgUGFzc3dvcmRcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IG1lbW86IHN0cmluZyA9IFwiaGVsbG8gd29ybGRcIlxuICAgIGNvbnN0IGluY29ycmVjdFBhc3N3b3JkOiBzdHJpbmcgPSBcImFzZGZhc2Rmc2FcIlxuICAgIGNvbnN0IG1lc3NhZ2U6IHN0cmluZyA9IGBwcm9ibGVtIHJldHJpZXZpbmcgdXNlcjogaW5jb3JyZWN0IHBhc3N3b3JkIGZvciB1c2VyIFwiJHtpbmNvcnJlY3RQYXNzd29yZH1cImBcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8U2VuZFJlc3BvbnNlPiA9IGFwaS5zZW5kKFxuICAgICAgdXNlcm5hbWUsXG4gICAgICBpbmNvcnJlY3RQYXNzd29yZCxcbiAgICAgIFwiYXNzZXRJZFwiLFxuICAgICAgMTAsXG4gICAgICBhZGRyQSxcbiAgICAgIFthZGRyQl0sXG4gICAgICBhZGRyQSxcbiAgICAgIG1lbW9cbiAgICApXG5cbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgY29kZTogLTMyMDAwLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgICBkYXRhOiBudWxsXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogb2JqZWN0ID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZVtcImNvZGVcIl0pLnRvQmUoLTMyMDAwKVxuICAgIGV4cGVjdChyZXNwb25zZVtcIm1lc3NhZ2VcIl0pLnRvQmUobWVzc2FnZSlcbiAgfSlcblxuICB0ZXN0KFwiY2FuIFNlbmQgMVwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgdHhJZDogc3RyaW5nID0gXCJhc2RmaHZsMjM0XCJcbiAgICBjb25zdCBtZW1vOiBzdHJpbmcgPSBcImhlbGxvIHdvcmxkXCJcbiAgICBjb25zdCBjaGFuZ2VBZGRyOiBzdHJpbmcgPSBcIlgtbG9jYWwxXCJcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8U2VuZFJlc3BvbnNlPiA9IGFwaS5zZW5kKFxuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIFwiYXNzZXRJZFwiLFxuICAgICAgMTAsXG4gICAgICBhZGRyQSxcbiAgICAgIFthZGRyQl0sXG4gICAgICBhZGRyQSxcbiAgICAgIG1lbW9cbiAgICApXG4gICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIHR4SUQ6IHR4SWQsXG4gICAgICAgIGNoYW5nZUFkZHI6IGNoYW5nZUFkZHJcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWRcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBvYmplY3QgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlW1widHhJRFwiXSkudG9CZSh0eElkKVxuICAgIGV4cGVjdChyZXNwb25zZVtcImNoYW5nZUFkZHJcIl0pLnRvQmUoY2hhbmdlQWRkcilcbiAgfSlcblxuICB0ZXN0KFwiY2FuIFNlbmQgMlwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgdHhJZDogc3RyaW5nID0gXCJhc2RmaHZsMjM0XCJcbiAgICBjb25zdCBtZW1vOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShcImhlbGxvIHdvcmxkXCIpXG4gICAgY29uc3QgY2hhbmdlQWRkcjogc3RyaW5nID0gXCJYLWxvY2FsMVwiXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPFNlbmRSZXNwb25zZT4gPSBhcGkuc2VuZChcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBiaW50b29scy5iNThUb0J1ZmZlcihcIjZoMnM1ZGUxVkM2NW1lYWpFMUwyUGp2WjFNWHZIYzNGNmVxUENHS3VEdDRNeGl3ZUZcIiksXG4gICAgICBuZXcgQk4oMTApLFxuICAgICAgYWRkckEsXG4gICAgICBbYWRkckJdLFxuICAgICAgYWRkckEsXG4gICAgICBtZW1vXG4gICAgKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICB0eElEOiB0eElkLFxuICAgICAgICBjaGFuZ2VBZGRyOiBjaGFuZ2VBZGRyXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogb2JqZWN0ID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZVtcInR4SURcIl0pLnRvQmUodHhJZClcbiAgICBleHBlY3QocmVzcG9uc2VbXCJjaGFuZ2VBZGRyXCJdKS50b0JlKGNoYW5nZUFkZHIpXG4gIH0pXG5cbiAgdGVzdChcImNhbiBTZW5kIE11bHRpcGxlXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCB0eElkOiBzdHJpbmcgPSBcImFzZGZodmwyMzRcIlxuICAgIGNvbnN0IG1lbW86IHN0cmluZyA9IFwiaGVsbG8gd29ybGRcIlxuICAgIGNvbnN0IGNoYW5nZUFkZHI6IHN0cmluZyA9IFwiWC1sb2NhbDFcIlxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxTZW5kTXVsdGlwbGVSZXNwb25zZT4gPSBhcGkuc2VuZE11bHRpcGxlKFxuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIFt7IGFzc2V0SUQ6IFwiYXNzZXRJZFwiLCBhbW91bnQ6IDEwLCB0bzogYWRkckEgfV0sXG4gICAgICBbYWRkckJdLFxuICAgICAgYWRkckEsXG4gICAgICBtZW1vXG4gICAgKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICB0eElEOiB0eElkLFxuICAgICAgICBjaGFuZ2VBZGRyOiBjaGFuZ2VBZGRyXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogU2VuZE11bHRpcGxlUmVzcG9uc2UgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlW1widHhJRFwiXSkudG9CZSh0eElkKVxuICAgIGV4cGVjdChyZXNwb25zZVtcImNoYW5nZUFkZHJcIl0pLnRvQmUoY2hhbmdlQWRkcilcbiAgfSlcblxuICB0ZXN0KFwicmVmcmVzaEJsb2NrY2hhaW5JRFwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgbjNiY0lEOiBzdHJpbmcgPSBEZWZhdWx0cy5uZXR3b3JrWzNdLlhbXCJibG9ja2NoYWluSURcIl1cbiAgICBjb25zdCBuMTMzN2JjSUQ6IHN0cmluZyA9IERlZmF1bHRzLm5ldHdvcmtbMTMzN10uWFtcImJsb2NrY2hhaW5JRFwiXVxuICAgIGNvbnN0IHRlc3RBUEk6IEFWTUFQSSA9IG5ldyBBVk1BUEkoYXZhbGFuY2hlLCBcIi9leHQvYmMvYXZtXCIsIG4zYmNJRClcbiAgICBjb25zdCBiYzE6IHN0cmluZyA9IHRlc3RBUEkuZ2V0QmxvY2tjaGFpbklEKClcbiAgICBleHBlY3QoYmMxKS50b0JlKG4zYmNJRClcblxuICAgIHRlc3RBUEkucmVmcmVzaEJsb2NrY2hhaW5JRCgpXG4gICAgY29uc3QgYmMyOiBzdHJpbmcgPSB0ZXN0QVBJLmdldEJsb2NrY2hhaW5JRCgpXG4gICAgZXhwZWN0KGJjMikudG9CZShuMTMzN2JjSUQpXG5cbiAgICB0ZXN0QVBJLnJlZnJlc2hCbG9ja2NoYWluSUQobjNiY0lEKVxuICAgIGNvbnN0IGJjMzogc3RyaW5nID0gdGVzdEFQSS5nZXRCbG9ja2NoYWluSUQoKVxuICAgIGV4cGVjdChiYzMpLnRvQmUobjNiY0lEKVxuICB9KVxuXG4gIHRlc3QoXCJsaXN0QWRkcmVzc2VzXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBhZGRyZXNzZXMgPSBbYWRkckEsIGFkZHJCXVxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmdbXT4gPSBhcGkubGlzdEFkZHJlc3Nlcyh1c2VybmFtZSwgcGFzc3dvcmQpXG4gICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIGFkZHJlc3Nlc1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZ1tdID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZShhZGRyZXNzZXMpXG4gIH0pXG5cbiAgdGVzdChcImltcG9ydEtleVwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgYWRkcmVzcyA9IGFkZHJDXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhcGkuaW1wb3J0S2V5KHVzZXJuYW1lLCBwYXNzd29yZCwgXCJrZXlcIilcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgYWRkcmVzc1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUoYWRkcmVzcylcbiAgfSlcblxuICB0ZXN0KFwiZ2V0QmFsYW5jZVwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgYmFsYW5jZTogQk4gPSBuZXcgQk4oXCIxMDBcIiwgMTApXG4gICAgY29uc3QgcmVzcG9iajogR2V0QmFsYW5jZVJlc3BvbnNlID0ge1xuICAgICAgYmFsYW5jZSxcbiAgICAgIHV0eG9JRHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR4SUQ6IFwiTFVyaUIzVzkxOUY4NEx3UE1NdzRzbTJmWjRZNzZXZ2I2bXNhYXVFWTdpMXRGTm10dlwiLFxuICAgICAgICAgIG91dHB1dEluZGV4OiAwXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8R2V0QmFsYW5jZVJlc3BvbnNlPiA9IGFwaS5nZXRCYWxhbmNlKGFkZHJBLCBcIkFUSFwiKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDogcmVzcG9ialxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IG9iamVjdCA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpKS50b0JlKEpTT04uc3RyaW5naWZ5KHJlc3BvYmopKVxuICB9KVxuXG4gIHRlc3QoXCJnZXRCYWxhbmNlIGluY2x1ZGVQYXJ0aWFsXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBiYWxhbmNlOiBCTiA9IG5ldyBCTihcIjEwMFwiLCAxMClcbiAgICBjb25zdCByZXNwb2JqID0ge1xuICAgICAgYmFsYW5jZSxcbiAgICAgIHV0eG9JRHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR4SUQ6IFwiTFVyaUIzVzkxOUY4NEx3UE1NdzRzbTJmWjRZNzZXZ2I2bXNhYXVFWTdpMXRGTm10dlwiLFxuICAgICAgICAgIG91dHB1dEluZGV4OiAwXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8R2V0QmFsYW5jZVJlc3BvbnNlPiA9IGFwaS5nZXRCYWxhbmNlKFxuICAgICAgYWRkckEsXG4gICAgICBcIkFUSFwiLFxuICAgICAgdHJ1ZVxuICAgIClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHJlc3BvYmpcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWRcbiAgICB9XG5cbiAgICBjb25zdCBleHBlY3RlZFJlcXVlc3RQYXlsb2FkID0ge1xuICAgICAgaWQ6IDEsXG4gICAgICBtZXRob2Q6IFwiYXZtLmdldEJhbGFuY2VcIixcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBhZGRyZXNzOiBhZGRyQSxcbiAgICAgICAgYXNzZXRJRDogXCJBVEhcIixcbiAgICAgICAgaW5jbHVkZVBhcnRpYWw6IHRydWVcbiAgICAgIH0sXG4gICAgICBqc29ucnBjOiBcIjIuMFwiXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogb2JqZWN0ID0gYXdhaXQgcmVzdWx0XG4gICAgY29uc3QgY2FsbGVkV2l0aDogb2JqZWN0ID0ge1xuICAgICAgYmFzZVVSTDogXCJodHRwczovLzEyNy4wLjAuMTo5NjUwXCIsXG4gICAgICBkYXRhOiAne1wiaWRcIjo5LFwibWV0aG9kXCI6XCJhdm0uZ2V0QmFsYW5jZVwiLFwicGFyYW1zXCI6e1wiYWRkcmVzc1wiOlwiWC1jdXN0b20xZDZra2owcWg0d2NtdXMzdGs1OW5wd3Qzcmx1YzZlbjc1NWE1OGdcIixcImFzc2V0SURcIjpcIkFUSFwiLFwiaW5jbHVkZVBhcnRpYWxcIjp0cnVlfSxcImpzb25ycGNcIjpcIjIuMFwifScsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PVVURi04XCJcbiAgICAgIH0sXG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgcGFyYW1zOiB7fSxcbiAgICAgIHJlc3BvbnNlVHlwZTogXCJqc29uXCIsXG4gICAgICB1cmw6IFwiL2V4dC9iYy9YXCJcbiAgICB9XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvQmVDYWxsZWRXaXRoKGNhbGxlZFdpdGgpXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpKS50b0JlKEpTT04uc3RyaW5naWZ5KHJlc3BvYmopKVxuICB9KVxuXG4gIHRlc3QoXCJleHBvcnRLZXlcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IGtleTogc3RyaW5nID0gXCJzZGZnbHZsajJoM3Y0NVwiXG5cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5leHBvcnRLZXkodXNlcm5hbWUsIHBhc3N3b3JkLCBhZGRyQSlcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgcHJpdmF0ZUtleToga2V5XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZShrZXkpXG4gIH0pXG5cbiAgdGVzdChcImV4cG9ydFwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgYW1vdW50OiBCTiA9IG5ldyBCTigxMDApXG4gICAgY29uc3QgdG86IHN0cmluZyA9IFwiYWJjZGVmXCJcbiAgICBjb25zdCBhc3NldElEOiBzdHJpbmcgPSBcIkRKVFhcIlxuICAgIGNvbnN0IHVzZXJuYW1lOiBzdHJpbmcgPSBcIlJvYmVydFwiXG4gICAgY29uc3QgcGFzc3dvcmQ6IHN0cmluZyA9IFwiUGF1bHNvblwiXG4gICAgY29uc3QgdHhJRDogc3RyaW5nID0gXCJ2YWxpZFwiXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhcGkuZXhwb3J0KFxuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIHRvLFxuICAgICAgYW1vdW50LFxuICAgICAgYXNzZXRJRFxuICAgIClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgdHhJRDogdHhJRFxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUodHhJRClcbiAgfSlcblxuICB0ZXN0KFwiaW1wb3J0XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCB0bzogc3RyaW5nID0gXCJhYmNkZWZcIlxuICAgIGNvbnN0IHVzZXJuYW1lOiBzdHJpbmcgPSBcIlJvYmVydFwiXG4gICAgY29uc3QgcGFzc3dvcmQ6IHN0cmluZyA9IFwiUGF1bHNvblwiXG4gICAgY29uc3QgdHhJRDogc3RyaW5nID0gXCJ2YWxpZFwiXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhcGkuaW1wb3J0KFxuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIHRvLFxuICAgICAgYmxvY2tjaGFpbklEXG4gICAgKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICB0eElEOiB0eElEXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSh0eElEKVxuICB9KVxuXG4gIHRlc3QoXCJjcmVhdGVBZGRyZXNzXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBhbGlhczogc3RyaW5nID0gXCJyYW5kb21hbGlhc1wiXG5cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5jcmVhdGVBZGRyZXNzKHVzZXJuYW1lLCBwYXNzd29yZClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgYWRkcmVzczogYWxpYXNcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWRcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKGFsaWFzKVxuICB9KVxuXG4gIHRlc3QoXCJjcmVhdGVGaXhlZENhcEFzc2V0XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBrcDogS2V5UGFpciA9IG5ldyBLZXlQYWlyKGF2YWxhbmNoZS5nZXRIUlAoKSwgYWxpYXMpXG4gICAga3AuaW1wb3J0S2V5KFxuICAgICAgQnVmZmVyLmZyb20oXG4gICAgICAgIFwiZWY5YmYyZDQ0MzY0OTFjMTUzOTY3Yzk3MDlkZDhlODI3OTViZGI5YjVhZDQ0ZWUyMmMyOTAzMDA1ZDFjZjY3NlwiLFxuICAgICAgICBcImhleFwiXG4gICAgICApXG4gICAgKVxuXG4gICAgY29uc3QgZGVub21pbmF0aW9uOiBudW1iZXIgPSAwXG4gICAgY29uc3QgYXNzZXRJRDogc3RyaW5nID1cbiAgICAgIFwiOGE1ZDJkMzJlNjhiYzUwMDM2ZTRkMDg2MDQ0NjE3ZmU0YTBhMDI5NmIyNzQ5OTliYTU2OGVhOTJkYTQ2ZDUzM1wiXG4gICAgY29uc3QgaW5pdGlhbEhvbGRlcnM6IG9iamVjdFtdID0gW1xuICAgICAge1xuICAgICAgICBhZGRyZXNzOiBcIjdzaWszUHI2cjFGZUxydksxb1d3RUNCUzhpSjVWUHVTaFwiLFxuICAgICAgICBhbW91bnQ6IFwiMTAwMDBcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgYWRkcmVzczogXCI3c2lrM1ByNnIxRmVMcnZLMW9Xd0VDQlM4aUo1VlB1U2hcIixcbiAgICAgICAgYW1vdW50OiBcIjUwMDAwXCJcbiAgICAgIH1cbiAgICBdXG5cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5jcmVhdGVGaXhlZENhcEFzc2V0KFxuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIFwiU29tZSBDb2luXCIsXG4gICAgICBcIlNDQ1wiLFxuICAgICAgZGVub21pbmF0aW9uLFxuICAgICAgaW5pdGlhbEhvbGRlcnNcbiAgICApXG4gICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIGFzc2V0SUQ6IGFzc2V0SURcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWRcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKGFzc2V0SUQpXG4gIH0pXG5cbiAgdGVzdChcImNyZWF0ZVZhcmlhYmxlQ2FwQXNzZXRcIiwgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGtwOiBLZXlQYWlyID0gbmV3IEtleVBhaXIoYXZhbGFuY2hlLmdldEhSUCgpLCBhbGlhcylcbiAgICBrcC5pbXBvcnRLZXkoXG4gICAgICBCdWZmZXIuZnJvbShcbiAgICAgICAgXCJlZjliZjJkNDQzNjQ5MWMxNTM5NjdjOTcwOWRkOGU4Mjc5NWJkYjliNWFkNDRlZTIyYzI5MDMwMDVkMWNmNjc2XCIsXG4gICAgICAgIFwiaGV4XCJcbiAgICAgIClcbiAgICApXG5cbiAgICBjb25zdCBkZW5vbWluYXRpb246IG51bWJlciA9IDBcbiAgICBjb25zdCBhc3NldElEOiBzdHJpbmcgPVxuICAgICAgXCI4YTVkMmQzMmU2OGJjNTAwMzZlNGQwODYwNDQ2MTdmZTRhMGEwMjk2YjI3NDk5OWJhNTY4ZWE5MmRhNDZkNTMzXCJcbiAgICBjb25zdCBtaW50ZXJTZXRzOiBvYmplY3RbXSA9IFtcbiAgICAgIHtcbiAgICAgICAgbWludGVyczogW1wiNHBlSnNGdmhkbjdYamhORjRIV0FReTZZYUp0czI3czlxXCJdLFxuICAgICAgICB0aHJlc2hvbGQ6IDFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG1pbnRlcnM6IFtcbiAgICAgICAgICBcImRjSjZ6OWR1TGZ5UVRnYmpxMndCQ293a3ZjUFpIVkRGXCIsXG4gICAgICAgICAgXCIyZkU2aWlicWZFUno1d2VuWEU2cXl2aW5zeER2RmhIWmtcIixcbiAgICAgICAgICBcIjdpZUFKYmZyR1FicE5aUkFRRXBaQ0MxR3MxejVnejRIVVwiXG4gICAgICAgIF0sXG4gICAgICAgIHRocmVzaG9sZDogMlxuICAgICAgfVxuICAgIF1cblxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gYXBpLmNyZWF0ZVZhcmlhYmxlQ2FwQXNzZXQoXG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgXCJTb21lIENvaW5cIixcbiAgICAgIFwiU0NDXCIsXG4gICAgICBkZW5vbWluYXRpb24sXG4gICAgICBtaW50ZXJTZXRzXG4gICAgKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBhc3NldElEOiBhc3NldElEXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZShhc3NldElEKVxuICB9KVxuXG4gIHRlc3QoXCJtaW50IDFcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IHVzZXJuYW1lOiBzdHJpbmcgPSBcIkNvbGxpblwiXG4gICAgY29uc3QgcGFzc3dvcmQ6IHN0cmluZyA9IFwiQ3VzY2VcIlxuICAgIGNvbnN0IGFtb3VudDogbnVtYmVyID0gMlxuICAgIGNvbnN0IGFzc2V0SUQ6IHN0cmluZyA9XG4gICAgICBcImY5NjY3NTBmNDM4ODY3YzNjOTgyOGRkY2RiZTY2MGUyMWNjZGJiMzZhOTI3Njk1OGYwMTFiYTQ3MmY3NWQ0ZTdcIlxuICAgIGNvbnN0IHRvOiBzdHJpbmcgPSBcImRjSjZ6OWR1TGZ5UVRnYmpxMndCQ293a3ZjUFpIVkRGXCJcbiAgICBjb25zdCBtaW50ZXJzOiBzdHJpbmdbXSA9IFtcbiAgICAgIFwiZGNKNno5ZHVMZnlRVGdianEyd0JDb3drdmNQWkhWREZcIixcbiAgICAgIFwiMmZFNmlpYnFmRVJ6NXdlblhFNnF5dmluc3hEdkZoSFprXCIsXG4gICAgICBcIjdpZUFKYmZyR1FicE5aUkFRRXBaQ0MxR3MxejVnejRIVVwiXG4gICAgXVxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gYXBpLm1pbnQoXG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgYW1vdW50LFxuICAgICAgYXNzZXRJRCxcbiAgICAgIHRvLFxuICAgICAgbWludGVyc1xuICAgIClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgdHhJRDogXCJzb21ldHhcIlxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUoXCJzb21ldHhcIilcbiAgfSlcblxuICB0ZXN0KFwibWludCAyXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCB1c2VybmFtZTogc3RyaW5nID0gXCJDb2xsaW5cIlxuICAgIGNvbnN0IHBhc3N3b3JkOiBzdHJpbmcgPSBcIkN1c2NlXCJcbiAgICBjb25zdCBhbW91bnQ6IEJOID0gbmV3IEJOKDEpXG4gICAgY29uc3QgYXNzZXRJRDogQnVmZmVyID0gQnVmZmVyLmZyb20oXG4gICAgICBcImY5NjY3NTBmNDM4ODY3YzNjOTgyOGRkY2RiZTY2MGUyMWNjZGJiMzZhOTI3Njk1OGYwMTFiYTQ3MmY3NWQ0ZTdcIixcbiAgICAgIFwiaGV4XCJcbiAgICApXG4gICAgY29uc3QgdG86IHN0cmluZyA9IFwiZGNKNno5ZHVMZnlRVGdianEyd0JDb3drdmNQWkhWREZcIlxuICAgIGNvbnN0IG1pbnRlcnM6IHN0cmluZ1tdID0gW1xuICAgICAgXCJkY0o2ejlkdUxmeVFUZ2JqcTJ3QkNvd2t2Y1BaSFZERlwiLFxuICAgICAgXCIyZkU2aWlicWZFUno1d2VuWEU2cXl2aW5zeER2RmhIWmtcIixcbiAgICAgIFwiN2llQUpiZnJHUWJwTlpSQVFFcFpDQzFHczF6NWd6NEhVXCJcbiAgICBdXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhcGkubWludChcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBhbW91bnQsXG4gICAgICBhc3NldElELFxuICAgICAgdG8sXG4gICAgICBtaW50ZXJzXG4gICAgKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICB0eElEOiBcInNvbWV0eFwiXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZShcInNvbWV0eFwiKVxuICB9KVxuXG4gIHRlc3QoXCJnZXRUeFwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgdHhpZDogc3RyaW5nID1cbiAgICAgIFwiZjk2Njc1MGY0Mzg4NjdjM2M5ODI4ZGRjZGJlNjYwZTIxY2NkYmIzNmE5Mjc2OTU4ZjAxMWJhNDcyZjc1ZDRlN1wiXG5cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nIHwgb2JqZWN0PiA9IGFwaS5nZXRUeCh0eGlkKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICB0eDogXCJzb21ldHhcIlxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyB8IG9iamVjdCA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUoXCJzb21ldHhcIilcbiAgfSlcblxuICB0ZXN0KFwiZ2V0VHhTdGF0dXNcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IHR4aWQ6IHN0cmluZyA9XG4gICAgICBcImY5NjY3NTBmNDM4ODY3YzNjOTgyOGRkY2RiZTY2MGUyMWNjZGJiMzZhOTI3Njk1OGYwMTFiYTQ3MmY3NWQ0ZTdcIlxuXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhcGkuZ2V0VHhTdGF0dXModHhpZClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgc3RhdHVzOiBcImFjY2VwdGVkXCJcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWRcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKFwiYWNjZXB0ZWRcIilcbiAgfSlcblxuICB0ZXN0KFwiZ2V0QXNzZXREZXNjcmlwdGlvbiBhcyBzdHJpbmdcIiwgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGFzc2V0SUQ6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKFxuICAgICAgXCI4YTVkMmQzMmU2OGJjNTAwMzZlNGQwODYwNDQ2MTdmZTRhMGEwMjk2YjI3NDk5OWJhNTY4ZWE5MmRhNDZkNTMzXCIsXG4gICAgICBcImhleFwiXG4gICAgKVxuICAgIGNvbnN0IGFzc2V0aWRzdHI6IHN0cmluZyA9IGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRClcblxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxvYmplY3Q+ID0gYXBpLmdldEFzc2V0RGVzY3JpcHRpb24oYXNzZXRpZHN0cilcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgbmFtZTogXCJDb2xsaW4gQ29pblwiLFxuICAgICAgICBzeW1ib2w6IFwiQ0tDXCIsXG4gICAgICAgIGFzc2V0SUQ6IGFzc2V0aWRzdHIsXG4gICAgICAgIGRlbm9taW5hdGlvbjogXCIxMFwiXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogYW55ID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZS5uYW1lKS50b0JlKFwiQ29sbGluIENvaW5cIilcbiAgICBleHBlY3QocmVzcG9uc2Uuc3ltYm9sKS50b0JlKFwiQ0tDXCIpXG4gICAgZXhwZWN0KHJlc3BvbnNlLmFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoYXNzZXRJRC50b1N0cmluZyhcImhleFwiKSlcbiAgICBleHBlY3QocmVzcG9uc2UuZGVub21pbmF0aW9uKS50b0JlKDEwKVxuICB9KVxuXG4gIHRlc3QoXCJnZXRBc3NldERlc2NyaXB0aW9uIGFzIEJ1ZmZlclwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgYXNzZXRJRDogQnVmZmVyID0gQnVmZmVyLmZyb20oXG4gICAgICBcIjhhNWQyZDMyZTY4YmM1MDAzNmU0ZDA4NjA0NDYxN2ZlNGEwYTAyOTZiMjc0OTk5YmE1NjhlYTkyZGE0NmQ1MzNcIixcbiAgICAgIFwiaGV4XCJcbiAgICApXG4gICAgY29uc3QgYXNzZXRpZHN0cjogc3RyaW5nID0gYmludG9vbHMuY2I1OEVuY29kZShcbiAgICAgIEJ1ZmZlci5mcm9tKFxuICAgICAgICBcIjhhNWQyZDMyZTY4YmM1MDAzNmU0ZDA4NjA0NDYxN2ZlNGEwYTAyOTZiMjc0OTk5YmE1NjhlYTkyZGE0NmQ1MzNcIixcbiAgICAgICAgXCJoZXhcIlxuICAgICAgKVxuICAgIClcblxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxvYmplY3Q+ID0gYXBpLmdldEFzc2V0RGVzY3JpcHRpb24oYXNzZXRJRClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgbmFtZTogXCJDb2xsaW4gQ29pblwiLFxuICAgICAgICBzeW1ib2w6IFwiQ0tDXCIsXG4gICAgICAgIGFzc2V0SUQ6IGFzc2V0aWRzdHIsXG4gICAgICAgIGRlbm9taW5hdGlvbjogXCIxMVwiXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogYW55ID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZS5uYW1lKS50b0JlKFwiQ29sbGluIENvaW5cIilcbiAgICBleHBlY3QocmVzcG9uc2Uuc3ltYm9sKS50b0JlKFwiQ0tDXCIpXG4gICAgZXhwZWN0KHJlc3BvbnNlLmFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoYXNzZXRJRC50b1N0cmluZyhcImhleFwiKSlcbiAgICBleHBlY3QocmVzcG9uc2UuZGVub21pbmF0aW9uKS50b0JlKDExKVxuICB9KVxuXG4gIHRlc3QoXCJnZXRVVFhPc1wiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgLy8gUGF5bWVudFxuICAgIGNvbnN0IE9QVVRYT3N0cjE6IHN0cmluZyA9IGJpbnRvb2xzLmNiNThFbmNvZGUoXG4gICAgICBCdWZmZXIuZnJvbShcbiAgICAgICAgXCIwMDAwMzhkMWI5ZjExMzg2NzJkYTZmYjZjMzUxMjU1MzkyNzZhOWFjYzJhNjY4ZDYzYmVhNmJhM2M3OTVlMmVkYjBmNTAwMDAwMDAxM2UwN2UzOGUyZjIzMTIxYmU4NzU2NDEyYzE4ZGI3MjQ2YTE2ZDI2ZWU5OTM2ZjNjYmEyOGJlMTQ5Y2ZkMzU1ODAwMDAwMDA3MDAwMDAwMDAwMDAwNGRkNTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAxYTM2ZmQwYzJkYmNhYjMxMTczMWRkZTdlZjE1MTRiZDI2ZmNkYzc0ZFwiLFxuICAgICAgICBcImhleFwiXG4gICAgICApXG4gICAgKVxuICAgIGNvbnN0IE9QVVRYT3N0cjI6IHN0cmluZyA9IGJpbnRvb2xzLmNiNThFbmNvZGUoXG4gICAgICBCdWZmZXIuZnJvbShcbiAgICAgICAgXCIwMDAwYzNlNDgyMzU3MTU4N2ZlMmJkZmM1MDI2ODlmNWE4MjM4YjlkMGVhN2YzMjc3MTI0ZDE2YWY5ZGUwZDJkOTkxMTAwMDAwMDAwM2UwN2UzOGUyZjIzMTIxYmU4NzU2NDEyYzE4ZGI3MjQ2YTE2ZDI2ZWU5OTM2ZjNjYmEyOGJlMTQ5Y2ZkMzU1ODAwMDAwMDA3MDAwMDAwMDAwMDAwMDAxOTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAxZTFiNmI2YTRiYWQ5NGQyZTNmMjA3MzAzNzliOWJjZDZmMTc2MzE4ZVwiLFxuICAgICAgICBcImhleFwiXG4gICAgICApXG4gICAgKVxuICAgIGNvbnN0IE9QVVRYT3N0cjM6IHN0cmluZyA9IGJpbnRvb2xzLmNiNThFbmNvZGUoXG4gICAgICBCdWZmZXIuZnJvbShcbiAgICAgICAgXCIwMDAwZjI5ZGJhNjFmZGE4ZDU3YTkxMWU3Zjg4MTBmOTM1YmRlODEwZDNmOGQ0OTU0MDQ2ODViZGI4ZDlkODU0NWU4NjAwMDAwMDAwM2UwN2UzOGUyZjIzMTIxYmU4NzU2NDEyYzE4ZGI3MjQ2YTE2ZDI2ZWU5OTM2ZjNjYmEyOGJlMTQ5Y2ZkMzU1ODAwMDAwMDA3MDAwMDAwMDAwMDAwMDAxOTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAxZTFiNmI2YTRiYWQ5NGQyZTNmMjA3MzAzNzliOWJjZDZmMTc2MzE4ZVwiLFxuICAgICAgICBcImhleFwiXG4gICAgICApXG4gICAgKVxuXG4gICAgY29uc3Qgc2V0OiBVVFhPU2V0ID0gbmV3IFVUWE9TZXQoKVxuICAgIHNldC5hZGQoT1BVVFhPc3RyMSlcbiAgICBzZXQuYWRkQXJyYXkoW09QVVRYT3N0cjIsIE9QVVRYT3N0cjNdKVxuXG4gICAgY29uc3QgcGVyc2lzdE9wdHM6IFBlcnNpc3RhbmNlT3B0aW9ucyA9IG5ldyBQZXJzaXN0YW5jZU9wdGlvbnMoXG4gICAgICBcInRlc3RcIixcbiAgICAgIHRydWUsXG4gICAgICBcInVuaW9uXCJcbiAgICApXG4gICAgZXhwZWN0KHBlcnNpc3RPcHRzLmdldE1lcmdlUnVsZSgpKS50b0JlKFwidW5pb25cIilcbiAgICBsZXQgYWRkcmVzc2VzOiBzdHJpbmdbXSA9IHNldFxuICAgICAgLmdldEFkZHJlc3NlcygpXG4gICAgICAubWFwKChhKSA9PiBhcGkuYWRkcmVzc0Zyb21CdWZmZXIoYSkpXG4gICAgbGV0IHJlc3VsdDogUHJvbWlzZTx7XG4gICAgICBudW1GZXRjaGVkOiBudW1iZXJcbiAgICAgIHV0eG9zOiBVVFhPU2V0XG4gICAgICBlbmRJbmRleDogeyBhZGRyZXNzOiBzdHJpbmc7IHV0eG86IHN0cmluZyB9XG4gICAgfT4gPSBhcGkuZ2V0VVRYT3MoXG4gICAgICBhZGRyZXNzZXMsXG4gICAgICBhcGkuZ2V0QmxvY2tjaGFpbklEKCksXG4gICAgICAwLFxuICAgICAgdW5kZWZpbmVkLFxuICAgICAgcGVyc2lzdE9wdHNcbiAgICApXG4gICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIG51bUZldGNoZWQ6IDMsXG4gICAgICAgIHV0eG9zOiBbT1BVVFhPc3RyMSwgT1BVVFhPc3RyMiwgT1BVVFhPc3RyM10sXG4gICAgICAgIHN0b3BJbmRleDogeyBhZGRyZXNzOiBcImFcIiwgdXR4bzogXCJiXCIgfVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgbGV0IHJlc3BvbnNlOiBVVFhPU2V0ID0gKGF3YWl0IHJlc3VsdCkudXR4b3NcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlLmdldEFsbFVUWE9TdHJpbmdzKCkuc29ydCgpKSkudG9CZShcbiAgICAgIEpTT04uc3RyaW5naWZ5KHNldC5nZXRBbGxVVFhPU3RyaW5ncygpLnNvcnQoKSlcbiAgICApXG5cbiAgICBhZGRyZXNzZXMgPSBzZXQuZ2V0QWRkcmVzc2VzKCkubWFwKChhKSA9PiBhcGkuYWRkcmVzc0Zyb21CdWZmZXIoYSkpXG4gICAgcmVzdWx0ID0gYXBpLmdldFVUWE9zKFxuICAgICAgYWRkcmVzc2VzLFxuICAgICAgYXBpLmdldEJsb2NrY2hhaW5JRCgpLFxuICAgICAgMCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHBlcnNpc3RPcHRzXG4gICAgKVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICByZXNwb25zZSA9IChhd2FpdCByZXN1bHQpLnV0eG9zXG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygyKVxuICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShyZXNwb25zZS5nZXRBbGxVVFhPU3RyaW5ncygpLnNvcnQoKSkpLnRvQmUoXG4gICAgICBKU09OLnN0cmluZ2lmeShzZXQuZ2V0QWxsVVRYT1N0cmluZ3MoKS5zb3J0KCkpXG4gICAgKVxuICB9KVxuXG4gIGRlc2NyaWJlKFwiVHJhbnNhY3Rpb25zXCIsICgpOiB2b2lkID0+IHtcbiAgICBsZXQgc2V0OiBVVFhPU2V0XG4gICAgbGV0IGtleW1ncjI6IEtleUNoYWluXG4gICAgbGV0IGtleW1ncjM6IEtleUNoYWluXG4gICAgbGV0IGFkZHJzMTogc3RyaW5nW11cbiAgICBsZXQgYWRkcnMyOiBzdHJpbmdbXVxuICAgIGxldCBhZGRyczM6IHN0cmluZ1tdXG4gICAgbGV0IGFkZHJlc3NidWZmczogQnVmZmVyW10gPSBbXVxuICAgIGxldCBhZGRyZXNzZXM6IHN0cmluZ1tdID0gW11cbiAgICBsZXQgdXR4b3M6IFVUWE9bXVxuICAgIGxldCBpbnB1dHM6IFRyYW5zZmVyYWJsZUlucHV0W11cbiAgICBsZXQgb3V0cHV0czogVHJhbnNmZXJhYmxlT3V0cHV0W11cbiAgICBsZXQgb3BzOiBUcmFuc2ZlcmFibGVPcGVyYXRpb25bXVxuICAgIGxldCBhbW50OiBudW1iZXIgPSAxMDAwMFxuICAgIGNvbnN0IGFzc2V0SUQ6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKFxuICAgICAgY3JlYXRlSGFzaChcInNoYTI1NlwiKS51cGRhdGUoXCJtYXJ5IGhhZCBhIGxpdHRsZSBsYW1iXCIpLmRpZ2VzdCgpXG4gICAgKVxuICAgIGNvbnN0IE5GVGFzc2V0SUQ6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKFxuICAgICAgY3JlYXRlSGFzaChcInNoYTI1NlwiKVxuICAgICAgICAudXBkYXRlKFxuICAgICAgICAgIFwiSSBjYW4ndCBzdGFuZCBpdCwgSSBrbm93IHlvdSBwbGFubmVkIGl0LCBJJ21tYSBzZXQgc3RyYWlnaHQgdGhpcyBXYXRlcmdhdGUuXCJcbiAgICAgICAgKVxuICAgICAgICAuZGlnZXN0KClcbiAgICApXG4gICAgbGV0IHNlY3BiYXNlMTogU0VDUFRyYW5zZmVyT3V0cHV0XG4gICAgbGV0IHNlY3BiYXNlMjogU0VDUFRyYW5zZmVyT3V0cHV0XG4gICAgbGV0IHNlY3BiYXNlMzogU0VDUFRyYW5zZmVyT3V0cHV0XG4gICAgbGV0IGluaXRpYWxTdGF0ZTogSW5pdGlhbFN0YXRlc1xuICAgIGxldCBuZnRwYmFzZTE6IE5GVE1pbnRPdXRwdXRcbiAgICBsZXQgbmZ0cGJhc2UyOiBORlRNaW50T3V0cHV0XG4gICAgbGV0IG5mdHBiYXNlMzogTkZUTWludE91dHB1dFxuICAgIGxldCBuZnRJbml0aWFsU3RhdGU6IEluaXRpYWxTdGF0ZXNcbiAgICBsZXQgbmZ0dXR4b2lkczogc3RyaW5nW10gPSBbXVxuICAgIGxldCBmdW5ndXR4b2lkczogc3RyaW5nW10gPSBbXVxuICAgIGxldCBhdm06IEFWTUFQSVxuICAgIGNvbnN0IGZlZTogbnVtYmVyID0gMTBcbiAgICBjb25zdCBuYW1lOiBzdHJpbmcgPSBcIk1vcnR5Y29pbiBpcyB0aGUgZHVtYiBhcyBhIHNhY2sgb2YgaGFtbWVycy5cIlxuICAgIGNvbnN0IHN5bWJvbDogc3RyaW5nID0gXCJtb3JUXCJcbiAgICBjb25zdCBkZW5vbWluYXRpb246IG51bWJlciA9IDhcblxuICAgIGxldCBzZWNwTWludE91dDE6IFNFQ1BNaW50T3V0cHV0XG4gICAgbGV0IHNlY3BNaW50T3V0MjogU0VDUE1pbnRPdXRwdXRcbiAgICBsZXQgc2VjcE1pbnRUWElEOiBCdWZmZXJcbiAgICBsZXQgc2VjcE1pbnRVVFhPOiBVVFhPXG4gICAgbGV0IHNlY3BNaW50WGZlck91dDE6IFNFQ1BUcmFuc2Zlck91dHB1dFxuICAgIGxldCBzZWNwTWludFhmZXJPdXQyOiBTRUNQVHJhbnNmZXJPdXRwdXRcbiAgICBsZXQgc2VjcE1pbnRPcDogU0VDUE1pbnRPcGVyYXRpb25cblxuICAgIGxldCB4ZmVyc2VjcG1pbnRvcDogVHJhbnNmZXJhYmxlT3BlcmF0aW9uXG5cbiAgICBiZWZvcmVFYWNoKGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGF2bSA9IG5ldyBBVk1BUEkoYXZhbGFuY2hlLCBcIi9leHQvYmMvWFwiLCBibG9ja2NoYWluSUQpXG5cbiAgICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxCdWZmZXI+ID0gYXZtLmdldERKVFhBc3NldElEKHRydWUpXG4gICAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICAgIHJlc3VsdDoge1xuICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgc3ltYm9sLFxuICAgICAgICAgIGFzc2V0SUQ6IGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRCksXG4gICAgICAgICAgZGVub21pbmF0aW9uOiBkZW5vbWluYXRpb25cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcGF5bG9hZFxuICAgICAgfVxuXG4gICAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgICAgYXdhaXQgcmVzdWx0XG4gICAgICBzZXQgPSBuZXcgVVRYT1NldCgpXG4gICAgICBhdm0ubmV3S2V5Q2hhaW4oKVxuICAgICAga2V5bWdyMiA9IG5ldyBLZXlDaGFpbihhdmFsYW5jaGUuZ2V0SFJQKCksIGFsaWFzKVxuICAgICAga2V5bWdyMyA9IG5ldyBLZXlDaGFpbihhdmFsYW5jaGUuZ2V0SFJQKCksIGFsaWFzKVxuICAgICAgYWRkcnMxID0gW11cbiAgICAgIGFkZHJzMiA9IFtdXG4gICAgICBhZGRyczMgPSBbXVxuICAgICAgdXR4b3MgPSBbXVxuICAgICAgaW5wdXRzID0gW11cbiAgICAgIG91dHB1dHMgPSBbXVxuICAgICAgb3BzID0gW11cbiAgICAgIG5mdHV0eG9pZHMgPSBbXVxuICAgICAgZnVuZ3V0eG9pZHMgPSBbXVxuICAgICAgY29uc3QgcGxvYWQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygxMDI0KVxuICAgICAgcGxvYWQud3JpdGUoXG4gICAgICAgIFwiQWxsIHlvdSBUcmVra2llcyBhbmQgVFYgYWRkaWN0cywgRG9uJ3QgbWVhbiB0byBkaXNzIGRvbid0IG1lYW4gdG8gYnJpbmcgc3RhdGljLlwiLFxuICAgICAgICAwLFxuICAgICAgICAxMDI0LFxuICAgICAgICBcInV0ZjhcIlxuICAgICAgKVxuXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgIGFkZHJzMS5wdXNoKFxuICAgICAgICAgIGF2bS5hZGRyZXNzRnJvbUJ1ZmZlcihhdm0ua2V5Q2hhaW4oKS5tYWtlS2V5KCkuZ2V0QWRkcmVzcygpKVxuICAgICAgICApXG4gICAgICAgIGFkZHJzMi5wdXNoKGF2bS5hZGRyZXNzRnJvbUJ1ZmZlcihrZXltZ3IyLm1ha2VLZXkoKS5nZXRBZGRyZXNzKCkpKVxuICAgICAgICBhZGRyczMucHVzaChhdm0uYWRkcmVzc0Zyb21CdWZmZXIoa2V5bWdyMy5tYWtlS2V5KCkuZ2V0QWRkcmVzcygpKSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFtb3VudDogQk4gPSBPTkVESlRYLm11bChuZXcgQk4oYW1udCkpXG4gICAgICBhZGRyZXNzYnVmZnMgPSBhdm0ua2V5Q2hhaW4oKS5nZXRBZGRyZXNzZXMoKVxuICAgICAgYWRkcmVzc2VzID0gYWRkcmVzc2J1ZmZzLm1hcCgoYSkgPT4gYXZtLmFkZHJlc3NGcm9tQnVmZmVyKGEpKVxuICAgICAgY29uc3QgbG9ja3RpbWU6IEJOID0gbmV3IEJOKDU0MzIxKVxuICAgICAgY29uc3QgdGhyZXNob2xkOiBudW1iZXIgPSAzXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgIGxldCB0eGlkOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShcbiAgICAgICAgICBjcmVhdGVIYXNoKFwic2hhMjU2XCIpXG4gICAgICAgICAgICAudXBkYXRlKGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKG5ldyBCTihpKSwgMzIpKVxuICAgICAgICAgICAgLmRpZ2VzdCgpXG4gICAgICAgIClcbiAgICAgICAgbGV0IHR4aWR4OiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICAgICAgdHhpZHgud3JpdGVVSW50MzJCRShpLCAwKVxuXG4gICAgICAgIGNvbnN0IG91dDogU0VDUFRyYW5zZmVyT3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChcbiAgICAgICAgICBhbW91bnQsXG4gICAgICAgICAgYWRkcmVzc2J1ZmZzLFxuICAgICAgICAgIGxvY2t0aW1lLFxuICAgICAgICAgIHRocmVzaG9sZFxuICAgICAgICApXG4gICAgICAgIGNvbnN0IHhmZXJvdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoYXNzZXRJRCwgb3V0KVxuICAgICAgICBvdXRwdXRzLnB1c2goeGZlcm91dClcblxuICAgICAgICBjb25zdCB1OiBVVFhPID0gbmV3IFVUWE8oKVxuICAgICAgICB1LmZyb21CdWZmZXIoXG4gICAgICAgICAgQnVmZmVyLmNvbmNhdChbdS5nZXRDb2RlY0lEQnVmZmVyKCksIHR4aWQsIHR4aWR4LCB4ZmVyb3V0LnRvQnVmZmVyKCldKVxuICAgICAgICApXG4gICAgICAgIGZ1bmd1dHhvaWRzLnB1c2godS5nZXRVVFhPSUQoKSlcbiAgICAgICAgdXR4b3MucHVzaCh1KVxuXG4gICAgICAgIHR4aWQgPSB1LmdldFR4SUQoKVxuICAgICAgICB0eGlkeCA9IHUuZ2V0T3V0cHV0SWR4KClcbiAgICAgICAgY29uc3QgYXNzZXQgPSB1LmdldEFzc2V0SUQoKVxuXG4gICAgICAgIGNvbnN0IGlucHV0OiBTRUNQVHJhbnNmZXJJbnB1dCA9IG5ldyBTRUNQVHJhbnNmZXJJbnB1dChhbW91bnQpXG4gICAgICAgIGNvbnN0IHhmZXJpbnB1dDogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQoXG4gICAgICAgICAgdHhpZCxcbiAgICAgICAgICB0eGlkeCxcbiAgICAgICAgICBhc3NldCxcbiAgICAgICAgICBpbnB1dFxuICAgICAgICApXG4gICAgICAgIGlucHV0cy5wdXNoKHhmZXJpbnB1dClcblxuICAgICAgICBjb25zdCBub3V0OiBORlRUcmFuc2Zlck91dHB1dCA9IG5ldyBORlRUcmFuc2Zlck91dHB1dChcbiAgICAgICAgICAxMDAwICsgaSxcbiAgICAgICAgICBwbG9hZCxcbiAgICAgICAgICBhZGRyZXNzYnVmZnMsXG4gICAgICAgICAgbG9ja3RpbWUsXG4gICAgICAgICAgdGhyZXNob2xkXG4gICAgICAgIClcbiAgICAgICAgY29uc3Qgb3A6IE5GVFRyYW5zZmVyT3BlcmF0aW9uID0gbmV3IE5GVFRyYW5zZmVyT3BlcmF0aW9uKG5vdXQpXG4gICAgICAgIGNvbnN0IG5mdHR4aWQ6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKFxuICAgICAgICAgIGNyZWF0ZUhhc2goXCJzaGEyNTZcIilcbiAgICAgICAgICAgIC51cGRhdGUoYmludG9vbHMuZnJvbUJOVG9CdWZmZXIobmV3IEJOKDEwMDAgKyBpKSwgMzIpKVxuICAgICAgICAgICAgLmRpZ2VzdCgpXG4gICAgICAgIClcbiAgICAgICAgY29uc3QgbmZ0dXR4bzogVVRYTyA9IG5ldyBVVFhPKFxuICAgICAgICAgIEFWTUNvbnN0YW50cy5MQVRFU1RDT0RFQyxcbiAgICAgICAgICBuZnR0eGlkLFxuICAgICAgICAgIDEwMDAgKyBpLFxuICAgICAgICAgIE5GVGFzc2V0SUQsXG4gICAgICAgICAgbm91dFxuICAgICAgICApXG4gICAgICAgIG5mdHV0eG9pZHMucHVzaChuZnR1dHhvLmdldFVUWE9JRCgpKVxuICAgICAgICBjb25zdCB4ZmVyb3A6IFRyYW5zZmVyYWJsZU9wZXJhdGlvbiA9IG5ldyBUcmFuc2ZlcmFibGVPcGVyYXRpb24oXG4gICAgICAgICAgTkZUYXNzZXRJRCxcbiAgICAgICAgICBbbmZ0dXR4by5nZXRVVFhPSUQoKV0sXG4gICAgICAgICAgb3BcbiAgICAgICAgKVxuICAgICAgICBvcHMucHVzaCh4ZmVyb3ApXG4gICAgICAgIHV0eG9zLnB1c2gobmZ0dXR4bylcbiAgICAgIH1cbiAgICAgIHNldC5hZGRBcnJheSh1dHhvcylcblxuICAgICAgc2VjcGJhc2UxID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChcbiAgICAgICAgbmV3IEJOKDc3NyksXG4gICAgICAgIGFkZHJzMy5tYXAoKGEpID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpLFxuICAgICAgICBVbml4Tm93KCksXG4gICAgICAgIDFcbiAgICAgIClcbiAgICAgIHNlY3BiYXNlMiA9IG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQoXG4gICAgICAgIG5ldyBCTig4ODgpLFxuICAgICAgICBhZGRyczIubWFwKChhKSA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKSxcbiAgICAgICAgVW5peE5vdygpLFxuICAgICAgICAxXG4gICAgICApXG4gICAgICBzZWNwYmFzZTMgPSBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KFxuICAgICAgICBuZXcgQk4oOTk5KSxcbiAgICAgICAgYWRkcnMyLm1hcCgoYSkgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSksXG4gICAgICAgIFVuaXhOb3coKSxcbiAgICAgICAgMVxuICAgICAgKVxuICAgICAgaW5pdGlhbFN0YXRlID0gbmV3IEluaXRpYWxTdGF0ZXMoKVxuICAgICAgaW5pdGlhbFN0YXRlLmFkZE91dHB1dChzZWNwYmFzZTEsIEFWTUNvbnN0YW50cy5TRUNQRlhJRClcbiAgICAgIGluaXRpYWxTdGF0ZS5hZGRPdXRwdXQoc2VjcGJhc2UyLCBBVk1Db25zdGFudHMuU0VDUEZYSUQpXG4gICAgICBpbml0aWFsU3RhdGUuYWRkT3V0cHV0KHNlY3BiYXNlMywgQVZNQ29uc3RhbnRzLlNFQ1BGWElEKVxuXG4gICAgICBuZnRwYmFzZTEgPSBuZXcgTkZUTWludE91dHB1dChcbiAgICAgICAgMCxcbiAgICAgICAgYWRkcnMxLm1hcCgoYSkgPT4gYXBpLnBhcnNlQWRkcmVzcyhhKSksXG4gICAgICAgIGxvY2t0aW1lLFxuICAgICAgICAxXG4gICAgICApXG4gICAgICBuZnRwYmFzZTIgPSBuZXcgTkZUTWludE91dHB1dChcbiAgICAgICAgMSxcbiAgICAgICAgYWRkcnMyLm1hcCgoYSkgPT4gYXBpLnBhcnNlQWRkcmVzcyhhKSksXG4gICAgICAgIGxvY2t0aW1lLFxuICAgICAgICAxXG4gICAgICApXG4gICAgICBuZnRwYmFzZTMgPSBuZXcgTkZUTWludE91dHB1dChcbiAgICAgICAgMixcbiAgICAgICAgYWRkcnMzLm1hcCgoYSkgPT4gYXBpLnBhcnNlQWRkcmVzcyhhKSksXG4gICAgICAgIGxvY2t0aW1lLFxuICAgICAgICAxXG4gICAgICApXG4gICAgICBuZnRJbml0aWFsU3RhdGUgPSBuZXcgSW5pdGlhbFN0YXRlcygpXG4gICAgICBuZnRJbml0aWFsU3RhdGUuYWRkT3V0cHV0KG5mdHBiYXNlMSwgQVZNQ29uc3RhbnRzLk5GVEZYSUQpXG4gICAgICBuZnRJbml0aWFsU3RhdGUuYWRkT3V0cHV0KG5mdHBiYXNlMiwgQVZNQ29uc3RhbnRzLk5GVEZYSUQpXG4gICAgICBuZnRJbml0aWFsU3RhdGUuYWRkT3V0cHV0KG5mdHBiYXNlMywgQVZNQ29uc3RhbnRzLk5GVEZYSUQpXG5cbiAgICAgIHNlY3BNaW50T3V0MSA9IG5ldyBTRUNQTWludE91dHB1dChhZGRyZXNzYnVmZnMsIG5ldyBCTigwKSwgMSlcbiAgICAgIHNlY3BNaW50T3V0MiA9IG5ldyBTRUNQTWludE91dHB1dChhZGRyZXNzYnVmZnMsIG5ldyBCTigwKSwgMSlcbiAgICAgIHNlY3BNaW50VFhJRCA9IEJ1ZmZlci5mcm9tKFxuICAgICAgICBjcmVhdGVIYXNoKFwic2hhMjU2XCIpXG4gICAgICAgICAgLnVwZGF0ZShiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihuZXcgQk4oMTMzNyksIDMyKSlcbiAgICAgICAgICAuZGlnZXN0KClcbiAgICAgIClcbiAgICAgIHNlY3BNaW50VVRYTyA9IG5ldyBVVFhPKFxuICAgICAgICBBVk1Db25zdGFudHMuTEFURVNUQ09ERUMsXG4gICAgICAgIHNlY3BNaW50VFhJRCxcbiAgICAgICAgMCxcbiAgICAgICAgYXNzZXRJRCxcbiAgICAgICAgc2VjcE1pbnRPdXQxXG4gICAgICApXG4gICAgICBzZWNwTWludFhmZXJPdXQxID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChcbiAgICAgICAgbmV3IEJOKDEyMyksXG4gICAgICAgIGFkZHJzMy5tYXAoKGEpID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpLFxuICAgICAgICBVbml4Tm93KCksXG4gICAgICAgIDJcbiAgICAgIClcbiAgICAgIHNlY3BNaW50WGZlck91dDIgPSBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KFxuICAgICAgICBuZXcgQk4oNDU2KSxcbiAgICAgICAgW2F2bS5wYXJzZUFkZHJlc3MoYWRkcnMyWzBdKV0sXG4gICAgICAgIFVuaXhOb3coKSxcbiAgICAgICAgMVxuICAgICAgKVxuICAgICAgc2VjcE1pbnRPcCA9IG5ldyBTRUNQTWludE9wZXJhdGlvbihzZWNwTWludE91dDEsIHNlY3BNaW50WGZlck91dDEpXG5cbiAgICAgIHNldC5hZGQoc2VjcE1pbnRVVFhPKVxuXG4gICAgICB4ZmVyc2VjcG1pbnRvcCA9IG5ldyBUcmFuc2ZlcmFibGVPcGVyYXRpb24oXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIFtzZWNwTWludFVUWE8uZ2V0VVRYT0lEKCldLFxuICAgICAgICBzZWNwTWludE9wXG4gICAgICApXG4gICAgfSlcblxuICAgIHRlc3QoXCJnZXREZWZhdWx0TWludFR4RmVlXCIsICgpOiB2b2lkID0+IHtcbiAgICAgIGV4cGVjdChhdm0uZ2V0RGVmYXVsdE1pbnRUeEZlZSgpLnRvU3RyaW5nKCkpLnRvQmUoXCIxMDAwMDAwXCIpXG4gICAgfSlcblxuICAgIHRlc3QoXCJzaWduVHhcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgY29uc3QgdHh1MTogVW5zaWduZWRUeCA9IGF3YWl0IGF2bS5idWlsZEJhc2VUeChcbiAgICAgICAgc2V0LFxuICAgICAgICBuZXcgQk4oYW1udCksXG4gICAgICAgIGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRCksXG4gICAgICAgIGFkZHJzMyxcbiAgICAgICAgYWRkcnMxLFxuICAgICAgICBhZGRyczFcbiAgICAgIClcbiAgICAgIGNvbnN0IHR4dTI6IFVuc2lnbmVkVHggPSBzZXQuYnVpbGRCYXNlVHgoXG4gICAgICAgIG5ldHdvcmtJRCxcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLFxuICAgICAgICBuZXcgQk4oYW1udCksXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIGFkZHJzMy5tYXAoKGEpID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpLFxuICAgICAgICBhZGRyczEubWFwKChhKSA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKSxcbiAgICAgICAgYWRkcnMxLm1hcCgoYSkgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSksXG4gICAgICAgIGF2bS5nZXRUeEZlZSgpLFxuICAgICAgICBhc3NldElELFxuICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgIFVuaXhOb3coKSxcbiAgICAgICAgbmV3IEJOKDApLFxuICAgICAgICAxXG4gICAgICApXG5cbiAgICAgIGNvbnN0IHR4MTogVHggPSBhdm0uc2lnblR4KHR4dTEpXG4gICAgICBjb25zdCB0eDI6IFR4ID0gYXZtLnNpZ25UeCh0eHUyKVxuXG4gICAgICBleHBlY3QodHgyLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoXG4gICAgICAgIHR4MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICApXG4gICAgICBleHBlY3QodHgyLnRvU3RyaW5nKCkpLnRvQmUodHgxLnRvU3RyaW5nKCkpXG4gICAgfSlcblxuICAgIHRlc3QoXCJidWlsZEJhc2VUeDFcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgY29uc3QgdHh1MTogVW5zaWduZWRUeCA9IGF3YWl0IGF2bS5idWlsZEJhc2VUeChcbiAgICAgICAgc2V0LFxuICAgICAgICBuZXcgQk4oYW1udCksXG4gICAgICAgIGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRCksXG4gICAgICAgIGFkZHJzMyxcbiAgICAgICAgYWRkcnMxLFxuICAgICAgICBhZGRyczEsXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldENvbnRlbnQoKVxuICAgICAgKVxuICAgICAgY29uc3QgbWVtb2J1ZjogQnVmZmVyID0gQnVmZmVyLmZyb20oXCJoZWxsbyB3b3JsZFwiKVxuICAgICAgY29uc3QgdHh1MjogVW5zaWduZWRUeCA9IHNldC5idWlsZEJhc2VUeChcbiAgICAgICAgbmV0d29ya0lELFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKGJsb2NrY2hhaW5JRCksXG4gICAgICAgIG5ldyBCTihhbW50KSxcbiAgICAgICAgYXNzZXRJRCxcbiAgICAgICAgYWRkcnMzLm1hcCgoYSkgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSksXG4gICAgICAgIGFkZHJzMS5tYXAoKGEpID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpLFxuICAgICAgICBhZGRyczEubWFwKChhKSA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKSxcbiAgICAgICAgYXZtLmdldFR4RmVlKCksXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIG1lbW9idWYsXG4gICAgICAgIFVuaXhOb3coKSxcbiAgICAgICAgbmV3IEJOKDApLFxuICAgICAgICAxXG4gICAgICApXG4gICAgICBleHBlY3QodHh1Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKFxuICAgICAgICB0eHUxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIClcbiAgICAgIGV4cGVjdCh0eHUyLnRvU3RyaW5nKCkpLnRvQmUodHh1MS50b1N0cmluZygpKVxuXG4gICAgICBjb25zdCB0eDE6IFR4ID0gdHh1MS5zaWduKGF2bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgY2hlY2tUeDogc3RyaW5nID0gdHgxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MW9iajogb2JqZWN0ID0gdHgxLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgxc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDFvYmopXG4gICAgICBjb25zdCB0eDJuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgxc3RyKVxuICAgICAgY29uc3QgdHgyOiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDIuZGVzZXJpYWxpemUodHgybmV3b2JqLCBcImhleFwiKVxuXG4gICAgICBjb25zdCB0eDJvYmo6IG9iamVjdCA9IHR4Mi5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MnN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgyb2JqKVxuICAgICAgZXhwZWN0KHR4MW9iaikudG9TdHJpY3RFcXVhbCh0eDJvYmopXG4gICAgICBleHBlY3QodHgxc3RyKS50b1N0cmljdEVxdWFsKHR4MnN0cilcbiAgICAgIGV4cGVjdCh0eDIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuXG4gICAgICBjb25zdCB0eDM6IFR4ID0gdHh1MS5zaWduKGF2bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgdHgzb2JqOiBvYmplY3QgPSB0eDMuc2VyaWFsaXplKGRpc3BsYXkpXG4gICAgICBjb25zdCB0eDNzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4M29iailcbiAgICAgIGNvbnN0IHR4NG5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDNzdHIpXG4gICAgICBjb25zdCB0eDQ6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4NC5kZXNlcmlhbGl6ZSh0eDRuZXdvYmosIGRpc3BsYXkpXG5cbiAgICAgIGNvbnN0IHR4NG9iajogb2JqZWN0ID0gdHg0LnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHg0c3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDRvYmopXG4gICAgICBleHBlY3QodHgzb2JqKS50b1N0cmljdEVxdWFsKHR4NG9iailcbiAgICAgIGV4cGVjdCh0eDNzdHIpLnRvU3RyaWN0RXF1YWwodHg0c3RyKVxuICAgICAgZXhwZWN0KHR4NC50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG4gICAgfSlcblxuICAgIHRlc3QoXCJET01QdXJpZnlDbGVhbk9iamVjdFwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBjb25zdCB0eHUxOiBVbnNpZ25lZFR4ID0gYXdhaXQgYXZtLmJ1aWxkQmFzZVR4KFxuICAgICAgICBzZXQsXG4gICAgICAgIG5ldyBCTihhbW50KSxcbiAgICAgICAgYmludG9vbHMuY2I1OEVuY29kZShhc3NldElEKSxcbiAgICAgICAgYWRkcnMzLFxuICAgICAgICBhZGRyczEsXG4gICAgICAgIGFkZHJzMVxuICAgICAgKVxuXG4gICAgICBjb25zdCB0eDE6IFR4ID0gYXZtLnNpZ25UeCh0eHUxKVxuICAgICAgY29uc3QgdHgxb2JqOiBvYmplY3QgPSB0eDEuc2VyaWFsaXplKFwiaGV4XCIpXG4gICAgICBjb25zdCBzYW5pdGl6ZWQ6IG9iamVjdCA9IHR4MS5zYW5pdGl6ZU9iamVjdCh0eDFvYmopXG4gICAgICBleHBlY3QodHgxb2JqKS50b1N0cmljdEVxdWFsKHNhbml0aXplZClcbiAgICB9KVxuXG4gICAgdGVzdChcIkRPTVB1cmlmeURpcnR5T2JqZWN0XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGNvbnN0IGRpcnR5RG9tOiBzdHJpbmcgPSBcIjxpbWcgc3JjPXggb25lcnJvcj1hbGVydCgxKS8vPlwiXG4gICAgICBjb25zdCBzYW5pdGl6ZWRTdHJpbmc6IHN0cmluZyA9IGA8aW1nIHNyYz1cInhcIj5gXG5cbiAgICAgIGNvbnN0IHR4dTE6IFVuc2lnbmVkVHggPSBhd2FpdCBhdm0uYnVpbGRCYXNlVHgoXG4gICAgICAgIHNldCxcbiAgICAgICAgbmV3IEJOKGFtbnQpLFxuICAgICAgICBiaW50b29scy5jYjU4RW5jb2RlKGFzc2V0SUQpLFxuICAgICAgICBhZGRyczMsXG4gICAgICAgIGFkZHJzMSxcbiAgICAgICAgYWRkcnMxXG4gICAgICApXG5cbiAgICAgIGNvbnN0IHR4MTogVHggPSBhdm0uc2lnblR4KHR4dTEpXG4gICAgICBjb25zdCB0eDFvYmo6IG9iamVjdCA9IHR4MS5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IGRpcnR5T2JqOiBvYmplY3QgPSB7XG4gICAgICAgIC4uLnR4MW9iaixcbiAgICAgICAgZGlydHlEb206IGRpcnR5RG9tXG4gICAgICB9XG4gICAgICBjb25zdCBzYW5pdGl6ZWRPYmo6IGFueSA9IHR4MS5zYW5pdGl6ZU9iamVjdChkaXJ0eU9iailcbiAgICAgIGV4cGVjdChzYW5pdGl6ZWRTdHJpbmcpLnRvQmUoc2FuaXRpemVkT2JqLmRpcnR5RG9tKVxuICAgIH0pXG5cbiAgICB0ZXN0KFwiYnVpbGRCYXNlVHgyXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGNvbnN0IHR4dTE6IFVuc2lnbmVkVHggPSBhd2FpdCBhdm0uYnVpbGRCYXNlVHgoXG4gICAgICAgIHNldCxcbiAgICAgICAgbmV3IEJOKGFtbnQpLnN1YihuZXcgQk4oMTAwKSksXG4gICAgICAgIGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRCksXG4gICAgICAgIGFkZHJzMyxcbiAgICAgICAgYWRkcnMxLFxuICAgICAgICBhZGRyczIsXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpXG4gICAgICApXG4gICAgICBjb25zdCB0eHUyOiBVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkQmFzZVR4KFxuICAgICAgICBuZXR3b3JrSUQsXG4gICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoYmxvY2tjaGFpbklEKSxcbiAgICAgICAgbmV3IEJOKGFtbnQpLnN1YihuZXcgQk4oMTAwKSksXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIGFkZHJzMy5tYXAoKGEpOiBCdWZmZXIgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSksXG4gICAgICAgIGFkZHJzMS5tYXAoKGEpOiBCdWZmZXIgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSksXG4gICAgICAgIGFkZHJzMi5tYXAoKGEpOiBCdWZmZXIgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSksXG4gICAgICAgIGF2bS5nZXRUeEZlZSgpLFxuICAgICAgICBhc3NldElELFxuICAgICAgICBuZXcgVVRGOFBheWxvYWQoXCJoZWxsbyB3b3JsZFwiKS5nZXRQYXlsb2FkKCksXG4gICAgICAgIFVuaXhOb3coKSxcbiAgICAgICAgbmV3IEJOKDApLFxuICAgICAgICAxXG4gICAgICApXG5cbiAgICAgIGV4cGVjdCh0eHUyLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoXG4gICAgICAgIHR4dTEudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgKVxuICAgICAgZXhwZWN0KHR4dTIudG9TdHJpbmcoKSkudG9CZSh0eHUxLnRvU3RyaW5nKCkpXG5cbiAgICAgIGNvbnN0IG91dGllcyA9IHR4dTFcbiAgICAgICAgLmdldFRyYW5zYWN0aW9uKClcbiAgICAgICAgLmdldE91dHMoKVxuICAgICAgICAuc29ydChUcmFuc2ZlcmFibGVPdXRwdXQuY29tcGFyYXRvcigpKSBhcyBUcmFuc2ZlcmFibGVPdXRwdXRbXVxuXG4gICAgICBleHBlY3Qob3V0aWVzLmxlbmd0aCkudG9CZSgyKVxuICAgICAgY29uc3Qgb3V0YWRkcjAgPSBvdXRpZXNbMF1cbiAgICAgICAgLmdldE91dHB1dCgpXG4gICAgICAgIC5nZXRBZGRyZXNzZXMoKVxuICAgICAgICAubWFwKChhKSA9PiBhdm0uYWRkcmVzc0Zyb21CdWZmZXIoYSkpXG4gICAgICBjb25zdCBvdXRhZGRyMSA9IG91dGllc1sxXVxuICAgICAgICAuZ2V0T3V0cHV0KClcbiAgICAgICAgLmdldEFkZHJlc3NlcygpXG4gICAgICAgIC5tYXAoKGEpID0+IGF2bS5hZGRyZXNzRnJvbUJ1ZmZlcihhKSlcblxuICAgICAgY29uc3QgdGVzdGFkZHIyID0gSlNPTi5zdHJpbmdpZnkoYWRkcnMyLnNvcnQoKSlcbiAgICAgIGNvbnN0IHRlc3RhZGRyMyA9IEpTT04uc3RyaW5naWZ5KGFkZHJzMy5zb3J0KCkpXG5cbiAgICAgIGNvbnN0IHRlc3RvdXQwID0gSlNPTi5zdHJpbmdpZnkob3V0YWRkcjAuc29ydCgpKVxuICAgICAgY29uc3QgdGVzdG91dDEgPSBKU09OLnN0cmluZ2lmeShvdXRhZGRyMS5zb3J0KCkpXG4gICAgICBleHBlY3QoXG4gICAgICAgICh0ZXN0YWRkcjIgPT0gdGVzdG91dDAgJiYgdGVzdGFkZHIzID09IHRlc3RvdXQxKSB8fFxuICAgICAgICAgICh0ZXN0YWRkcjMgPT0gdGVzdG91dDAgJiYgdGVzdGFkZHIyID09IHRlc3RvdXQxKVxuICAgICAgKS50b0JlKHRydWUpXG5cbiAgICAgIGNvbnN0IHR4MTogVHggPSB0eHUxLnNpZ24oYXZtLmtleUNoYWluKCkpXG4gICAgICBjb25zdCBjaGVja1R4OiBzdHJpbmcgPSB0eDEudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgY29uc3QgdHgxb2JqOiBvYmplY3QgPSB0eDEuc2VyaWFsaXplKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDFzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4MW9iailcbiAgICAgIGNvbnN0IHR4Mm5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDFzdHIpXG4gICAgICBjb25zdCB0eDI6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4Mi5kZXNlcmlhbGl6ZSh0eDJuZXdvYmosIFwiaGV4XCIpXG5cbiAgICAgIGNvbnN0IHR4Mm9iajogb2JqZWN0ID0gdHgyLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgyc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDJvYmopXG4gICAgICBleHBlY3QodHgxb2JqKS50b1N0cmljdEVxdWFsKHR4Mm9iailcbiAgICAgIGV4cGVjdCh0eDFzdHIpLnRvU3RyaWN0RXF1YWwodHgyc3RyKVxuICAgICAgZXhwZWN0KHR4Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG5cbiAgICAgIGNvbnN0IHR4MzogVHggPSB0eHUxLnNpZ24oYXZtLmtleUNoYWluKCkpXG4gICAgICBjb25zdCB0eDNvYmo6IG9iamVjdCA9IHR4My5zZXJpYWxpemUoZGlzcGxheSlcbiAgICAgIGNvbnN0IHR4M3N0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgzb2JqKVxuICAgICAgY29uc3QgdHg0bmV3b2JqOiBvYmplY3QgPSBKU09OLnBhcnNlKHR4M3N0cilcbiAgICAgIGNvbnN0IHR4NDogVHggPSBuZXcgVHgoKVxuICAgICAgdHg0LmRlc2VyaWFsaXplKHR4NG5ld29iaiwgZGlzcGxheSlcblxuICAgICAgY29uc3QgdHg0b2JqOiBvYmplY3QgPSB0eDQuc2VyaWFsaXplKGRpc3BsYXkpXG4gICAgICBjb25zdCB0eDRzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4NG9iailcbiAgICAgIGV4cGVjdCh0eDNvYmopLnRvU3RyaWN0RXF1YWwodHg0b2JqKVxuICAgICAgZXhwZWN0KHR4M3N0cikudG9TdHJpY3RFcXVhbCh0eDRzdHIpXG4gICAgICBleHBlY3QodHg0LnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoY2hlY2tUeClcblxuICAgICAgc2VyaWFsemVpdCh0eDEsIFwiQmFzZVR4XCIpXG4gICAgfSlcblxuICAgIHRlc3QoXCJpc3N1ZVR4IFNlcmlhbGl6ZWRcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgY29uc3QgdHh1OiBVbnNpZ25lZFR4ID0gYXdhaXQgYXZtLmJ1aWxkQmFzZVR4KFxuICAgICAgICBzZXQsXG4gICAgICAgIG5ldyBCTihhbW50KSxcbiAgICAgICAgYmludG9vbHMuY2I1OEVuY29kZShhc3NldElEKSxcbiAgICAgICAgYWRkcnMzLFxuICAgICAgICBhZGRyczEsXG4gICAgICAgIGFkZHJzMVxuICAgICAgKVxuICAgICAgY29uc3QgdHggPSBhdm0uc2lnblR4KHR4dSlcbiAgICAgIGNvbnN0IHR4aWQ6IHN0cmluZyA9XG4gICAgICAgIFwiZjk2Njc1MGY0Mzg4NjdjM2M5ODI4ZGRjZGJlNjYwZTIxY2NkYmIzNmE5Mjc2OTU4ZjAxMWJhNDcyZjc1ZDRlN1wiXG5cbiAgICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gYXZtLmlzc3VlVHgodHgudG9TdHJpbmcoKSlcbiAgICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgICAgcmVzdWx0OiB7XG4gICAgICAgICAgdHhJRDogdHhpZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiBwYXlsb2FkXG4gICAgICB9XG4gICAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUodHhpZClcbiAgICB9KVxuXG4gICAgdGVzdChcImlzc3VlVHggQnVmZmVyXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGNvbnN0IHR4dTogVW5zaWduZWRUeCA9IGF3YWl0IGF2bS5idWlsZEJhc2VUeChcbiAgICAgICAgc2V0LFxuICAgICAgICBuZXcgQk4oYW1udCksXG4gICAgICAgIGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRCksXG4gICAgICAgIGFkZHJzMyxcbiAgICAgICAgYWRkcnMxLFxuICAgICAgICBhZGRyczFcbiAgICAgIClcbiAgICAgIGNvbnN0IHR4ID0gYXZtLnNpZ25UeCh0eHUpXG5cbiAgICAgIGNvbnN0IHR4aWQ6IHN0cmluZyA9XG4gICAgICAgIFwiZjk2Njc1MGY0Mzg4NjdjM2M5ODI4ZGRjZGJlNjYwZTIxY2NkYmIzNmE5Mjc2OTU4ZjAxMWJhNDcyZjc1ZDRlN1wiXG4gICAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGF2bS5pc3N1ZVR4KHR4LnRvQnVmZmVyKCkpXG4gICAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICAgIHJlc3VsdDoge1xuICAgICAgICAgIHR4SUQ6IHR4aWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcGF5bG9hZFxuICAgICAgfVxuXG4gICAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUodHhpZClcbiAgICB9KVxuICAgIHRlc3QoXCJpc3N1ZVR4IENsYXNzIFR4XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGNvbnN0IHR4dTogVW5zaWduZWRUeCA9IGF3YWl0IGF2bS5idWlsZEJhc2VUeChcbiAgICAgICAgc2V0LFxuICAgICAgICBuZXcgQk4oYW1udCksXG4gICAgICAgIGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRCksXG4gICAgICAgIGFkZHJzMyxcbiAgICAgICAgYWRkcnMxLFxuICAgICAgICBhZGRyczFcbiAgICAgIClcbiAgICAgIGNvbnN0IHR4ID0gYXZtLnNpZ25UeCh0eHUpXG5cbiAgICAgIGNvbnN0IHR4aWQ6IHN0cmluZyA9XG4gICAgICAgIFwiZjk2Njc1MGY0Mzg4NjdjM2M5ODI4ZGRjZGJlNjYwZTIxY2NkYmIzNmE5Mjc2OTU4ZjAxMWJhNDcyZjc1ZDRlN1wiXG5cbiAgICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gYXZtLmlzc3VlVHgodHgpXG4gICAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICAgIHJlc3VsdDoge1xuICAgICAgICAgIHR4SUQ6IHR4aWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcGF5bG9hZFxuICAgICAgfVxuXG4gICAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKHR4aWQpXG4gICAgfSlcblxuICAgIHRlc3QoXCJidWlsZENyZWF0ZUFzc2V0VHggLSBGaXhlZCBDYXBcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgYXZtLnNldENyZWF0aW9uVHhGZWUobmV3IEJOKGZlZSkpXG4gICAgICBjb25zdCB0eHUxOiBVbnNpZ25lZFR4ID0gYXdhaXQgYXZtLmJ1aWxkQ3JlYXRlQXNzZXRUeChcbiAgICAgICAgc2V0LFxuICAgICAgICBhZGRyczEsXG4gICAgICAgIGFkZHJzMixcbiAgICAgICAgaW5pdGlhbFN0YXRlLFxuICAgICAgICBuYW1lLFxuICAgICAgICBzeW1ib2wsXG4gICAgICAgIGRlbm9taW5hdGlvblxuICAgICAgKVxuXG4gICAgICBjb25zdCB0eHUyOiBVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkQ3JlYXRlQXNzZXRUeChcbiAgICAgICAgYXZhbGFuY2hlLmdldE5ldHdvcmtJRCgpLFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKGF2bS5nZXRCbG9ja2NoYWluSUQoKSksXG4gICAgICAgIGFkZHJzMS5tYXAoKGEpID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpLFxuICAgICAgICBhZGRyczIubWFwKChhKSA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKSxcbiAgICAgICAgaW5pdGlhbFN0YXRlLFxuICAgICAgICBuYW1lLFxuICAgICAgICBzeW1ib2wsXG4gICAgICAgIGRlbm9taW5hdGlvbixcbiAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICBDRU5USURKVFgsXG4gICAgICAgIGFzc2V0SURcbiAgICAgIClcblxuICAgICAgZXhwZWN0KHR4dTIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShcbiAgICAgICAgdHh1MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICApXG4gICAgICBleHBlY3QodHh1Mi50b1N0cmluZygpKS50b0JlKHR4dTEudG9TdHJpbmcoKSlcblxuICAgICAgY29uc3QgdHgxOiBUeCA9IHR4dTEuc2lnbihhdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IGNoZWNrVHg6IHN0cmluZyA9IHR4MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDFvYmo6IG9iamVjdCA9IHR4MS5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MXN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgxb2JqKVxuICAgICAgY29uc3QgdHgybmV3b2JqOiBvYmplY3QgPSBKU09OLnBhcnNlKHR4MXN0cilcbiAgICAgIGNvbnN0IHR4MjogVHggPSBuZXcgVHgoKVxuICAgICAgdHgyLmRlc2VyaWFsaXplKHR4Mm5ld29iaiwgXCJoZXhcIilcblxuICAgICAgY29uc3QgdHgyb2JqOiBvYmplY3QgPSB0eDIuc2VyaWFsaXplKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDJzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4Mm9iailcbiAgICAgIGV4cGVjdCh0eDFvYmopLnRvU3RyaWN0RXF1YWwodHgyb2JqKVxuICAgICAgZXhwZWN0KHR4MXN0cikudG9TdHJpY3RFcXVhbCh0eDJzdHIpXG4gICAgICBleHBlY3QodHgyLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoY2hlY2tUeClcblxuICAgICAgY29uc3QgdHgzOiBUeCA9IHR4dTEuc2lnbihhdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IHR4M29iajogb2JqZWN0ID0gdHgzLnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHgzc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDNvYmopXG4gICAgICBjb25zdCB0eDRuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgzc3RyKVxuICAgICAgY29uc3QgdHg0OiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDQuZGVzZXJpYWxpemUodHg0bmV3b2JqLCBkaXNwbGF5KVxuXG4gICAgICBjb25zdCB0eDRvYmo6IG9iamVjdCA9IHR4NC5zZXJpYWxpemUoZGlzcGxheSlcbiAgICAgIGNvbnN0IHR4NHN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHg0b2JqKVxuICAgICAgZXhwZWN0KHR4M29iaikudG9TdHJpY3RFcXVhbCh0eDRvYmopXG4gICAgICBleHBlY3QodHgzc3RyKS50b1N0cmljdEVxdWFsKHR4NHN0cilcbiAgICAgIGV4cGVjdCh0eDQudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuICAgICAgc2VyaWFsemVpdCh0eDEsIFwiQ3JlYXRlQXNzZXRUeFwiKVxuICAgIH0pXG5cbiAgICB0ZXN0KFwiYnVpbGRDcmVhdGVBc3NldFR4IC0gVmFyaWFibGUgQ2FwXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGF2bS5zZXRDcmVhdGlvblR4RmVlKG5ldyBCTihEZWZhdWx0cy5uZXR3b3JrWzEyMzQ1XS5QW1wiY3JlYXRpb25UeEZlZVwiXSkpXG4gICAgICBjb25zdCBtaW50T3V0cHV0czogU0VDUE1pbnRPdXRwdXRbXSA9IFtzZWNwTWludE91dDEsIHNlY3BNaW50T3V0Ml1cbiAgICAgIGNvbnN0IHR4dTE6IFVuc2lnbmVkVHggPSBhd2FpdCBhdm0uYnVpbGRDcmVhdGVBc3NldFR4KFxuICAgICAgICBzZXQsXG4gICAgICAgIGFkZHJzMSxcbiAgICAgICAgYWRkcnMyLFxuICAgICAgICBpbml0aWFsU3RhdGUsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHN5bWJvbCxcbiAgICAgICAgZGVub21pbmF0aW9uLFxuICAgICAgICBtaW50T3V0cHV0c1xuICAgICAgKVxuXG4gICAgICBjb25zdCB0eHUyOiBVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkQ3JlYXRlQXNzZXRUeChcbiAgICAgICAgYXZhbGFuY2hlLmdldE5ldHdvcmtJRCgpLFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKGF2bS5nZXRCbG9ja2NoYWluSUQoKSksXG4gICAgICAgIGFkZHJzMS5tYXAoKGEpID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpLFxuICAgICAgICBhZGRyczIubWFwKChhKSA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKSxcbiAgICAgICAgaW5pdGlhbFN0YXRlLFxuICAgICAgICBuYW1lLFxuICAgICAgICBzeW1ib2wsXG4gICAgICAgIGRlbm9taW5hdGlvbixcbiAgICAgICAgbWludE91dHB1dHMsXG4gICAgICAgIGF2bS5nZXRDcmVhdGlvblR4RmVlKCksXG4gICAgICAgIGFzc2V0SURcbiAgICAgIClcblxuICAgICAgZXhwZWN0KHR4dTIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShcbiAgICAgICAgdHh1MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICApXG4gICAgICBleHBlY3QodHh1Mi50b1N0cmluZygpKS50b0JlKHR4dTEudG9TdHJpbmcoKSlcblxuICAgICAgY29uc3QgdHgxOiBUeCA9IHR4dTEuc2lnbihhdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IGNoZWNrVHg6IHN0cmluZyA9IHR4MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDFvYmo6IG9iamVjdCA9IHR4MS5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MXN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgxb2JqKVxuICAgICAgY29uc3QgdHgybmV3b2JqOiBvYmplY3QgPSBKU09OLnBhcnNlKHR4MXN0cilcbiAgICAgIGNvbnN0IHR4MjogVHggPSBuZXcgVHgoKVxuICAgICAgdHgyLmRlc2VyaWFsaXplKHR4Mm5ld29iaiwgXCJoZXhcIilcblxuICAgICAgY29uc3QgdHgyb2JqOiBvYmplY3QgPSB0eDIuc2VyaWFsaXplKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDJzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4Mm9iailcbiAgICAgIGV4cGVjdCh0eDFvYmopLnRvU3RyaWN0RXF1YWwodHgyb2JqKVxuICAgICAgZXhwZWN0KHR4MXN0cikudG9TdHJpY3RFcXVhbCh0eDJzdHIpXG4gICAgICBleHBlY3QodHgyLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoY2hlY2tUeClcblxuICAgICAgY29uc3QgdHgzOiBUeCA9IHR4dTEuc2lnbihhdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IHR4M29iajogb2JqZWN0ID0gdHgzLnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHgzc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDNvYmopXG4gICAgICBjb25zdCB0eDRuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgzc3RyKVxuICAgICAgY29uc3QgdHg0OiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDQuZGVzZXJpYWxpemUodHg0bmV3b2JqLCBkaXNwbGF5KVxuXG4gICAgICBjb25zdCB0eDRvYmo6IG9iamVjdCA9IHR4NC5zZXJpYWxpemUoZGlzcGxheSlcbiAgICAgIGNvbnN0IHR4NHN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHg0b2JqKVxuICAgICAgZXhwZWN0KHR4M29iaikudG9TdHJpY3RFcXVhbCh0eDRvYmopXG4gICAgICBleHBlY3QodHgzc3RyKS50b1N0cmljdEVxdWFsKHR4NHN0cilcbiAgICAgIGV4cGVjdCh0eDQudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuICAgIH0pXG5cbiAgICB0ZXN0KFwiYnVpbGRTRUNQTWludFR4XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGF2bS5zZXRUeEZlZShuZXcgQk4oZmVlKSlcbiAgICAgIGNvbnN0IG5ld01pbnRlcjogU0VDUE1pbnRPdXRwdXQgPSBuZXcgU0VDUE1pbnRPdXRwdXQoXG4gICAgICAgIGFkZHJzMy5tYXAoKGEpID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpLFxuICAgICAgICBuZXcgQk4oMCksXG4gICAgICAgIDFcbiAgICAgIClcbiAgICAgIGNvbnN0IHR4dTE6IFVuc2lnbmVkVHggPSBhd2FpdCBhdm0uYnVpbGRTRUNQTWludFR4KFxuICAgICAgICBzZXQsXG4gICAgICAgIG5ld01pbnRlcixcbiAgICAgICAgc2VjcE1pbnRYZmVyT3V0MSxcbiAgICAgICAgYWRkcnMxLFxuICAgICAgICBhZGRyczIsXG4gICAgICAgIHNlY3BNaW50VVRYTy5nZXRVVFhPSUQoKVxuICAgICAgKVxuXG4gICAgICBjb25zdCB0eHUyOiBVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkU0VDUE1pbnRUeChcbiAgICAgICAgYXZhbGFuY2hlLmdldE5ldHdvcmtJRCgpLFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKGF2bS5nZXRCbG9ja2NoYWluSUQoKSksXG4gICAgICAgIG5ld01pbnRlcixcbiAgICAgICAgc2VjcE1pbnRYZmVyT3V0MSxcbiAgICAgICAgYWRkcnMxLm1hcCgoYSkgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSksXG4gICAgICAgIGFkZHJzMi5tYXAoKGEpID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpLFxuICAgICAgICBzZWNwTWludFVUWE8uZ2V0VVRYT0lEKCksXG4gICAgICAgIE1JTExJREpUWCxcbiAgICAgICAgYXNzZXRJRFxuICAgICAgKVxuXG4gICAgICBleHBlY3QodHh1Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKFxuICAgICAgICB0eHUxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIClcbiAgICAgIGV4cGVjdCh0eHUyLnRvU3RyaW5nKCkpLnRvQmUodHh1MS50b1N0cmluZygpKVxuXG4gICAgICBjb25zdCB0eDE6IFR4ID0gdHh1MS5zaWduKGF2bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgY2hlY2tUeDogc3RyaW5nID0gdHgxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MW9iajogb2JqZWN0ID0gdHgxLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgxc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDFvYmopXG4gICAgICBjb25zdCB0eDJuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgxc3RyKVxuICAgICAgY29uc3QgdHgyOiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDIuZGVzZXJpYWxpemUodHgybmV3b2JqLCBcImhleFwiKVxuXG4gICAgICBjb25zdCB0eDJvYmo6IG9iamVjdCA9IHR4Mi5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MnN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgyb2JqKVxuICAgICAgZXhwZWN0KHR4MW9iaikudG9TdHJpY3RFcXVhbCh0eDJvYmopXG4gICAgICBleHBlY3QodHgxc3RyKS50b1N0cmljdEVxdWFsKHR4MnN0cilcbiAgICAgIGV4cGVjdCh0eDIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuXG4gICAgICBjb25zdCB0eDM6IFR4ID0gdHh1MS5zaWduKGF2bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgdHgzb2JqOiBvYmplY3QgPSB0eDMuc2VyaWFsaXplKGRpc3BsYXkpXG4gICAgICBjb25zdCB0eDNzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4M29iailcbiAgICAgIGNvbnN0IHR4NG5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDNzdHIpXG4gICAgICBjb25zdCB0eDQ6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4NC5kZXNlcmlhbGl6ZSh0eDRuZXdvYmosIGRpc3BsYXkpXG5cbiAgICAgIGNvbnN0IHR4NG9iajogb2JqZWN0ID0gdHg0LnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHg0c3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDRvYmopXG4gICAgICBleHBlY3QodHgzb2JqKS50b1N0cmljdEVxdWFsKHR4NG9iailcbiAgICAgIGV4cGVjdCh0eDNzdHIpLnRvU3RyaWN0RXF1YWwodHg0c3RyKVxuICAgICAgZXhwZWN0KHR4NC50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG4gICAgICBzZXJpYWx6ZWl0KHR4MSwgXCJTRUNQTWludFR4XCIpXG4gICAgfSlcblxuICAgIHRlc3QoXCJidWlsZENyZWF0ZU5GVEFzc2V0VHhcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgYXZtLnNldENyZWF0aW9uVHhGZWUobmV3IEJOKERlZmF1bHRzLm5ldHdvcmtbMTIzNDVdLlBbXCJjcmVhdGlvblR4RmVlXCJdKSlcbiAgICAgIGNvbnN0IG1pbnRlclNldHM6IE1pbnRlclNldFtdID0gW25ldyBNaW50ZXJTZXQoMSwgYWRkcnMxKV1cbiAgICAgIGNvbnN0IGxvY2t0aW1lOiBCTiA9IG5ldyBCTigwKVxuXG4gICAgICBjb25zdCB0eHUxOiBVbnNpZ25lZFR4ID0gYXdhaXQgYXZtLmJ1aWxkQ3JlYXRlTkZUQXNzZXRUeChcbiAgICAgICAgc2V0LFxuICAgICAgICBhZGRyczEsXG4gICAgICAgIGFkZHJzMixcbiAgICAgICAgbWludGVyU2V0cyxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgc3ltYm9sLFxuICAgICAgICBuZXcgVVRGOFBheWxvYWQoXCJoZWxsbyB3b3JsZFwiKSxcbiAgICAgICAgVW5peE5vdygpLFxuICAgICAgICBsb2NrdGltZVxuICAgICAgKVxuXG4gICAgICBjb25zdCB0eHUyOiBVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkQ3JlYXRlTkZUQXNzZXRUeChcbiAgICAgICAgYXZhbGFuY2hlLmdldE5ldHdvcmtJRCgpLFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKGF2bS5nZXRCbG9ja2NoYWluSUQoKSksXG4gICAgICAgIGFkZHJzMS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKSxcbiAgICAgICAgYWRkcnMyLm1hcCgoYTogc3RyaW5nKTogQnVmZmVyID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpLFxuICAgICAgICBtaW50ZXJTZXRzLFxuICAgICAgICBuYW1lLFxuICAgICAgICBzeW1ib2wsXG4gICAgICAgIGF2bS5nZXRDcmVhdGlvblR4RmVlKCksXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldFBheWxvYWQoKSxcbiAgICAgICAgVW5peE5vdygpLFxuICAgICAgICBsb2NrdGltZVxuICAgICAgKVxuXG4gICAgICBleHBlY3QodHh1Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKFxuICAgICAgICB0eHUxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIClcbiAgICAgIGV4cGVjdCh0eHUyLnRvU3RyaW5nKCkpLnRvQmUodHh1MS50b1N0cmluZygpKVxuXG4gICAgICBjb25zdCB0eDE6IFR4ID0gdHh1MS5zaWduKGF2bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgY2hlY2tUeDogc3RyaW5nID0gdHgxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MW9iajogb2JqZWN0ID0gdHgxLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgxc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDFvYmopXG4gICAgICBjb25zdCB0eDJuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgxc3RyKVxuICAgICAgY29uc3QgdHgyOiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDIuZGVzZXJpYWxpemUodHgybmV3b2JqLCBcImhleFwiKVxuXG4gICAgICBjb25zdCB0eDJvYmo6IG9iamVjdCA9IHR4Mi5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MnN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgyb2JqKVxuICAgICAgZXhwZWN0KHR4MW9iaikudG9TdHJpY3RFcXVhbCh0eDJvYmopXG4gICAgICBleHBlY3QodHgxc3RyKS50b1N0cmljdEVxdWFsKHR4MnN0cilcbiAgICAgIGV4cGVjdCh0eDIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuXG4gICAgICBjb25zdCB0eDM6IFR4ID0gdHh1MS5zaWduKGF2bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgdHgzb2JqOiBvYmplY3QgPSB0eDMuc2VyaWFsaXplKGRpc3BsYXkpXG4gICAgICBjb25zdCB0eDNzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4M29iailcbiAgICAgIGNvbnN0IHR4NG5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDNzdHIpXG4gICAgICBjb25zdCB0eDQ6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4NC5kZXNlcmlhbGl6ZSh0eDRuZXdvYmosIGRpc3BsYXkpXG5cbiAgICAgIGNvbnN0IHR4NG9iajogb2JqZWN0ID0gdHg0LnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHg0c3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDRvYmopXG4gICAgICBleHBlY3QodHgzb2JqKS50b1N0cmljdEVxdWFsKHR4NG9iailcbiAgICAgIGV4cGVjdCh0eDNzdHIpLnRvU3RyaWN0RXF1YWwodHg0c3RyKVxuICAgICAgZXhwZWN0KHR4NC50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG4gICAgICBzZXJpYWx6ZWl0KHR4MSwgXCJDcmVhdGVORlRBc3NldFR4XCIpXG4gICAgfSlcblxuICAgIHRlc3QoXCJidWlsZENyZWF0ZU5GVE1pbnRUeFwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBhdm0uc2V0VHhGZWUobmV3IEJOKGZlZSkpXG4gICAgICBjb25zdCBncm91cElEOiBudW1iZXIgPSAwXG4gICAgICBjb25zdCBsb2NrdGltZTogQk4gPSBuZXcgQk4oMClcbiAgICAgIGNvbnN0IHRocmVzaG9sZDogbnVtYmVyID0gMVxuICAgICAgY29uc3QgcGF5bG9hZDogQnVmZmVyID0gQnVmZmVyLmZyb20oXCJBdmFsYW5jaGVcIilcbiAgICAgIGNvbnN0IGFkZHJidWZmMTogQnVmZmVyW10gPSBhZGRyczEubWFwKFxuICAgICAgICAoYTogc3RyaW5nKTogQnVmZmVyID0+IGF2bS5wYXJzZUFkZHJlc3MoYSlcbiAgICAgIClcbiAgICAgIGNvbnN0IGFkZHJidWZmMjogQnVmZmVyW10gPSBhZGRyczIubWFwKFxuICAgICAgICAoYTogc3RyaW5nKTogQnVmZmVyID0+IGF2bS5wYXJzZUFkZHJlc3MoYSlcbiAgICAgIClcbiAgICAgIGNvbnN0IGFkZHJidWZmMzogQnVmZmVyW10gPSBhZGRyczMubWFwKFxuICAgICAgICAoYTogc3RyaW5nKTogQnVmZmVyID0+IGF2bS5wYXJzZUFkZHJlc3MoYSlcbiAgICAgIClcbiAgICAgIGNvbnN0IG91dHB1dE93bmVyczogT3V0cHV0T3duZXJzW10gPSBbXVxuICAgICAgY29uc3Qgb286IE91dHB1dE93bmVycyA9IG5ldyBPdXRwdXRPd25lcnMoYWRkcmJ1ZmYzLCBsb2NrdGltZSwgdGhyZXNob2xkKVxuICAgICAgb3V0cHV0T3duZXJzLnB1c2goKVxuXG4gICAgICBjb25zdCB0eHUxOiBVbnNpZ25lZFR4ID0gYXdhaXQgYXZtLmJ1aWxkQ3JlYXRlTkZUTWludFR4KFxuICAgICAgICBzZXQsXG4gICAgICAgIG9vLFxuICAgICAgICBhZGRyczEsXG4gICAgICAgIGFkZHJzMixcbiAgICAgICAgbmZ0dXR4b2lkcyxcbiAgICAgICAgZ3JvdXBJRCxcbiAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICBVbml4Tm93KClcbiAgICAgIClcblxuICAgICAgY29uc3QgdHh1MjogVW5zaWduZWRUeCA9IHNldC5idWlsZENyZWF0ZU5GVE1pbnRUeChcbiAgICAgICAgYXZhbGFuY2hlLmdldE5ldHdvcmtJRCgpLFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKGF2bS5nZXRCbG9ja2NoYWluSUQoKSksXG4gICAgICAgIFtvb10sXG4gICAgICAgIGFkZHJidWZmMSxcbiAgICAgICAgYWRkcmJ1ZmYyLFxuICAgICAgICBuZnR1dHhvaWRzLFxuICAgICAgICBncm91cElELFxuICAgICAgICBwYXlsb2FkLFxuICAgICAgICBhdm0uZ2V0VHhGZWUoKSxcbiAgICAgICAgYXNzZXRJRCxcbiAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICBVbml4Tm93KClcbiAgICAgIClcblxuICAgICAgZXhwZWN0KHR4dTIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShcbiAgICAgICAgdHh1MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICApXG4gICAgICBleHBlY3QodHh1Mi50b1N0cmluZygpKS50b0JlKHR4dTEudG9TdHJpbmcoKSlcblxuICAgICAgb3V0cHV0T3duZXJzLnB1c2gob28pXG4gICAgICBvdXRwdXRPd25lcnMucHVzaChuZXcgT3V0cHV0T3duZXJzKGFkZHJidWZmMywgbG9ja3RpbWUsIHRocmVzaG9sZCArIDEpKVxuXG4gICAgICBjb25zdCB0eHUzOiBVbnNpZ25lZFR4ID0gYXdhaXQgYXZtLmJ1aWxkQ3JlYXRlTkZUTWludFR4KFxuICAgICAgICBzZXQsXG4gICAgICAgIG91dHB1dE93bmVycyxcbiAgICAgICAgYWRkcnMxLFxuICAgICAgICBhZGRyczIsXG4gICAgICAgIG5mdHV0eG9pZHMsXG4gICAgICAgIGdyb3VwSUQsXG4gICAgICAgIHBheWxvYWQsXG4gICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgVW5peE5vdygpXG4gICAgICApXG5cbiAgICAgIGNvbnN0IHR4dTQ6IFVuc2lnbmVkVHggPSBzZXQuYnVpbGRDcmVhdGVORlRNaW50VHgoXG4gICAgICAgIGF2YWxhbmNoZS5nZXROZXR3b3JrSUQoKSxcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShhdm0uZ2V0QmxvY2tjaGFpbklEKCkpLFxuICAgICAgICBvdXRwdXRPd25lcnMsXG4gICAgICAgIGFkZHJidWZmMSxcbiAgICAgICAgYWRkcmJ1ZmYyLFxuICAgICAgICBuZnR1dHhvaWRzLFxuICAgICAgICBncm91cElELFxuICAgICAgICBwYXlsb2FkLFxuICAgICAgICBhdm0uZ2V0VHhGZWUoKSxcbiAgICAgICAgYXNzZXRJRCxcbiAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICBVbml4Tm93KClcbiAgICAgIClcblxuICAgICAgZXhwZWN0KHR4dTQudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShcbiAgICAgICAgdHh1My50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICApXG4gICAgICBleHBlY3QodHh1NC50b1N0cmluZygpKS50b0JlKHR4dTMudG9TdHJpbmcoKSlcblxuICAgICAgY29uc3QgdHgxOiBUeCA9IHR4dTEuc2lnbihhdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IGNoZWNrVHg6IHN0cmluZyA9IHR4MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDFvYmo6IG9iamVjdCA9IHR4MS5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MXN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgxb2JqKVxuICAgICAgY29uc3QgdHgybmV3b2JqOiBvYmplY3QgPSBKU09OLnBhcnNlKHR4MXN0cilcbiAgICAgIGNvbnN0IHR4MjogVHggPSBuZXcgVHgoKVxuICAgICAgdHgyLmRlc2VyaWFsaXplKHR4Mm5ld29iaiwgXCJoZXhcIilcblxuICAgICAgY29uc3QgdHgyb2JqOiBvYmplY3QgPSB0eDIuc2VyaWFsaXplKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDJzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4Mm9iailcbiAgICAgIGV4cGVjdCh0eDFvYmopLnRvU3RyaWN0RXF1YWwodHgyb2JqKVxuICAgICAgZXhwZWN0KHR4MXN0cikudG9TdHJpY3RFcXVhbCh0eDJzdHIpXG4gICAgICBleHBlY3QodHgyLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoY2hlY2tUeClcblxuICAgICAgY29uc3QgdHgzOiBUeCA9IHR4dTEuc2lnbihhdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IHR4M29iajogb2JqZWN0ID0gdHgzLnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHgzc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDNvYmopXG4gICAgICBjb25zdCB0eDRuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgzc3RyKVxuICAgICAgY29uc3QgdHg0OiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDQuZGVzZXJpYWxpemUodHg0bmV3b2JqLCBkaXNwbGF5KVxuXG4gICAgICBjb25zdCB0eDRvYmo6IG9iamVjdCA9IHR4NC5zZXJpYWxpemUoZGlzcGxheSlcbiAgICAgIGNvbnN0IHR4NHN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHg0b2JqKVxuICAgICAgZXhwZWN0KHR4M29iaikudG9TdHJpY3RFcXVhbCh0eDRvYmopXG4gICAgICBleHBlY3QodHgzc3RyKS50b1N0cmljdEVxdWFsKHR4NHN0cilcbiAgICAgIGV4cGVjdCh0eDQudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuICAgICAgc2VyaWFsemVpdCh0eDEsIFwiQ3JlYXRlTkZUTWludFR4XCIpXG4gICAgfSlcblxuICAgIHRlc3QoXCJidWlsZE5GVFRyYW5zZmVyVHhcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgYXZtLnNldFR4RmVlKG5ldyBCTihmZWUpKVxuICAgICAgY29uc3QgcGxvYWQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygxMDI0KVxuICAgICAgcGxvYWQud3JpdGUoXG4gICAgICAgIFwiQWxsIHlvdSBUcmVra2llcyBhbmQgVFYgYWRkaWN0cywgRG9uJ3QgbWVhbiB0byBkaXNzIGRvbid0IG1lYW4gdG8gYnJpbmcgc3RhdGljLlwiLFxuICAgICAgICAwLFxuICAgICAgICAxMDI0LFxuICAgICAgICBcInV0ZjhcIlxuICAgICAgKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYxID0gYWRkcnMxLm1hcCgoYTogc3RyaW5nKTogQnVmZmVyID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpXG4gICAgICBjb25zdCBhZGRyYnVmZjIgPSBhZGRyczIubWFwKChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IGFkZHJidWZmMyA9IGFkZHJzMy5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKVxuICAgICAgY29uc3QgdHh1MTogVW5zaWduZWRUeCA9IGF3YWl0IGF2bS5idWlsZE5GVFRyYW5zZmVyVHgoXG4gICAgICAgIHNldCxcbiAgICAgICAgYWRkcnMzLFxuICAgICAgICBhZGRyczEsXG4gICAgICAgIGFkZHJzMixcbiAgICAgICAgbmZ0dXR4b2lkc1sxXSxcbiAgICAgICAgbmV3IFVURjhQYXlsb2FkKFwiaGVsbG8gd29ybGRcIiksXG4gICAgICAgIFVuaXhOb3coKSxcbiAgICAgICAgbmV3IEJOKDApLFxuICAgICAgICAxXG4gICAgICApXG5cbiAgICAgIGNvbnN0IHR4dTI6IFVuc2lnbmVkVHggPSBzZXQuYnVpbGRORlRUcmFuc2ZlclR4KFxuICAgICAgICBuZXR3b3JrSUQsXG4gICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoYmxvY2tjaGFpbklEKSxcbiAgICAgICAgYWRkcmJ1ZmYzLFxuICAgICAgICBhZGRyYnVmZjEsXG4gICAgICAgIGFkZHJidWZmMixcbiAgICAgICAgW25mdHV0eG9pZHNbMV1dLFxuICAgICAgICBhdm0uZ2V0VHhGZWUoKSxcbiAgICAgICAgYXNzZXRJRCxcbiAgICAgICAgbmV3IFVURjhQYXlsb2FkKFwiaGVsbG8gd29ybGRcIikuZ2V0UGF5bG9hZCgpLFxuICAgICAgICBVbml4Tm93KCksXG4gICAgICAgIG5ldyBCTigwKSxcbiAgICAgICAgMVxuICAgICAgKVxuXG4gICAgICBleHBlY3QodHh1Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKFxuICAgICAgICB0eHUxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIClcbiAgICAgIGV4cGVjdCh0eHUyLnRvU3RyaW5nKCkpLnRvQmUodHh1MS50b1N0cmluZygpKVxuXG4gICAgICBjb25zdCB0eDE6IFR4ID0gdHh1MS5zaWduKGF2bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgY2hlY2tUeDogc3RyaW5nID0gdHgxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MW9iajogb2JqZWN0ID0gdHgxLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgxc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDFvYmopXG4gICAgICBjb25zdCB0eDJuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgxc3RyKVxuICAgICAgY29uc3QgdHgyOiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDIuZGVzZXJpYWxpemUodHgybmV3b2JqLCBcImhleFwiKVxuXG4gICAgICBjb25zdCB0eDJvYmo6IG9iamVjdCA9IHR4Mi5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MnN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgyb2JqKVxuICAgICAgZXhwZWN0KHR4MW9iaikudG9TdHJpY3RFcXVhbCh0eDJvYmopXG4gICAgICBleHBlY3QodHgxc3RyKS50b1N0cmljdEVxdWFsKHR4MnN0cilcbiAgICAgIGV4cGVjdCh0eDIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuXG4gICAgICBjb25zdCB0eDM6IFR4ID0gdHh1MS5zaWduKGF2bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgdHgzb2JqOiBvYmplY3QgPSB0eDMuc2VyaWFsaXplKGRpc3BsYXkpXG4gICAgICBjb25zdCB0eDNzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4M29iailcbiAgICAgIGNvbnN0IHR4NG5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDNzdHIpXG4gICAgICBjb25zdCB0eDQ6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4NC5kZXNlcmlhbGl6ZSh0eDRuZXdvYmosIGRpc3BsYXkpXG5cbiAgICAgIGNvbnN0IHR4NG9iajogb2JqZWN0ID0gdHg0LnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHg0c3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDRvYmopXG4gICAgICBleHBlY3QodHgzb2JqKS50b1N0cmljdEVxdWFsKHR4NG9iailcbiAgICAgIGV4cGVjdCh0eDNzdHIpLnRvU3RyaWN0RXF1YWwodHg0c3RyKVxuICAgICAgZXhwZWN0KHR4NC50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG4gICAgICBzZXJpYWx6ZWl0KHR4MSwgXCJORlRUcmFuc2ZlclR4XCIpXG4gICAgfSlcblxuICAgIHRlc3QoXCJidWlsZEltcG9ydFR4XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGNvbnN0IGxvY2t0aW1lOiBCTiA9IG5ldyBCTigwKVxuICAgICAgY29uc3QgdGhyZXNob2xkOiBudW1iZXIgPSAxXG4gICAgICBhdm0uc2V0VHhGZWUobmV3IEJOKGZlZSkpXG4gICAgICBjb25zdCBhZGRyYnVmZjEgPSBhZGRyczEubWFwKChhKSA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYyID0gYWRkcnMyLm1hcCgoYSkgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IGFkZHJidWZmMyA9IGFkZHJzMy5tYXAoKGEpID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpXG4gICAgICBjb25zdCBmdW5ndXR4bzogVVRYTyA9IHNldC5nZXRVVFhPKGZ1bmd1dHhvaWRzWzFdKVxuICAgICAgY29uc3QgZnVuZ3V0eG9zdHI6IHN0cmluZyA9IGZ1bmd1dHhvLnRvU3RyaW5nKClcblxuICAgICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPFVuc2lnbmVkVHg+ID0gYXZtLmJ1aWxkSW1wb3J0VHgoXG4gICAgICAgIHNldCxcbiAgICAgICAgYWRkcnMxLFxuICAgICAgICBQbGF0Zm9ybUNoYWluSUQsXG4gICAgICAgIGFkZHJzMyxcbiAgICAgICAgYWRkcnMxLFxuICAgICAgICBhZGRyczIsXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLFxuICAgICAgICBVbml4Tm93KCksXG4gICAgICAgIGxvY2t0aW1lLFxuICAgICAgICB0aHJlc2hvbGRcbiAgICAgIClcbiAgICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgICAgcmVzdWx0OiB7XG4gICAgICAgICAgdXR4b3M6IFtmdW5ndXR4b3N0cl1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcGF5bG9hZFxuICAgICAgfVxuXG4gICAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgICAgY29uc3QgdHh1MTogVW5zaWduZWRUeCA9IGF3YWl0IHJlc3VsdFxuXG4gICAgICBjb25zdCB0eHUyOiBVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkSW1wb3J0VHgoXG4gICAgICAgIG5ldHdvcmtJRCxcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLFxuICAgICAgICBhZGRyYnVmZjMsXG4gICAgICAgIGFkZHJidWZmMSxcbiAgICAgICAgYWRkcmJ1ZmYyLFxuICAgICAgICBbZnVuZ3V0eG9dLFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKFBsYXRmb3JtQ2hhaW5JRCksXG4gICAgICAgIGF2bS5nZXRUeEZlZSgpLFxuICAgICAgICBhd2FpdCBhdm0uZ2V0REpUWEFzc2V0SUQoKSxcbiAgICAgICAgbmV3IFVURjhQYXlsb2FkKFwiaGVsbG8gd29ybGRcIikuZ2V0UGF5bG9hZCgpLFxuICAgICAgICBVbml4Tm93KCksXG4gICAgICAgIGxvY2t0aW1lLFxuICAgICAgICB0aHJlc2hvbGRcbiAgICAgIClcblxuICAgICAgZXhwZWN0KHR4dTIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShcbiAgICAgICAgdHh1MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICApXG4gICAgICBleHBlY3QodHh1Mi50b1N0cmluZygpKS50b0JlKHR4dTEudG9TdHJpbmcoKSlcblxuICAgICAgY29uc3QgdHgxOiBUeCA9IHR4dTEuc2lnbihhdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IGNoZWNrVHg6IHN0cmluZyA9IHR4MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDFvYmo6IG9iamVjdCA9IHR4MS5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MXN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgxb2JqKVxuICAgICAgY29uc3QgdHgybmV3b2JqOiBvYmplY3QgPSBKU09OLnBhcnNlKHR4MXN0cilcbiAgICAgIGNvbnN0IHR4MjogVHggPSBuZXcgVHgoKVxuICAgICAgdHgyLmRlc2VyaWFsaXplKHR4Mm5ld29iaiwgXCJoZXhcIilcblxuICAgICAgY29uc3QgdHgyb2JqOiBvYmplY3QgPSB0eDIuc2VyaWFsaXplKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDJzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4Mm9iailcbiAgICAgIGV4cGVjdCh0eDFvYmopLnRvU3RyaWN0RXF1YWwodHgyb2JqKVxuICAgICAgZXhwZWN0KHR4MXN0cikudG9TdHJpY3RFcXVhbCh0eDJzdHIpXG4gICAgICBleHBlY3QodHgyLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoY2hlY2tUeClcblxuICAgICAgY29uc3QgdHgzOiBUeCA9IHR4dTEuc2lnbihhdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IHR4M29iajogb2JqZWN0ID0gdHgzLnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHgzc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDNvYmopXG4gICAgICBjb25zdCB0eDRuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgzc3RyKVxuICAgICAgY29uc3QgdHg0OiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDQuZGVzZXJpYWxpemUodHg0bmV3b2JqLCBkaXNwbGF5KVxuXG4gICAgICBjb25zdCB0eDRvYmo6IG9iamVjdCA9IHR4NC5zZXJpYWxpemUoZGlzcGxheSlcbiAgICAgIGNvbnN0IHR4NHN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHg0b2JqKVxuICAgICAgZXhwZWN0KHR4M29iaikudG9TdHJpY3RFcXVhbCh0eDRvYmopXG4gICAgICBleHBlY3QodHgzc3RyKS50b1N0cmljdEVxdWFsKHR4NHN0cilcbiAgICAgIGV4cGVjdCh0eDQudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuICAgICAgc2VyaWFsemVpdCh0eDEsIFwiSW1wb3J0VHhcIilcbiAgICB9KVxuXG4gICAgdGVzdChcImJ1aWxkRXhwb3J0VHhcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgYXZtLnNldFR4RmVlKG5ldyBCTihmZWUpKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYxOiBCdWZmZXJbXSA9IGFkZHJzMS5tYXAoXG4gICAgICAgIChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKVxuICAgICAgKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYyOiBCdWZmZXJbXSA9IGFkZHJzMi5tYXAoXG4gICAgICAgIChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKVxuICAgICAgKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYzOiBCdWZmZXJbXSA9IGFkZHJzMy5tYXAoXG4gICAgICAgIChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKVxuICAgICAgKVxuICAgICAgY29uc3QgYW1vdW50OiBCTiA9IG5ldyBCTig5MClcbiAgICAgIGNvbnN0IHR5cGU6IFNlcmlhbGl6ZWRUeXBlID0gXCJiZWNoMzJcIlxuICAgICAgY29uc3QgdHh1MTogVW5zaWduZWRUeCA9IGF3YWl0IGF2bS5idWlsZEV4cG9ydFR4KFxuICAgICAgICBzZXQsXG4gICAgICAgIGFtb3VudCxcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShQbGF0Zm9ybUNoYWluSUQpLFxuICAgICAgICBhZGRyYnVmZjMubWFwKChhOiBCdWZmZXIpOiBhbnkgPT5cbiAgICAgICAgICBzZXJpYWxpemF0aW9uLmJ1ZmZlclRvVHlwZShhLCB0eXBlLCBhdmFsYW5jaGUuZ2V0SFJQKCksIFwiUFwiKVxuICAgICAgICApLFxuICAgICAgICBhZGRyczEsXG4gICAgICAgIGFkZHJzMixcbiAgICAgICAgbmV3IFVURjhQYXlsb2FkKFwiaGVsbG8gd29ybGRcIiksXG4gICAgICAgIFVuaXhOb3coKVxuICAgICAgKVxuXG4gICAgICBjb25zdCB0eHUyOiBVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkRXhwb3J0VHgoXG4gICAgICAgIG5ldHdvcmtJRCxcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLFxuICAgICAgICBhbW91bnQsXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIGFkZHJidWZmMyxcbiAgICAgICAgYWRkcmJ1ZmYxLFxuICAgICAgICBhZGRyYnVmZjIsXG4gICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoUGxhdGZvcm1DaGFpbklEKSxcbiAgICAgICAgYXZtLmdldFR4RmVlKCksXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldFBheWxvYWQoKSxcbiAgICAgICAgVW5peE5vdygpXG4gICAgICApXG5cbiAgICAgIGV4cGVjdCh0eHUyLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoXG4gICAgICAgIHR4dTEudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgKVxuICAgICAgZXhwZWN0KHR4dTIudG9TdHJpbmcoKSkudG9CZSh0eHUxLnRvU3RyaW5nKCkpXG5cbiAgICAgIGNvbnN0IHR4dTM6IFVuc2lnbmVkVHggPSBhd2FpdCBhdm0uYnVpbGRFeHBvcnRUeChcbiAgICAgICAgc2V0LFxuICAgICAgICBhbW91bnQsXG4gICAgICAgIFBsYXRmb3JtQ2hhaW5JRCxcbiAgICAgICAgYWRkcnMzLFxuICAgICAgICBhZGRyczEsXG4gICAgICAgIGFkZHJzMixcbiAgICAgICAgbmV3IFVURjhQYXlsb2FkKFwiaGVsbG8gd29ybGRcIiksXG4gICAgICAgIFVuaXhOb3coKVxuICAgICAgKVxuXG4gICAgICBjb25zdCB0eHU0OiBVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkRXhwb3J0VHgoXG4gICAgICAgIG5ldHdvcmtJRCxcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLFxuICAgICAgICBhbW91bnQsXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIGFkZHJidWZmMyxcbiAgICAgICAgYWRkcmJ1ZmYxLFxuICAgICAgICBhZGRyYnVmZjIsXG4gICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgYXZtLmdldFR4RmVlKCksXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldFBheWxvYWQoKSxcbiAgICAgICAgVW5peE5vdygpXG4gICAgICApXG5cbiAgICAgIGV4cGVjdCh0eHU0LnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoXG4gICAgICAgIHR4dTMudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgKVxuICAgICAgZXhwZWN0KHR4dTQudG9TdHJpbmcoKSkudG9CZSh0eHUzLnRvU3RyaW5nKCkpXG5cbiAgICAgIGNvbnN0IHR4MTogVHggPSB0eHUxLnNpZ24oYXZtLmtleUNoYWluKCkpXG4gICAgICBjb25zdCBjaGVja1R4OiBzdHJpbmcgPSB0eDEudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgY29uc3QgdHgxb2JqOiBvYmplY3QgPSB0eDEuc2VyaWFsaXplKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDFzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4MW9iailcbiAgICAgIGNvbnN0IHR4Mm5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDFzdHIpXG4gICAgICBjb25zdCB0eDI6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4Mi5kZXNlcmlhbGl6ZSh0eDJuZXdvYmosIFwiaGV4XCIpXG5cbiAgICAgIGNvbnN0IHR4Mm9iajogb2JqZWN0ID0gdHgyLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgyc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDJvYmopXG4gICAgICBleHBlY3QodHgxb2JqKS50b1N0cmljdEVxdWFsKHR4Mm9iailcbiAgICAgIGV4cGVjdCh0eDFzdHIpLnRvU3RyaWN0RXF1YWwodHgyc3RyKVxuICAgICAgZXhwZWN0KHR4Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG5cbiAgICAgIGNvbnN0IHR4MzogVHggPSB0eHUxLnNpZ24oYXZtLmtleUNoYWluKCkpXG4gICAgICBjb25zdCB0eDNvYmo6IG9iamVjdCA9IHR4My5zZXJpYWxpemUoZGlzcGxheSlcbiAgICAgIGNvbnN0IHR4M3N0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgzb2JqKVxuICAgICAgY29uc3QgdHg0bmV3b2JqOiBvYmplY3QgPSBKU09OLnBhcnNlKHR4M3N0cilcbiAgICAgIGNvbnN0IHR4NDogVHggPSBuZXcgVHgoKVxuICAgICAgdHg0LmRlc2VyaWFsaXplKHR4NG5ld29iaiwgZGlzcGxheSlcblxuICAgICAgY29uc3QgdHg0b2JqOiBvYmplY3QgPSB0eDQuc2VyaWFsaXplKGRpc3BsYXkpXG4gICAgICBjb25zdCB0eDRzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4NG9iailcbiAgICAgIGV4cGVjdCh0eDNvYmopLnRvU3RyaWN0RXF1YWwodHg0b2JqKVxuICAgICAgZXhwZWN0KHR4M3N0cikudG9TdHJpY3RFcXVhbCh0eDRzdHIpXG4gICAgICBleHBlY3QodHg0LnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoY2hlY2tUeClcbiAgICAgIHNlcmlhbHplaXQodHgxLCBcIkV4cG9ydFR4XCIpXG4gICAgfSlcblxuICAgIHRlc3QoXCJidWlsZEdlbmVzaXNcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgY29uc3QgZ2VuZXNpc0RhdGE6IG9iamVjdCA9IHtcbiAgICAgICAgZ2VuZXNpc0RhdGE6IHtcbiAgICAgICAgICBhc3NldEFsaWFzMToge1xuICAgICAgICAgICAgbmFtZTogXCJodW1hbiByZWFkYWJsZSBuYW1lXCIsXG4gICAgICAgICAgICBzeW1ib2w6IFwiQVZBTFwiLFxuICAgICAgICAgICAgaW5pdGlhbFN0YXRlOiB7XG4gICAgICAgICAgICAgIGZpeGVkQ2FwOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgYW1vdW50OiAxMDAwLFxuICAgICAgICAgICAgICAgICAgYWRkcmVzczogXCJBXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGFtb3VudDogNTAwMCxcbiAgICAgICAgICAgICAgICAgIGFkZHJlc3M6IFwiQlwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBhc3NldEFsaWFzQ2FuQmVBbnl0aGluZ1VuaXF1ZToge1xuICAgICAgICAgICAgbmFtZTogXCJodW1hbiByZWFkYWJsZSBuYW1lXCIsXG4gICAgICAgICAgICBzeW1ib2w6IFwiQVZBTFwiLFxuICAgICAgICAgICAgaW5pdGlhbFN0YXRlOiB7XG4gICAgICAgICAgICAgIHZhcmlhYmxlQ2FwOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgbWludGVyczogW1wiQVwiLCBcIkJcIl0sXG4gICAgICAgICAgICAgICAgICB0aHJlc2hvbGQ6IDFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIG1pbnRlcnM6IFtcIkFcIiwgXCJCXCIsIFwiQ1wiXSxcbiAgICAgICAgICAgICAgICAgIHRocmVzaG9sZDogMlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgYnl0ZXM6IHN0cmluZyA9XG4gICAgICAgIFwiMTExVE5XelV0SEtvU3Z4b2hqeWZFd0UyWDIyOFpER0JuZ1o0bWRNVVZNblZuanRuYXdXMWIxemJBaHp5QU0xdjZkN0VDTmo2RFhzVDdxRG1oU0VmM0RXZ1hSajdFQ3dCWDM2WlhGYzl0V1ZCMnFIVVJvVWZkRHZGc0JlU1JxYXRDbWo3NmVaUU1HWkRnQkZSTmlqUmhQTktVYXA3YkNlS3BIRHR1Q1pjNFlwUGtkNG1SODRkTEwyQUwxYjRLNDZlaXJXS01hRlZqQTVidFlTNERueVV4NWNMcEFxM2QzNWtFZE5kVTV6SDNyVFUxOFM0VHhZVjh2b01QY0xDVFozaDR6UnNNNWpXMWNVempXVnZLZzd1WVMyb1I5cVhSRmNneTFnd05URlpHc3R5U3V2U0Y3TVplWkY0elNkTmdDNHJiWTlIOTRSVmhxZThyVzdNWHFNU1pCNnZCVEIyQnBnRjZ0TkZlaG1ZeEVYd2phS1JyaW1YOTF1dHZaZTlZamdHYkRyOFhIc1hDblhYZzRaRENqYXBDeTRIbW1SVXRVb0FkdUdOQmRHVk1pd0U5V3ZWYnBNRkZjTmZnRFhHejlOaWF0Z1Nua3hRQUxUSHZHWFhtOGJuNENvTEZ6S25BdHEzS3dpV3FIbVYzR2pGWWVVbTNtOFplZTlWRGZaQXZEc2hhNTFhY3hmdG8xaHRzdHhZdTY2RFdwVDM2WVQxOFdTYnhpYlpjS1hhN2dacnJzQ3d5emlkOENDV3c3OURiYUxDVWlxOXU0N1Zxb2ZHMWtneHd1dXlIYjhOVm5UZ1JUa1FBU1NiajIzMmZ5RzdZZVg0bUF2Wlk3YTdLN3lmU3l6SmFYZFVkUjdhTGVDZExQNm1iRkRxVU1yTjZZRWtVMlg4ZDRDazNUXCJcbiAgICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gYXBpLmJ1aWxkR2VuZXNpcyhnZW5lc2lzRGF0YSlcbiAgICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgICAgcmVzdWx0OiB7XG4gICAgICAgICAgYnl0ZXM6IGJ5dGVzXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlc3BvbnNlT2JqOiB7XG4gICAgICAgIGRhdGE6IG9iamVjdFxuICAgICAgfSA9IHtcbiAgICAgICAgZGF0YTogcGF5bG9hZFxuICAgICAgfVxuXG4gICAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKGJ5dGVzKVxuICAgIH0pXG4gIH0pXG59KVxuIl19