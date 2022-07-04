"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UTXOSet = exports.AssetAmountDestination = exports.UTXO = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-UTXOs
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const outputs_1 = require("./outputs");
const inputs_1 = require("./inputs");
const helperfunctions_1 = require("../../utils/helperfunctions");
const utxos_1 = require("../../common/utxos");
const constants_1 = require("./constants");
const tx_1 = require("./tx");
const exporttx_1 = require("../platformvm/exporttx");
const constants_2 = require("../../utils/constants");
const importtx_1 = require("../platformvm/importtx");
const basetx_1 = require("../platformvm/basetx");
const assetamount_1 = require("../../common/assetamount");
const validationtx_1 = require("./validationtx");
const createsubnettx_1 = require("./createsubnettx");
const serialization_1 = require("../../utils/serialization");
const errors_1 = require("../../utils/errors");
const _1 = require(".");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
/**
 * Class for representing a single UTXO.
 */
class UTXO extends utxos_1.StandardUTXO {
    constructor() {
        super(...arguments);
        this._typeName = "UTXO";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.output = (0, outputs_1.SelectOutputClass)(fields["output"]["_typeID"]);
        this.output.deserialize(fields["output"], encoding);
    }
    fromBuffer(bytes, offset = 0) {
        this.codecID = bintools.copyFrom(bytes, offset, offset + 2);
        offset += 2;
        this.txid = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        this.outputidx = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.assetID = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        const outputid = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.output = (0, outputs_1.SelectOutputClass)(outputid);
        return this.output.fromBuffer(bytes, offset);
    }
    /**
     * Takes a base-58 string containing a [[UTXO]], parses it, populates the class, and returns the length of the StandardUTXO in bytes.
     *
     * @param serialized A base-58 string containing a raw [[UTXO]]
     *
     * @returns The length of the raw [[UTXO]]
     *
     * @remarks
     * unlike most fromStrings, it expects the string to be serialized in cb58 format
     */
    fromString(serialized) {
        /* istanbul ignore next */
        return this.fromBuffer(bintools.cb58Decode(serialized));
    }
    /**
     * Returns a base-58 representation of the [[UTXO]].
     *
     * @remarks
     * unlike most toStrings, this returns in cb58 serialization format
     */
    toString() {
        /* istanbul ignore next */
        return bintools.cb58Encode(this.toBuffer());
    }
    clone() {
        const utxo = new UTXO();
        utxo.fromBuffer(this.toBuffer());
        return utxo;
    }
    create(codecID = constants_1.PlatformVMConstants.LATESTCODEC, txid = undefined, outputidx = undefined, assetID = undefined, output = undefined) {
        return new UTXO(codecID, txid, outputidx, assetID, output);
    }
}
exports.UTXO = UTXO;
class AssetAmountDestination extends assetamount_1.StandardAssetAmountDestination {
}
exports.AssetAmountDestination = AssetAmountDestination;
/**
 * Class representing a set of [[UTXO]]s.
 */
class UTXOSet extends utxos_1.StandardUTXOSet {
    constructor() {
        super(...arguments);
        this._typeName = "UTXOSet";
        this._typeID = undefined;
        this.getConsumableUXTO = (asOf = (0, helperfunctions_1.UnixNow)(), stakeable = false) => {
            return this.getAllUTXOs().filter((utxo) => {
                if (stakeable) {
                    // stakeable transactions can consume any UTXO.
                    return true;
                }
                const output = utxo.getOutput();
                if (!(output instanceof outputs_1.StakeableLockOut)) {
                    // non-stakeable transactions can consume any UTXO that isn't locked.
                    return true;
                }
                const stakeableOutput = output;
                if (stakeableOutput.getStakeableLocktime().lt(asOf)) {
                    // If the stakeable outputs locktime has ended, then this UTXO can still
                    // be consumed by a non-stakeable transaction.
                    return true;
                }
                // This output is locked and can't be consumed by a non-stakeable
                // transaction.
                return false;
            });
        };
        this.getMinimumSpendable = (aad, asOf = (0, helperfunctions_1.UnixNow)(), locktime = new bn_js_1.default(0), threshold = 1, stakeable = false) => {
            let utxoArray = this.getConsumableUXTO(asOf, stakeable);
            let tmpUTXOArray = [];
            if (stakeable) {
                // If this is a stakeable transaction then have StakeableLockOut come before SECPTransferOutput
                // so that users first stake locked tokens before staking unlocked tokens
                utxoArray.forEach((utxo) => {
                    // StakeableLockOuts
                    if (utxo.getOutput().getTypeID() === 22) {
                        tmpUTXOArray.push(utxo);
                    }
                });
                // Sort the StakeableLockOuts by StakeableLocktime so that the greatest StakeableLocktime are spent first
                tmpUTXOArray.sort((a, b) => {
                    let stakeableLockOut1 = a.getOutput();
                    let stakeableLockOut2 = b.getOutput();
                    return (stakeableLockOut2.getStakeableLocktime().toNumber() -
                        stakeableLockOut1.getStakeableLocktime().toNumber());
                });
                utxoArray.forEach((utxo) => {
                    // SECPTransferOutputs
                    if (utxo.getOutput().getTypeID() === 7) {
                        tmpUTXOArray.push(utxo);
                    }
                });
                utxoArray = tmpUTXOArray;
            }
            // outs is a map from assetID to a tuple of (lockedStakeable, unlocked)
            // which are arrays of outputs.
            const outs = {};
            // We only need to iterate over UTXOs until we have spent sufficient funds
            // to met the requested amounts.
            utxoArray.forEach((utxo, index) => {
                const assetID = utxo.getAssetID();
                const assetKey = assetID.toString("hex");
                const fromAddresses = aad.getSenders();
                const output = utxo.getOutput();
                if (!(output instanceof outputs_1.AmountOutput) ||
                    !aad.assetExists(assetKey) ||
                    !output.meetsThreshold(fromAddresses, asOf)) {
                    // We should only try to spend fungible assets.
                    // We should only spend {{ assetKey }}.
                    // We need to be able to spend the output.
                    return;
                }
                const assetAmount = aad.getAssetAmount(assetKey);
                if (assetAmount.isFinished()) {
                    // We've already spent the needed UTXOs for this assetID.
                    return;
                }
                if (!(assetKey in outs)) {
                    // If this is the first time spending this assetID, we need to
                    // initialize the outs object correctly.
                    outs[`${assetKey}`] = {
                        lockedStakeable: [],
                        unlocked: []
                    };
                }
                const amountOutput = output;
                // amount is the amount of funds available from this UTXO.
                const amount = amountOutput.getAmount();
                // Set up the SECP input with the same amount as the output.
                let input = new inputs_1.SECPTransferInput(amount);
                let locked = false;
                if (amountOutput instanceof outputs_1.StakeableLockOut) {
                    const stakeableOutput = amountOutput;
                    const stakeableLocktime = stakeableOutput.getStakeableLocktime();
                    if (stakeableLocktime.gt(asOf)) {
                        // Add a new input and mark it as being locked.
                        input = new inputs_1.StakeableLockIn(amount, stakeableLocktime, new inputs_1.ParseableInput(input));
                        // Mark this UTXO as having been re-locked.
                        locked = true;
                    }
                }
                assetAmount.spendAmount(amount, locked);
                if (locked) {
                    // Track the UTXO as locked.
                    outs[`${assetKey}`].lockedStakeable.push(amountOutput);
                }
                else {
                    // Track the UTXO as unlocked.
                    outs[`${assetKey}`].unlocked.push(amountOutput);
                }
                // Get the indices of the outputs that should be used to authorize the
                // spending of this input.
                // TODO: getSpenders should return an array of indices rather than an
                // array of addresses.
                const spenders = amountOutput.getSpenders(fromAddresses, asOf);
                spenders.forEach((spender) => {
                    const idx = amountOutput.getAddressIdx(spender);
                    if (idx === -1) {
                        // This should never happen, which is why the error is thrown rather
                        // than being returned. If this were to ever happen this would be an
                        // error in the internal logic rather having called this function with
                        // invalid arguments.
                        /* istanbul ignore next */
                        throw new errors_1.AddressError("Error - UTXOSet.getMinimumSpendable: no such " +
                            `address in output: ${spender}`);
                    }
                    input.addSignatureIdx(idx, spender);
                });
                const txID = utxo.getTxID();
                const outputIdx = utxo.getOutputIdx();
                const transferInput = new inputs_1.TransferableInput(txID, outputIdx, assetID, input);
                aad.addInput(transferInput);
            });
            if (!aad.canComplete()) {
                // After running through all the UTXOs, we still weren't able to get all
                // the necessary funds, so this transaction can't be made.
                return new errors_1.InsufficientFundsError("Error - UTXOSet.getMinimumSpendable: insufficient " +
                    "funds to create the transaction");
            }
            // TODO: We should separate the above functionality into a single function
            // that just selects the UTXOs to consume.
            const zero = new bn_js_1.default(0);
            // assetAmounts is an array of asset descriptions and how much is left to
            // spend for them.
            const assetAmounts = aad.getAmounts();
            assetAmounts.forEach((assetAmount) => {
                // change is the amount that should be returned back to the source of the
                // funds.
                const change = assetAmount.getChange();
                // isStakeableLockChange is if the change is locked or not.
                const isStakeableLockChange = assetAmount.getStakeableLockChange();
                // lockedChange is the amount of locked change that should be returned to
                // the sender
                const lockedChange = isStakeableLockChange ? change : zero.clone();
                const assetID = assetAmount.getAssetID();
                const assetKey = assetAmount.getAssetIDString();
                const lockedOutputs = outs[`${assetKey}`].lockedStakeable;
                lockedOutputs.forEach((lockedOutput, i) => {
                    const stakeableLocktime = lockedOutput.getStakeableLocktime();
                    const parseableOutput = lockedOutput.getTransferableOutput();
                    // We know that parseableOutput contains an AmountOutput because the
                    // first loop filters for fungible assets.
                    const output = parseableOutput.getOutput();
                    let outputAmountRemaining = output.getAmount();
                    // The only output that could generate change is the last output.
                    // Otherwise, any further UTXOs wouldn't have needed to be spent.
                    if (i == lockedOutputs.length - 1 && lockedChange.gt(zero)) {
                        // update outputAmountRemaining to no longer hold the change that we
                        // are returning.
                        outputAmountRemaining = outputAmountRemaining.sub(lockedChange);
                        // Create the inner output.
                        const newChangeOutput = (0, outputs_1.SelectOutputClass)(output.getOutputID(), lockedChange, output.getAddresses(), output.getLocktime(), output.getThreshold());
                        // Wrap the inner output in the StakeableLockOut wrapper.
                        let newLockedChangeOutput = (0, outputs_1.SelectOutputClass)(lockedOutput.getOutputID(), lockedChange, output.getAddresses(), output.getLocktime(), output.getThreshold(), stakeableLocktime, new outputs_1.ParseableOutput(newChangeOutput));
                        const transferOutput = new outputs_1.TransferableOutput(assetID, newLockedChangeOutput);
                        aad.addChange(transferOutput);
                    }
                    // We know that outputAmountRemaining > 0. Otherwise, we would never
                    // have consumed this UTXO, as it would be only change.
                    // Create the inner output.
                    const newOutput = (0, outputs_1.SelectOutputClass)(output.getOutputID(), outputAmountRemaining, output.getAddresses(), output.getLocktime(), output.getThreshold());
                    // Wrap the inner output in the StakeableLockOut wrapper.
                    const newLockedOutput = (0, outputs_1.SelectOutputClass)(lockedOutput.getOutputID(), outputAmountRemaining, output.getAddresses(), output.getLocktime(), output.getThreshold(), stakeableLocktime, new outputs_1.ParseableOutput(newOutput));
                    const transferOutput = new outputs_1.TransferableOutput(assetID, newLockedOutput);
                    aad.addOutput(transferOutput);
                });
                // unlockedChange is the amount of unlocked change that should be returned
                // to the sender
                const unlockedChange = isStakeableLockChange ? zero.clone() : change;
                if (unlockedChange.gt(zero)) {
                    const newChangeOutput = new outputs_1.SECPTransferOutput(unlockedChange, aad.getChangeAddresses(), zero.clone(), // make sure that we don't lock the change output.
                    1 // only require one of the changes addresses to spend this output.
                    );
                    const transferOutput = new outputs_1.TransferableOutput(assetID, newChangeOutput);
                    aad.addChange(transferOutput);
                }
                // totalAmountSpent is the total amount of tokens consumed.
                const totalAmountSpent = assetAmount.getSpent();
                // stakeableLockedAmount is the total amount of locked tokens consumed.
                const stakeableLockedAmount = assetAmount.getStakeableLockSpent();
                // totalUnlockedSpent is the total amount of unlocked tokens consumed.
                const totalUnlockedSpent = totalAmountSpent.sub(stakeableLockedAmount);
                // amountBurnt is the amount of unlocked tokens that must be burn.
                const amountBurnt = assetAmount.getBurn();
                // totalUnlockedAvailable is the total amount of unlocked tokens available
                // to be produced.
                const totalUnlockedAvailable = totalUnlockedSpent.sub(amountBurnt);
                // unlockedAmount is the amount of unlocked tokens that should be sent.
                const unlockedAmount = totalUnlockedAvailable.sub(unlockedChange);
                if (unlockedAmount.gt(zero)) {
                    const newOutput = new outputs_1.SECPTransferOutput(unlockedAmount, aad.getDestinations(), locktime, threshold);
                    const transferOutput = new outputs_1.TransferableOutput(assetID, newOutput);
                    aad.addOutput(transferOutput);
                }
            });
            return undefined;
        };
        /**
         * Creates an [[UnsignedTx]] wrapping a [[BaseTx]]. For more granular control, you may create your own
         * [[UnsignedTx]] wrapping a [[BaseTx]] manually (with their corresponding [[TransferableInput]]s and [[TransferableOutput]]s).
         *
         * @param networkID The number representing NetworkID of the node
         * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
         * @param amount The amount of the asset to be spent in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}.
         * @param assetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for the UTXO
         * @param toAddresses The addresses to send the funds
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs. Default: toAddresses
         * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
         * @param feeAssetID Optional. The assetID of the fees being burned. Default: assetID
         * @param memo Optional. Contains arbitrary data, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         *
         * @returns An unsigned transaction created from the passed in parameters.
         *
         */
        this.buildBaseTx = (networkID, blockchainID, amount, assetID, toAddresses, fromAddresses, changeAddresses = undefined, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = (0, helperfunctions_1.UnixNow)(), locktime = new bn_js_1.default(0), threshold = 1) => {
            if (threshold > toAddresses.length) {
                /* istanbul ignore next */
                throw new errors_1.ThresholdError("Error - UTXOSet.buildBaseTx: threshold is greater than number of addresses");
            }
            if (typeof changeAddresses === "undefined") {
                changeAddresses = toAddresses;
            }
            if (typeof feeAssetID === "undefined") {
                feeAssetID = assetID;
            }
            const zero = new bn_js_1.default(0);
            if (amount.eq(zero)) {
                return undefined;
            }
            const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
            if (assetID.toString("hex") === feeAssetID.toString("hex")) {
                aad.addAssetAmount(assetID, amount, fee);
            }
            else {
                aad.addAssetAmount(assetID, amount, zero);
                if (this._feeCheck(fee, feeAssetID)) {
                    aad.addAssetAmount(feeAssetID, zero, fee);
                }
            }
            let ins = [];
            let outs = [];
            const minSpendableErr = this.getMinimumSpendable(aad, asOf, locktime, threshold);
            if (typeof minSpendableErr === "undefined") {
                ins = aad.getInputs();
                outs = aad.getAllOutputs();
            }
            else {
                throw minSpendableErr;
            }
            const baseTx = new basetx_1.BaseTx(networkID, blockchainID, outs, ins, memo);
            return new tx_1.UnsignedTx(baseTx);
        };
        /**
         * Creates an unsigned ImportTx transaction.
         *
         * @param networkID The number representing NetworkID of the node
         * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
         * @param toAddresses The addresses to send the funds
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs. Default: toAddresses
         * @param importIns An array of [[TransferableInput]]s being imported
         * @param sourceChain A {@link https://github.com/feross/buffer|Buffer} for the chainid where the imports are coming from.
         * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}. Fee will come from the inputs first, if they can.
         * @param feeAssetID Optional. The assetID of the fees being burned.
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         * @returns An unsigned transaction created from the passed in parameters.
         *
         */
        this.buildImportTx = (networkID, blockchainID, toAddresses, fromAddresses, changeAddresses, atomics, sourceChain = undefined, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = (0, helperfunctions_1.UnixNow)(), locktime = new bn_js_1.default(0), threshold = 1) => {
            const zero = new bn_js_1.default(0);
            let ins = [];
            let outs = [];
            if (typeof fee === "undefined") {
                fee = zero.clone();
            }
            const importIns = [];
            let feepaid = new bn_js_1.default(0);
            let feeAssetStr = feeAssetID.toString("hex");
            for (let i = 0; i < atomics.length; i++) {
                const utxo = atomics[`${i}`];
                const assetID = utxo.getAssetID();
                const output = utxo.getOutput();
                let amt = output.getAmount().clone();
                let infeeamount = amt.clone();
                let assetStr = assetID.toString("hex");
                if (typeof feeAssetID !== "undefined" &&
                    fee.gt(zero) &&
                    feepaid.lt(fee) &&
                    assetStr === feeAssetStr) {
                    feepaid = feepaid.add(infeeamount);
                    if (feepaid.gte(fee)) {
                        infeeamount = feepaid.sub(fee);
                        feepaid = fee.clone();
                    }
                    else {
                        infeeamount = zero.clone();
                    }
                }
                const txid = utxo.getTxID();
                const outputidx = utxo.getOutputIdx();
                const input = new inputs_1.SECPTransferInput(amt);
                const xferin = new inputs_1.TransferableInput(txid, outputidx, assetID, input);
                const from = output.getAddresses();
                const spenders = output.getSpenders(from, asOf);
                for (let j = 0; j < spenders.length; j++) {
                    const idx = output.getAddressIdx(spenders[`${j}`]);
                    if (idx === -1) {
                        /* istanbul ignore next */
                        throw new errors_1.AddressError("Error - UTXOSet.buildImportTx: no such " +
                            `address in output: ${spenders[`${j}`]}`);
                    }
                    xferin.getInput().addSignatureIdx(idx, spenders[`${j}`]);
                }
                importIns.push(xferin);
                //add extra outputs for each amount (calculated from the imported inputs), minus fees
                if (infeeamount.gt(zero)) {
                    const spendout = (0, outputs_1.SelectOutputClass)(output.getOutputID(), infeeamount, toAddresses, locktime, threshold);
                    const xferout = new outputs_1.TransferableOutput(assetID, spendout);
                    outs.push(xferout);
                }
            }
            // get remaining fees from the provided addresses
            let feeRemaining = fee.sub(feepaid);
            if (feeRemaining.gt(zero) && this._feeCheck(feeRemaining, feeAssetID)) {
                const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
                aad.addAssetAmount(feeAssetID, zero, feeRemaining);
                const minSpendableErr = this.getMinimumSpendable(aad, asOf, locktime, threshold);
                if (typeof minSpendableErr === "undefined") {
                    ins = aad.getInputs();
                    outs = aad.getAllOutputs();
                }
                else {
                    throw minSpendableErr;
                }
            }
            const importTx = new importtx_1.ImportTx(networkID, blockchainID, outs, ins, memo, sourceChain, importIns);
            return new tx_1.UnsignedTx(importTx);
        };
        /**
         * Creates an unsigned ExportTx transaction.
         *
         * @param networkID The number representing NetworkID of the node
         * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
         * @param amount The amount being exported as a {@link https://github.com/indutny/bn.js/|BN}
         * @param djtxAssetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for DJTX
         * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who recieves the DJTX
         * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who owns the DJTX
         * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover of the DJTX
         * @param destinationChain Optional. A {@link https://github.com/feross/buffer|Buffer} for the chainid where to send the asset.
         * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
         * @param feeAssetID Optional. The assetID of the fees being burned.
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         *
         * @returns An unsigned transaction created from the passed in parameters.
         *
         */
        this.buildExportTx = (networkID, blockchainID, amount, djtxAssetID, // TODO: rename this to amountAssetID
        toAddresses, fromAddresses, changeAddresses = undefined, destinationChain = undefined, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = (0, helperfunctions_1.UnixNow)(), locktime = new bn_js_1.default(0), threshold = 1) => {
            let ins = [];
            let outs = [];
            let exportouts = [];
            if (typeof changeAddresses === "undefined") {
                changeAddresses = toAddresses;
            }
            const zero = new bn_js_1.default(0);
            if (amount.eq(zero)) {
                return undefined;
            }
            if (typeof feeAssetID === "undefined") {
                feeAssetID = djtxAssetID;
            }
            else if (feeAssetID.toString("hex") !== djtxAssetID.toString("hex")) {
                /* istanbul ignore next */
                throw new errors_1.FeeAssetError("Error - UTXOSet.buildExportTx: " + `feeAssetID must match djtxAssetID`);
            }
            if (typeof destinationChain === "undefined") {
                destinationChain = bintools.cb58Decode(constants_2.Defaults.network[`${networkID}`].X["blockchainID"]);
            }
            const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
            if (djtxAssetID.toString("hex") === feeAssetID.toString("hex")) {
                aad.addAssetAmount(djtxAssetID, amount, fee);
            }
            else {
                aad.addAssetAmount(djtxAssetID, amount, zero);
                if (this._feeCheck(fee, feeAssetID)) {
                    aad.addAssetAmount(feeAssetID, zero, fee);
                }
            }
            const minSpendableErr = this.getMinimumSpendable(aad, asOf, locktime, threshold);
            if (typeof minSpendableErr === "undefined") {
                ins = aad.getInputs();
                outs = aad.getChangeOutputs();
                exportouts = aad.getOutputs();
            }
            else {
                throw minSpendableErr;
            }
            const exportTx = new exporttx_1.ExportTx(networkID, blockchainID, outs, ins, memo, destinationChain, exportouts);
            return new tx_1.UnsignedTx(exportTx);
        };
        /**
         * Class representing an unsigned [[AddSubnetValidatorTx]] transaction.
         *
         * @param networkID Networkid, [[DefaultNetworkID]]
         * @param blockchainID Blockchainid, default undefined
         * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who pays the fees in DJTX
         * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the fee payment
         * @param nodeID The node ID of the validator being added.
         * @param startTime The Unix time when the validator starts validating the Primary Network.
         * @param endTime The Unix time when the validator stops validating the Primary Network (and staked DJTX is returned).
         * @param weight The amount of weight for this subnet validator.
         * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
         * @param feeAssetID Optional. The assetID of the fees being burned.
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        /* must implement later once the transaction format signing process is clearer
        buildAddSubnetValidatorTx = (
          networkID:number = DefaultNetworkID,
          blockchainID:Buffer,
          fromAddresses:Buffer[],
          changeAddresses:Buffer[],
          nodeID:Buffer,
          startTime:BN,
          endTime:BN,
          weight:BN,
          fee:BN = undefined,
          feeAssetID:Buffer = undefined,
          memo:Buffer = undefined,
          asOf:BN = UnixNow()
        ):UnsignedTx => {
          let ins:TransferableInput[] = [];
          let outs:TransferableOutput[] = [];
          //let stakeOuts:TransferableOutput[] = [];
      
          const zero:BN = new BN(0);
          const now:BN = UnixNow();
          if (startTime.lt(now) || endTime.lte(startTime)) {
            throw new Error("UTXOSet.buildAddSubnetValidatorTx -- startTime must be in the future and endTime must come after startTime");
          }
      
          // Not implemented: Fees can be paid from importIns
          if(this._feeCheck(fee, feeAssetID)) {
            const aad:AssetAmountDestination = new AssetAmountDestination(fromAddresses, fromAddresses, changeAddresses);
            aad.addAssetAmount(feeAssetID, zero, fee);
            const success:Error = this.getMinimumSpendable(aad, asOf);
            if(typeof success === "undefined") {
              ins = aad.getInputs();
              outs = aad.getAllOutputs();
            } else {
              throw success;
            }
          }
      
          const UTx:AddSubnetValidatorTx = new AddSubnetValidatorTx(networkID, blockchainID, outs, ins, memo, nodeID, startTime, endTime, weight);
          return new UnsignedTx(UTx);
        }
        */
        /**
         * Class representing an unsigned [[AddDelegatorTx]] transaction.
         *
         * @param networkID Networkid, [[DefaultNetworkID]]
         * @param blockchainID Blockchainid, default undefined
         * @param djtxAssetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for DJTX
         * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} recieves the stake at the end of the staking period
         * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who pays the fees and the stake
         * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the staking payment
         * @param nodeID The node ID of the validator being added.
         * @param startTime The Unix time when the validator starts validating the Primary Network.
         * @param endTime The Unix time when the validator stops validating the Primary Network (and staked DJTX is returned).
         * @param stakeAmount A {@link https://github.com/indutny/bn.js/|BN} for the amount of stake to be delegated in nDJTX.
         * @param rewardLocktime The locktime field created in the resulting reward outputs
         * @param rewardThreshold The number of signatures required to spend the funds in the resultant reward UTXO
         * @param rewardAddresses The addresses the validator reward goes.
         * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
         * @param feeAssetID Optional. The assetID of the fees being burned.
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        this.buildAddDelegatorTx = (networkID = constants_2.DefaultNetworkID, blockchainID, djtxAssetID, toAddresses, fromAddresses, changeAddresses, nodeID, startTime, endTime, stakeAmount, rewardLocktime, rewardThreshold, rewardAddresses, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = (0, helperfunctions_1.UnixNow)()) => {
            let ins = [];
            let outs = [];
            let stakeOuts = [];
            const zero = new bn_js_1.default(0);
            const now = (0, helperfunctions_1.UnixNow)();
            if (startTime.lt(now) || endTime.lte(startTime)) {
                throw new errors_1.TimeError("UTXOSet.buildAddDelegatorTx -- startTime must be in the future and endTime must come after startTime");
            }
            const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
            if (djtxAssetID.toString("hex") === feeAssetID.toString("hex")) {
                aad.addAssetAmount(djtxAssetID, stakeAmount, fee);
            }
            else {
                aad.addAssetAmount(djtxAssetID, stakeAmount, zero);
                if (this._feeCheck(fee, feeAssetID)) {
                    aad.addAssetAmount(feeAssetID, zero, fee);
                }
            }
            const minSpendableErr = this.getMinimumSpendable(aad, asOf, undefined, undefined, true);
            if (typeof minSpendableErr === "undefined") {
                ins = aad.getInputs();
                outs = aad.getChangeOutputs();
                stakeOuts = aad.getOutputs();
            }
            else {
                throw minSpendableErr;
            }
            const rewardOutputOwners = new outputs_1.SECPOwnerOutput(rewardAddresses, rewardLocktime, rewardThreshold);
            const UTx = new validationtx_1.AddDelegatorTx(networkID, blockchainID, outs, ins, memo, nodeID, startTime, endTime, stakeAmount, stakeOuts, new outputs_1.ParseableOutput(rewardOutputOwners));
            return new tx_1.UnsignedTx(UTx);
        };
        /**
         * Class representing an unsigned [[AddValidatorTx]] transaction.
         *
         * @param networkID NetworkID, [[DefaultNetworkID]]
         * @param blockchainID BlockchainID, default undefined
         * @param djtxAssetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for DJTX
         * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} recieves the stake at the end of the staking period
         * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who pays the fees and the stake
         * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the staking payment
         * @param nodeID The node ID of the validator being added.
         * @param startTime The Unix time when the validator starts validating the Primary Network.
         * @param endTime The Unix time when the validator stops validating the Primary Network (and staked DJTX is returned).
         * @param stakeAmount A {@link https://github.com/indutny/bn.js/|BN} for the amount of stake to be delegated in nDJTX.
         * @param rewardLocktime The locktime field created in the resulting reward outputs
         * @param rewardThreshold The number of signatures required to spend the funds in the resultant reward UTXO
         * @param rewardAddresses The addresses the validator reward goes.
         * @param delegationFee A number for the percentage of reward to be given to the validator when someone delegates to them. Must be between 0 and 100.
         * @param minStake A {@link https://github.com/indutny/bn.js/|BN} representing the minimum stake required to validate on this network.
         * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
         * @param feeAssetID Optional. The assetID of the fees being burned.
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        this.buildAddValidatorTx = (networkID = constants_2.DefaultNetworkID, blockchainID, djtxAssetID, toAddresses, fromAddresses, changeAddresses, nodeID, startTime, endTime, stakeAmount, rewardLocktime, rewardThreshold, rewardAddresses, delegationFee, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = (0, helperfunctions_1.UnixNow)()) => {
            let ins = [];
            let outs = [];
            let stakeOuts = [];
            const zero = new bn_js_1.default(0);
            const now = (0, helperfunctions_1.UnixNow)();
            if (startTime.lt(now) || endTime.lte(startTime)) {
                throw new errors_1.TimeError("UTXOSet.buildAddValidatorTx -- startTime must be in the future and endTime must come after startTime");
            }
            if (delegationFee > 100 || delegationFee < 0) {
                throw new errors_1.TimeError("UTXOSet.buildAddValidatorTx -- startTime must be in the range of 0 to 100, inclusively");
            }
            const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
            if (djtxAssetID.toString("hex") === feeAssetID.toString("hex")) {
                aad.addAssetAmount(djtxAssetID, stakeAmount, fee);
            }
            else {
                aad.addAssetAmount(djtxAssetID, stakeAmount, zero);
                if (this._feeCheck(fee, feeAssetID)) {
                    aad.addAssetAmount(feeAssetID, zero, fee);
                }
            }
            const minSpendableErr = this.getMinimumSpendable(aad, asOf, undefined, undefined, true);
            if (typeof minSpendableErr === "undefined") {
                ins = aad.getInputs();
                outs = aad.getChangeOutputs();
                stakeOuts = aad.getOutputs();
            }
            else {
                throw minSpendableErr;
            }
            const rewardOutputOwners = new outputs_1.SECPOwnerOutput(rewardAddresses, rewardLocktime, rewardThreshold);
            const UTx = new validationtx_1.AddValidatorTx(networkID, blockchainID, outs, ins, memo, nodeID, startTime, endTime, stakeAmount, stakeOuts, new outputs_1.ParseableOutput(rewardOutputOwners), delegationFee);
            return new tx_1.UnsignedTx(UTx);
        };
        /**
         * Class representing an unsigned [[CreateSubnetTx]] transaction.
         *
         * @param networkID Networkid, [[DefaultNetworkID]]
         * @param blockchainID Blockchainid, default undefined
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
         * @param subnetOwnerAddresses An array of {@link https://github.com/feross/buffer|Buffer} for the addresses to add to a subnet
         * @param subnetOwnerThreshold The number of owners's signatures required to add a validator to the network
         * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
         * @param feeAssetID Optional. The assetID of the fees being burned
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        this.buildCreateSubnetTx = (networkID = constants_2.DefaultNetworkID, blockchainID, fromAddresses, changeAddresses, subnetOwnerAddresses, subnetOwnerThreshold, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = (0, helperfunctions_1.UnixNow)()) => {
            const zero = new bn_js_1.default(0);
            let ins = [];
            let outs = [];
            if (this._feeCheck(fee, feeAssetID)) {
                const aad = new AssetAmountDestination(fromAddresses, fromAddresses, changeAddresses);
                aad.addAssetAmount(feeAssetID, zero, fee);
                const minSpendableErr = this.getMinimumSpendable(aad, asOf, undefined, undefined);
                if (typeof minSpendableErr === "undefined") {
                    ins = aad.getInputs();
                    outs = aad.getAllOutputs();
                }
                else {
                    throw minSpendableErr;
                }
            }
            const locktime = new bn_js_1.default(0);
            const UTx = new createsubnettx_1.CreateSubnetTx(networkID, blockchainID, outs, ins, memo, new outputs_1.SECPOwnerOutput(subnetOwnerAddresses, locktime, subnetOwnerThreshold));
            return new tx_1.UnsignedTx(UTx);
        };
        /**
         * Build an unsigned [[CreateChainTx]].
         *
         * @param networkID Networkid, [[DefaultNetworkID]]
         * @param blockchainID Blockchainid, default undefined
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
         * @param subnetID Optional ID of the Subnet that validates this blockchain
         * @param chainName Optional A human readable name for the chain; need not be unique
         * @param vmID Optional ID of the VM running on the new chain
         * @param fxIDs Optional IDs of the feature extensions running on the new chain
         * @param genesisData Optional Byte representation of genesis state of the new chain
         * @param subnetAuth Optional Specifies the addresses whose signatures will be provided to demonstrate that the owners of a subnet approve something
         * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
         * @param feeAssetID Optional. The assetID of the fees being burned
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         *
         * @returns An unsigned CreateChainTx created from the passed in parameters.
         */
        this.buildCreateChainTx = (networkID = constants_2.DefaultNetworkID, blockchainID, fromAddresses, changeAddresses, subnetID = undefined, chainName = undefined, vmID = undefined, fxIDs = undefined, genesisData = undefined, subnetAuth = undefined, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = (0, helperfunctions_1.UnixNow)()) => {
            const zero = new bn_js_1.default(0);
            let ins = [];
            let outs = [];
            if (this._feeCheck(fee, feeAssetID)) {
                const aad = new AssetAmountDestination(fromAddresses, fromAddresses, changeAddresses);
                aad.addAssetAmount(feeAssetID, zero, fee);
                const minSpendableErr = this.getMinimumSpendable(aad, asOf, undefined, undefined);
                if (typeof minSpendableErr === "undefined") {
                    ins = aad.getInputs();
                    outs = aad.getAllOutputs();
                }
                else {
                    throw minSpendableErr;
                }
            }
            const createChainTx = new _1.CreateChainTx(networkID, blockchainID, outs, ins, memo, subnetID, chainName, vmID, fxIDs, genesisData, subnetAuth);
            return new tx_1.UnsignedTx(createChainTx);
        };
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        let utxos = {};
        for (let utxoid in fields["utxos"]) {
            let utxoidCleaned = serialization.decoder(utxoid, encoding, "base58", "base58");
            utxos[`${utxoidCleaned}`] = new UTXO();
            utxos[`${utxoidCleaned}`].deserialize(fields["utxos"][`${utxoid}`], encoding);
        }
        let addressUTXOs = {};
        for (let address in fields["addressUTXOs"]) {
            let addressCleaned = serialization.decoder(address, encoding, "cb58", "hex");
            let utxobalance = {};
            for (let utxoid in fields["addressUTXOs"][`${address}`]) {
                let utxoidCleaned = serialization.decoder(utxoid, encoding, "base58", "base58");
                utxobalance[`${utxoidCleaned}`] = serialization.decoder(fields["addressUTXOs"][`${address}`][`${utxoid}`], encoding, "decimalString", "BN");
            }
            addressUTXOs[`${addressCleaned}`] = utxobalance;
        }
        this.utxos = utxos;
        this.addressUTXOs = addressUTXOs;
    }
    parseUTXO(utxo) {
        const utxovar = new UTXO();
        // force a copy
        if (typeof utxo === "string") {
            utxovar.fromBuffer(bintools.cb58Decode(utxo));
        }
        else if (utxo instanceof utxos_1.StandardUTXO) {
            utxovar.fromBuffer(utxo.toBuffer()); // forces a copy
        }
        else {
            /* istanbul ignore next */
            throw new errors_1.UTXOError("Error - UTXO.parseUTXO: utxo parameter is not a UTXO or string");
        }
        return utxovar;
    }
    create(...args) {
        return new UTXOSet();
    }
    clone() {
        const newset = this.create();
        const allUTXOs = this.getAllUTXOs();
        newset.addArray(allUTXOs);
        return newset;
    }
    _feeCheck(fee, feeAssetID) {
        return (typeof fee !== "undefined" &&
            typeof feeAssetID !== "undefined" &&
            fee.gt(new bn_js_1.default(0)) &&
            feeAssetID instanceof buffer_1.Buffer);
    }
}
exports.UTXOSet = UTXOSet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXR4b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL3V0eG9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFnQztBQUNoQyxvRUFBMkM7QUFDM0Msa0RBQXNCO0FBQ3RCLHVDQVFrQjtBQUNsQixxQ0FNaUI7QUFDakIsaUVBQXFEO0FBQ3JELDhDQUFrRTtBQUNsRSwyQ0FBaUQ7QUFDakQsNkJBQWlDO0FBQ2pDLHFEQUFpRDtBQUNqRCxxREFBa0U7QUFDbEUscURBQWlEO0FBQ2pELGlEQUE2QztBQUM3QywwREFHaUM7QUFFakMsaURBQStEO0FBQy9ELHFEQUFpRDtBQUNqRCw2REFBNkU7QUFDN0UsK0NBTzJCO0FBQzNCLHdCQUE2QztBQUc3Qzs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxhQUFhLEdBQWtCLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFaEU7O0dBRUc7QUFDSCxNQUFhLElBQUssU0FBUSxvQkFBWTtJQUF0Qzs7UUFDWSxjQUFTLEdBQUcsTUFBTSxDQUFBO1FBQ2xCLFlBQU8sR0FBRyxTQUFTLENBQUE7SUFvRS9CLENBQUM7SUFsRUMsd0JBQXdCO0lBRXhCLFdBQVcsQ0FBQyxNQUFjLEVBQUUsV0FBK0IsS0FBSztRQUM5RCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUNuQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsMkJBQWlCLEVBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7UUFDNUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ3JELENBQUM7SUFFRCxVQUFVLENBQUMsS0FBYSxF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LE1BQU0sSUFBSSxrQkFBUyxDQUNqQixnRUFBZ0UsQ0FDakUsQ0FBQTtTQUNGO1FBQ0QsT0FBTyxPQUFPLENBQUE7SUFDaEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFHLElBQVc7UUFDbkIsT0FBTyxJQUFJLE9BQU8sRUFBVSxDQUFBO0lBQzlCLENBQUM7SUFFRCxLQUFLO1FBQ0gsTUFBTSxNQUFNLEdBQVksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO1FBQ3JDLE1BQU0sUUFBUSxHQUFXLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUMzQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3pCLE9BQU8sTUFBYyxDQUFBO0lBQ3ZCLENBQUM7SUFFRCxTQUFTLENBQUMsR0FBTyxFQUFFLFVBQWtCO1FBQ25DLE9BQU8sQ0FDTCxPQUFPLEdBQUcsS0FBSyxXQUFXO1lBQzFCLE9BQU8sVUFBVSxLQUFLLFdBQVc7WUFDakMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLGVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQixVQUFVLFlBQVksZUFBTSxDQUM3QixDQUFBO0lBQ0gsQ0FBQztDQTZqQ0Y7QUFscENELDBCQWtwQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktUGxhdGZvcm1WTS1VVFhPc1xuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uLy4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCBCTiBmcm9tIFwiYm4uanNcIlxuaW1wb3J0IHtcbiAgQW1vdW50T3V0cHV0LFxuICBTZWxlY3RPdXRwdXRDbGFzcyxcbiAgVHJhbnNmZXJhYmxlT3V0cHV0LFxuICBTRUNQT3duZXJPdXRwdXQsXG4gIFBhcnNlYWJsZU91dHB1dCxcbiAgU3Rha2VhYmxlTG9ja091dCxcbiAgU0VDUFRyYW5zZmVyT3V0cHV0XG59IGZyb20gXCIuL291dHB1dHNcIlxuaW1wb3J0IHtcbiAgQW1vdW50SW5wdXQsXG4gIFNFQ1BUcmFuc2ZlcklucHV0LFxuICBTdGFrZWFibGVMb2NrSW4sXG4gIFRyYW5zZmVyYWJsZUlucHV0LFxuICBQYXJzZWFibGVJbnB1dFxufSBmcm9tIFwiLi9pbnB1dHNcIlxuaW1wb3J0IHsgVW5peE5vdyB9IGZyb20gXCIuLi8uLi91dGlscy9oZWxwZXJmdW5jdGlvbnNcIlxuaW1wb3J0IHsgU3RhbmRhcmRVVFhPLCBTdGFuZGFyZFVUWE9TZXQgfSBmcm9tIFwiLi4vLi4vY29tbW9uL3V0eG9zXCJcbmltcG9ydCB7IFBsYXRmb3JtVk1Db25zdGFudHMgfSBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgVW5zaWduZWRUeCB9IGZyb20gXCIuL3R4XCJcbmltcG9ydCB7IEV4cG9ydFR4IH0gZnJvbSBcIi4uL3BsYXRmb3Jtdm0vZXhwb3J0dHhcIlxuaW1wb3J0IHsgRGVmYXVsdE5ldHdvcmtJRCwgRGVmYXVsdHMgfSBmcm9tIFwiLi4vLi4vdXRpbHMvY29uc3RhbnRzXCJcbmltcG9ydCB7IEltcG9ydFR4IH0gZnJvbSBcIi4uL3BsYXRmb3Jtdm0vaW1wb3J0dHhcIlxuaW1wb3J0IHsgQmFzZVR4IH0gZnJvbSBcIi4uL3BsYXRmb3Jtdm0vYmFzZXR4XCJcbmltcG9ydCB7XG4gIFN0YW5kYXJkQXNzZXRBbW91bnREZXN0aW5hdGlvbixcbiAgQXNzZXRBbW91bnRcbn0gZnJvbSBcIi4uLy4uL2NvbW1vbi9hc3NldGFtb3VudFwiXG5pbXBvcnQgeyBPdXRwdXQgfSBmcm9tIFwiLi4vLi4vY29tbW9uL291dHB1dFwiXG5pbXBvcnQgeyBBZGREZWxlZ2F0b3JUeCwgQWRkVmFsaWRhdG9yVHggfSBmcm9tIFwiLi92YWxpZGF0aW9udHhcIlxuaW1wb3J0IHsgQ3JlYXRlU3VibmV0VHggfSBmcm9tIFwiLi9jcmVhdGVzdWJuZXR0eFwiXG5pbXBvcnQgeyBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvblwiXG5pbXBvcnQge1xuICBVVFhPRXJyb3IsXG4gIEFkZHJlc3NFcnJvcixcbiAgSW5zdWZmaWNpZW50RnVuZHNFcnJvcixcbiAgVGhyZXNob2xkRXJyb3IsXG4gIEZlZUFzc2V0RXJyb3IsXG4gIFRpbWVFcnJvclxufSBmcm9tIFwiLi4vLi4vdXRpbHMvZXJyb3JzXCJcbmltcG9ydCB7IENyZWF0ZUNoYWluVHgsIFN1Ym5ldEF1dGggfSBmcm9tIFwiLlwiXG5pbXBvcnQgeyBHZW5lc2lzRGF0YSB9IGZyb20gXCIuLi9hdm1cIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuXG4vKipcbiAqIENsYXNzIGZvciByZXByZXNlbnRpbmcgYSBzaW5nbGUgVVRYTy5cbiAqL1xuZXhwb3J0IGNsYXNzIFVUWE8gZXh0ZW5kcyBTdGFuZGFyZFVUWE8ge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJVVFhPXCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICAvL3NlcmlhbGl6ZSBpcyBpbmhlcml0ZWRcblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMub3V0cHV0ID0gU2VsZWN0T3V0cHV0Q2xhc3MoZmllbGRzW1wib3V0cHV0XCJdW1wiX3R5cGVJRFwiXSlcbiAgICB0aGlzLm91dHB1dC5kZXNlcmlhbGl6ZShmaWVsZHNbXCJvdXRwdXRcIl0sIGVuY29kaW5nKVxuICB9XG5cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRoaXMuY29kZWNJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDIpXG4gICAgb2Zmc2V0ICs9IDJcbiAgICB0aGlzLnR4aWQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMilcbiAgICBvZmZzZXQgKz0gMzJcbiAgICB0aGlzLm91dHB1dGlkeCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLmFzc2V0SUQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMilcbiAgICBvZmZzZXQgKz0gMzJcbiAgICBjb25zdCBvdXRwdXRpZDogbnVtYmVyID0gYmludG9vbHNcbiAgICAgIC5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgICAgLnJlYWRVSW50MzJCRSgwKVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy5vdXRwdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhvdXRwdXRpZClcbiAgICByZXR1cm4gdGhpcy5vdXRwdXQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEgYmFzZS01OCBzdHJpbmcgY29udGFpbmluZyBhIFtbVVRYT11dLCBwYXJzZXMgaXQsIHBvcHVsYXRlcyB0aGUgY2xhc3MsIGFuZCByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIFN0YW5kYXJkVVRYTyBpbiBieXRlcy5cbiAgICpcbiAgICogQHBhcmFtIHNlcmlhbGl6ZWQgQSBiYXNlLTU4IHN0cmluZyBjb250YWluaW5nIGEgcmF3IFtbVVRYT11dXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBsZW5ndGggb2YgdGhlIHJhdyBbW1VUWE9dXVxuICAgKlxuICAgKiBAcmVtYXJrc1xuICAgKiB1bmxpa2UgbW9zdCBmcm9tU3RyaW5ncywgaXQgZXhwZWN0cyB0aGUgc3RyaW5nIHRvIGJlIHNlcmlhbGl6ZWQgaW4gY2I1OCBmb3JtYXRcbiAgICovXG4gIGZyb21TdHJpbmcoc2VyaWFsaXplZDogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIHJldHVybiB0aGlzLmZyb21CdWZmZXIoYmludG9vbHMuY2I1OERlY29kZShzZXJpYWxpemVkKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYmFzZS01OCByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tVVFhPXV0uXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIHVubGlrZSBtb3N0IHRvU3RyaW5ncywgdGhpcyByZXR1cm5zIGluIGNiNTggc2VyaWFsaXphdGlvbiBmb3JtYXRcbiAgICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICByZXR1cm4gYmludG9vbHMuY2I1OEVuY29kZSh0aGlzLnRvQnVmZmVyKCkpXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCB1dHhvOiBVVFhPID0gbmV3IFVUWE8oKVxuICAgIHV0eG8uZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpXG4gICAgcmV0dXJuIHV0eG8gYXMgdGhpc1xuICB9XG5cbiAgY3JlYXRlKFxuICAgIGNvZGVjSUQ6IG51bWJlciA9IFBsYXRmb3JtVk1Db25zdGFudHMuTEFURVNUQ09ERUMsXG4gICAgdHhpZDogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG91dHB1dGlkeDogQnVmZmVyIHwgbnVtYmVyID0gdW5kZWZpbmVkLFxuICAgIGFzc2V0SUQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBvdXRwdXQ6IE91dHB1dCA9IHVuZGVmaW5lZFxuICApOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IFVUWE8oY29kZWNJRCwgdHhpZCwgb3V0cHV0aWR4LCBhc3NldElELCBvdXRwdXQpIGFzIHRoaXNcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQXNzZXRBbW91bnREZXN0aW5hdGlvbiBleHRlbmRzIFN0YW5kYXJkQXNzZXRBbW91bnREZXN0aW5hdGlvbjxcbiAgVHJhbnNmZXJhYmxlT3V0cHV0LFxuICBUcmFuc2ZlcmFibGVJbnB1dFxuPiB7fVxuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhIHNldCBvZiBbW1VUWE9dXXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBVVFhPU2V0IGV4dGVuZHMgU3RhbmRhcmRVVFhPU2V0PFVUWE8+IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiVVRYT1NldFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgLy9zZXJpYWxpemUgaXMgaW5oZXJpdGVkXG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICBsZXQgdXR4b3MgPSB7fVxuICAgIGZvciAobGV0IHV0eG9pZCBpbiBmaWVsZHNbXCJ1dHhvc1wiXSkge1xuICAgICAgbGV0IHV0eG9pZENsZWFuZWQ6IHN0cmluZyA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgICAgdXR4b2lkLFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJiYXNlNThcIixcbiAgICAgICAgXCJiYXNlNThcIlxuICAgICAgKVxuICAgICAgdXR4b3NbYCR7dXR4b2lkQ2xlYW5lZH1gXSA9IG5ldyBVVFhPKClcbiAgICAgIHV0eG9zW2Ake3V0eG9pZENsZWFuZWR9YF0uZGVzZXJpYWxpemUoXG4gICAgICAgIGZpZWxkc1tcInV0eG9zXCJdW2Ake3V0eG9pZH1gXSxcbiAgICAgICAgZW5jb2RpbmdcbiAgICAgIClcbiAgICB9XG4gICAgbGV0IGFkZHJlc3NVVFhPcyA9IHt9XG4gICAgZm9yIChsZXQgYWRkcmVzcyBpbiBmaWVsZHNbXCJhZGRyZXNzVVRYT3NcIl0pIHtcbiAgICAgIGxldCBhZGRyZXNzQ2xlYW5lZDogc3RyaW5nID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgICBhZGRyZXNzLFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJjYjU4XCIsXG4gICAgICAgIFwiaGV4XCJcbiAgICAgIClcbiAgICAgIGxldCB1dHhvYmFsYW5jZSA9IHt9XG4gICAgICBmb3IgKGxldCB1dHhvaWQgaW4gZmllbGRzW1wiYWRkcmVzc1VUWE9zXCJdW2Ake2FkZHJlc3N9YF0pIHtcbiAgICAgICAgbGV0IHV0eG9pZENsZWFuZWQ6IHN0cmluZyA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgICAgICB1dHhvaWQsXG4gICAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgICAgXCJiYXNlNThcIixcbiAgICAgICAgICBcImJhc2U1OFwiXG4gICAgICAgIClcbiAgICAgICAgdXR4b2JhbGFuY2VbYCR7dXR4b2lkQ2xlYW5lZH1gXSA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgICAgICBmaWVsZHNbXCJhZGRyZXNzVVRYT3NcIl1bYCR7YWRkcmVzc31gXVtgJHt1dHhvaWR9YF0sXG4gICAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICAgICAgXCJCTlwiXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIGFkZHJlc3NVVFhPc1tgJHthZGRyZXNzQ2xlYW5lZH1gXSA9IHV0eG9iYWxhbmNlXG4gICAgfVxuICAgIHRoaXMudXR4b3MgPSB1dHhvc1xuICAgIHRoaXMuYWRkcmVzc1VUWE9zID0gYWRkcmVzc1VUWE9zXG4gIH1cblxuICBwYXJzZVVUWE8odXR4bzogVVRYTyB8IHN0cmluZyk6IFVUWE8ge1xuICAgIGNvbnN0IHV0eG92YXI6IFVUWE8gPSBuZXcgVVRYTygpXG4gICAgLy8gZm9yY2UgYSBjb3B5XG4gICAgaWYgKHR5cGVvZiB1dHhvID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB1dHhvdmFyLmZyb21CdWZmZXIoYmludG9vbHMuY2I1OERlY29kZSh1dHhvKSlcbiAgICB9IGVsc2UgaWYgKHV0eG8gaW5zdGFuY2VvZiBTdGFuZGFyZFVUWE8pIHtcbiAgICAgIHV0eG92YXIuZnJvbUJ1ZmZlcih1dHhvLnRvQnVmZmVyKCkpIC8vIGZvcmNlcyBhIGNvcHlcbiAgICB9IGVsc2Uge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBVVFhPRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBVVFhPLnBhcnNlVVRYTzogdXR4byBwYXJhbWV0ZXIgaXMgbm90IGEgVVRYTyBvciBzdHJpbmdcIlxuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gdXR4b3ZhclxuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIG5ldyBVVFhPU2V0KCkgYXMgdGhpc1xuICB9XG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgY29uc3QgbmV3c2V0OiBVVFhPU2V0ID0gdGhpcy5jcmVhdGUoKVxuICAgIGNvbnN0IGFsbFVUWE9zOiBVVFhPW10gPSB0aGlzLmdldEFsbFVUWE9zKClcbiAgICBuZXdzZXQuYWRkQXJyYXkoYWxsVVRYT3MpXG4gICAgcmV0dXJuIG5ld3NldCBhcyB0aGlzXG4gIH1cblxuICBfZmVlQ2hlY2soZmVlOiBCTiwgZmVlQXNzZXRJRDogQnVmZmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHR5cGVvZiBmZWUgIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgIHR5cGVvZiBmZWVBc3NldElEICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICBmZWUuZ3QobmV3IEJOKDApKSAmJlxuICAgICAgZmVlQXNzZXRJRCBpbnN0YW5jZW9mIEJ1ZmZlclxuICAgIClcbiAgfVxuXG4gIGdldENvbnN1bWFibGVVWFRPID0gKFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICAgIHN0YWtlYWJsZTogYm9vbGVhbiA9IGZhbHNlXG4gICk6IFVUWE9bXSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsVVRYT3MoKS5maWx0ZXIoKHV0eG86IFVUWE8pID0+IHtcbiAgICAgIGlmIChzdGFrZWFibGUpIHtcbiAgICAgICAgLy8gc3Rha2VhYmxlIHRyYW5zYWN0aW9ucyBjYW4gY29uc3VtZSBhbnkgVVRYTy5cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIGNvbnN0IG91dHB1dDogT3V0cHV0ID0gdXR4by5nZXRPdXRwdXQoKVxuICAgICAgaWYgKCEob3V0cHV0IGluc3RhbmNlb2YgU3Rha2VhYmxlTG9ja091dCkpIHtcbiAgICAgICAgLy8gbm9uLXN0YWtlYWJsZSB0cmFuc2FjdGlvbnMgY2FuIGNvbnN1bWUgYW55IFVUWE8gdGhhdCBpc24ndCBsb2NrZWQuXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBjb25zdCBzdGFrZWFibGVPdXRwdXQ6IFN0YWtlYWJsZUxvY2tPdXQgPSBvdXRwdXQgYXMgU3Rha2VhYmxlTG9ja091dFxuICAgICAgaWYgKHN0YWtlYWJsZU91dHB1dC5nZXRTdGFrZWFibGVMb2NrdGltZSgpLmx0KGFzT2YpKSB7XG4gICAgICAgIC8vIElmIHRoZSBzdGFrZWFibGUgb3V0cHV0cyBsb2NrdGltZSBoYXMgZW5kZWQsIHRoZW4gdGhpcyBVVFhPIGNhbiBzdGlsbFxuICAgICAgICAvLyBiZSBjb25zdW1lZCBieSBhIG5vbi1zdGFrZWFibGUgdHJhbnNhY3Rpb24uXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICAvLyBUaGlzIG91dHB1dCBpcyBsb2NrZWQgYW5kIGNhbid0IGJlIGNvbnN1bWVkIGJ5IGEgbm9uLXN0YWtlYWJsZVxuICAgICAgLy8gdHJhbnNhY3Rpb24uXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgZ2V0TWluaW11bVNwZW5kYWJsZSA9IChcbiAgICBhYWQ6IEFzc2V0QW1vdW50RGVzdGluYXRpb24sXG4gICAgYXNPZjogQk4gPSBVbml4Tm93KCksXG4gICAgbG9ja3RpbWU6IEJOID0gbmV3IEJOKDApLFxuICAgIHRocmVzaG9sZDogbnVtYmVyID0gMSxcbiAgICBzdGFrZWFibGU6IGJvb2xlYW4gPSBmYWxzZVxuICApOiBFcnJvciA9PiB7XG4gICAgbGV0IHV0eG9BcnJheTogVVRYT1tdID0gdGhpcy5nZXRDb25zdW1hYmxlVVhUTyhhc09mLCBzdGFrZWFibGUpXG4gICAgbGV0IHRtcFVUWE9BcnJheTogVVRYT1tdID0gW11cbiAgICBpZiAoc3Rha2VhYmxlKSB7XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgc3Rha2VhYmxlIHRyYW5zYWN0aW9uIHRoZW4gaGF2ZSBTdGFrZWFibGVMb2NrT3V0IGNvbWUgYmVmb3JlIFNFQ1BUcmFuc2Zlck91dHB1dFxuICAgICAgLy8gc28gdGhhdCB1c2VycyBmaXJzdCBzdGFrZSBsb2NrZWQgdG9rZW5zIGJlZm9yZSBzdGFraW5nIHVubG9ja2VkIHRva2Vuc1xuICAgICAgdXR4b0FycmF5LmZvckVhY2goKHV0eG86IFVUWE8pID0+IHtcbiAgICAgICAgLy8gU3Rha2VhYmxlTG9ja091dHNcbiAgICAgICAgaWYgKHV0eG8uZ2V0T3V0cHV0KCkuZ2V0VHlwZUlEKCkgPT09IDIyKSB7XG4gICAgICAgICAgdG1wVVRYT0FycmF5LnB1c2godXR4bylcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gU29ydCB0aGUgU3Rha2VhYmxlTG9ja091dHMgYnkgU3Rha2VhYmxlTG9ja3RpbWUgc28gdGhhdCB0aGUgZ3JlYXRlc3QgU3Rha2VhYmxlTG9ja3RpbWUgYXJlIHNwZW50IGZpcnN0XG4gICAgICB0bXBVVFhPQXJyYXkuc29ydCgoYTogVVRYTywgYjogVVRYTykgPT4ge1xuICAgICAgICBsZXQgc3Rha2VhYmxlTG9ja091dDEgPSBhLmdldE91dHB1dCgpIGFzIFN0YWtlYWJsZUxvY2tPdXRcbiAgICAgICAgbGV0IHN0YWtlYWJsZUxvY2tPdXQyID0gYi5nZXRPdXRwdXQoKSBhcyBTdGFrZWFibGVMb2NrT3V0XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgc3Rha2VhYmxlTG9ja091dDIuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKS50b051bWJlcigpIC1cbiAgICAgICAgICBzdGFrZWFibGVMb2NrT3V0MS5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvTnVtYmVyKClcbiAgICAgICAgKVxuICAgICAgfSlcblxuICAgICAgdXR4b0FycmF5LmZvckVhY2goKHV0eG86IFVUWE8pID0+IHtcbiAgICAgICAgLy8gU0VDUFRyYW5zZmVyT3V0cHV0c1xuICAgICAgICBpZiAodXR4by5nZXRPdXRwdXQoKS5nZXRUeXBlSUQoKSA9PT0gNykge1xuICAgICAgICAgIHRtcFVUWE9BcnJheS5wdXNoKHV0eG8pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB1dHhvQXJyYXkgPSB0bXBVVFhPQXJyYXlcbiAgICB9XG5cbiAgICAvLyBvdXRzIGlzIGEgbWFwIGZyb20gYXNzZXRJRCB0byBhIHR1cGxlIG9mIChsb2NrZWRTdGFrZWFibGUsIHVubG9ja2VkKVxuICAgIC8vIHdoaWNoIGFyZSBhcnJheXMgb2Ygb3V0cHV0cy5cbiAgICBjb25zdCBvdXRzOiBvYmplY3QgPSB7fVxuXG4gICAgLy8gV2Ugb25seSBuZWVkIHRvIGl0ZXJhdGUgb3ZlciBVVFhPcyB1bnRpbCB3ZSBoYXZlIHNwZW50IHN1ZmZpY2llbnQgZnVuZHNcbiAgICAvLyB0byBtZXQgdGhlIHJlcXVlc3RlZCBhbW91bnRzLlxuICAgIHV0eG9BcnJheS5mb3JFYWNoKCh1dHhvOiBVVFhPLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBhc3NldElEOiBCdWZmZXIgPSB1dHhvLmdldEFzc2V0SUQoKVxuICAgICAgY29uc3QgYXNzZXRLZXk6IHN0cmluZyA9IGFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGNvbnN0IGZyb21BZGRyZXNzZXM6IEJ1ZmZlcltdID0gYWFkLmdldFNlbmRlcnMoKVxuICAgICAgY29uc3Qgb3V0cHV0OiBPdXRwdXQgPSB1dHhvLmdldE91dHB1dCgpXG4gICAgICBpZiAoXG4gICAgICAgICEob3V0cHV0IGluc3RhbmNlb2YgQW1vdW50T3V0cHV0KSB8fFxuICAgICAgICAhYWFkLmFzc2V0RXhpc3RzKGFzc2V0S2V5KSB8fFxuICAgICAgICAhb3V0cHV0Lm1lZXRzVGhyZXNob2xkKGZyb21BZGRyZXNzZXMsIGFzT2YpXG4gICAgICApIHtcbiAgICAgICAgLy8gV2Ugc2hvdWxkIG9ubHkgdHJ5IHRvIHNwZW5kIGZ1bmdpYmxlIGFzc2V0cy5cbiAgICAgICAgLy8gV2Ugc2hvdWxkIG9ubHkgc3BlbmQge3sgYXNzZXRLZXkgfX0uXG4gICAgICAgIC8vIFdlIG5lZWQgdG8gYmUgYWJsZSB0byBzcGVuZCB0aGUgb3V0cHV0LlxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgYXNzZXRBbW91bnQ6IEFzc2V0QW1vdW50ID0gYWFkLmdldEFzc2V0QW1vdW50KGFzc2V0S2V5KVxuICAgICAgaWYgKGFzc2V0QW1vdW50LmlzRmluaXNoZWQoKSkge1xuICAgICAgICAvLyBXZSd2ZSBhbHJlYWR5IHNwZW50IHRoZSBuZWVkZWQgVVRYT3MgZm9yIHRoaXMgYXNzZXRJRC5cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICghKGFzc2V0S2V5IGluIG91dHMpKSB7XG4gICAgICAgIC8vIElmIHRoaXMgaXMgdGhlIGZpcnN0IHRpbWUgc3BlbmRpbmcgdGhpcyBhc3NldElELCB3ZSBuZWVkIHRvXG4gICAgICAgIC8vIGluaXRpYWxpemUgdGhlIG91dHMgb2JqZWN0IGNvcnJlY3RseS5cbiAgICAgICAgb3V0c1tgJHthc3NldEtleX1gXSA9IHtcbiAgICAgICAgICBsb2NrZWRTdGFrZWFibGU6IFtdLFxuICAgICAgICAgIHVubG9ja2VkOiBbXVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFtb3VudE91dHB1dDogQW1vdW50T3V0cHV0ID0gb3V0cHV0IGFzIEFtb3VudE91dHB1dFxuICAgICAgLy8gYW1vdW50IGlzIHRoZSBhbW91bnQgb2YgZnVuZHMgYXZhaWxhYmxlIGZyb20gdGhpcyBVVFhPLlxuICAgICAgY29uc3QgYW1vdW50ID0gYW1vdW50T3V0cHV0LmdldEFtb3VudCgpXG5cbiAgICAgIC8vIFNldCB1cCB0aGUgU0VDUCBpbnB1dCB3aXRoIHRoZSBzYW1lIGFtb3VudCBhcyB0aGUgb3V0cHV0LlxuICAgICAgbGV0IGlucHV0OiBBbW91bnRJbnB1dCA9IG5ldyBTRUNQVHJhbnNmZXJJbnB1dChhbW91bnQpXG5cbiAgICAgIGxldCBsb2NrZWQ6IGJvb2xlYW4gPSBmYWxzZVxuICAgICAgaWYgKGFtb3VudE91dHB1dCBpbnN0YW5jZW9mIFN0YWtlYWJsZUxvY2tPdXQpIHtcbiAgICAgICAgY29uc3Qgc3Rha2VhYmxlT3V0cHV0OiBTdGFrZWFibGVMb2NrT3V0ID1cbiAgICAgICAgICBhbW91bnRPdXRwdXQgYXMgU3Rha2VhYmxlTG9ja091dFxuICAgICAgICBjb25zdCBzdGFrZWFibGVMb2NrdGltZTogQk4gPSBzdGFrZWFibGVPdXRwdXQuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKVxuXG4gICAgICAgIGlmIChzdGFrZWFibGVMb2NrdGltZS5ndChhc09mKSkge1xuICAgICAgICAgIC8vIEFkZCBhIG5ldyBpbnB1dCBhbmQgbWFyayBpdCBhcyBiZWluZyBsb2NrZWQuXG4gICAgICAgICAgaW5wdXQgPSBuZXcgU3Rha2VhYmxlTG9ja0luKFxuICAgICAgICAgICAgYW1vdW50LFxuICAgICAgICAgICAgc3Rha2VhYmxlTG9ja3RpbWUsXG4gICAgICAgICAgICBuZXcgUGFyc2VhYmxlSW5wdXQoaW5wdXQpXG4gICAgICAgICAgKVxuXG4gICAgICAgICAgLy8gTWFyayB0aGlzIFVUWE8gYXMgaGF2aW5nIGJlZW4gcmUtbG9ja2VkLlxuICAgICAgICAgIGxvY2tlZCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBhc3NldEFtb3VudC5zcGVuZEFtb3VudChhbW91bnQsIGxvY2tlZClcbiAgICAgIGlmIChsb2NrZWQpIHtcbiAgICAgICAgLy8gVHJhY2sgdGhlIFVUWE8gYXMgbG9ja2VkLlxuICAgICAgICBvdXRzW2Ake2Fzc2V0S2V5fWBdLmxvY2tlZFN0YWtlYWJsZS5wdXNoKGFtb3VudE91dHB1dClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRyYWNrIHRoZSBVVFhPIGFzIHVubG9ja2VkLlxuICAgICAgICBvdXRzW2Ake2Fzc2V0S2V5fWBdLnVubG9ja2VkLnB1c2goYW1vdW50T3V0cHV0KVxuICAgICAgfVxuXG4gICAgICAvLyBHZXQgdGhlIGluZGljZXMgb2YgdGhlIG91dHB1dHMgdGhhdCBzaG91bGQgYmUgdXNlZCB0byBhdXRob3JpemUgdGhlXG4gICAgICAvLyBzcGVuZGluZyBvZiB0aGlzIGlucHV0LlxuXG4gICAgICAvLyBUT0RPOiBnZXRTcGVuZGVycyBzaG91bGQgcmV0dXJuIGFuIGFycmF5IG9mIGluZGljZXMgcmF0aGVyIHRoYW4gYW5cbiAgICAgIC8vIGFycmF5IG9mIGFkZHJlc3Nlcy5cbiAgICAgIGNvbnN0IHNwZW5kZXJzOiBCdWZmZXJbXSA9IGFtb3VudE91dHB1dC5nZXRTcGVuZGVycyhmcm9tQWRkcmVzc2VzLCBhc09mKVxuICAgICAgc3BlbmRlcnMuZm9yRWFjaCgoc3BlbmRlcjogQnVmZmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGlkeDogbnVtYmVyID0gYW1vdW50T3V0cHV0LmdldEFkZHJlc3NJZHgoc3BlbmRlcilcbiAgICAgICAgaWYgKGlkeCA9PT0gLTEpIHtcbiAgICAgICAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4sIHdoaWNoIGlzIHdoeSB0aGUgZXJyb3IgaXMgdGhyb3duIHJhdGhlclxuICAgICAgICAgIC8vIHRoYW4gYmVpbmcgcmV0dXJuZWQuIElmIHRoaXMgd2VyZSB0byBldmVyIGhhcHBlbiB0aGlzIHdvdWxkIGJlIGFuXG4gICAgICAgICAgLy8gZXJyb3IgaW4gdGhlIGludGVybmFsIGxvZ2ljIHJhdGhlciBoYXZpbmcgY2FsbGVkIHRoaXMgZnVuY3Rpb24gd2l0aFxuICAgICAgICAgIC8vIGludmFsaWQgYXJndW1lbnRzLlxuXG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICB0aHJvdyBuZXcgQWRkcmVzc0Vycm9yKFxuICAgICAgICAgICAgXCJFcnJvciAtIFVUWE9TZXQuZ2V0TWluaW11bVNwZW5kYWJsZTogbm8gc3VjaCBcIiArXG4gICAgICAgICAgICAgIGBhZGRyZXNzIGluIG91dHB1dDogJHtzcGVuZGVyfWBcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgICAgaW5wdXQuYWRkU2lnbmF0dXJlSWR4KGlkeCwgc3BlbmRlcilcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IHR4SUQ6IEJ1ZmZlciA9IHV0eG8uZ2V0VHhJRCgpXG4gICAgICBjb25zdCBvdXRwdXRJZHg6IEJ1ZmZlciA9IHV0eG8uZ2V0T3V0cHV0SWR4KClcbiAgICAgIGNvbnN0IHRyYW5zZmVySW5wdXQ6IFRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFRyYW5zZmVyYWJsZUlucHV0KFxuICAgICAgICB0eElELFxuICAgICAgICBvdXRwdXRJZHgsXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIGlucHV0XG4gICAgICApXG4gICAgICBhYWQuYWRkSW5wdXQodHJhbnNmZXJJbnB1dClcbiAgICB9KVxuXG4gICAgaWYgKCFhYWQuY2FuQ29tcGxldGUoKSkge1xuICAgICAgLy8gQWZ0ZXIgcnVubmluZyB0aHJvdWdoIGFsbCB0aGUgVVRYT3MsIHdlIHN0aWxsIHdlcmVuJ3QgYWJsZSB0byBnZXQgYWxsXG4gICAgICAvLyB0aGUgbmVjZXNzYXJ5IGZ1bmRzLCBzbyB0aGlzIHRyYW5zYWN0aW9uIGNhbid0IGJlIG1hZGUuXG4gICAgICByZXR1cm4gbmV3IEluc3VmZmljaWVudEZ1bmRzRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBVVFhPU2V0LmdldE1pbmltdW1TcGVuZGFibGU6IGluc3VmZmljaWVudCBcIiArXG4gICAgICAgICAgXCJmdW5kcyB0byBjcmVhdGUgdGhlIHRyYW5zYWN0aW9uXCJcbiAgICAgIClcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBXZSBzaG91bGQgc2VwYXJhdGUgdGhlIGFib3ZlIGZ1bmN0aW9uYWxpdHkgaW50byBhIHNpbmdsZSBmdW5jdGlvblxuICAgIC8vIHRoYXQganVzdCBzZWxlY3RzIHRoZSBVVFhPcyB0byBjb25zdW1lLlxuXG4gICAgY29uc3QgemVybzogQk4gPSBuZXcgQk4oMClcblxuICAgIC8vIGFzc2V0QW1vdW50cyBpcyBhbiBhcnJheSBvZiBhc3NldCBkZXNjcmlwdGlvbnMgYW5kIGhvdyBtdWNoIGlzIGxlZnQgdG9cbiAgICAvLyBzcGVuZCBmb3IgdGhlbS5cbiAgICBjb25zdCBhc3NldEFtb3VudHM6IEFzc2V0QW1vdW50W10gPSBhYWQuZ2V0QW1vdW50cygpXG4gICAgYXNzZXRBbW91bnRzLmZvckVhY2goKGFzc2V0QW1vdW50OiBBc3NldEFtb3VudCkgPT4ge1xuICAgICAgLy8gY2hhbmdlIGlzIHRoZSBhbW91bnQgdGhhdCBzaG91bGQgYmUgcmV0dXJuZWQgYmFjayB0byB0aGUgc291cmNlIG9mIHRoZVxuICAgICAgLy8gZnVuZHMuXG4gICAgICBjb25zdCBjaGFuZ2U6IEJOID0gYXNzZXRBbW91bnQuZ2V0Q2hhbmdlKClcbiAgICAgIC8vIGlzU3Rha2VhYmxlTG9ja0NoYW5nZSBpcyBpZiB0aGUgY2hhbmdlIGlzIGxvY2tlZCBvciBub3QuXG4gICAgICBjb25zdCBpc1N0YWtlYWJsZUxvY2tDaGFuZ2U6IGJvb2xlYW4gPVxuICAgICAgICBhc3NldEFtb3VudC5nZXRTdGFrZWFibGVMb2NrQ2hhbmdlKClcbiAgICAgIC8vIGxvY2tlZENoYW5nZSBpcyB0aGUgYW1vdW50IG9mIGxvY2tlZCBjaGFuZ2UgdGhhdCBzaG91bGQgYmUgcmV0dXJuZWQgdG9cbiAgICAgIC8vIHRoZSBzZW5kZXJcbiAgICAgIGNvbnN0IGxvY2tlZENoYW5nZTogQk4gPSBpc1N0YWtlYWJsZUxvY2tDaGFuZ2UgPyBjaGFuZ2UgOiB6ZXJvLmNsb25lKClcblxuICAgICAgY29uc3QgYXNzZXRJRDogQnVmZmVyID0gYXNzZXRBbW91bnQuZ2V0QXNzZXRJRCgpXG4gICAgICBjb25zdCBhc3NldEtleTogc3RyaW5nID0gYXNzZXRBbW91bnQuZ2V0QXNzZXRJRFN0cmluZygpXG4gICAgICBjb25zdCBsb2NrZWRPdXRwdXRzOiBTdGFrZWFibGVMb2NrT3V0W10gPVxuICAgICAgICBvdXRzW2Ake2Fzc2V0S2V5fWBdLmxvY2tlZFN0YWtlYWJsZVxuICAgICAgbG9ja2VkT3V0cHV0cy5mb3JFYWNoKChsb2NrZWRPdXRwdXQ6IFN0YWtlYWJsZUxvY2tPdXQsIGk6IG51bWJlcikgPT4ge1xuICAgICAgICBjb25zdCBzdGFrZWFibGVMb2NrdGltZTogQk4gPSBsb2NrZWRPdXRwdXQuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKVxuICAgICAgICBjb25zdCBwYXJzZWFibGVPdXRwdXQ6IFBhcnNlYWJsZU91dHB1dCA9XG4gICAgICAgICAgbG9ja2VkT3V0cHV0LmdldFRyYW5zZmVyYWJsZU91dHB1dCgpXG5cbiAgICAgICAgLy8gV2Uga25vdyB0aGF0IHBhcnNlYWJsZU91dHB1dCBjb250YWlucyBhbiBBbW91bnRPdXRwdXQgYmVjYXVzZSB0aGVcbiAgICAgICAgLy8gZmlyc3QgbG9vcCBmaWx0ZXJzIGZvciBmdW5naWJsZSBhc3NldHMuXG4gICAgICAgIGNvbnN0IG91dHB1dDogQW1vdW50T3V0cHV0ID0gcGFyc2VhYmxlT3V0cHV0LmdldE91dHB1dCgpIGFzIEFtb3VudE91dHB1dFxuXG4gICAgICAgIGxldCBvdXRwdXRBbW91bnRSZW1haW5pbmc6IEJOID0gb3V0cHV0LmdldEFtb3VudCgpXG4gICAgICAgIC8vIFRoZSBvbmx5IG91dHB1dCB0aGF0IGNvdWxkIGdlbmVyYXRlIGNoYW5nZSBpcyB0aGUgbGFzdCBvdXRwdXQuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgYW55IGZ1cnRoZXIgVVRYT3Mgd291bGRuJ3QgaGF2ZSBuZWVkZWQgdG8gYmUgc3BlbnQuXG4gICAgICAgIGlmIChpID09IGxvY2tlZE91dHB1dHMubGVuZ3RoIC0gMSAmJiBsb2NrZWRDaGFuZ2UuZ3QoemVybykpIHtcbiAgICAgICAgICAvLyB1cGRhdGUgb3V0cHV0QW1vdW50UmVtYWluaW5nIHRvIG5vIGxvbmdlciBob2xkIHRoZSBjaGFuZ2UgdGhhdCB3ZVxuICAgICAgICAgIC8vIGFyZSByZXR1cm5pbmcuXG4gICAgICAgICAgb3V0cHV0QW1vdW50UmVtYWluaW5nID0gb3V0cHV0QW1vdW50UmVtYWluaW5nLnN1Yihsb2NrZWRDaGFuZ2UpXG4gICAgICAgICAgLy8gQ3JlYXRlIHRoZSBpbm5lciBvdXRwdXQuXG4gICAgICAgICAgY29uc3QgbmV3Q2hhbmdlT3V0cHV0OiBBbW91bnRPdXRwdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhcbiAgICAgICAgICAgIG91dHB1dC5nZXRPdXRwdXRJRCgpLFxuICAgICAgICAgICAgbG9ja2VkQ2hhbmdlLFxuICAgICAgICAgICAgb3V0cHV0LmdldEFkZHJlc3NlcygpLFxuICAgICAgICAgICAgb3V0cHV0LmdldExvY2t0aW1lKCksXG4gICAgICAgICAgICBvdXRwdXQuZ2V0VGhyZXNob2xkKClcbiAgICAgICAgICApIGFzIEFtb3VudE91dHB1dFxuICAgICAgICAgIC8vIFdyYXAgdGhlIGlubmVyIG91dHB1dCBpbiB0aGUgU3Rha2VhYmxlTG9ja091dCB3cmFwcGVyLlxuICAgICAgICAgIGxldCBuZXdMb2NrZWRDaGFuZ2VPdXRwdXQ6IFN0YWtlYWJsZUxvY2tPdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhcbiAgICAgICAgICAgIGxvY2tlZE91dHB1dC5nZXRPdXRwdXRJRCgpLFxuICAgICAgICAgICAgbG9ja2VkQ2hhbmdlLFxuICAgICAgICAgICAgb3V0cHV0LmdldEFkZHJlc3NlcygpLFxuICAgICAgICAgICAgb3V0cHV0LmdldExvY2t0aW1lKCksXG4gICAgICAgICAgICBvdXRwdXQuZ2V0VGhyZXNob2xkKCksXG4gICAgICAgICAgICBzdGFrZWFibGVMb2NrdGltZSxcbiAgICAgICAgICAgIG5ldyBQYXJzZWFibGVPdXRwdXQobmV3Q2hhbmdlT3V0cHV0KVxuICAgICAgICAgICkgYXMgU3Rha2VhYmxlTG9ja091dFxuICAgICAgICAgIGNvbnN0IHRyYW5zZmVyT3V0cHV0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KFxuICAgICAgICAgICAgYXNzZXRJRCxcbiAgICAgICAgICAgIG5ld0xvY2tlZENoYW5nZU91dHB1dFxuICAgICAgICAgIClcbiAgICAgICAgICBhYWQuYWRkQ2hhbmdlKHRyYW5zZmVyT3V0cHV0KVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2Uga25vdyB0aGF0IG91dHB1dEFtb3VudFJlbWFpbmluZyA+IDAuIE90aGVyd2lzZSwgd2Ugd291bGQgbmV2ZXJcbiAgICAgICAgLy8gaGF2ZSBjb25zdW1lZCB0aGlzIFVUWE8sIGFzIGl0IHdvdWxkIGJlIG9ubHkgY2hhbmdlLlxuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgaW5uZXIgb3V0cHV0LlxuICAgICAgICBjb25zdCBuZXdPdXRwdXQ6IEFtb3VudE91dHB1dCA9IFNlbGVjdE91dHB1dENsYXNzKFxuICAgICAgICAgIG91dHB1dC5nZXRPdXRwdXRJRCgpLFxuICAgICAgICAgIG91dHB1dEFtb3VudFJlbWFpbmluZyxcbiAgICAgICAgICBvdXRwdXQuZ2V0QWRkcmVzc2VzKCksXG4gICAgICAgICAgb3V0cHV0LmdldExvY2t0aW1lKCksXG4gICAgICAgICAgb3V0cHV0LmdldFRocmVzaG9sZCgpXG4gICAgICAgICkgYXMgQW1vdW50T3V0cHV0XG4gICAgICAgIC8vIFdyYXAgdGhlIGlubmVyIG91dHB1dCBpbiB0aGUgU3Rha2VhYmxlTG9ja091dCB3cmFwcGVyLlxuICAgICAgICBjb25zdCBuZXdMb2NrZWRPdXRwdXQ6IFN0YWtlYWJsZUxvY2tPdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhcbiAgICAgICAgICBsb2NrZWRPdXRwdXQuZ2V0T3V0cHV0SUQoKSxcbiAgICAgICAgICBvdXRwdXRBbW91bnRSZW1haW5pbmcsXG4gICAgICAgICAgb3V0cHV0LmdldEFkZHJlc3NlcygpLFxuICAgICAgICAgIG91dHB1dC5nZXRMb2NrdGltZSgpLFxuICAgICAgICAgIG91dHB1dC5nZXRUaHJlc2hvbGQoKSxcbiAgICAgICAgICBzdGFrZWFibGVMb2NrdGltZSxcbiAgICAgICAgICBuZXcgUGFyc2VhYmxlT3V0cHV0KG5ld091dHB1dClcbiAgICAgICAgKSBhcyBTdGFrZWFibGVMb2NrT3V0XG4gICAgICAgIGNvbnN0IHRyYW5zZmVyT3V0cHV0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KFxuICAgICAgICAgIGFzc2V0SUQsXG4gICAgICAgICAgbmV3TG9ja2VkT3V0cHV0XG4gICAgICAgIClcbiAgICAgICAgYWFkLmFkZE91dHB1dCh0cmFuc2Zlck91dHB1dClcbiAgICAgIH0pXG5cbiAgICAgIC8vIHVubG9ja2VkQ2hhbmdlIGlzIHRoZSBhbW91bnQgb2YgdW5sb2NrZWQgY2hhbmdlIHRoYXQgc2hvdWxkIGJlIHJldHVybmVkXG4gICAgICAvLyB0byB0aGUgc2VuZGVyXG4gICAgICBjb25zdCB1bmxvY2tlZENoYW5nZTogQk4gPSBpc1N0YWtlYWJsZUxvY2tDaGFuZ2UgPyB6ZXJvLmNsb25lKCkgOiBjaGFuZ2VcbiAgICAgIGlmICh1bmxvY2tlZENoYW5nZS5ndCh6ZXJvKSkge1xuICAgICAgICBjb25zdCBuZXdDaGFuZ2VPdXRwdXQ6IEFtb3VudE91dHB1dCA9IG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQoXG4gICAgICAgICAgdW5sb2NrZWRDaGFuZ2UsXG4gICAgICAgICAgYWFkLmdldENoYW5nZUFkZHJlc3NlcygpLFxuICAgICAgICAgIHplcm8uY2xvbmUoKSwgLy8gbWFrZSBzdXJlIHRoYXQgd2UgZG9uJ3QgbG9jayB0aGUgY2hhbmdlIG91dHB1dC5cbiAgICAgICAgICAxIC8vIG9ubHkgcmVxdWlyZSBvbmUgb2YgdGhlIGNoYW5nZXMgYWRkcmVzc2VzIHRvIHNwZW5kIHRoaXMgb3V0cHV0LlxuICAgICAgICApIGFzIEFtb3VudE91dHB1dFxuICAgICAgICBjb25zdCB0cmFuc2Zlck91dHB1dDogVHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dChcbiAgICAgICAgICBhc3NldElELFxuICAgICAgICAgIG5ld0NoYW5nZU91dHB1dFxuICAgICAgICApXG4gICAgICAgIGFhZC5hZGRDaGFuZ2UodHJhbnNmZXJPdXRwdXQpXG4gICAgICB9XG5cbiAgICAgIC8vIHRvdGFsQW1vdW50U3BlbnQgaXMgdGhlIHRvdGFsIGFtb3VudCBvZiB0b2tlbnMgY29uc3VtZWQuXG4gICAgICBjb25zdCB0b3RhbEFtb3VudFNwZW50OiBCTiA9IGFzc2V0QW1vdW50LmdldFNwZW50KClcbiAgICAgIC8vIHN0YWtlYWJsZUxvY2tlZEFtb3VudCBpcyB0aGUgdG90YWwgYW1vdW50IG9mIGxvY2tlZCB0b2tlbnMgY29uc3VtZWQuXG4gICAgICBjb25zdCBzdGFrZWFibGVMb2NrZWRBbW91bnQ6IEJOID0gYXNzZXRBbW91bnQuZ2V0U3Rha2VhYmxlTG9ja1NwZW50KClcbiAgICAgIC8vIHRvdGFsVW5sb2NrZWRTcGVudCBpcyB0aGUgdG90YWwgYW1vdW50IG9mIHVubG9ja2VkIHRva2VucyBjb25zdW1lZC5cbiAgICAgIGNvbnN0IHRvdGFsVW5sb2NrZWRTcGVudDogQk4gPSB0b3RhbEFtb3VudFNwZW50LnN1YihzdGFrZWFibGVMb2NrZWRBbW91bnQpXG4gICAgICAvLyBhbW91bnRCdXJudCBpcyB0aGUgYW1vdW50IG9mIHVubG9ja2VkIHRva2VucyB0aGF0IG11c3QgYmUgYnVybi5cbiAgICAgIGNvbnN0IGFtb3VudEJ1cm50OiBCTiA9IGFzc2V0QW1vdW50LmdldEJ1cm4oKVxuICAgICAgLy8gdG90YWxVbmxvY2tlZEF2YWlsYWJsZSBpcyB0aGUgdG90YWwgYW1vdW50IG9mIHVubG9ja2VkIHRva2VucyBhdmFpbGFibGVcbiAgICAgIC8vIHRvIGJlIHByb2R1Y2VkLlxuICAgICAgY29uc3QgdG90YWxVbmxvY2tlZEF2YWlsYWJsZTogQk4gPSB0b3RhbFVubG9ja2VkU3BlbnQuc3ViKGFtb3VudEJ1cm50KVxuICAgICAgLy8gdW5sb2NrZWRBbW91bnQgaXMgdGhlIGFtb3VudCBvZiB1bmxvY2tlZCB0b2tlbnMgdGhhdCBzaG91bGQgYmUgc2VudC5cbiAgICAgIGNvbnN0IHVubG9ja2VkQW1vdW50OiBCTiA9IHRvdGFsVW5sb2NrZWRBdmFpbGFibGUuc3ViKHVubG9ja2VkQ2hhbmdlKVxuICAgICAgaWYgKHVubG9ja2VkQW1vdW50Lmd0KHplcm8pKSB7XG4gICAgICAgIGNvbnN0IG5ld091dHB1dDogQW1vdW50T3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChcbiAgICAgICAgICB1bmxvY2tlZEFtb3VudCxcbiAgICAgICAgICBhYWQuZ2V0RGVzdGluYXRpb25zKCksXG4gICAgICAgICAgbG9ja3RpbWUsXG4gICAgICAgICAgdGhyZXNob2xkXG4gICAgICAgICkgYXMgQW1vdW50T3V0cHV0XG4gICAgICAgIGNvbnN0IHRyYW5zZmVyT3V0cHV0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KFxuICAgICAgICAgIGFzc2V0SUQsXG4gICAgICAgICAgbmV3T3V0cHV0XG4gICAgICAgIClcbiAgICAgICAgYWFkLmFkZE91dHB1dCh0cmFuc2Zlck91dHB1dClcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIFtbVW5zaWduZWRUeF1dIHdyYXBwaW5nIGEgW1tCYXNlVHhdXS4gRm9yIG1vcmUgZ3JhbnVsYXIgY29udHJvbCwgeW91IG1heSBjcmVhdGUgeW91ciBvd25cbiAgICogW1tVbnNpZ25lZFR4XV0gd3JhcHBpbmcgYSBbW0Jhc2VUeF1dIG1hbnVhbGx5ICh3aXRoIHRoZWlyIGNvcnJlc3BvbmRpbmcgW1tUcmFuc2ZlcmFibGVJbnB1dF1dcyBhbmQgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXMpLlxuICAgKlxuICAgKiBAcGFyYW0gbmV0d29ya0lEIFRoZSBudW1iZXIgcmVwcmVzZW50aW5nIE5ldHdvcmtJRCBvZiB0aGUgbm9kZVxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIFRoZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRpbmcgdGhlIEJsb2NrY2hhaW5JRCBmb3IgdGhlIHRyYW5zYWN0aW9uXG4gICAqIEBwYXJhbSBhbW91bnQgVGhlIGFtb3VudCBvZiB0aGUgYXNzZXQgdG8gYmUgc3BlbnQgaW4gaXRzIHNtYWxsZXN0IGRlbm9taW5hdGlvbiwgcmVwcmVzZW50ZWQgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0uXG4gICAqIEBwYXJhbSBhc3NldElEIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9mIHRoZSBhc3NldCBJRCBmb3IgdGhlIFVUWE9cbiAgICogQHBhcmFtIHRvQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdG8gc2VuZCB0aGUgZnVuZHNcbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgT3B0aW9uYWwuIFRoZSBhZGRyZXNzZXMgdGhhdCBjYW4gc3BlbmQgdGhlIGNoYW5nZSByZW1haW5pbmcgZnJvbSB0aGUgc3BlbnQgVVRYT3MuIERlZmF1bHQ6IHRvQWRkcmVzc2VzXG4gICAqIEBwYXJhbSBmZWUgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgZmVlcyB0byBidXJuIGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBmZWVBc3NldElEIE9wdGlvbmFsLiBUaGUgYXNzZXRJRCBvZiB0aGUgZmVlcyBiZWluZyBidXJuZWQuIERlZmF1bHQ6IGFzc2V0SURcbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwuIENvbnRhaW5zIGFyYml0cmFyeSBkYXRhLCB1cCB0byAyNTYgYnl0ZXNcbiAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIGxvY2t0aW1lIE9wdGlvbmFsLiBUaGUgbG9ja3RpbWUgZmllbGQgY3JlYXRlZCBpbiB0aGUgcmVzdWx0aW5nIG91dHB1dHNcbiAgICogQHBhcmFtIHRocmVzaG9sZCBPcHRpb25hbC4gVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBmdW5kcyBpbiB0aGUgcmVzdWx0YW50IFVUWE9cbiAgICpcbiAgICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gY3JlYXRlZCBmcm9tIHRoZSBwYXNzZWQgaW4gcGFyYW1ldGVycy5cbiAgICpcbiAgICovXG4gIGJ1aWxkQmFzZVR4ID0gKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyLFxuICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyLFxuICAgIGFtb3VudDogQk4sXG4gICAgYXNzZXRJRDogQnVmZmVyLFxuICAgIHRvQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBmcm9tQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IEJ1ZmZlcltdID0gdW5kZWZpbmVkLFxuICAgIGZlZTogQk4gPSB1bmRlZmluZWQsXG4gICAgZmVlQXNzZXRJRDogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKSxcbiAgICBsb2NrdGltZTogQk4gPSBuZXcgQk4oMCksXG4gICAgdGhyZXNob2xkOiBudW1iZXIgPSAxXG4gICk6IFVuc2lnbmVkVHggPT4ge1xuICAgIGlmICh0aHJlc2hvbGQgPiB0b0FkZHJlc3Nlcy5sZW5ndGgpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgVGhyZXNob2xkRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBVVFhPU2V0LmJ1aWxkQmFzZVR4OiB0aHJlc2hvbGQgaXMgZ3JlYXRlciB0aGFuIG51bWJlciBvZiBhZGRyZXNzZXNcIlxuICAgICAgKVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgY2hhbmdlQWRkcmVzc2VzID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBjaGFuZ2VBZGRyZXNzZXMgPSB0b0FkZHJlc3Nlc1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZmVlQXNzZXRJRCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgZmVlQXNzZXRJRCA9IGFzc2V0SURcbiAgICB9XG5cbiAgICBjb25zdCB6ZXJvOiBCTiA9IG5ldyBCTigwKVxuXG4gICAgaWYgKGFtb3VudC5lcSh6ZXJvKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cblxuICAgIGNvbnN0IGFhZDogQXNzZXRBbW91bnREZXN0aW5hdGlvbiA9IG5ldyBBc3NldEFtb3VudERlc3RpbmF0aW9uKFxuICAgICAgdG9BZGRyZXNzZXMsXG4gICAgICBmcm9tQWRkcmVzc2VzLFxuICAgICAgY2hhbmdlQWRkcmVzc2VzXG4gICAgKVxuICAgIGlmIChhc3NldElELnRvU3RyaW5nKFwiaGV4XCIpID09PSBmZWVBc3NldElELnRvU3RyaW5nKFwiaGV4XCIpKSB7XG4gICAgICBhYWQuYWRkQXNzZXRBbW91bnQoYXNzZXRJRCwgYW1vdW50LCBmZWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChhc3NldElELCBhbW91bnQsIHplcm8pXG4gICAgICBpZiAodGhpcy5fZmVlQ2hlY2soZmVlLCBmZWVBc3NldElEKSkge1xuICAgICAgICBhYWQuYWRkQXNzZXRBbW91bnQoZmVlQXNzZXRJRCwgemVybywgZmVlKVxuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXVxuICAgIGxldCBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IFtdXG5cbiAgICBjb25zdCBtaW5TcGVuZGFibGVFcnI6IEVycm9yID0gdGhpcy5nZXRNaW5pbXVtU3BlbmRhYmxlKFxuICAgICAgYWFkLFxuICAgICAgYXNPZixcbiAgICAgIGxvY2t0aW1lLFxuICAgICAgdGhyZXNob2xkXG4gICAgKVxuICAgIGlmICh0eXBlb2YgbWluU3BlbmRhYmxlRXJyID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpbnMgPSBhYWQuZ2V0SW5wdXRzKClcbiAgICAgIG91dHMgPSBhYWQuZ2V0QWxsT3V0cHV0cygpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG1pblNwZW5kYWJsZUVyclxuICAgIH1cblxuICAgIGNvbnN0IGJhc2VUeDogQmFzZVR4ID0gbmV3IEJhc2VUeChuZXR3b3JrSUQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zLCBtZW1vKVxuICAgIHJldHVybiBuZXcgVW5zaWduZWRUeChiYXNlVHgpXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiB1bnNpZ25lZCBJbXBvcnRUeCB0cmFuc2FjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIG5ldHdvcmtJRCBUaGUgbnVtYmVyIHJlcHJlc2VudGluZyBOZXR3b3JrSUQgb2YgdGhlIG5vZGVcbiAgICogQHBhcmFtIGJsb2NrY2hhaW5JRCBUaGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBCbG9ja2NoYWluSUQgZm9yIHRoZSB0cmFuc2FjdGlvblxuICAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0byBzZW5kIHRoZSBmdW5kc1xuICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIGJlaW5nIHVzZWQgdG8gc2VuZCB0aGUgZnVuZHMgZnJvbSB0aGUgVVRYT3Mge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBPcHRpb25hbC4gVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPcy4gRGVmYXVsdDogdG9BZGRyZXNzZXNcbiAgICogQHBhcmFtIGltcG9ydElucyBBbiBhcnJheSBvZiBbW1RyYW5zZmVyYWJsZUlucHV0XV1zIGJlaW5nIGltcG9ydGVkXG4gICAqIEBwYXJhbSBzb3VyY2VDaGFpbiBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgY2hhaW5pZCB3aGVyZSB0aGUgaW1wb3J0cyBhcmUgY29taW5nIGZyb20uXG4gICAqIEBwYXJhbSBmZWUgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgZmVlcyB0byBidXJuIGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59LiBGZWUgd2lsbCBjb21lIGZyb20gdGhlIGlucHV0cyBmaXJzdCwgaWYgdGhleSBjYW4uXG4gICAqIEBwYXJhbSBmZWVBc3NldElEIE9wdGlvbmFsLiBUaGUgYXNzZXRJRCBvZiB0aGUgZmVlcyBiZWluZyBidXJuZWQuXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBsb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyBvdXRwdXRzXG4gICAqIEBwYXJhbSB0aHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBVVFhPXG4gICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICAqXG4gICAqL1xuICBidWlsZEltcG9ydFR4ID0gKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyLFxuICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyLFxuICAgIHRvQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBmcm9tQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IEJ1ZmZlcltdLFxuICAgIGF0b21pY3M6IFVUWE9bXSxcbiAgICBzb3VyY2VDaGFpbjogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGZlZTogQk4gPSB1bmRlZmluZWQsXG4gICAgZmVlQXNzZXRJRDogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKSxcbiAgICBsb2NrdGltZTogQk4gPSBuZXcgQk4oMCksXG4gICAgdGhyZXNob2xkOiBudW1iZXIgPSAxXG4gICk6IFVuc2lnbmVkVHggPT4ge1xuICAgIGNvbnN0IHplcm86IEJOID0gbmV3IEJOKDApXG4gICAgbGV0IGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IFtdXG4gICAgbGV0IG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW11cbiAgICBpZiAodHlwZW9mIGZlZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgZmVlID0gemVyby5jbG9uZSgpXG4gICAgfVxuXG4gICAgY29uc3QgaW1wb3J0SW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gW11cbiAgICBsZXQgZmVlcGFpZDogQk4gPSBuZXcgQk4oMClcbiAgICBsZXQgZmVlQXNzZXRTdHI6IHN0cmluZyA9IGZlZUFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIilcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgYXRvbWljcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgdXR4bzogVVRYTyA9IGF0b21pY3NbYCR7aX1gXVxuICAgICAgY29uc3QgYXNzZXRJRDogQnVmZmVyID0gdXR4by5nZXRBc3NldElEKClcbiAgICAgIGNvbnN0IG91dHB1dDogQW1vdW50T3V0cHV0ID0gdXR4by5nZXRPdXRwdXQoKSBhcyBBbW91bnRPdXRwdXRcbiAgICAgIGxldCBhbXQ6IEJOID0gb3V0cHV0LmdldEFtb3VudCgpLmNsb25lKClcblxuICAgICAgbGV0IGluZmVlYW1vdW50ID0gYW10LmNsb25lKClcbiAgICAgIGxldCBhc3NldFN0cjogc3RyaW5nID0gYXNzZXRJRC50b1N0cmluZyhcImhleFwiKVxuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgZmVlQXNzZXRJRCAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgICBmZWUuZ3QoemVybykgJiZcbiAgICAgICAgZmVlcGFpZC5sdChmZWUpICYmXG4gICAgICAgIGFzc2V0U3RyID09PSBmZWVBc3NldFN0clxuICAgICAgKSB7XG4gICAgICAgIGZlZXBhaWQgPSBmZWVwYWlkLmFkZChpbmZlZWFtb3VudClcbiAgICAgICAgaWYgKGZlZXBhaWQuZ3RlKGZlZSkpIHtcbiAgICAgICAgICBpbmZlZWFtb3VudCA9IGZlZXBhaWQuc3ViKGZlZSlcbiAgICAgICAgICBmZWVwYWlkID0gZmVlLmNsb25lKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbmZlZWFtb3VudCA9IHplcm8uY2xvbmUoKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHR4aWQ6IEJ1ZmZlciA9IHV0eG8uZ2V0VHhJRCgpXG4gICAgICBjb25zdCBvdXRwdXRpZHg6IEJ1ZmZlciA9IHV0eG8uZ2V0T3V0cHV0SWR4KClcbiAgICAgIGNvbnN0IGlucHV0OiBTRUNQVHJhbnNmZXJJbnB1dCA9IG5ldyBTRUNQVHJhbnNmZXJJbnB1dChhbXQpXG4gICAgICBjb25zdCB4ZmVyaW46IFRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFRyYW5zZmVyYWJsZUlucHV0KFxuICAgICAgICB0eGlkLFxuICAgICAgICBvdXRwdXRpZHgsXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIGlucHV0XG4gICAgICApXG4gICAgICBjb25zdCBmcm9tOiBCdWZmZXJbXSA9IG91dHB1dC5nZXRBZGRyZXNzZXMoKVxuICAgICAgY29uc3Qgc3BlbmRlcnM6IEJ1ZmZlcltdID0gb3V0cHV0LmdldFNwZW5kZXJzKGZyb20sIGFzT2YpXG4gICAgICBmb3IgKGxldCBqOiBudW1iZXIgPSAwOyBqIDwgc3BlbmRlcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3QgaWR4OiBudW1iZXIgPSBvdXRwdXQuZ2V0QWRkcmVzc0lkeChzcGVuZGVyc1tgJHtqfWBdKVxuICAgICAgICBpZiAoaWR4ID09PSAtMSkge1xuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgdGhyb3cgbmV3IEFkZHJlc3NFcnJvcihcbiAgICAgICAgICAgIFwiRXJyb3IgLSBVVFhPU2V0LmJ1aWxkSW1wb3J0VHg6IG5vIHN1Y2ggXCIgK1xuICAgICAgICAgICAgICBgYWRkcmVzcyBpbiBvdXRwdXQ6ICR7c3BlbmRlcnNbYCR7an1gXX1gXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIHhmZXJpbi5nZXRJbnB1dCgpLmFkZFNpZ25hdHVyZUlkeChpZHgsIHNwZW5kZXJzW2Ake2p9YF0pXG4gICAgICB9XG4gICAgICBpbXBvcnRJbnMucHVzaCh4ZmVyaW4pXG4gICAgICAvL2FkZCBleHRyYSBvdXRwdXRzIGZvciBlYWNoIGFtb3VudCAoY2FsY3VsYXRlZCBmcm9tIHRoZSBpbXBvcnRlZCBpbnB1dHMpLCBtaW51cyBmZWVzXG4gICAgICBpZiAoaW5mZWVhbW91bnQuZ3QoemVybykpIHtcbiAgICAgICAgY29uc3Qgc3BlbmRvdXQ6IEFtb3VudE91dHB1dCA9IFNlbGVjdE91dHB1dENsYXNzKFxuICAgICAgICAgIG91dHB1dC5nZXRPdXRwdXRJRCgpLFxuICAgICAgICAgIGluZmVlYW1vdW50LFxuICAgICAgICAgIHRvQWRkcmVzc2VzLFxuICAgICAgICAgIGxvY2t0aW1lLFxuICAgICAgICAgIHRocmVzaG9sZFxuICAgICAgICApIGFzIEFtb3VudE91dHB1dFxuICAgICAgICBjb25zdCB4ZmVyb3V0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KFxuICAgICAgICAgIGFzc2V0SUQsXG4gICAgICAgICAgc3BlbmRvdXRcbiAgICAgICAgKVxuICAgICAgICBvdXRzLnB1c2goeGZlcm91dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBnZXQgcmVtYWluaW5nIGZlZXMgZnJvbSB0aGUgcHJvdmlkZWQgYWRkcmVzc2VzXG4gICAgbGV0IGZlZVJlbWFpbmluZzogQk4gPSBmZWUuc3ViKGZlZXBhaWQpXG4gICAgaWYgKGZlZVJlbWFpbmluZy5ndCh6ZXJvKSAmJiB0aGlzLl9mZWVDaGVjayhmZWVSZW1haW5pbmcsIGZlZUFzc2V0SUQpKSB7XG4gICAgICBjb25zdCBhYWQ6IEFzc2V0QW1vdW50RGVzdGluYXRpb24gPSBuZXcgQXNzZXRBbW91bnREZXN0aW5hdGlvbihcbiAgICAgICAgdG9BZGRyZXNzZXMsXG4gICAgICAgIGZyb21BZGRyZXNzZXMsXG4gICAgICAgIGNoYW5nZUFkZHJlc3Nlc1xuICAgICAgKVxuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGZlZUFzc2V0SUQsIHplcm8sIGZlZVJlbWFpbmluZylcbiAgICAgIGNvbnN0IG1pblNwZW5kYWJsZUVycjogRXJyb3IgPSB0aGlzLmdldE1pbmltdW1TcGVuZGFibGUoXG4gICAgICAgIGFhZCxcbiAgICAgICAgYXNPZixcbiAgICAgICAgbG9ja3RpbWUsXG4gICAgICAgIHRocmVzaG9sZFxuICAgICAgKVxuICAgICAgaWYgKHR5cGVvZiBtaW5TcGVuZGFibGVFcnIgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaW5zID0gYWFkLmdldElucHV0cygpXG4gICAgICAgIG91dHMgPSBhYWQuZ2V0QWxsT3V0cHV0cygpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBtaW5TcGVuZGFibGVFcnJcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbXBvcnRUeDogSW1wb3J0VHggPSBuZXcgSW1wb3J0VHgoXG4gICAgICBuZXR3b3JrSUQsXG4gICAgICBibG9ja2NoYWluSUQsXG4gICAgICBvdXRzLFxuICAgICAgaW5zLFxuICAgICAgbWVtbyxcbiAgICAgIHNvdXJjZUNoYWluLFxuICAgICAgaW1wb3J0SW5zXG4gICAgKVxuICAgIHJldHVybiBuZXcgVW5zaWduZWRUeChpbXBvcnRUeClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIHVuc2lnbmVkIEV4cG9ydFR4IHRyYW5zYWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gbmV0d29ya0lEIFRoZSBudW1iZXIgcmVwcmVzZW50aW5nIE5ldHdvcmtJRCBvZiB0aGUgbm9kZVxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIFRoZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRpbmcgdGhlIEJsb2NrY2hhaW5JRCBmb3IgdGhlIHRyYW5zYWN0aW9uXG4gICAqIEBwYXJhbSBhbW91bnQgVGhlIGFtb3VudCBiZWluZyBleHBvcnRlZCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBkanR4QXNzZXRJRCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvZiB0aGUgYXNzZXQgSUQgZm9yIERKVFhcbiAgICogQHBhcmFtIHRvQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gcmVjaWV2ZXMgdGhlIERKVFhcbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBvd25zIHRoZSBESlRYXG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBnZXRzIHRoZSBjaGFuZ2UgbGVmdG92ZXIgb2YgdGhlIERKVFhcbiAgICogQHBhcmFtIGRlc3RpbmF0aW9uQ2hhaW4gT3B0aW9uYWwuIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBjaGFpbmlkIHdoZXJlIHRvIHNlbmQgdGhlIGFzc2V0LlxuICAgKiBAcGFyYW0gZmVlIE9wdGlvbmFsLiBUaGUgYW1vdW50IG9mIGZlZXMgdG8gYnVybiBpbiBpdHMgc21hbGxlc3QgZGVub21pbmF0aW9uLCByZXByZXNlbnRlZCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gZmVlQXNzZXRJRCBPcHRpb25hbC4gVGhlIGFzc2V0SUQgb2YgdGhlIGZlZXMgYmVpbmcgYnVybmVkLlxuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gbG9ja3RpbWUgT3B0aW9uYWwuIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgb3V0cHV0c1xuICAgKiBAcGFyYW0gdGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgVVRYT1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKi9cbiAgYnVpbGRFeHBvcnRUeCA9IChcbiAgICBuZXR3b3JrSUQ6IG51bWJlcixcbiAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlcixcbiAgICBhbW91bnQ6IEJOLFxuICAgIGRqdHhBc3NldElEOiBCdWZmZXIsIC8vIFRPRE86IHJlbmFtZSB0aGlzIHRvIGFtb3VudEFzc2V0SURcbiAgICB0b0FkZHJlc3NlczogQnVmZmVyW10sXG4gICAgZnJvbUFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBCdWZmZXJbXSA9IHVuZGVmaW5lZCxcbiAgICBkZXN0aW5hdGlvbkNoYWluOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgZmVlOiBCTiA9IHVuZGVmaW5lZCxcbiAgICBmZWVBc3NldElEOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICAgIGxvY2t0aW1lOiBCTiA9IG5ldyBCTigwKSxcbiAgICB0aHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgKTogVW5zaWduZWRUeCA9PiB7XG4gICAgbGV0IGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IFtdXG4gICAgbGV0IG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW11cbiAgICBsZXQgZXhwb3J0b3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXVxuXG4gICAgaWYgKHR5cGVvZiBjaGFuZ2VBZGRyZXNzZXMgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGNoYW5nZUFkZHJlc3NlcyA9IHRvQWRkcmVzc2VzXG4gICAgfVxuXG4gICAgY29uc3QgemVybzogQk4gPSBuZXcgQk4oMClcblxuICAgIGlmIChhbW91bnQuZXEoemVybykpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGZlZUFzc2V0SUQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGZlZUFzc2V0SUQgPSBkanR4QXNzZXRJRFxuICAgIH0gZWxzZSBpZiAoZmVlQXNzZXRJRC50b1N0cmluZyhcImhleFwiKSAhPT0gZGp0eEFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgRmVlQXNzZXRFcnJvcihcbiAgICAgICAgXCJFcnJvciAtIFVUWE9TZXQuYnVpbGRFeHBvcnRUeDogXCIgKyBgZmVlQXNzZXRJRCBtdXN0IG1hdGNoIGRqdHhBc3NldElEYFxuICAgICAgKVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGVzdGluYXRpb25DaGFpbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgZGVzdGluYXRpb25DaGFpbiA9IGJpbnRvb2xzLmNiNThEZWNvZGUoXG4gICAgICAgIERlZmF1bHRzLm5ldHdvcmtbYCR7bmV0d29ya0lEfWBdLlhbXCJibG9ja2NoYWluSURcIl1cbiAgICAgIClcbiAgICB9XG5cbiAgICBjb25zdCBhYWQ6IEFzc2V0QW1vdW50RGVzdGluYXRpb24gPSBuZXcgQXNzZXRBbW91bnREZXN0aW5hdGlvbihcbiAgICAgIHRvQWRkcmVzc2VzLFxuICAgICAgZnJvbUFkZHJlc3NlcyxcbiAgICAgIGNoYW5nZUFkZHJlc3Nlc1xuICAgIClcbiAgICBpZiAoZGp0eEFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikgPT09IGZlZUFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikpIHtcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChkanR4QXNzZXRJRCwgYW1vdW50LCBmZWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChkanR4QXNzZXRJRCwgYW1vdW50LCB6ZXJvKVxuICAgICAgaWYgKHRoaXMuX2ZlZUNoZWNrKGZlZSwgZmVlQXNzZXRJRCkpIHtcbiAgICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGZlZUFzc2V0SUQsIHplcm8sIGZlZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBtaW5TcGVuZGFibGVFcnI6IEVycm9yID0gdGhpcy5nZXRNaW5pbXVtU3BlbmRhYmxlKFxuICAgICAgYWFkLFxuICAgICAgYXNPZixcbiAgICAgIGxvY2t0aW1lLFxuICAgICAgdGhyZXNob2xkXG4gICAgKVxuICAgIGlmICh0eXBlb2YgbWluU3BlbmRhYmxlRXJyID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpbnMgPSBhYWQuZ2V0SW5wdXRzKClcbiAgICAgIG91dHMgPSBhYWQuZ2V0Q2hhbmdlT3V0cHV0cygpXG4gICAgICBleHBvcnRvdXRzID0gYWFkLmdldE91dHB1dHMoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBtaW5TcGVuZGFibGVFcnJcbiAgICB9XG5cbiAgICBjb25zdCBleHBvcnRUeDogRXhwb3J0VHggPSBuZXcgRXhwb3J0VHgoXG4gICAgICBuZXR3b3JrSUQsXG4gICAgICBibG9ja2NoYWluSUQsXG4gICAgICBvdXRzLFxuICAgICAgaW5zLFxuICAgICAgbWVtbyxcbiAgICAgIGRlc3RpbmF0aW9uQ2hhaW4sXG4gICAgICBleHBvcnRvdXRzXG4gICAgKVxuXG4gICAgcmV0dXJuIG5ldyBVbnNpZ25lZFR4KGV4cG9ydFR4KVxuICB9XG5cbiAgLyoqXG4gICAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBbW0FkZFN1Ym5ldFZhbGlkYXRvclR4XV0gdHJhbnNhY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgTmV0d29ya2lkLCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIEJsb2NrY2hhaW5pZCwgZGVmYXVsdCB1bmRlZmluZWRcbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBwYXlzIHRoZSBmZWVzIGluIERKVFhcbiAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2hvIGdldHMgdGhlIGNoYW5nZSBsZWZ0b3ZlciBmcm9tIHRoZSBmZWUgcGF5bWVudFxuICAgKiBAcGFyYW0gbm9kZUlEIFRoZSBub2RlIElEIG9mIHRoZSB2YWxpZGF0b3IgYmVpbmcgYWRkZWQuXG4gICAqIEBwYXJhbSBzdGFydFRpbWUgVGhlIFVuaXggdGltZSB3aGVuIHRoZSB2YWxpZGF0b3Igc3RhcnRzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yay5cbiAgICogQHBhcmFtIGVuZFRpbWUgVGhlIFVuaXggdGltZSB3aGVuIHRoZSB2YWxpZGF0b3Igc3RvcHMgdmFsaWRhdGluZyB0aGUgUHJpbWFyeSBOZXR3b3JrIChhbmQgc3Rha2VkIERKVFggaXMgcmV0dXJuZWQpLlxuICAgKiBAcGFyYW0gd2VpZ2h0IFRoZSBhbW91bnQgb2Ygd2VpZ2h0IGZvciB0aGlzIHN1Ym5ldCB2YWxpZGF0b3IuXG4gICAqIEBwYXJhbSBmZWUgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgZmVlcyB0byBidXJuIGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBmZWVBc3NldElEIE9wdGlvbmFsLiBUaGUgYXNzZXRJRCBvZiB0aGUgZmVlcyBiZWluZyBidXJuZWQuXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBsb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyBvdXRwdXRzXG4gICAqIEBwYXJhbSB0aHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBVVFhPXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICAqL1xuXG4gIC8qIG11c3QgaW1wbGVtZW50IGxhdGVyIG9uY2UgdGhlIHRyYW5zYWN0aW9uIGZvcm1hdCBzaWduaW5nIHByb2Nlc3MgaXMgY2xlYXJlclxuICBidWlsZEFkZFN1Ym5ldFZhbGlkYXRvclR4ID0gKFxuICAgIG5ldHdvcmtJRDpudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELFxuICAgIGJsb2NrY2hhaW5JRDpCdWZmZXIsXG4gICAgZnJvbUFkZHJlc3NlczpCdWZmZXJbXSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6QnVmZmVyW10sXG4gICAgbm9kZUlEOkJ1ZmZlcixcbiAgICBzdGFydFRpbWU6Qk4sXG4gICAgZW5kVGltZTpCTixcbiAgICB3ZWlnaHQ6Qk4sXG4gICAgZmVlOkJOID0gdW5kZWZpbmVkLFxuICAgIGZlZUFzc2V0SUQ6QnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG1lbW86QnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6Qk4gPSBVbml4Tm93KClcbiAgKTpVbnNpZ25lZFR4ID0+IHtcbiAgICBsZXQgaW5zOlRyYW5zZmVyYWJsZUlucHV0W10gPSBbXTtcbiAgICBsZXQgb3V0czpUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IFtdO1xuICAgIC8vbGV0IHN0YWtlT3V0czpUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IFtdO1xuXG4gICAgY29uc3QgemVybzpCTiA9IG5ldyBCTigwKTtcbiAgICBjb25zdCBub3c6Qk4gPSBVbml4Tm93KCk7XG4gICAgaWYgKHN0YXJ0VGltZS5sdChub3cpIHx8IGVuZFRpbWUubHRlKHN0YXJ0VGltZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVUWE9TZXQuYnVpbGRBZGRTdWJuZXRWYWxpZGF0b3JUeCAtLSBzdGFydFRpbWUgbXVzdCBiZSBpbiB0aGUgZnV0dXJlIGFuZCBlbmRUaW1lIG11c3QgY29tZSBhZnRlciBzdGFydFRpbWVcIik7XG4gICAgfVxuXG4gICAgLy8gTm90IGltcGxlbWVudGVkOiBGZWVzIGNhbiBiZSBwYWlkIGZyb20gaW1wb3J0SW5zXG4gICAgaWYodGhpcy5fZmVlQ2hlY2soZmVlLCBmZWVBc3NldElEKSkge1xuICAgICAgY29uc3QgYWFkOkFzc2V0QW1vdW50RGVzdGluYXRpb24gPSBuZXcgQXNzZXRBbW91bnREZXN0aW5hdGlvbihmcm9tQWRkcmVzc2VzLCBmcm9tQWRkcmVzc2VzLCBjaGFuZ2VBZGRyZXNzZXMpO1xuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGZlZUFzc2V0SUQsIHplcm8sIGZlZSk7XG4gICAgICBjb25zdCBzdWNjZXNzOkVycm9yID0gdGhpcy5nZXRNaW5pbXVtU3BlbmRhYmxlKGFhZCwgYXNPZik7XG4gICAgICBpZih0eXBlb2Ygc3VjY2VzcyA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpbnMgPSBhYWQuZ2V0SW5wdXRzKCk7XG4gICAgICAgIG91dHMgPSBhYWQuZ2V0QWxsT3V0cHV0cygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgc3VjY2VzcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBVVHg6QWRkU3VibmV0VmFsaWRhdG9yVHggPSBuZXcgQWRkU3VibmV0VmFsaWRhdG9yVHgobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucywgbWVtbywgbm9kZUlELCBzdGFydFRpbWUsIGVuZFRpbWUsIHdlaWdodCk7XG4gICAgcmV0dXJuIG5ldyBVbnNpZ25lZFR4KFVUeCk7XG4gIH1cbiAgKi9cblxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIFtbQWRkRGVsZWdhdG9yVHhdXSB0cmFuc2FjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIG5ldHdvcmtJRCBOZXR3b3JraWQsIFtbRGVmYXVsdE5ldHdvcmtJRF1dXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgQmxvY2tjaGFpbmlkLCBkZWZhdWx0IHVuZGVmaW5lZFxuICAgKiBAcGFyYW0gZGp0eEFzc2V0SUQge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb2YgdGhlIGFzc2V0IElEIGZvciBESlRYXG4gICAqIEBwYXJhbSB0b0FkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVjaWV2ZXMgdGhlIHN0YWtlIGF0IHRoZSBlbmQgb2YgdGhlIHN0YWtpbmcgcGVyaW9kXG4gICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gcGF5cyB0aGUgZmVlcyBhbmQgdGhlIHN0YWtlXG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBnZXRzIHRoZSBjaGFuZ2UgbGVmdG92ZXIgZnJvbSB0aGUgc3Rha2luZyBwYXltZW50XG4gICAqIEBwYXJhbSBub2RlSUQgVGhlIG5vZGUgSUQgb2YgdGhlIHZhbGlkYXRvciBiZWluZyBhZGRlZC5cbiAgICogQHBhcmFtIHN0YXJ0VGltZSBUaGUgVW5peCB0aW1lIHdoZW4gdGhlIHZhbGlkYXRvciBzdGFydHMgdmFsaWRhdGluZyB0aGUgUHJpbWFyeSBOZXR3b3JrLlxuICAgKiBAcGFyYW0gZW5kVGltZSBUaGUgVW5peCB0aW1lIHdoZW4gdGhlIHZhbGlkYXRvciBzdG9wcyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsgKGFuZCBzdGFrZWQgREpUWCBpcyByZXR1cm5lZCkuXG4gICAqIEBwYXJhbSBzdGFrZUFtb3VudCBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IGZvciB0aGUgYW1vdW50IG9mIHN0YWtlIHRvIGJlIGRlbGVnYXRlZCBpbiBuREpUWC5cbiAgICogQHBhcmFtIHJld2FyZExvY2t0aW1lIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgcmV3YXJkIG91dHB1dHNcbiAgICogQHBhcmFtIHJld2FyZFRocmVzaG9sZCBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgcmV3YXJkIFVUWE9cbiAgICogQHBhcmFtIHJld2FyZEFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRoZSB2YWxpZGF0b3IgcmV3YXJkIGdvZXMuXG4gICAqIEBwYXJhbSBmZWUgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgZmVlcyB0byBidXJuIGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBmZWVBc3NldElEIE9wdGlvbmFsLiBUaGUgYXNzZXRJRCBvZiB0aGUgZmVlcyBiZWluZyBidXJuZWQuXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqXG4gICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICAqL1xuICBidWlsZEFkZERlbGVnYXRvclR4ID0gKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCxcbiAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlcixcbiAgICBkanR4QXNzZXRJRDogQnVmZmVyLFxuICAgIHRvQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBmcm9tQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IEJ1ZmZlcltdLFxuICAgIG5vZGVJRDogQnVmZmVyLFxuICAgIHN0YXJ0VGltZTogQk4sXG4gICAgZW5kVGltZTogQk4sXG4gICAgc3Rha2VBbW91bnQ6IEJOLFxuICAgIHJld2FyZExvY2t0aW1lOiBCTixcbiAgICByZXdhcmRUaHJlc2hvbGQ6IG51bWJlcixcbiAgICByZXdhcmRBZGRyZXNzZXM6IEJ1ZmZlcltdLFxuICAgIGZlZTogQk4gPSB1bmRlZmluZWQsXG4gICAgZmVlQXNzZXRJRDogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKVxuICApOiBVbnNpZ25lZFR4ID0+IHtcbiAgICBsZXQgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gW11cbiAgICBsZXQgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXVxuICAgIGxldCBzdGFrZU91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW11cblxuICAgIGNvbnN0IHplcm86IEJOID0gbmV3IEJOKDApXG4gICAgY29uc3Qgbm93OiBCTiA9IFVuaXhOb3coKVxuICAgIGlmIChzdGFydFRpbWUubHQobm93KSB8fCBlbmRUaW1lLmx0ZShzdGFydFRpbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVGltZUVycm9yKFxuICAgICAgICBcIlVUWE9TZXQuYnVpbGRBZGREZWxlZ2F0b3JUeCAtLSBzdGFydFRpbWUgbXVzdCBiZSBpbiB0aGUgZnV0dXJlIGFuZCBlbmRUaW1lIG11c3QgY29tZSBhZnRlciBzdGFydFRpbWVcIlxuICAgICAgKVxuICAgIH1cblxuICAgIGNvbnN0IGFhZDogQXNzZXRBbW91bnREZXN0aW5hdGlvbiA9IG5ldyBBc3NldEFtb3VudERlc3RpbmF0aW9uKFxuICAgICAgdG9BZGRyZXNzZXMsXG4gICAgICBmcm9tQWRkcmVzc2VzLFxuICAgICAgY2hhbmdlQWRkcmVzc2VzXG4gICAgKVxuICAgIGlmIChkanR4QXNzZXRJRC50b1N0cmluZyhcImhleFwiKSA9PT0gZmVlQXNzZXRJRC50b1N0cmluZyhcImhleFwiKSkge1xuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGRqdHhBc3NldElELCBzdGFrZUFtb3VudCwgZmVlKVxuICAgIH0gZWxzZSB7XG4gICAgICBhYWQuYWRkQXNzZXRBbW91bnQoZGp0eEFzc2V0SUQsIHN0YWtlQW1vdW50LCB6ZXJvKVxuICAgICAgaWYgKHRoaXMuX2ZlZUNoZWNrKGZlZSwgZmVlQXNzZXRJRCkpIHtcbiAgICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGZlZUFzc2V0SUQsIHplcm8sIGZlZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBtaW5TcGVuZGFibGVFcnI6IEVycm9yID0gdGhpcy5nZXRNaW5pbXVtU3BlbmRhYmxlKFxuICAgICAgYWFkLFxuICAgICAgYXNPZixcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHRydWVcbiAgICApXG4gICAgaWYgKHR5cGVvZiBtaW5TcGVuZGFibGVFcnIgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlucyA9IGFhZC5nZXRJbnB1dHMoKVxuICAgICAgb3V0cyA9IGFhZC5nZXRDaGFuZ2VPdXRwdXRzKClcbiAgICAgIHN0YWtlT3V0cyA9IGFhZC5nZXRPdXRwdXRzKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbWluU3BlbmRhYmxlRXJyXG4gICAgfVxuXG4gICAgY29uc3QgcmV3YXJkT3V0cHV0T3duZXJzOiBTRUNQT3duZXJPdXRwdXQgPSBuZXcgU0VDUE93bmVyT3V0cHV0KFxuICAgICAgcmV3YXJkQWRkcmVzc2VzLFxuICAgICAgcmV3YXJkTG9ja3RpbWUsXG4gICAgICByZXdhcmRUaHJlc2hvbGRcbiAgICApXG5cbiAgICBjb25zdCBVVHg6IEFkZERlbGVnYXRvclR4ID0gbmV3IEFkZERlbGVnYXRvclR4KFxuICAgICAgbmV0d29ya0lELFxuICAgICAgYmxvY2tjaGFpbklELFxuICAgICAgb3V0cyxcbiAgICAgIGlucyxcbiAgICAgIG1lbW8sXG4gICAgICBub2RlSUQsXG4gICAgICBzdGFydFRpbWUsXG4gICAgICBlbmRUaW1lLFxuICAgICAgc3Rha2VBbW91bnQsXG4gICAgICBzdGFrZU91dHMsXG4gICAgICBuZXcgUGFyc2VhYmxlT3V0cHV0KHJld2FyZE91dHB1dE93bmVycylcbiAgICApXG4gICAgcmV0dXJuIG5ldyBVbnNpZ25lZFR4KFVUeClcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgW1tBZGRWYWxpZGF0b3JUeF1dIHRyYW5zYWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gbmV0d29ya0lEIE5ldHdvcmtJRCwgW1tEZWZhdWx0TmV0d29ya0lEXV1cbiAgICogQHBhcmFtIGJsb2NrY2hhaW5JRCBCbG9ja2NoYWluSUQsIGRlZmF1bHQgdW5kZWZpbmVkXG4gICAqIEBwYXJhbSBkanR4QXNzZXRJRCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvZiB0aGUgYXNzZXQgSUQgZm9yIERKVFhcbiAgICogQHBhcmFtIHRvQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZWNpZXZlcyB0aGUgc3Rha2UgYXQgdGhlIGVuZCBvZiB0aGUgc3Rha2luZyBwZXJpb2RcbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBwYXlzIHRoZSBmZWVzIGFuZCB0aGUgc3Rha2VcbiAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2hvIGdldHMgdGhlIGNoYW5nZSBsZWZ0b3ZlciBmcm9tIHRoZSBzdGFraW5nIHBheW1lbnRcbiAgICogQHBhcmFtIG5vZGVJRCBUaGUgbm9kZSBJRCBvZiB0aGUgdmFsaWRhdG9yIGJlaW5nIGFkZGVkLlxuICAgKiBAcGFyYW0gc3RhcnRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0YXJ0cyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsuXG4gICAqIEBwYXJhbSBlbmRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0b3BzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yayAoYW5kIHN0YWtlZCBESlRYIGlzIHJldHVybmVkKS5cbiAgICogQHBhcmFtIHN0YWtlQW1vdW50IEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gZm9yIHRoZSBhbW91bnQgb2Ygc3Rha2UgdG8gYmUgZGVsZWdhdGVkIGluIG5ESlRYLlxuICAgKiBAcGFyYW0gcmV3YXJkTG9ja3RpbWUgVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyByZXdhcmQgb3V0cHV0c1xuICAgKiBAcGFyYW0gcmV3YXJkVGhyZXNob2xkIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCByZXdhcmQgVVRYT1xuICAgKiBAcGFyYW0gcmV3YXJkQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdGhlIHZhbGlkYXRvciByZXdhcmQgZ29lcy5cbiAgICogQHBhcmFtIGRlbGVnYXRpb25GZWUgQSBudW1iZXIgZm9yIHRoZSBwZXJjZW50YWdlIG9mIHJld2FyZCB0byBiZSBnaXZlbiB0byB0aGUgdmFsaWRhdG9yIHdoZW4gc29tZW9uZSBkZWxlZ2F0ZXMgdG8gdGhlbS4gTXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDEwMC5cbiAgICogQHBhcmFtIG1pblN0YWtlIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gcmVwcmVzZW50aW5nIHRoZSBtaW5pbXVtIHN0YWtlIHJlcXVpcmVkIHRvIHZhbGlkYXRlIG9uIHRoaXMgbmV0d29yay5cbiAgICogQHBhcmFtIGZlZSBPcHRpb25hbC4gVGhlIGFtb3VudCBvZiBmZWVzIHRvIGJ1cm4gaW4gaXRzIHNtYWxsZXN0IGRlbm9taW5hdGlvbiwgcmVwcmVzZW50ZWQgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIGZlZUFzc2V0SUQgT3B0aW9uYWwuIFRoZSBhc3NldElEIG9mIHRoZSBmZWVzIGJlaW5nIGJ1cm5lZC5cbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICpcbiAgICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gY3JlYXRlZCBmcm9tIHRoZSBwYXNzZWQgaW4gcGFyYW1ldGVycy5cbiAgICovXG4gIGJ1aWxkQWRkVmFsaWRhdG9yVHggPSAoXG4gICAgbmV0d29ya0lEOiBudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELFxuICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyLFxuICAgIGRqdHhBc3NldElEOiBCdWZmZXIsXG4gICAgdG9BZGRyZXNzZXM6IEJ1ZmZlcltdLFxuICAgIGZyb21BZGRyZXNzZXM6IEJ1ZmZlcltdLFxuICAgIGNoYW5nZUFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgbm9kZUlEOiBCdWZmZXIsXG4gICAgc3RhcnRUaW1lOiBCTixcbiAgICBlbmRUaW1lOiBCTixcbiAgICBzdGFrZUFtb3VudDogQk4sXG4gICAgcmV3YXJkTG9ja3RpbWU6IEJOLFxuICAgIHJld2FyZFRocmVzaG9sZDogbnVtYmVyLFxuICAgIHJld2FyZEFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgZGVsZWdhdGlvbkZlZTogbnVtYmVyLFxuICAgIGZlZTogQk4gPSB1bmRlZmluZWQsXG4gICAgZmVlQXNzZXRJRDogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKVxuICApOiBVbnNpZ25lZFR4ID0+IHtcbiAgICBsZXQgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gW11cbiAgICBsZXQgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXVxuICAgIGxldCBzdGFrZU91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW11cblxuICAgIGNvbnN0IHplcm86IEJOID0gbmV3IEJOKDApXG4gICAgY29uc3Qgbm93OiBCTiA9IFVuaXhOb3coKVxuICAgIGlmIChzdGFydFRpbWUubHQobm93KSB8fCBlbmRUaW1lLmx0ZShzdGFydFRpbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVGltZUVycm9yKFxuICAgICAgICBcIlVUWE9TZXQuYnVpbGRBZGRWYWxpZGF0b3JUeCAtLSBzdGFydFRpbWUgbXVzdCBiZSBpbiB0aGUgZnV0dXJlIGFuZCBlbmRUaW1lIG11c3QgY29tZSBhZnRlciBzdGFydFRpbWVcIlxuICAgICAgKVxuICAgIH1cblxuICAgIGlmIChkZWxlZ2F0aW9uRmVlID4gMTAwIHx8IGRlbGVnYXRpb25GZWUgPCAwKSB7XG4gICAgICB0aHJvdyBuZXcgVGltZUVycm9yKFxuICAgICAgICBcIlVUWE9TZXQuYnVpbGRBZGRWYWxpZGF0b3JUeCAtLSBzdGFydFRpbWUgbXVzdCBiZSBpbiB0aGUgcmFuZ2Ugb2YgMCB0byAxMDAsIGluY2x1c2l2ZWx5XCJcbiAgICAgIClcbiAgICB9XG5cbiAgICBjb25zdCBhYWQ6IEFzc2V0QW1vdW50RGVzdGluYXRpb24gPSBuZXcgQXNzZXRBbW91bnREZXN0aW5hdGlvbihcbiAgICAgIHRvQWRkcmVzc2VzLFxuICAgICAgZnJvbUFkZHJlc3NlcyxcbiAgICAgIGNoYW5nZUFkZHJlc3Nlc1xuICAgIClcbiAgICBpZiAoZGp0eEFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikgPT09IGZlZUFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikpIHtcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChkanR4QXNzZXRJRCwgc3Rha2VBbW91bnQsIGZlZSlcbiAgICB9IGVsc2Uge1xuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGRqdHhBc3NldElELCBzdGFrZUFtb3VudCwgemVybylcbiAgICAgIGlmICh0aGlzLl9mZWVDaGVjayhmZWUsIGZlZUFzc2V0SUQpKSB7XG4gICAgICAgIGFhZC5hZGRBc3NldEFtb3VudChmZWVBc3NldElELCB6ZXJvLCBmZWUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbWluU3BlbmRhYmxlRXJyOiBFcnJvciA9IHRoaXMuZ2V0TWluaW11bVNwZW5kYWJsZShcbiAgICAgIGFhZCxcbiAgICAgIGFzT2YsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB0cnVlXG4gICAgKVxuICAgIGlmICh0eXBlb2YgbWluU3BlbmRhYmxlRXJyID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpbnMgPSBhYWQuZ2V0SW5wdXRzKClcbiAgICAgIG91dHMgPSBhYWQuZ2V0Q2hhbmdlT3V0cHV0cygpXG4gICAgICBzdGFrZU91dHMgPSBhYWQuZ2V0T3V0cHV0cygpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG1pblNwZW5kYWJsZUVyclxuICAgIH1cblxuICAgIGNvbnN0IHJld2FyZE91dHB1dE93bmVyczogU0VDUE93bmVyT3V0cHV0ID0gbmV3IFNFQ1BPd25lck91dHB1dChcbiAgICAgIHJld2FyZEFkZHJlc3NlcyxcbiAgICAgIHJld2FyZExvY2t0aW1lLFxuICAgICAgcmV3YXJkVGhyZXNob2xkXG4gICAgKVxuXG4gICAgY29uc3QgVVR4OiBBZGRWYWxpZGF0b3JUeCA9IG5ldyBBZGRWYWxpZGF0b3JUeChcbiAgICAgIG5ldHdvcmtJRCxcbiAgICAgIGJsb2NrY2hhaW5JRCxcbiAgICAgIG91dHMsXG4gICAgICBpbnMsXG4gICAgICBtZW1vLFxuICAgICAgbm9kZUlELFxuICAgICAgc3RhcnRUaW1lLFxuICAgICAgZW5kVGltZSxcbiAgICAgIHN0YWtlQW1vdW50LFxuICAgICAgc3Rha2VPdXRzLFxuICAgICAgbmV3IFBhcnNlYWJsZU91dHB1dChyZXdhcmRPdXRwdXRPd25lcnMpLFxuICAgICAgZGVsZWdhdGlvbkZlZVxuICAgIClcbiAgICByZXR1cm4gbmV3IFVuc2lnbmVkVHgoVVR4KVxuICB9XG5cbiAgLyoqXG4gICAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBbW0NyZWF0ZVN1Ym5ldFR4XV0gdHJhbnNhY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgTmV0d29ya2lkLCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIEJsb2NrY2hhaW5pZCwgZGVmYXVsdCB1bmRlZmluZWRcbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPcy5cbiAgICogQHBhcmFtIHN1Ym5ldE93bmVyQWRkcmVzc2VzIEFuIGFycmF5IG9mIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgYWRkcmVzc2VzIHRvIGFkZCB0byBhIHN1Ym5ldFxuICAgKiBAcGFyYW0gc3VibmV0T3duZXJUaHJlc2hvbGQgVGhlIG51bWJlciBvZiBvd25lcnMncyBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIGFkZCBhIHZhbGlkYXRvciB0byB0aGUgbmV0d29ya1xuICAgKiBAcGFyYW0gZmVlIE9wdGlvbmFsLiBUaGUgYW1vdW50IG9mIGZlZXMgdG8gYnVybiBpbiBpdHMgc21hbGxlc3QgZGVub21pbmF0aW9uLCByZXByZXNlbnRlZCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gZmVlQXNzZXRJRCBPcHRpb25hbC4gVGhlIGFzc2V0SUQgb2YgdGhlIGZlZXMgYmVpbmcgYnVybmVkXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqXG4gICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICAqL1xuICBidWlsZENyZWF0ZVN1Ym5ldFR4ID0gKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCxcbiAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlcixcbiAgICBmcm9tQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IEJ1ZmZlcltdLFxuICAgIHN1Ym5ldE93bmVyQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBzdWJuZXRPd25lclRocmVzaG9sZDogbnVtYmVyLFxuICAgIGZlZTogQk4gPSB1bmRlZmluZWQsXG4gICAgZmVlQXNzZXRJRDogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKVxuICApOiBVbnNpZ25lZFR4ID0+IHtcbiAgICBjb25zdCB6ZXJvOiBCTiA9IG5ldyBCTigwKVxuICAgIGxldCBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXVxuICAgIGxldCBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IFtdXG5cbiAgICBpZiAodGhpcy5fZmVlQ2hlY2soZmVlLCBmZWVBc3NldElEKSkge1xuICAgICAgY29uc3QgYWFkOiBBc3NldEFtb3VudERlc3RpbmF0aW9uID0gbmV3IEFzc2V0QW1vdW50RGVzdGluYXRpb24oXG4gICAgICAgIGZyb21BZGRyZXNzZXMsXG4gICAgICAgIGZyb21BZGRyZXNzZXMsXG4gICAgICAgIGNoYW5nZUFkZHJlc3Nlc1xuICAgICAgKVxuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGZlZUFzc2V0SUQsIHplcm8sIGZlZSlcbiAgICAgIGNvbnN0IG1pblNwZW5kYWJsZUVycjogRXJyb3IgPSB0aGlzLmdldE1pbmltdW1TcGVuZGFibGUoXG4gICAgICAgIGFhZCxcbiAgICAgICAgYXNPZixcbiAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICB1bmRlZmluZWRcbiAgICAgIClcbiAgICAgIGlmICh0eXBlb2YgbWluU3BlbmRhYmxlRXJyID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlucyA9IGFhZC5nZXRJbnB1dHMoKVxuICAgICAgICBvdXRzID0gYWFkLmdldEFsbE91dHB1dHMoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbWluU3BlbmRhYmxlRXJyXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbG9ja3RpbWU6IEJOID0gbmV3IEJOKDApXG4gICAgY29uc3QgVVR4OiBDcmVhdGVTdWJuZXRUeCA9IG5ldyBDcmVhdGVTdWJuZXRUeChcbiAgICAgIG5ldHdvcmtJRCxcbiAgICAgIGJsb2NrY2hhaW5JRCxcbiAgICAgIG91dHMsXG4gICAgICBpbnMsXG4gICAgICBtZW1vLFxuICAgICAgbmV3IFNFQ1BPd25lck91dHB1dChzdWJuZXRPd25lckFkZHJlc3NlcywgbG9ja3RpbWUsIHN1Ym5ldE93bmVyVGhyZXNob2xkKVxuICAgIClcbiAgICByZXR1cm4gbmV3IFVuc2lnbmVkVHgoVVR4KVxuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkIGFuIHVuc2lnbmVkIFtbQ3JlYXRlQ2hhaW5UeF1dLlxuICAgKlxuICAgKiBAcGFyYW0gbmV0d29ya0lEIE5ldHdvcmtpZCwgW1tEZWZhdWx0TmV0d29ya0lEXV1cbiAgICogQHBhcmFtIGJsb2NrY2hhaW5JRCBCbG9ja2NoYWluaWQsIGRlZmF1bHQgdW5kZWZpbmVkXG4gICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBmdW5kcyBmcm9tIHRoZSBVVFhPcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdGhhdCBjYW4gc3BlbmQgdGhlIGNoYW5nZSByZW1haW5pbmcgZnJvbSB0aGUgc3BlbnQgVVRYT3MuXG4gICAqIEBwYXJhbSBzdWJuZXRJRCBPcHRpb25hbCBJRCBvZiB0aGUgU3VibmV0IHRoYXQgdmFsaWRhdGVzIHRoaXMgYmxvY2tjaGFpblxuICAgKiBAcGFyYW0gY2hhaW5OYW1lIE9wdGlvbmFsIEEgaHVtYW4gcmVhZGFibGUgbmFtZSBmb3IgdGhlIGNoYWluOyBuZWVkIG5vdCBiZSB1bmlxdWVcbiAgICogQHBhcmFtIHZtSUQgT3B0aW9uYWwgSUQgb2YgdGhlIFZNIHJ1bm5pbmcgb24gdGhlIG5ldyBjaGFpblxuICAgKiBAcGFyYW0gZnhJRHMgT3B0aW9uYWwgSURzIG9mIHRoZSBmZWF0dXJlIGV4dGVuc2lvbnMgcnVubmluZyBvbiB0aGUgbmV3IGNoYWluXG4gICAqIEBwYXJhbSBnZW5lc2lzRGF0YSBPcHRpb25hbCBCeXRlIHJlcHJlc2VudGF0aW9uIG9mIGdlbmVzaXMgc3RhdGUgb2YgdGhlIG5ldyBjaGFpblxuICAgKiBAcGFyYW0gc3VibmV0QXV0aCBPcHRpb25hbCBTcGVjaWZpZXMgdGhlIGFkZHJlc3NlcyB3aG9zZSBzaWduYXR1cmVzIHdpbGwgYmUgcHJvdmlkZWQgdG8gZGVtb25zdHJhdGUgdGhhdCB0aGUgb3duZXJzIG9mIGEgc3VibmV0IGFwcHJvdmUgc29tZXRoaW5nXG4gICAqIEBwYXJhbSBmZWUgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgZmVlcyB0byBidXJuIGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBmZWVBc3NldElEIE9wdGlvbmFsLiBUaGUgYXNzZXRJRCBvZiB0aGUgZmVlcyBiZWluZyBidXJuZWRcbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICpcbiAgICogQHJldHVybnMgQW4gdW5zaWduZWQgQ3JlYXRlQ2hhaW5UeCBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgYnVpbGRDcmVhdGVDaGFpblR4ID0gKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCxcbiAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlcixcbiAgICBmcm9tQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IEJ1ZmZlcltdLFxuICAgIHN1Ym5ldElEOiBzdHJpbmcgfCBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgY2hhaW5OYW1lOiBzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgdm1JRDogc3RyaW5nID0gdW5kZWZpbmVkLFxuICAgIGZ4SURzOiBzdHJpbmdbXSA9IHVuZGVmaW5lZCxcbiAgICBnZW5lc2lzRGF0YTogc3RyaW5nIHwgR2VuZXNpc0RhdGEgPSB1bmRlZmluZWQsXG4gICAgc3VibmV0QXV0aDogU3VibmV0QXV0aCA9IHVuZGVmaW5lZCxcbiAgICBmZWU6IEJOID0gdW5kZWZpbmVkLFxuICAgIGZlZUFzc2V0SUQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBVbml4Tm93KClcbiAgKTogVW5zaWduZWRUeCA9PiB7XG4gICAgY29uc3QgemVybzogQk4gPSBuZXcgQk4oMClcbiAgICBsZXQgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gW11cbiAgICBsZXQgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXVxuXG4gICAgaWYgKHRoaXMuX2ZlZUNoZWNrKGZlZSwgZmVlQXNzZXRJRCkpIHtcbiAgICAgIGNvbnN0IGFhZDogQXNzZXRBbW91bnREZXN0aW5hdGlvbiA9IG5ldyBBc3NldEFtb3VudERlc3RpbmF0aW9uKFxuICAgICAgICBmcm9tQWRkcmVzc2VzLFxuICAgICAgICBmcm9tQWRkcmVzc2VzLFxuICAgICAgICBjaGFuZ2VBZGRyZXNzZXNcbiAgICAgIClcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChmZWVBc3NldElELCB6ZXJvLCBmZWUpXG4gICAgICBjb25zdCBtaW5TcGVuZGFibGVFcnI6IEVycm9yID0gdGhpcy5nZXRNaW5pbXVtU3BlbmRhYmxlKFxuICAgICAgICBhYWQsXG4gICAgICAgIGFzT2YsXG4gICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgdW5kZWZpbmVkXG4gICAgICApXG4gICAgICBpZiAodHlwZW9mIG1pblNwZW5kYWJsZUVyciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpbnMgPSBhYWQuZ2V0SW5wdXRzKClcbiAgICAgICAgb3V0cyA9IGFhZC5nZXRBbGxPdXRwdXRzKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG1pblNwZW5kYWJsZUVyclxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGNyZWF0ZUNoYWluVHg6IENyZWF0ZUNoYWluVHggPSBuZXcgQ3JlYXRlQ2hhaW5UeChcbiAgICAgIG5ldHdvcmtJRCxcbiAgICAgIGJsb2NrY2hhaW5JRCxcbiAgICAgIG91dHMsXG4gICAgICBpbnMsXG4gICAgICBtZW1vLFxuICAgICAgc3VibmV0SUQsXG4gICAgICBjaGFpbk5hbWUsXG4gICAgICB2bUlELFxuICAgICAgZnhJRHMsXG4gICAgICBnZW5lc2lzRGF0YSxcbiAgICAgIHN1Ym5ldEF1dGhcbiAgICApXG4gICAgcmV0dXJuIG5ldyBVbnNpZ25lZFR4KGNyZWF0ZUNoYWluVHgpXG4gIH1cbn1cbiJdfQ==