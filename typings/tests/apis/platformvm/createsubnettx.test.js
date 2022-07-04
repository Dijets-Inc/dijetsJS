"use strict";
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
const bintools_1 = __importDefault(require("../../../src/utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer/");
const outputs_1 = require("../../../src/apis/platformvm/outputs");
const constants_1 = require("../../../src/apis/platformvm/constants");
const platformvm_1 = require("src/apis/platformvm");
describe("CreateSubnetTx", () => {
    /**
     * @ignore
     */
    const bintools = bintools_1.default.getInstance();
    const networkID = 1337;
    const pChainBlockchainID = "11111111111111111111111111111111LpoYY";
    const memoStr = "from snowflake to avalanche";
    const memo = buffer_1.Buffer.from(memoStr, "utf8");
    const bID = bintools.cb58Decode(pChainBlockchainID);
    const addys = [];
    const lt = new bn_js_1.default(0);
    const t = 1;
    const subnetOwners = new outputs_1.SECPOwnerOutput(addys, lt, t);
    const createSubnetTx = new platformvm_1.CreateSubnetTx(networkID, bID, [], [], memo, subnetOwners);
    console.log(createSubnetTx);
    test("getTypeID", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(createSubnetTx.getTypeID()).toBe(constants_1.PlatformVMConstants.CREATESUBNETTX);
    }));
    test("getSubnetOwners", () => __awaiter(void 0, void 0, void 0, function* () {
        const subnetOwners = createSubnetTx.getSubnetOwners();
        const threshold = 1;
        const l = subnetOwners.getLocktime();
        const lt = new bn_js_1.default(0);
        expect(l.toNumber()).toBe(lt.toNumber());
        expect(subnetOwners.getThreshold()).toBe(threshold);
        const outputID = subnetOwners.getOutputID();
        expect(outputID).toBe(constants_1.PlatformVMConstants.SECPOWNEROUTPUTID);
        const addresses = subnetOwners.getAddresses();
        const addrLen = 0;
        expect(addresses.length).toBe(addrLen);
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlc3VibmV0dHgudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3RzL2FwaXMvcGxhdGZvcm12bS9jcmVhdGVzdWJuZXR0eC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkVBQWtEO0FBQ2xELGtEQUFzQjtBQUN0QixvQ0FBZ0M7QUFDaEMsa0VBQXNFO0FBQ3RFLHNFQUE0RTtBQUM1RSxvREFBb0Q7QUFFcEQsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEdBQVMsRUFBRTtJQUNwQzs7T0FFRztJQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDakQsTUFBTSxTQUFTLEdBQVcsSUFBSSxDQUFBO0lBQzlCLE1BQU0sa0JBQWtCLEdBQVcsdUNBQXVDLENBQUE7SUFDMUUsTUFBTSxPQUFPLEdBQVcsNkJBQTZCLENBQUE7SUFDckQsTUFBTSxJQUFJLEdBQVcsZUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFDakQsTUFBTSxHQUFHLEdBQVcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0lBQzNELE1BQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQTtJQUMxQixNQUFNLEVBQUUsR0FBTyxJQUFJLGVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN4QixNQUFNLENBQUMsR0FBVyxDQUFDLENBQUE7SUFDbkIsTUFBTSxZQUFZLEdBQW9CLElBQUkseUJBQWUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ3ZFLE1BQU0sY0FBYyxHQUFHLElBQUksMkJBQWMsQ0FDdkMsU0FBUyxFQUNULEdBQUcsRUFDSCxFQUFFLEVBQ0YsRUFBRSxFQUNGLElBQUksRUFDSixZQUFZLENBQ2IsQ0FBQTtJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUE7SUFFM0IsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUF3QixFQUFFO1FBQzFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsK0JBQW1CLENBQUMsY0FBYyxDQUFDLENBQUE7SUFDN0UsQ0FBQyxDQUFBLENBQUMsQ0FBQTtJQUVGLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUF3QixFQUFFO1FBQ2hELE1BQU0sWUFBWSxHQUFvQixjQUFjLENBQUMsZUFBZSxFQUFFLENBQUE7UUFDdEUsTUFBTSxTQUFTLEdBQVcsQ0FBQyxDQUFBO1FBQzNCLE1BQU0sQ0FBQyxHQUFPLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUN4QyxNQUFNLEVBQUUsR0FBTyxJQUFJLGVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN4QixNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1FBQ3hDLE1BQU0sQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7UUFFbkQsTUFBTSxRQUFRLEdBQVcsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQ25ELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsK0JBQW1CLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtRQUU1RCxNQUFNLFNBQVMsR0FBYSxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUE7UUFDdkQsTUFBTSxPQUFPLEdBQVcsQ0FBQyxDQUFBO1FBQ3pCLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ3hDLENBQUMsQ0FBQSxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi4vLi4vLi4vc3JjL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCBCTiBmcm9tIFwiYm4uanNcIlxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IHsgU0VDUE93bmVyT3V0cHV0IH0gZnJvbSBcIi4uLy4uLy4uL3NyYy9hcGlzL3BsYXRmb3Jtdm0vb3V0cHV0c1wiXG5pbXBvcnQgeyBQbGF0Zm9ybVZNQ29uc3RhbnRzIH0gZnJvbSBcIi4uLy4uLy4uL3NyYy9hcGlzL3BsYXRmb3Jtdm0vY29uc3RhbnRzXCJcbmltcG9ydCB7IENyZWF0ZVN1Ym5ldFR4IH0gZnJvbSBcInNyYy9hcGlzL3BsYXRmb3Jtdm1cIlxuXG5kZXNjcmliZShcIkNyZWF0ZVN1Ym5ldFR4XCIsICgpOiB2b2lkID0+IHtcbiAgLyoqXG4gICAqIEBpZ25vcmVcbiAgICovXG4gIGNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbiAgY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSAxMzM3XG4gIGNvbnN0IHBDaGFpbkJsb2NrY2hhaW5JRDogc3RyaW5nID0gXCIxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMUxwb1lZXCJcbiAgY29uc3QgbWVtb1N0cjogc3RyaW5nID0gXCJmcm9tIHNub3dmbGFrZSB0byBhdmFsYW5jaGVcIlxuICBjb25zdCBtZW1vOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShtZW1vU3RyLCBcInV0ZjhcIilcbiAgY29uc3QgYklEOiBCdWZmZXIgPSBiaW50b29scy5jYjU4RGVjb2RlKHBDaGFpbkJsb2NrY2hhaW5JRClcbiAgY29uc3QgYWRkeXM6IEJ1ZmZlcltdID0gW11cbiAgY29uc3QgbHQ6IEJOID0gbmV3IEJOKDApXG4gIGNvbnN0IHQ6IG51bWJlciA9IDFcbiAgY29uc3Qgc3VibmV0T3duZXJzOiBTRUNQT3duZXJPdXRwdXQgPSBuZXcgU0VDUE93bmVyT3V0cHV0KGFkZHlzLCBsdCwgdClcbiAgY29uc3QgY3JlYXRlU3VibmV0VHggPSBuZXcgQ3JlYXRlU3VibmV0VHgoXG4gICAgbmV0d29ya0lELFxuICAgIGJJRCxcbiAgICBbXSxcbiAgICBbXSxcbiAgICBtZW1vLFxuICAgIHN1Ym5ldE93bmVyc1xuICApXG4gIGNvbnNvbGUubG9nKGNyZWF0ZVN1Ym5ldFR4KVxuXG4gIHRlc3QoXCJnZXRUeXBlSURcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGV4cGVjdChjcmVhdGVTdWJuZXRUeC5nZXRUeXBlSUQoKSkudG9CZShQbGF0Zm9ybVZNQ29uc3RhbnRzLkNSRUFURVNVQk5FVFRYKVxuICB9KVxuXG4gIHRlc3QoXCJnZXRTdWJuZXRPd25lcnNcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IHN1Ym5ldE93bmVyczogU0VDUE93bmVyT3V0cHV0ID0gY3JlYXRlU3VibmV0VHguZ2V0U3VibmV0T3duZXJzKClcbiAgICBjb25zdCB0aHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgICBjb25zdCBsOiBCTiA9IHN1Ym5ldE93bmVycy5nZXRMb2NrdGltZSgpXG4gICAgY29uc3QgbHQ6IEJOID0gbmV3IEJOKDApXG4gICAgZXhwZWN0KGwudG9OdW1iZXIoKSkudG9CZShsdC50b051bWJlcigpKVxuICAgIGV4cGVjdChzdWJuZXRPd25lcnMuZ2V0VGhyZXNob2xkKCkpLnRvQmUodGhyZXNob2xkKVxuXG4gICAgY29uc3Qgb3V0cHV0SUQ6IG51bWJlciA9IHN1Ym5ldE93bmVycy5nZXRPdXRwdXRJRCgpXG4gICAgZXhwZWN0KG91dHB1dElEKS50b0JlKFBsYXRmb3JtVk1Db25zdGFudHMuU0VDUE9XTkVST1VUUFVUSUQpXG5cbiAgICBjb25zdCBhZGRyZXNzZXM6IEJ1ZmZlcltdID0gc3VibmV0T3duZXJzLmdldEFkZHJlc3NlcygpXG4gICAgY29uc3QgYWRkckxlbjogbnVtYmVyID0gMFxuICAgIGV4cGVjdChhZGRyZXNzZXMubGVuZ3RoKS50b0JlKGFkZHJMZW4pXG4gIH0pXG59KVxuIl19