import { Avalanche } from "../../dist"
import { MetricsAPI } from "../../dist/apis/metrics"

const ip: string = "archiver.switzerlandnorth.cloudapp.azure.com"
const port: number = 443
const protocol: string = "https"
const networkID: number = 43112
const avalanche: Avalanche = new Avalanche(ip, port, protocol, networkID)
const metrics: MetricsAPI = avalanche.Metrics()

const main = async (): Promise<any> => {
  const m: string = await metrics.getMetrics()
  console.log(m)
}

main()
