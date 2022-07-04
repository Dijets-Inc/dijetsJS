import { Avalanche } from "../../src"
import { InfoAPI } from "../../src/apis/info"

const ip: string = "archiver.switzerlandnorth.cloudapp.azure.com"
const port: number = 443
const protocol: string = "https"
const networkID: number = 43112
const avalanche: Avalanche = new Avalanche(ip, port, protocol, networkID)
const info: InfoAPI = avalanche.Info()

const main = async (): Promise<any> => {
  const nodeVersion: string = await info.getNodeVersion()
  console.log(nodeVersion)
}

main()
