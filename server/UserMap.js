const User = require('./User');

const cacheMap = new Map();

module.exports = {
    has(key) {
        return this.get(key) != null;
    },
    async get(key) {
        let user = cacheMap.get(key);
        if (!user) {
            user = await User.findOne({ userID: key });
            cacheMap.set(key, user);
        }
        return user;
    },
    put(key, value) {
        cacheMap.set(key, value);
        return value;
    }
}