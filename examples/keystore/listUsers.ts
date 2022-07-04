import { Avalanche } from "../../dist"
import { KeystoreAPI } from "../../dist/apis/keystore"

const ip: string = "archiver.switzerlandnorth.cloudapp.azure.com"
const port: number = 443
const protocol: string = "https"
const networkID: number = 43112
const avalanche: Avalanche = new Avalanche(ip, port, protocol, networkID)
const keystore: KeystoreAPI = avalanche.NodeKeys()

const main = async (): Promise<any> => {
  const users: string[] = await keystore.listUsers()
  console.log(users)
}

main()
