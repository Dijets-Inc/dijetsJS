// This file read secrets from a separate file called "secrets.json"
// which you can create based on "secrets.example" which is in the
// root of the `examples/` directory.
// Unlike "secrets.example", "secrets.json" should never be committed to git.
import { readFile } from "fs"
import { Avalanche } from "../../dist"
import { KeystoreAPI } from "../../dist/apis/keystore"

const ip: string = "archiver.switzerlandnorth.cloudapp.azure.com"
const port: number = 443
const protocol: string = "https"
const networkID: number = 43112
const avalanche: Avalanche = new Avalanche(ip, port, protocol, networkID)
const keystore: KeystoreAPI = avalanche.NodeKeys()

const main = async (): Promise<any> => {
  const path: string = "./examples/secrets.json"
  const encoding: "utf8" = "utf8"
  const cb = async (err: any, data: any): Promise<void> => {
    if (err) throw err
    const jsonData: any = JSON.parse(data)
    const username: string = "username"
    const password: string = jsonData.password
    const user: string = jsonData.user
    const successful: boolean = await keystore.importUser(
      username,
      user,
      password
    )
    console.log(successful)
  }
  readFile(path, encoding, cb)
}

main()
