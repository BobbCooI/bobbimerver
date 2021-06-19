const apiKeys = new Map();
apiKeys.set(process.env.headerSecret!, true);
apiKeys.set(process.env.headerAniSecret!, true);
export default apiKeys;