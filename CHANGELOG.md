# CHANGELOG

## v1.1.0

### Notes

* Added Dijets testnet network values
* NFTs are partially implemented in anticipation of their complete release in a future build

### Method Signature Changes

* `avm.makeUnsignedTx`
  * Renamed to `avm.makeBaseTx`
  * Now returns `UnsignedTx` instead of `TxUnsigned`
* `avm.makeCreateAssetTx`
  * 4th parameter has been renamed `initialStates` from `initialState`
  * Now returns `UnsignedTx` instead of `TxCreateAsset`
* `avm.signTx` 
  * Now accepts `UnsignedTx` instead of `TxUnsigned`
* `SelectInputClass`
  * Now accepts a `number` instead of a `Buffer`
* `avm.getInputID`
  * Has been renamed to `avm.getInput` and now returns an `Input` instead of a `number`

### New Methods

* `avm.makeNFTTransferTx`

### Added Classes

* avm credentials
  * Credential
  * SecpCredential is a superset of Credential
  * NFTCredential is a superset of Credential
* avm inputs
  * TransferableInput
  * AmountInput
* avm ops
  * Operation
  * TransferableOperation
  * NFTTransferOperation
* avm outputs
  * TransferableOutput
  * AmountOutput
  * SecpOutput
  * NFTOutBase
* avm tx
  * BaseTx
  * CreateAssetTx
  * OperationTx
  * UnsignedTx
* avm types
  * UTXOID

### New Types

* MergeRule

### Updated Classes

* Input is now `abstract`

### New RPC Calls

* `platform.getSubnets`
* `avm.buildGenesis`
* `keystore.deleteUser`
