const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    name: String,
    userID: String,
    accessToken: String,
    refreshToken: String,
    expiresAt: Date,
    lastUpdated: {
        type: Date,
        default: () => Date.now()
    },
    createdDate: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    }
});

userSchema.pre("save", function (next) {
    this.lastUpdated = Date.now();
    next();
})

module.exports = mongoose.model("User", userSchema);