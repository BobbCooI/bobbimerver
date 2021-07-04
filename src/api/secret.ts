const apiKeys = new Map();
import config from "../config.json"
apiKeys.set(config.headerSecret!, true);
apiKeys.set(config.headerAniSecret!, true);
export default apiKeys;