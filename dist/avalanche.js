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
/**
 * @packageDocumentation
 * @module AvalancheCore
 */
const axios_1 = __importDefault(require("axios"));
const apibase_1 = require("./common/apibase");
const errors_1 = require("./utils/errors");
const helperfunctions_1 = require("./utils/helperfunctions");
/**
 * AvalancheCore is middleware for interacting with Avalanche node RPC APIs.
 *
 * Example usage:
 * ```js
 * let avalanche = new AvalancheCore("127.0.0.1", 9650, "https")
 * ```
 *
 *
 */
class AvalancheCore {
    /**
     * Creates a new Avalanche instance. Sets the address and port of the main Avalanche Client.
     *
     * @param host The hostname to resolve to reach the Avalanche Client APIs
     * @param port The port to resolve to reach the Avalanche Client APIs
     * @param protocol The protocol string to use before a "://" in a request, ex: "http", "https", "git", "ws", etc ...
     */
    constructor(host, port, protocol = "http") {
        this.networkID = 0;
        this.hrp = "";
        this.auth = undefined;
        this.headers = {};
        this.requestConfig = {};
        this.apis = {};
        /**
         * Sets the address and port of the main Avalanche Client.
         *
         * @param host The hostname to resolve to reach the Avalanche Client RPC APIs.
         * @param port The port to resolve to reach the Avalanche Client RPC APIs.
         * @param protocol The protocol string to use before a "://" in a request,
         * ex: "http", "https", etc. Defaults to http
         * The following special characters are removed from host and protocol
         * &#,@+()$~%'":*?{} also less than and greater than signs
         */
        this.setAddress = (host, port, protocol = "http") => {
            host = host.replace(/[&#,@+()$~%'":*?<>{}]/g, "");
            protocol = protocol.replace(/[&#,@+()$~%'":*?<>{}]/g, "");
            const protocols = ["http", "https"];
            if (!protocols.includes(protocol)) {
                /* istanbul ignore next */
                throw new errors_1.ProtocolError("Error - AvalancheCore.setAddress: Invalid protocol");
            }
            this.host = host;
            this.port = port;
            this.protocol = protocol;
            let url = `${protocol}://${host}`;
            if (port != undefined && typeof port === "number" && port >= 0) {
                url = `${url}:${port}`;
            }
            this.url = url;
        };
        /**
         * Returns the protocol such as "http", "https", "git", "ws", etc.
         */
        this.getProtocol = () => this.protocol;
        /**
         * Returns the host for the Avalanche node.
         */
        this.getHost = () => this.host;
        /**
         * Returns the IP for the Avalanche node.
         */
        this.getIP = () => this.host;
        /**
         * Returns the port for the Avalanche node.
         */
        this.getPort = () => this.port;
        /**
         * Returns the URL of the Avalanche node (ip + port)
         */
        this.getURL = () => this.url;
        /**
         * Returns the custom headers
         */
        this.getHeaders = () => this.headers;
        /**
         * Returns the custom request config
         */
        this.getRequestConfig = () => this.requestConfig;
        /**
         * Returns the networkID
         */
        this.getNetworkID = () => this.networkID;
        /**
         * Sets the networkID
         */
        this.setNetworkID = (netID) => {
            this.networkID = netID;
            this.hrp = (0, helperfunctions_1.getPreferredHRP)(this.networkID);
        };
        /**
         * Returns the Human-Readable-Part of the network associated with this key.
         *
         * @returns The [[KeyPair]]'s Human-Readable-Part of the network's Bech32 addressing scheme
         */
        this.getHRP = () => this.hrp;
        /**
         * Sets the the Human-Readable-Part of the network associated with this key.
         *
         * @param hrp String for the Human-Readable-Part of Bech32 addresses
         */
        this.setHRP = (hrp) => {
            this.hrp = hrp;
        };
        /**
         * Adds a new custom header to be included with all requests.
         *
         * @param key Header name
         * @param value Header value
         */
        this.setHeader = (key, value) => {
            this.headers[`${key}`] = value;
        };
        /**
         * Removes a previously added custom header.
         *
         * @param key Header name
         */
        this.removeHeader = (key) => {
            delete this.headers[`${key}`];
        };
        /**
         * Removes all headers.
         */
        this.removeAllHeaders = () => {
            for (const prop in this.headers) {
                if (Object.prototype.hasOwnProperty.call(this.headers, prop)) {
                    delete this.headers[`${prop}`];
                }
            }
        };
        /**
         * Adds a new custom config value to be included with all requests.
         *
         * @param key Config name
         * @param value Config value
         */
        this.setRequestConfig = (key, value) => {
            this.requestConfig[`${key}`] = value;
        };
        /**
         * Removes a previously added request config.
         *
         * @param key Header name
         */
        this.removeRequestConfig = (key) => {
            delete this.requestConfig[`${key}`];
        };
        /**
         * Removes all request configs.
         */
        this.removeAllRequestConfigs = () => {
            for (const prop in this.requestConfig) {
                if (Object.prototype.hasOwnProperty.call(this.requestConfig, prop)) {
                    delete this.requestConfig[`${prop}`];
                }
            }
        };
        /**
         * Sets the temporary auth token used for communicating with the node.
         *
         * @param auth A temporary token provided by the node enabling access to the endpoints on the node.
         */
        this.setAuthToken = (auth) => {
            this.auth = auth;
        };
        this._setHeaders = (headers) => {
            if (typeof this.headers === "object") {
                for (const [key, value] of Object.entries(this.headers)) {
                    headers[`${key}`] = value;
                }
            }
            if (typeof this.auth === "string") {
                headers.Authorization = `Bearer ${this.auth}`;
            }
            return headers;
        };
        /**
         * Adds an API to the middleware. The API resolves to a registered blockchain's RPC.
         *
         * In TypeScript:
         * ```js
         * avalanche.addAPI<MyVMClass>("mychain", MyVMClass, "/ext/bc/mychain")
         * ```
         *
         * In Javascript:
         * ```js
         * avalanche.addAPI("mychain", MyVMClass, "/ext/bc/mychain")
         * ```
         *
         * @typeparam GA Class of the API being added
         * @param apiName A label for referencing the API in the future
         * @param ConstructorFN A reference to the class which instantiates the API
         * @param baseurl Path to resolve to reach the API
         *
         */
        this.addAPI = (apiName, ConstructorFN, baseurl = undefined, ...args) => {
            if (typeof baseurl === "undefined") {
                this.apis[`${apiName}`] = new ConstructorFN(this, undefined, ...args);
            }
            else {
                this.apis[`${apiName}`] = new ConstructorFN(this, baseurl, ...args);
            }
        };
        /**
         * Retrieves a reference to an API by its apiName label.
         *
         * @param apiName Name of the API to return
         */
        this.api = (apiName) => this.apis[`${apiName}`];
        /**
         * @ignore
         */
        this._request = (xhrmethod, baseurl, getdata, postdata, headers = {}, axiosConfig = undefined) => __awaiter(this, void 0, void 0, function* () {
            let config;
            if (axiosConfig) {
                config = Object.assign(Object.assign({}, axiosConfig), this.requestConfig);
            }
            else {
                config = Object.assign({ baseURL: `${this.protocol}://${this.host}:${this.port}`, responseType: "text" }, this.requestConfig);
            }
            config.url = baseurl;
            config.method = xhrmethod;
            config.headers = headers;
            config.data = postdata;
            config.params = getdata;
            const resp = yield axios_1.default.request(config);
            // purging all that is axios
            const xhrdata = new apibase_1.RequestResponseData(resp.data, resp.headers, resp.status, resp.statusText, resp.request);
            return xhrdata;
        });
        /**
         * Makes a GET call to an API.
         *
         * @param baseurl Path to the api
         * @param getdata Object containing the key value pairs sent in GET
         * @param headers An array HTTP Request Headers
         * @param axiosConfig Configuration for the axios javascript library that will be the
         * foundation for the rest of the parameters
         *
         * @returns A promise for [[RequestResponseData]]
         */
        this.get = (baseurl, getdata, headers = {}, axiosConfig = undefined) => this._request("GET", baseurl, getdata, {}, this._setHeaders(headers), axiosConfig);
        /**
         * Makes a DELETE call to an API.
         *
         * @param baseurl Path to the API
         * @param getdata Object containing the key value pairs sent in DELETE
         * @param headers An array HTTP Request Headers
         * @param axiosConfig Configuration for the axios javascript library that will be the
         * foundation for the rest of the parameters
         *
         * @returns A promise for [[RequestResponseData]]
         */
        this.delete = (baseurl, getdata, headers = {}, axiosConfig = undefined) => this._request("DELETE", baseurl, getdata, {}, this._setHeaders(headers), axiosConfig);
        /**
         * Makes a POST call to an API.
         *
         * @param baseurl Path to the API
         * @param getdata Object containing the key value pairs sent in POST
         * @param postdata Object containing the key value pairs sent in POST
         * @param headers An array HTTP Request Headers
         * @param axiosConfig Configuration for the axios javascript library that will be the
         * foundation for the rest of the parameters
         *
         * @returns A promise for [[RequestResponseData]]
         */
        this.post = (baseurl, getdata, postdata, headers = {}, axiosConfig = undefined) => this._request("POST", baseurl, getdata, postdata, this._setHeaders(headers), axiosConfig);
        /**
         * Makes a PUT call to an API.
         *
         * @param baseurl Path to the baseurl
         * @param getdata Object containing the key value pairs sent in PUT
         * @param postdata Object containing the key value pairs sent in PUT
         * @param headers An array HTTP Request Headers
         * @param axiosConfig Configuration for the axios javascript library that will be the
         * foundation for the rest of the parameters
         *
         * @returns A promise for [[RequestResponseData]]
         */
        this.put = (baseurl, getdata, postdata, headers = {}, axiosConfig = undefined) => this._request("PUT", baseurl, getdata, postdata, this._setHeaders(headers), axiosConfig);
        /**
         * Makes a PATCH call to an API.
         *
         * @param baseurl Path to the baseurl
         * @param getdata Object containing the key value pairs sent in PATCH
         * @param postdata Object containing the key value pairs sent in PATCH
         * @param parameters Object containing the parameters of the API call
         * @param headers An array HTTP Request Headers
         * @param axiosConfig Configuration for the axios javascript library that will be the
         * foundation for the rest of the parameters
         *
         * @returns A promise for [[RequestResponseData]]
         */
        this.patch = (baseurl, getdata, postdata, headers = {}, axiosConfig = undefined) => this._request("PATCH", baseurl, getdata, postdata, this._setHeaders(headers), axiosConfig);
        this.setAddress(host, port, protocol);
    }
}
exports.default = AvalancheCore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXZhbGFuY2hlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2F2YWxhbmNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBOzs7R0FHRztBQUNILGtEQUtjO0FBQ2QsOENBQStEO0FBQy9ELDJDQUE4QztBQUM5Qyw2REFBeUQ7QUFFekQ7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBcUIsYUFBYTtJQWdhaEM7Ozs7OztPQU1HO0lBQ0gsWUFBWSxJQUFZLEVBQUUsSUFBWSxFQUFFLFdBQW1CLE1BQU07UUF0YXZELGNBQVMsR0FBVyxDQUFDLENBQUE7UUFDckIsUUFBRyxHQUFXLEVBQUUsQ0FBQTtRQU1oQixTQUFJLEdBQVcsU0FBUyxDQUFBO1FBQ3hCLFlBQU8sR0FBNEIsRUFBRSxDQUFBO1FBQ3JDLGtCQUFhLEdBQXVCLEVBQUUsQ0FBQTtRQUN0QyxTQUFJLEdBQTZCLEVBQUUsQ0FBQTtRQUU3Qzs7Ozs7Ozs7O1dBU0c7UUFDSCxlQUFVLEdBQUcsQ0FDWCxJQUFZLEVBQ1osSUFBWSxFQUNaLFdBQW1CLE1BQU0sRUFDbkIsRUFBRTtZQUNSLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLEVBQUUsQ0FBQyxDQUFBO1lBQ2pELFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLEVBQUUsQ0FBQyxDQUFBO1lBQ3pELE1BQU0sU0FBUyxHQUFhLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1lBQzdDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNqQywwQkFBMEI7Z0JBQzFCLE1BQU0sSUFBSSxzQkFBYSxDQUNyQixvREFBb0QsQ0FDckQsQ0FBQTthQUNGO1lBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7WUFDaEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7WUFDaEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7WUFDeEIsSUFBSSxHQUFHLEdBQVcsR0FBRyxRQUFRLE1BQU0sSUFBSSxFQUFFLENBQUE7WUFDekMsSUFBSSxJQUFJLElBQUksU0FBUyxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFO2dCQUM5RCxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUE7YUFDdkI7WUFDRCxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNoQixDQUFDLENBQUE7UUFFRDs7V0FFRztRQUNILGdCQUFXLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQTtRQUV6Qzs7V0FFRztRQUNILFlBQU8sR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFBO1FBRWpDOztXQUVHO1FBQ0gsVUFBSyxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUE7UUFFL0I7O1dBRUc7UUFDSCxZQUFPLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQTtRQUVqQzs7V0FFRztRQUNILFdBQU0sR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFBO1FBRS9COztXQUVHO1FBQ0gsZUFBVSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUE7UUFFdkM7O1dBRUc7UUFDSCxxQkFBZ0IsR0FBRyxHQUF1QixFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQTtRQUUvRDs7V0FFRztRQUNILGlCQUFZLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQTtRQUUzQzs7V0FFRztRQUNILGlCQUFZLEdBQUcsQ0FBQyxLQUFhLEVBQVEsRUFBRTtZQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQTtZQUN0QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUEsaUNBQWUsRUFBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDNUMsQ0FBQyxDQUFBO1FBRUQ7Ozs7V0FJRztRQUNILFdBQU0sR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFBO1FBRS9COzs7O1dBSUc7UUFDSCxXQUFNLEdBQUcsQ0FBQyxHQUFXLEVBQVEsRUFBRTtZQUM3QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNoQixDQUFDLENBQUE7UUFFRDs7Ozs7V0FLRztRQUNILGNBQVMsR0FBRyxDQUFDLEdBQVcsRUFBRSxLQUFhLEVBQVEsRUFBRTtZQUMvQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDaEMsQ0FBQyxDQUFBO1FBRUQ7Ozs7V0FJRztRQUNILGlCQUFZLEdBQUcsQ0FBQyxHQUFXLEVBQVEsRUFBRTtZQUNuQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBQy9CLENBQUMsQ0FBQTtRQUVEOztXQUVHO1FBQ0gscUJBQWdCLEdBQUcsR0FBUyxFQUFFO1lBQzVCLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDL0IsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRTtvQkFDNUQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQTtpQkFDL0I7YUFDRjtRQUNILENBQUMsQ0FBQTtRQUVEOzs7OztXQUtHO1FBQ0gscUJBQWdCLEdBQUcsQ0FBQyxHQUFXLEVBQUUsS0FBdUIsRUFBUSxFQUFFO1lBQ2hFLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQTtRQUN0QyxDQUFDLENBQUE7UUFFRDs7OztXQUlHO1FBQ0gsd0JBQW1CLEdBQUcsQ0FBQyxHQUFXLEVBQVEsRUFBRTtZQUMxQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBQ3JDLENBQUMsQ0FBQTtRQUVEOztXQUVHO1FBQ0gsNEJBQXVCLEdBQUcsR0FBUyxFQUFFO1lBQ25DLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDckMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsRUFBRTtvQkFDbEUsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQTtpQkFDckM7YUFDRjtRQUNILENBQUMsQ0FBQTtRQUVEOzs7O1dBSUc7UUFDSCxpQkFBWSxHQUFHLENBQUMsSUFBWSxFQUFRLEVBQUU7WUFDcEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7UUFDbEIsQ0FBQyxDQUFBO1FBRVMsZ0JBQVcsR0FBRyxDQUFDLE9BQVksRUFBdUIsRUFBRTtZQUM1RCxJQUFJLE9BQU8sSUFBSSxDQUFDLE9BQU8sS0FBSyxRQUFRLEVBQUU7Z0JBQ3BDLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDdkQsT0FBTyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7aUJBQzFCO2FBQ0Y7WUFFRCxJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQ2pDLE9BQU8sQ0FBQyxhQUFhLEdBQUcsVUFBVSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7YUFDOUM7WUFDRCxPQUFPLE9BQU8sQ0FBQTtRQUNoQixDQUFDLENBQUE7UUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBa0JHO1FBQ0gsV0FBTSxHQUFHLENBQ1AsT0FBZSxFQUNmLGFBSU8sRUFDUCxVQUFrQixTQUFTLEVBQzNCLEdBQUcsSUFBVyxFQUNkLEVBQUU7WUFDRixJQUFJLE9BQU8sT0FBTyxLQUFLLFdBQVcsRUFBRTtnQkFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDLEdBQUcsSUFBSSxhQUFhLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO2FBQ3RFO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTthQUNwRTtRQUNILENBQUMsQ0FBQTtRQUVEOzs7O1dBSUc7UUFDSCxRQUFHLEdBQUcsQ0FBcUIsT0FBZSxFQUFNLEVBQUUsQ0FDaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFPLENBQUE7UUFFL0I7O1dBRUc7UUFDTyxhQUFRLEdBQUcsQ0FDbkIsU0FBaUIsRUFDakIsT0FBZSxFQUNmLE9BQWUsRUFDZixRQUF5RCxFQUN6RCxVQUErQixFQUFFLEVBQ2pDLGNBQWtDLFNBQVMsRUFDYixFQUFFO1lBQ2hDLElBQUksTUFBMEIsQ0FBQTtZQUM5QixJQUFJLFdBQVcsRUFBRTtnQkFDZixNQUFNLG1DQUNELFdBQVcsR0FDWCxJQUFJLENBQUMsYUFBYSxDQUN0QixDQUFBO2FBQ0Y7aUJBQU07Z0JBQ0wsTUFBTSxtQkFDSixPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxNQUFNLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxFQUN2RCxZQUFZLEVBQUUsTUFBTSxJQUNqQixJQUFJLENBQUMsYUFBYSxDQUN0QixDQUFBO2FBQ0Y7WUFDRCxNQUFNLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQTtZQUNwQixNQUFNLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQTtZQUN6QixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtZQUN4QixNQUFNLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQTtZQUN0QixNQUFNLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQTtZQUN2QixNQUFNLElBQUksR0FBdUIsTUFBTSxlQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQzVELDRCQUE0QjtZQUM1QixNQUFNLE9BQU8sR0FBd0IsSUFBSSw2QkFBbUIsQ0FDMUQsSUFBSSxDQUFDLElBQUksRUFDVCxJQUFJLENBQUMsT0FBTyxFQUNaLElBQUksQ0FBQyxNQUFNLEVBQ1gsSUFBSSxDQUFDLFVBQVUsRUFDZixJQUFJLENBQUMsT0FBTyxDQUNiLENBQUE7WUFDRCxPQUFPLE9BQU8sQ0FBQTtRQUNoQixDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7Ozs7O1dBVUc7UUFDSCxRQUFHLEdBQUcsQ0FDSixPQUFlLEVBQ2YsT0FBZSxFQUNmLFVBQWtCLEVBQUUsRUFDcEIsY0FBa0MsU0FBUyxFQUNiLEVBQUUsQ0FDaEMsSUFBSSxDQUFDLFFBQVEsQ0FDWCxLQUFLLEVBQ0wsT0FBTyxFQUNQLE9BQU8sRUFDUCxFQUFFLEVBQ0YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFDekIsV0FBVyxDQUNaLENBQUE7UUFFSDs7Ozs7Ozs7OztXQVVHO1FBQ0gsV0FBTSxHQUFHLENBQ1AsT0FBZSxFQUNmLE9BQWUsRUFDZixVQUFrQixFQUFFLEVBQ3BCLGNBQWtDLFNBQVMsRUFDYixFQUFFLENBQ2hDLElBQUksQ0FBQyxRQUFRLENBQ1gsUUFBUSxFQUNSLE9BQU8sRUFDUCxPQUFPLEVBQ1AsRUFBRSxFQUNGLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQ3pCLFdBQVcsQ0FDWixDQUFBO1FBRUg7Ozs7Ozs7Ozs7O1dBV0c7UUFDSCxTQUFJLEdBQUcsQ0FDTCxPQUFlLEVBQ2YsT0FBZSxFQUNmLFFBQXlELEVBQ3pELFVBQWtCLEVBQUUsRUFDcEIsY0FBa0MsU0FBUyxFQUNiLEVBQUUsQ0FDaEMsSUFBSSxDQUFDLFFBQVEsQ0FDWCxNQUFNLEVBQ04sT0FBTyxFQUNQLE9BQU8sRUFDUCxRQUFRLEVBQ1IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFDekIsV0FBVyxDQUNaLENBQUE7UUFFSDs7Ozs7Ozs7Ozs7V0FXRztRQUNILFFBQUcsR0FBRyxDQUNKLE9BQWUsRUFDZixPQUFlLEVBQ2YsUUFBeUQsRUFDekQsVUFBa0IsRUFBRSxFQUNwQixjQUFrQyxTQUFTLEVBQ2IsRUFBRSxDQUNoQyxJQUFJLENBQUMsUUFBUSxDQUNYLEtBQUssRUFDTCxPQUFPLEVBQ1AsT0FBTyxFQUNQLFFBQVEsRUFDUixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUN6QixXQUFXLENBQ1osQ0FBQTtRQUVIOzs7Ozs7Ozs7Ozs7V0FZRztRQUNILFVBQUssR0FBRyxDQUNOLE9BQWUsRUFDZixPQUFlLEVBQ2YsUUFBeUQsRUFDekQsVUFBa0IsRUFBRSxFQUNwQixjQUFrQyxTQUFTLEVBQ2IsRUFBRSxDQUNoQyxJQUFJLENBQUMsUUFBUSxDQUNYLE9BQU8sRUFDUCxPQUFPLEVBQ1AsT0FBTyxFQUNQLFFBQVEsRUFDUixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUN6QixXQUFXLENBQ1osQ0FBQTtRQVVELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUN2QyxDQUFDO0NBQ0Y7QUExYUQsZ0NBMGFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQXZhbGFuY2hlQ29yZVxuICovXG5pbXBvcnQgYXhpb3MsIHtcbiAgQXhpb3NSZXF1ZXN0Q29uZmlnLFxuICBBeGlvc1JlcXVlc3RIZWFkZXJzLFxuICBBeGlvc1Jlc3BvbnNlLFxuICBNZXRob2Rcbn0gZnJvbSBcImF4aW9zXCJcbmltcG9ydCB7IEFQSUJhc2UsIFJlcXVlc3RSZXNwb25zZURhdGEgfSBmcm9tIFwiLi9jb21tb24vYXBpYmFzZVwiXG5pbXBvcnQgeyBQcm90b2NvbEVycm9yIH0gZnJvbSBcIi4vdXRpbHMvZXJyb3JzXCJcbmltcG9ydCB7IGdldFByZWZlcnJlZEhSUCB9IGZyb20gXCIuL3V0aWxzL2hlbHBlcmZ1bmN0aW9uc1wiXG5cbi8qKlxuICogQXZhbGFuY2hlQ29yZSBpcyBtaWRkbGV3YXJlIGZvciBpbnRlcmFjdGluZyB3aXRoIEF2YWxhbmNoZSBub2RlIFJQQyBBUElzLlxuICpcbiAqIEV4YW1wbGUgdXNhZ2U6XG4gKiBgYGBqc1xuICogbGV0IGF2YWxhbmNoZSA9IG5ldyBBdmFsYW5jaGVDb3JlKFwiMTI3LjAuMC4xXCIsIDk2NTAsIFwiaHR0cHNcIilcbiAqIGBgYFxuICpcbiAqXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF2YWxhbmNoZUNvcmUge1xuICBwcm90ZWN0ZWQgbmV0d29ya0lEOiBudW1iZXIgPSAwXG4gIHByb3RlY3RlZCBocnA6IHN0cmluZyA9IFwiXCJcbiAgcHJvdGVjdGVkIHByb3RvY29sOiBzdHJpbmdcbiAgcHJvdGVjdGVkIGlwOiBzdHJpbmdcbiAgcHJvdGVjdGVkIGhvc3Q6IHN0cmluZ1xuICBwcm90ZWN0ZWQgcG9ydDogbnVtYmVyXG4gIHByb3RlY3RlZCB1cmw6IHN0cmluZ1xuICBwcm90ZWN0ZWQgYXV0aDogc3RyaW5nID0gdW5kZWZpbmVkXG4gIHByb3RlY3RlZCBoZWFkZXJzOiB7IFtrOiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9XG4gIHByb3RlY3RlZCByZXF1ZXN0Q29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7fVxuICBwcm90ZWN0ZWQgYXBpczogeyBbazogc3RyaW5nXTogQVBJQmFzZSB9ID0ge31cblxuICAvKipcbiAgICogU2V0cyB0aGUgYWRkcmVzcyBhbmQgcG9ydCBvZiB0aGUgbWFpbiBBdmFsYW5jaGUgQ2xpZW50LlxuICAgKlxuICAgKiBAcGFyYW0gaG9zdCBUaGUgaG9zdG5hbWUgdG8gcmVzb2x2ZSB0byByZWFjaCB0aGUgQXZhbGFuY2hlIENsaWVudCBSUEMgQVBJcy5cbiAgICogQHBhcmFtIHBvcnQgVGhlIHBvcnQgdG8gcmVzb2x2ZSB0byByZWFjaCB0aGUgQXZhbGFuY2hlIENsaWVudCBSUEMgQVBJcy5cbiAgICogQHBhcmFtIHByb3RvY29sIFRoZSBwcm90b2NvbCBzdHJpbmcgdG8gdXNlIGJlZm9yZSBhIFwiOi8vXCIgaW4gYSByZXF1ZXN0LFxuICAgKiBleDogXCJodHRwXCIsIFwiaHR0cHNcIiwgZXRjLiBEZWZhdWx0cyB0byBodHRwXG4gICAqIFRoZSBmb2xsb3dpbmcgc3BlY2lhbCBjaGFyYWN0ZXJzIGFyZSByZW1vdmVkIGZyb20gaG9zdCBhbmQgcHJvdG9jb2xcbiAgICogJiMsQCsoKSR+JSdcIjoqP3t9IGFsc28gbGVzcyB0aGFuIGFuZCBncmVhdGVyIHRoYW4gc2lnbnNcbiAgICovXG4gIHNldEFkZHJlc3MgPSAoXG4gICAgaG9zdDogc3RyaW5nLFxuICAgIHBvcnQ6IG51bWJlcixcbiAgICBwcm90b2NvbDogc3RyaW5nID0gXCJodHRwXCJcbiAgKTogdm9pZCA9PiB7XG4gICAgaG9zdCA9IGhvc3QucmVwbGFjZSgvWyYjLEArKCkkfiUnXCI6Kj88Pnt9XS9nLCBcIlwiKVxuICAgIHByb3RvY29sID0gcHJvdG9jb2wucmVwbGFjZSgvWyYjLEArKCkkfiUnXCI6Kj88Pnt9XS9nLCBcIlwiKVxuICAgIGNvbnN0IHByb3RvY29sczogc3RyaW5nW10gPSBbXCJodHRwXCIsIFwiaHR0cHNcIl1cbiAgICBpZiAoIXByb3RvY29scy5pbmNsdWRlcyhwcm90b2NvbCkpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgUHJvdG9jb2xFcnJvcihcbiAgICAgICAgXCJFcnJvciAtIEF2YWxhbmNoZUNvcmUuc2V0QWRkcmVzczogSW52YWxpZCBwcm90b2NvbFwiXG4gICAgICApXG4gICAgfVxuXG4gICAgdGhpcy5ob3N0ID0gaG9zdFxuICAgIHRoaXMucG9ydCA9IHBvcnRcbiAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2xcbiAgICBsZXQgdXJsOiBzdHJpbmcgPSBgJHtwcm90b2NvbH06Ly8ke2hvc3R9YFxuICAgIGlmIChwb3J0ICE9IHVuZGVmaW5lZCAmJiB0eXBlb2YgcG9ydCA9PT0gXCJudW1iZXJcIiAmJiBwb3J0ID49IDApIHtcbiAgICAgIHVybCA9IGAke3VybH06JHtwb3J0fWBcbiAgICB9XG4gICAgdGhpcy51cmwgPSB1cmxcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwcm90b2NvbCBzdWNoIGFzIFwiaHR0cFwiLCBcImh0dHBzXCIsIFwiZ2l0XCIsIFwid3NcIiwgZXRjLlxuICAgKi9cbiAgZ2V0UHJvdG9jb2wgPSAoKTogc3RyaW5nID0+IHRoaXMucHJvdG9jb2xcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaG9zdCBmb3IgdGhlIEF2YWxhbmNoZSBub2RlLlxuICAgKi9cbiAgZ2V0SG9zdCA9ICgpOiBzdHJpbmcgPT4gdGhpcy5ob3N0XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIElQIGZvciB0aGUgQXZhbGFuY2hlIG5vZGUuXG4gICAqL1xuICBnZXRJUCA9ICgpOiBzdHJpbmcgPT4gdGhpcy5ob3N0XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBvcnQgZm9yIHRoZSBBdmFsYW5jaGUgbm9kZS5cbiAgICovXG4gIGdldFBvcnQgPSAoKTogbnVtYmVyID0+IHRoaXMucG9ydFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBVUkwgb2YgdGhlIEF2YWxhbmNoZSBub2RlIChpcCArIHBvcnQpXG4gICAqL1xuICBnZXRVUkwgPSAoKTogc3RyaW5nID0+IHRoaXMudXJsXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGN1c3RvbSBoZWFkZXJzXG4gICAqL1xuICBnZXRIZWFkZXJzID0gKCk6IG9iamVjdCA9PiB0aGlzLmhlYWRlcnNcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VzdG9tIHJlcXVlc3QgY29uZmlnXG4gICAqL1xuICBnZXRSZXF1ZXN0Q29uZmlnID0gKCk6IEF4aW9zUmVxdWVzdENvbmZpZyA9PiB0aGlzLnJlcXVlc3RDb25maWdcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbmV0d29ya0lEXG4gICAqL1xuICBnZXROZXR3b3JrSUQgPSAoKTogbnVtYmVyID0+IHRoaXMubmV0d29ya0lEXG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIG5ldHdvcmtJRFxuICAgKi9cbiAgc2V0TmV0d29ya0lEID0gKG5ldElEOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgICB0aGlzLm5ldHdvcmtJRCA9IG5ldElEXG4gICAgdGhpcy5ocnAgPSBnZXRQcmVmZXJyZWRIUlAodGhpcy5uZXR3b3JrSUQpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgSHVtYW4tUmVhZGFibGUtUGFydCBvZiB0aGUgbmV0d29yayBhc3NvY2lhdGVkIHdpdGggdGhpcyBrZXkuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBbW0tleVBhaXJdXSdzIEh1bWFuLVJlYWRhYmxlLVBhcnQgb2YgdGhlIG5ldHdvcmsncyBCZWNoMzIgYWRkcmVzc2luZyBzY2hlbWVcbiAgICovXG4gIGdldEhSUCA9ICgpOiBzdHJpbmcgPT4gdGhpcy5ocnBcblxuICAvKipcbiAgICogU2V0cyB0aGUgdGhlIEh1bWFuLVJlYWRhYmxlLVBhcnQgb2YgdGhlIG5ldHdvcmsgYXNzb2NpYXRlZCB3aXRoIHRoaXMga2V5LlxuICAgKlxuICAgKiBAcGFyYW0gaHJwIFN0cmluZyBmb3IgdGhlIEh1bWFuLVJlYWRhYmxlLVBhcnQgb2YgQmVjaDMyIGFkZHJlc3Nlc1xuICAgKi9cbiAgc2V0SFJQID0gKGhycDogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgdGhpcy5ocnAgPSBocnBcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgbmV3IGN1c3RvbSBoZWFkZXIgdG8gYmUgaW5jbHVkZWQgd2l0aCBhbGwgcmVxdWVzdHMuXG4gICAqXG4gICAqIEBwYXJhbSBrZXkgSGVhZGVyIG5hbWVcbiAgICogQHBhcmFtIHZhbHVlIEhlYWRlciB2YWx1ZVxuICAgKi9cbiAgc2V0SGVhZGVyID0gKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgdGhpcy5oZWFkZXJzW2Ake2tleX1gXSA9IHZhbHVlXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIHByZXZpb3VzbHkgYWRkZWQgY3VzdG9tIGhlYWRlci5cbiAgICpcbiAgICogQHBhcmFtIGtleSBIZWFkZXIgbmFtZVxuICAgKi9cbiAgcmVtb3ZlSGVhZGVyID0gKGtleTogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgZGVsZXRlIHRoaXMuaGVhZGVyc1tgJHtrZXl9YF1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCBoZWFkZXJzLlxuICAgKi9cbiAgcmVtb3ZlQWxsSGVhZGVycyA9ICgpOiB2b2lkID0+IHtcbiAgICBmb3IgKGNvbnN0IHByb3AgaW4gdGhpcy5oZWFkZXJzKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuaGVhZGVycywgcHJvcCkpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuaGVhZGVyc1tgJHtwcm9wfWBdXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBuZXcgY3VzdG9tIGNvbmZpZyB2YWx1ZSB0byBiZSBpbmNsdWRlZCB3aXRoIGFsbCByZXF1ZXN0cy5cbiAgICpcbiAgICogQHBhcmFtIGtleSBDb25maWcgbmFtZVxuICAgKiBAcGFyYW0gdmFsdWUgQ29uZmlnIHZhbHVlXG4gICAqL1xuICBzZXRSZXF1ZXN0Q29uZmlnID0gKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgIHRoaXMucmVxdWVzdENvbmZpZ1tgJHtrZXl9YF0gPSB2YWx1ZVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBwcmV2aW91c2x5IGFkZGVkIHJlcXVlc3QgY29uZmlnLlxuICAgKlxuICAgKiBAcGFyYW0ga2V5IEhlYWRlciBuYW1lXG4gICAqL1xuICByZW1vdmVSZXF1ZXN0Q29uZmlnID0gKGtleTogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgZGVsZXRlIHRoaXMucmVxdWVzdENvbmZpZ1tgJHtrZXl9YF1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCByZXF1ZXN0IGNvbmZpZ3MuXG4gICAqL1xuICByZW1vdmVBbGxSZXF1ZXN0Q29uZmlncyA9ICgpOiB2b2lkID0+IHtcbiAgICBmb3IgKGNvbnN0IHByb3AgaW4gdGhpcy5yZXF1ZXN0Q29uZmlnKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMucmVxdWVzdENvbmZpZywgcHJvcCkpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMucmVxdWVzdENvbmZpZ1tgJHtwcm9wfWBdXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHRlbXBvcmFyeSBhdXRoIHRva2VuIHVzZWQgZm9yIGNvbW11bmljYXRpbmcgd2l0aCB0aGUgbm9kZS5cbiAgICpcbiAgICogQHBhcmFtIGF1dGggQSB0ZW1wb3JhcnkgdG9rZW4gcHJvdmlkZWQgYnkgdGhlIG5vZGUgZW5hYmxpbmcgYWNjZXNzIHRvIHRoZSBlbmRwb2ludHMgb24gdGhlIG5vZGUuXG4gICAqL1xuICBzZXRBdXRoVG9rZW4gPSAoYXV0aDogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgdGhpcy5hdXRoID0gYXV0aFxuICB9XG5cbiAgcHJvdGVjdGVkIF9zZXRIZWFkZXJzID0gKGhlYWRlcnM6IGFueSk6IEF4aW9zUmVxdWVzdEhlYWRlcnMgPT4ge1xuICAgIGlmICh0eXBlb2YgdGhpcy5oZWFkZXJzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh0aGlzLmhlYWRlcnMpKSB7XG4gICAgICAgIGhlYWRlcnNbYCR7a2V5fWBdID0gdmFsdWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHRoaXMuYXV0aCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgaGVhZGVycy5BdXRob3JpemF0aW9uID0gYEJlYXJlciAke3RoaXMuYXV0aH1gXG4gICAgfVxuICAgIHJldHVybiBoZWFkZXJzXG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiBBUEkgdG8gdGhlIG1pZGRsZXdhcmUuIFRoZSBBUEkgcmVzb2x2ZXMgdG8gYSByZWdpc3RlcmVkIGJsb2NrY2hhaW4ncyBSUEMuXG4gICAqXG4gICAqIEluIFR5cGVTY3JpcHQ6XG4gICAqIGBgYGpzXG4gICAqIGF2YWxhbmNoZS5hZGRBUEk8TXlWTUNsYXNzPihcIm15Y2hhaW5cIiwgTXlWTUNsYXNzLCBcIi9leHQvYmMvbXljaGFpblwiKVxuICAgKiBgYGBcbiAgICpcbiAgICogSW4gSmF2YXNjcmlwdDpcbiAgICogYGBganNcbiAgICogYXZhbGFuY2hlLmFkZEFQSShcIm15Y2hhaW5cIiwgTXlWTUNsYXNzLCBcIi9leHQvYmMvbXljaGFpblwiKVxuICAgKiBgYGBcbiAgICpcbiAgICogQHR5cGVwYXJhbSBHQSBDbGFzcyBvZiB0aGUgQVBJIGJlaW5nIGFkZGVkXG4gICAqIEBwYXJhbSBhcGlOYW1lIEEgbGFiZWwgZm9yIHJlZmVyZW5jaW5nIHRoZSBBUEkgaW4gdGhlIGZ1dHVyZVxuICAgKiBAcGFyYW0gQ29uc3RydWN0b3JGTiBBIHJlZmVyZW5jZSB0byB0aGUgY2xhc3Mgd2hpY2ggaW5zdGFudGlhdGVzIHRoZSBBUElcbiAgICogQHBhcmFtIGJhc2V1cmwgUGF0aCB0byByZXNvbHZlIHRvIHJlYWNoIHRoZSBBUElcbiAgICpcbiAgICovXG4gIGFkZEFQSSA9IDxHQSBleHRlbmRzIEFQSUJhc2U+KFxuICAgIGFwaU5hbWU6IHN0cmluZyxcbiAgICBDb25zdHJ1Y3RvckZOOiBuZXcgKFxuICAgICAgZGp0eDogQXZhbGFuY2hlQ29yZSxcbiAgICAgIGJhc2V1cmw/OiBzdHJpbmcsXG4gICAgICAuLi5hcmdzOiBhbnlbXVxuICAgICkgPT4gR0EsXG4gICAgYmFzZXVybDogc3RyaW5nID0gdW5kZWZpbmVkLFxuICAgIC4uLmFyZ3M6IGFueVtdXG4gICkgPT4ge1xuICAgIGlmICh0eXBlb2YgYmFzZXVybCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5hcGlzW2Ake2FwaU5hbWV9YF0gPSBuZXcgQ29uc3RydWN0b3JGTih0aGlzLCB1bmRlZmluZWQsIC4uLmFyZ3MpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXBpc1tgJHthcGlOYW1lfWBdID0gbmV3IENvbnN0cnVjdG9yRk4odGhpcywgYmFzZXVybCwgLi4uYXJncylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIGEgcmVmZXJlbmNlIHRvIGFuIEFQSSBieSBpdHMgYXBpTmFtZSBsYWJlbC5cbiAgICpcbiAgICogQHBhcmFtIGFwaU5hbWUgTmFtZSBvZiB0aGUgQVBJIHRvIHJldHVyblxuICAgKi9cbiAgYXBpID0gPEdBIGV4dGVuZHMgQVBJQmFzZT4oYXBpTmFtZTogc3RyaW5nKTogR0EgPT5cbiAgICB0aGlzLmFwaXNbYCR7YXBpTmFtZX1gXSBhcyBHQVxuXG4gIC8qKlxuICAgKiBAaWdub3JlXG4gICAqL1xuICBwcm90ZWN0ZWQgX3JlcXVlc3QgPSBhc3luYyAoXG4gICAgeGhybWV0aG9kOiBNZXRob2QsXG4gICAgYmFzZXVybDogc3RyaW5nLFxuICAgIGdldGRhdGE6IG9iamVjdCxcbiAgICBwb3N0ZGF0YTogc3RyaW5nIHwgb2JqZWN0IHwgQXJyYXlCdWZmZXIgfCBBcnJheUJ1ZmZlclZpZXcsXG4gICAgaGVhZGVyczogQXhpb3NSZXF1ZXN0SGVhZGVycyA9IHt9LFxuICAgIGF4aW9zQ29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB1bmRlZmluZWRcbiAgKTogUHJvbWlzZTxSZXF1ZXN0UmVzcG9uc2VEYXRhPiA9PiB7XG4gICAgbGV0IGNvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnXG4gICAgaWYgKGF4aW9zQ29uZmlnKSB7XG4gICAgICBjb25maWcgPSB7XG4gICAgICAgIC4uLmF4aW9zQ29uZmlnLFxuICAgICAgICAuLi50aGlzLnJlcXVlc3RDb25maWdcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uZmlnID0ge1xuICAgICAgICBiYXNlVVJMOiBgJHt0aGlzLnByb3RvY29sfTovLyR7dGhpcy5ob3N0fToke3RoaXMucG9ydH1gLFxuICAgICAgICByZXNwb25zZVR5cGU6IFwidGV4dFwiLFxuICAgICAgICAuLi50aGlzLnJlcXVlc3RDb25maWdcbiAgICAgIH1cbiAgICB9XG4gICAgY29uZmlnLnVybCA9IGJhc2V1cmxcbiAgICBjb25maWcubWV0aG9kID0geGhybWV0aG9kXG4gICAgY29uZmlnLmhlYWRlcnMgPSBoZWFkZXJzXG4gICAgY29uZmlnLmRhdGEgPSBwb3N0ZGF0YVxuICAgIGNvbmZpZy5wYXJhbXMgPSBnZXRkYXRhXG4gICAgY29uc3QgcmVzcDogQXhpb3NSZXNwb25zZTxhbnk+ID0gYXdhaXQgYXhpb3MucmVxdWVzdChjb25maWcpXG4gICAgLy8gcHVyZ2luZyBhbGwgdGhhdCBpcyBheGlvc1xuICAgIGNvbnN0IHhocmRhdGE6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBuZXcgUmVxdWVzdFJlc3BvbnNlRGF0YShcbiAgICAgIHJlc3AuZGF0YSxcbiAgICAgIHJlc3AuaGVhZGVycyxcbiAgICAgIHJlc3Auc3RhdHVzLFxuICAgICAgcmVzcC5zdGF0dXNUZXh0LFxuICAgICAgcmVzcC5yZXF1ZXN0XG4gICAgKVxuICAgIHJldHVybiB4aHJkYXRhXG4gIH1cblxuICAvKipcbiAgICogTWFrZXMgYSBHRVQgY2FsbCB0byBhbiBBUEkuXG4gICAqXG4gICAqIEBwYXJhbSBiYXNldXJsIFBhdGggdG8gdGhlIGFwaVxuICAgKiBAcGFyYW0gZ2V0ZGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUga2V5IHZhbHVlIHBhaXJzIHNlbnQgaW4gR0VUXG4gICAqIEBwYXJhbSBoZWFkZXJzIEFuIGFycmF5IEhUVFAgUmVxdWVzdCBIZWFkZXJzXG4gICAqIEBwYXJhbSBheGlvc0NvbmZpZyBDb25maWd1cmF0aW9uIGZvciB0aGUgYXhpb3MgamF2YXNjcmlwdCBsaWJyYXJ5IHRoYXQgd2lsbCBiZSB0aGVcbiAgICogZm91bmRhdGlvbiBmb3IgdGhlIHJlc3Qgb2YgdGhlIHBhcmFtZXRlcnNcbiAgICpcbiAgICogQHJldHVybnMgQSBwcm9taXNlIGZvciBbW1JlcXVlc3RSZXNwb25zZURhdGFdXVxuICAgKi9cbiAgZ2V0ID0gKFxuICAgIGJhc2V1cmw6IHN0cmluZyxcbiAgICBnZXRkYXRhOiBvYmplY3QsXG4gICAgaGVhZGVyczogb2JqZWN0ID0ge30sXG4gICAgYXhpb3NDb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHVuZGVmaW5lZFxuICApOiBQcm9taXNlPFJlcXVlc3RSZXNwb25zZURhdGE+ID0+XG4gICAgdGhpcy5fcmVxdWVzdChcbiAgICAgIFwiR0VUXCIsXG4gICAgICBiYXNldXJsLFxuICAgICAgZ2V0ZGF0YSxcbiAgICAgIHt9LFxuICAgICAgdGhpcy5fc2V0SGVhZGVycyhoZWFkZXJzKSxcbiAgICAgIGF4aW9zQ29uZmlnXG4gICAgKVxuXG4gIC8qKlxuICAgKiBNYWtlcyBhIERFTEVURSBjYWxsIHRvIGFuIEFQSS5cbiAgICpcbiAgICogQHBhcmFtIGJhc2V1cmwgUGF0aCB0byB0aGUgQVBJXG4gICAqIEBwYXJhbSBnZXRkYXRhIE9iamVjdCBjb250YWluaW5nIHRoZSBrZXkgdmFsdWUgcGFpcnMgc2VudCBpbiBERUxFVEVcbiAgICogQHBhcmFtIGhlYWRlcnMgQW4gYXJyYXkgSFRUUCBSZXF1ZXN0IEhlYWRlcnNcbiAgICogQHBhcmFtIGF4aW9zQ29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBheGlvcyBqYXZhc2NyaXB0IGxpYnJhcnkgdGhhdCB3aWxsIGJlIHRoZVxuICAgKiBmb3VuZGF0aW9uIGZvciB0aGUgcmVzdCBvZiB0aGUgcGFyYW1ldGVyc1xuICAgKlxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgZm9yIFtbUmVxdWVzdFJlc3BvbnNlRGF0YV1dXG4gICAqL1xuICBkZWxldGUgPSAoXG4gICAgYmFzZXVybDogc3RyaW5nLFxuICAgIGdldGRhdGE6IG9iamVjdCxcbiAgICBoZWFkZXJzOiBvYmplY3QgPSB7fSxcbiAgICBheGlvc0NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0gdW5kZWZpbmVkXG4gICk6IFByb21pc2U8UmVxdWVzdFJlc3BvbnNlRGF0YT4gPT5cbiAgICB0aGlzLl9yZXF1ZXN0KFxuICAgICAgXCJERUxFVEVcIixcbiAgICAgIGJhc2V1cmwsXG4gICAgICBnZXRkYXRhLFxuICAgICAge30sXG4gICAgICB0aGlzLl9zZXRIZWFkZXJzKGhlYWRlcnMpLFxuICAgICAgYXhpb3NDb25maWdcbiAgICApXG5cbiAgLyoqXG4gICAqIE1ha2VzIGEgUE9TVCBjYWxsIHRvIGFuIEFQSS5cbiAgICpcbiAgICogQHBhcmFtIGJhc2V1cmwgUGF0aCB0byB0aGUgQVBJXG4gICAqIEBwYXJhbSBnZXRkYXRhIE9iamVjdCBjb250YWluaW5nIHRoZSBrZXkgdmFsdWUgcGFpcnMgc2VudCBpbiBQT1NUXG4gICAqIEBwYXJhbSBwb3N0ZGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUga2V5IHZhbHVlIHBhaXJzIHNlbnQgaW4gUE9TVFxuICAgKiBAcGFyYW0gaGVhZGVycyBBbiBhcnJheSBIVFRQIFJlcXVlc3QgSGVhZGVyc1xuICAgKiBAcGFyYW0gYXhpb3NDb25maWcgQ29uZmlndXJhdGlvbiBmb3IgdGhlIGF4aW9zIGphdmFzY3JpcHQgbGlicmFyeSB0aGF0IHdpbGwgYmUgdGhlXG4gICAqIGZvdW5kYXRpb24gZm9yIHRoZSByZXN0IG9mIHRoZSBwYXJhbWV0ZXJzXG4gICAqXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBmb3IgW1tSZXF1ZXN0UmVzcG9uc2VEYXRhXV1cbiAgICovXG4gIHBvc3QgPSAoXG4gICAgYmFzZXVybDogc3RyaW5nLFxuICAgIGdldGRhdGE6IG9iamVjdCxcbiAgICBwb3N0ZGF0YTogc3RyaW5nIHwgb2JqZWN0IHwgQXJyYXlCdWZmZXIgfCBBcnJheUJ1ZmZlclZpZXcsXG4gICAgaGVhZGVyczogb2JqZWN0ID0ge30sXG4gICAgYXhpb3NDb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHVuZGVmaW5lZFxuICApOiBQcm9taXNlPFJlcXVlc3RSZXNwb25zZURhdGE+ID0+XG4gICAgdGhpcy5fcmVxdWVzdChcbiAgICAgIFwiUE9TVFwiLFxuICAgICAgYmFzZXVybCxcbiAgICAgIGdldGRhdGEsXG4gICAgICBwb3N0ZGF0YSxcbiAgICAgIHRoaXMuX3NldEhlYWRlcnMoaGVhZGVycyksXG4gICAgICBheGlvc0NvbmZpZ1xuICAgIClcblxuICAvKipcbiAgICogTWFrZXMgYSBQVVQgY2FsbCB0byBhbiBBUEkuXG4gICAqXG4gICAqIEBwYXJhbSBiYXNldXJsIFBhdGggdG8gdGhlIGJhc2V1cmxcbiAgICogQHBhcmFtIGdldGRhdGEgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGtleSB2YWx1ZSBwYWlycyBzZW50IGluIFBVVFxuICAgKiBAcGFyYW0gcG9zdGRhdGEgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGtleSB2YWx1ZSBwYWlycyBzZW50IGluIFBVVFxuICAgKiBAcGFyYW0gaGVhZGVycyBBbiBhcnJheSBIVFRQIFJlcXVlc3QgSGVhZGVyc1xuICAgKiBAcGFyYW0gYXhpb3NDb25maWcgQ29uZmlndXJhdGlvbiBmb3IgdGhlIGF4aW9zIGphdmFzY3JpcHQgbGlicmFyeSB0aGF0IHdpbGwgYmUgdGhlXG4gICAqIGZvdW5kYXRpb24gZm9yIHRoZSByZXN0IG9mIHRoZSBwYXJhbWV0ZXJzXG4gICAqXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBmb3IgW1tSZXF1ZXN0UmVzcG9uc2VEYXRhXV1cbiAgICovXG4gIHB1dCA9IChcbiAgICBiYXNldXJsOiBzdHJpbmcsXG4gICAgZ2V0ZGF0YTogb2JqZWN0LFxuICAgIHBvc3RkYXRhOiBzdHJpbmcgfCBvYmplY3QgfCBBcnJheUJ1ZmZlciB8IEFycmF5QnVmZmVyVmlldyxcbiAgICBoZWFkZXJzOiBvYmplY3QgPSB7fSxcbiAgICBheGlvc0NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0gdW5kZWZpbmVkXG4gICk6IFByb21pc2U8UmVxdWVzdFJlc3BvbnNlRGF0YT4gPT5cbiAgICB0aGlzLl9yZXF1ZXN0KFxuICAgICAgXCJQVVRcIixcbiAgICAgIGJhc2V1cmwsXG4gICAgICBnZXRkYXRhLFxuICAgICAgcG9zdGRhdGEsXG4gICAgICB0aGlzLl9zZXRIZWFkZXJzKGhlYWRlcnMpLFxuICAgICAgYXhpb3NDb25maWdcbiAgICApXG5cbiAgLyoqXG4gICAqIE1ha2VzIGEgUEFUQ0ggY2FsbCB0byBhbiBBUEkuXG4gICAqXG4gICAqIEBwYXJhbSBiYXNldXJsIFBhdGggdG8gdGhlIGJhc2V1cmxcbiAgICogQHBhcmFtIGdldGRhdGEgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGtleSB2YWx1ZSBwYWlycyBzZW50IGluIFBBVENIXG4gICAqIEBwYXJhbSBwb3N0ZGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUga2V5IHZhbHVlIHBhaXJzIHNlbnQgaW4gUEFUQ0hcbiAgICogQHBhcmFtIHBhcmFtZXRlcnMgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIHBhcmFtZXRlcnMgb2YgdGhlIEFQSSBjYWxsXG4gICAqIEBwYXJhbSBoZWFkZXJzIEFuIGFycmF5IEhUVFAgUmVxdWVzdCBIZWFkZXJzXG4gICAqIEBwYXJhbSBheGlvc0NvbmZpZyBDb25maWd1cmF0aW9uIGZvciB0aGUgYXhpb3MgamF2YXNjcmlwdCBsaWJyYXJ5IHRoYXQgd2lsbCBiZSB0aGVcbiAgICogZm91bmRhdGlvbiBmb3IgdGhlIHJlc3Qgb2YgdGhlIHBhcmFtZXRlcnNcbiAgICpcbiAgICogQHJldHVybnMgQSBwcm9taXNlIGZvciBbW1JlcXVlc3RSZXNwb25zZURhdGFdXVxuICAgKi9cbiAgcGF0Y2ggPSAoXG4gICAgYmFzZXVybDogc3RyaW5nLFxuICAgIGdldGRhdGE6IG9iamVjdCxcbiAgICBwb3N0ZGF0YTogc3RyaW5nIHwgb2JqZWN0IHwgQXJyYXlCdWZmZXIgfCBBcnJheUJ1ZmZlclZpZXcsXG4gICAgaGVhZGVyczogb2JqZWN0ID0ge30sXG4gICAgYXhpb3NDb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHVuZGVmaW5lZFxuICApOiBQcm9taXNlPFJlcXVlc3RSZXNwb25zZURhdGE+ID0+XG4gICAgdGhpcy5fcmVxdWVzdChcbiAgICAgIFwiUEFUQ0hcIixcbiAgICAgIGJhc2V1cmwsXG4gICAgICBnZXRkYXRhLFxuICAgICAgcG9zdGRhdGEsXG4gICAgICB0aGlzLl9zZXRIZWFkZXJzKGhlYWRlcnMpLFxuICAgICAgYXhpb3NDb25maWdcbiAgICApXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgQXZhbGFuY2hlIGluc3RhbmNlLiBTZXRzIHRoZSBhZGRyZXNzIGFuZCBwb3J0IG9mIHRoZSBtYWluIEF2YWxhbmNoZSBDbGllbnQuXG4gICAqXG4gICAqIEBwYXJhbSBob3N0IFRoZSBob3N0bmFtZSB0byByZXNvbHZlIHRvIHJlYWNoIHRoZSBBdmFsYW5jaGUgQ2xpZW50IEFQSXNcbiAgICogQHBhcmFtIHBvcnQgVGhlIHBvcnQgdG8gcmVzb2x2ZSB0byByZWFjaCB0aGUgQXZhbGFuY2hlIENsaWVudCBBUElzXG4gICAqIEBwYXJhbSBwcm90b2NvbCBUaGUgcHJvdG9jb2wgc3RyaW5nIHRvIHVzZSBiZWZvcmUgYSBcIjovL1wiIGluIGEgcmVxdWVzdCwgZXg6IFwiaHR0cFwiLCBcImh0dHBzXCIsIFwiZ2l0XCIsIFwid3NcIiwgZXRjIC4uLlxuICAgKi9cbiAgY29uc3RydWN0b3IoaG9zdDogc3RyaW5nLCBwb3J0OiBudW1iZXIsIHByb3RvY29sOiBzdHJpbmcgPSBcImh0dHBcIikge1xuICAgIHRoaXMuc2V0QWRkcmVzcyhob3N0LCBwb3J0LCBwcm90b2NvbClcbiAgfVxufVxuIl19