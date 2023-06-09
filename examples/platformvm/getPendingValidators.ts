import { Dijets } from "../../src"
import { MethodVMAPI } from "../../src/apis/methodvm"

const ip: string = "localhost"
const port: number = 9650
const protocol: string = "http"
const networkID: number = 1337
const dijets: Dijets = new Dijets(ip, port, protocol, networkID)
const mchain: MethodVMAPI = dijets.MChain()

const main = async (): Promise<any> => {
  const subnetID: string = "11111111111111111111111111111111LpoYY"
  const nodeIDs: string[] = []
  const pendingValidators: object = await pchain.getPendingValidators(subnetID)
  console.log(pendingValidators)
}

main()
