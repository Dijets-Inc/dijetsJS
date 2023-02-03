import { Dijets, BN, Buffer } from "../../src"
import {
  AVMAPI,
  KeyChain as AVMKeyChain,
  UTXOSet,
  UnsignedTx,
  Tx
} from "../../src/apis/avm"
import {
  GetBalanceResponse,
  GetUTXOsResponse
} from "../../src/apis/avm/interfaces"
import { KeyChain as EVMKeyChain, EVMAPI } from "../../src/apis/evm"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  Defaults,
  UnixNow
} from "../../src/utils"

const ip: string = "localhost"
const port: number = 9650
const protocol: string = "http"
const networkID: number = 1337
const dijets: Dijets = new Dijets(ip, port, protocol, networkID)
const vchain: AVMAPI = dijets.ValueChain()
const uchain: EVMAPI = dijets.UtilityChain()
const vKeychain: AVMKeyChain = vchain.keyChain()
const uKeychain: EVMKeyChain = uchain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
xKeychain.importKey(privKey)
cKeychain.importKey(privKey)
const vAddressStrings: string[] = vchain.keyChain().getAddressStrings()
const uAddressStrings: string[] = uchain.keyChain().getAddressStrings()
const uChainBlockchainID: string = Defaults.network[networkID].U.blockchainID
const djtxAssetID: string = Defaults.network[networkID].V.djtxAssetID
const locktime: BN = new BN(0)
const asOf: BN = UnixNow()
const memo: Buffer = Buffer.from(
  "AVM utility method buildExportTx to export DJTX to the Utility Chain (uchain) from the Value Chain (vchain)"
)
const fee: BN = xchain.getDefaultTxFee()

const main = async (): Promise<any> => {
  const avmUTXOResponse: GetUTXOsResponse = await xchain.getUTXOs(
    vAddressStrings
  )
  const utxoSet: UTXOSet = avmUTXOResponse.utxos
  const getBalanceResponse: GetBalanceResponse = await xchain.getBalance(
    vAddressStrings[0],
    djtxAssetID
  )
  const balance: BN = new BN(getBalanceResponse.balance)
  const amount: BN = balance.sub(fee)

  const unsignedTx: UnsignedTx = await xchain.buildExportTx(
    utxoSet,
    amount,
    uChainBlockchainID,
    uAddressStrings,
    vAddressStrings,
    vAddressStrings,
    memo,
    asOf,
    locktime
  )

  const tx: Tx = unsignedTx.sign(vKeychain)
  const txid: string = await vchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
