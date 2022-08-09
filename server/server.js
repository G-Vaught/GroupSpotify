require('dotenv').config();
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const cron = require('node-cron');
const userMap = require('./UserMap');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const Group = require('./Group');
const User = require("./User");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;

const mongoose = require('mongoose');
mongoose.connect(process.env.CONNECTION_STRING, () => {
    console.log("Mongoose connected");
}, e => console.log(e));

/*
    SERVER/HELPER METHODS
*/

app.use(async (req, res, next) => {
    const data = req.body;
    if (req.path === "/login" || req.path === "/refresh") return next();

    if (!data.userID || !data.accessToken) {
        return res.status(403).send("Must include userID and access token");
    }
    const user = await getUser(data.userID);
    if (!user) {
        return res.status(403).send("Cannot find user");
    }
    if (user.accessToken !== data.accessToken) {
        return res.status(403).send("User tokens do not match");
    }
    next();
})

process.on('exit', (code) => {
    console.log("Exiting application with code: ", code);
});

/*
    AUTHENTICATION METHODS
*/

function login(req, res) {
    const code = req.body.code;

    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
    });

    spotifyApi.authorizationCodeGrant(code)
        .then(data => {
            spotifyApi.setAccessToken(data.body.access_token);
            spotifyApi.getMe().then(me => {

                const expiresAt = new Date();
                expiresAt.setSeconds(expiresAt.getSeconds() + data.body.expires_in);
                getUser(me.body.id)
                    .then(existingUser => {
                        if (existingUser) {
                            console.log("Existing user", existingUser)
                            existingUser.accessToken = data.body.access_token;
                            existingUser.refreshToken = data.body.refresh_token;
                            existingUser.expiresAt = expiresAt;
                            existingUser.save().then(() => {
                                userMap.put(existingUser.userID, existingUser);
                                res.status(200).json({
                                    userID: me.body.id,
                                    userName: me.body.display_name,
                                    accessToken: data.body.access_token,
                                    refreshToken: data.body.refresh_token,
                                    expiresIn: data.body.expires_in
                                });
                            })
                        } else {
                            const user = User.create({
                                userID: me.body.id,
                                name: me.body.display_name,
                                accessToken: data.body.access_token,
                                refreshToken: data.body.refresh_token,
                                expiresAt: expiresAt
                            })
                                .then(() => {
                                    res.status(200).json({
                                        userID: me.body.id,
                                        userName: me.body.display_name,
                                        accessToken: data.body.access_token,
                                        refreshToken: data.body.refresh_token,
                                        expiresIn: data.body.expires_in
                                    });
                                });
                        }

                    });
            })
        }).catch(err => {
            console.log(err.body);
            res.sendStatus(400);
        })
}

app.post('/login', login);

const refreshToken = async refreshToken => {
    const params = new URLSearchParams();
    params.append("grant_type", 'refresh_token');
    params.append("client_id", CLIENT_ID);
    params.append("refresh_token", refreshToken);

    const data = await axios.post('https://accounts.spotify.com/api/token', params, {
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
            "Content-Type": "application/x-www-form-urlencoded"
        },
    })

    const refreshData = data.data;

    console.log("refresh data", refreshData);
    return refreshData;
}

const refreshLogin = async user => {

    const refreshData = await refreshToken(user.refreshToken);

    user.accessToken = refreshData.access_token;
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + refreshData.expires_in - 10);
    user.expiresAt = expiresAt;
    await user.save();

    return user;
}

function calcExpirationDate() {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 3600 - 10);
    return expiresAt;
}

app.post('/refresh', async (req, res) => {
    const token = req.body.refreshToken;

    const refreshData = await refreshToken(token);

    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        accessToken: refreshData.access_token
    });

    spotifyApi.getMe()
        .then(meRes => {
            getUser(meRes.body.id)
                .then(user => {
                    user.accessToken = refreshData.access_token;
                    user.expiresAt = calcExpirationDate();
                    user.save().then(() => {
                        res.status(200).json({
                            id: meRes.body.id,
                            userName: meRes.body.display_name,
                            accessToken: refreshData.access_token,
                            expiresIn: 3600
                        });
                    })
                });
        })
        .catch(err => {
            console.log("Could not refresh token", err);
            res.sendStatus(400);
        })
})



/*
    GROUPS METHODS
*/

/*
    Input:
        userID
        name
*/
app.post('/addGroup', async (req, res) => {
    console.log("Adding Group");
    try {
        const data = req.body;
        const userID = req.body.userID;
        const groupName = req.body.name;
        if (!data) {
            res.sendStatus(400);
        }
        const user = await getUser(userID);
        console.log("Add group data", data);
        const createdGroup = await Group.create({
            owner: user._id,
            name: groupName,
            users: [
                {
                    user: user._id,
                }
            ]
        });
        const group = await Group.findById(createdGroup._id).populate("owner users.user");
        console.log("Group created", group);
        await updateGroup(group);
        res.status(200).send("Group created").json({ group });
    } catch (err) {
        console.log("Error adding group", err);
        return res.sendStatus(400);
    }
});

app.post('/getGroupsByUser', async (req, res) => {
    console.log("Fetching Groups by User", req.body.userID);
    try {
        const userID = req.body.userID;
        if (!userID) {
            return res.status(400).end("No userID sent.");
        }
        const user = await getUser(userID);
        if (!user) {
            return res.status(400).end("Cannot find user.");
        }
        //Populate is a space delimited list of fields
        const groups = await Group.find({ $or: [{ owner: user._id }, { "users.user": user._id }] }).sort({ createdDate: -1 }).populate("owner users.user")

        console.log("Groups found", groups?.map(group => group.name));
        res.status(200);
        if (groups) {
            res.json(groups);
        }
    } catch (err) {
        console.log("Error getting groups by user", err);
        res.sendStatus(400);
    }
});

app.post("/joinGroup", async (req, res) => {
    const groupID = req.body.groupID;
    const userID = req.body.userID;
    const accessToken = req.body.accessToken;

    console.log(`User ${userID} joining group ${groupID}`);

    if (!groupID || !userID || !accessToken) {
        return res.status(400).send("Group ID or userID is missing");
    }

    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        accessToken: accessToken
    });

    const selfRes = await spotifyApi.getMe();

    if (!selfRes || selfRes.body.id !== userID) {
        return res.status(403).send("User is not authorized");
    }

    console.log("sefRes", selfRes.body);

    const user = await getUser(userID);

    let group = await Group.findById(groupID).populate("owner users.user");
    if (!group || group.owner._id === user._id) {
        return res.status(400).send("Cannot find group or user is the group owner");
    }

    if (group.users.find(groupUser => groupUser.user.userID === user.userID)) {
        //User already exists
        return res.status(400).send("Group already contains current user")
    }

    if (group.users.length >= 20) {
        return res.status(400).send("Group is full, cannot add more users");
    }

    const updateResult = await group.updateOne({
        $addToSet: {
            users: {
                user: user._id,
                previousTracks: []
            }
        }
    });

    console.log("User joined group");

    group = await Group.findById(groupID).populate("owner users.user");

    await updateGroup(group);

    console.log("Group updated", updateResult);

    return res.status(200).send("User added to group");
});

/*
    Input:
        groupID
        userName
        accessToken
*/
app.post("/deleteGroup", async (req, res) => {
    const groupID = req.body.groupID;
    const userID = req.body.userID;
    const accessToken = req.body.accessToken;

    if (!groupID || !userID || !accessToken) {
        return res.status(400).send("Group ID or username is missing");
    }

    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        accessToken: accessToken
    });

    const selfRes = await spotifyApi.getMe();

    if (!selfRes || selfRes.body.id !== userID) {
        return res.status(403).send("User is not authorized");
    }

    const group = await Group.findById(groupID).populate("owner");
    if (!group || group.owner.userID !== userID) {
        return res.status(400).send("Cannot find group or user is not group owner");
    }

    if (group.spotifyPlaylistID) {
        await spotifyApi.changePlaylistDetails(group.spotifyPlaylistID, { name: group.name + " - DELETED", description: "Deleted, this playlist will no longer be updated!" });
    }

    await group.delete();

    console.log("Deleted group", group);

    return res.status(200).send("Group deleted");
});

app.post("/leaveGroup", async (req, res) => {
    const groupID = req.body.groupID;
    const userID = req.body.userID;
    const accessToken = req.body.accessToken;

    if (!groupID || !userID || !accessToken) {
        return res.status(400).send("Group ID or userID is missing");
    }

    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        accessToken: accessToken
    });

    const selfRes = await spotifyApi.getMe();

    if (!selfRes || selfRes.body.id !== userID) {
        return res.status(403).send("User is not authorized");
    }

    const user = await getUser(userID);

    const group = await Group.findById(groupID).populate("users.user");
    //TODO: check if user exists in group
    if (!group) {
        return res.status(400).send("Cannot find group or user is not group owner");
    }

    await group.updateOne({ $pull: { "users": { user: user._id } } });

    await spotifyApi.unfollowPlaylist(group.spotifyPlaylistID);

    return res.status(200).send("User removed from group");
});

/*
    PLAYLIST CRUD METHODS
*/

async function generatePlaylist() {

}

async function createPlaylist(group, spotifyApi) {
    const res = await spotifyApi.createPlaylist(group.name, { public: false, description: "Test playlist" })
    console.log("create playlist res", res.body)
    group.spotifyPlaylistID = res.body.id;
    await group.save();
    console.log("Group updated with playlist id", group.spotifyPlaylistID);
}

app.post("/updatePlaylists", async (req, res) => {
    try {
        await updatePlaylists();
    } catch (err) {
        console.log("Error updating playlists", err.message);
    }
    res.status(200).send("Updated playlists");
})

const updatePlaylists = async () => {
    console.log("Updating all Playlists.");
    const groups = await Group.find().populate("owner users.user");
    for (const group of groups) {
        try {
            await updateGroup(group);
            console.log(`Updated playlist for group ${group.name}`);
        } catch (err) {
            console.log(`Error updating group ${group.name}`, err.message);
        }
    }
}

const updateGroup = async group => {
    //final list of new tracks for the group
    const tracks = [];
    //Get owner, create group playlist if not exists
    const owner = await getUser(group.owner.userID)
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        accessToken: owner.accessToken
    });
    try {
        if (group.spotifyPlaylistID) {
            await spotifyApi.getPlaylist(group.spotifyPlaylistID);
        } else {
            await createPlaylist(group, spotifyApi);
        }
    } catch (err) {
        console.log("Error getting playlist", err.message);
        await createPlaylist(group, spotifyApi);
    }

    if (group.currentTracks.length > 0) {
        const tracksToDelete = group.currentTracks.map(track => { return { "uri": "spotify:track:" + track?.trackId || track } });
        await spotifyApi.removeTracksFromPlaylist(group.spotifyPlaylistID, tracksToDelete);
    }

    const numberOfSongs = Math.floor(20 / group.users.length);
    const extraSongsCount = 20 - group.users.length * numberOfSongs;
    let usersWithExtra = []
    if (extraSongsCount > 0) {
        usersWithExtra = group.users.map(user => ({ user, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ user }) => user).slice(0, extraSongsCount);
    }

    for (const userObj of group.users) {
        const user = await getUser(userObj.user.userID)
        const spotifyApi = new SpotifyWebApi({
            redirectUri: process.env.REDIRECT_URL,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            accessToken: user.accessToken
        });
        await spotifyApi.followPlaylist(group.spotifyPlaylistID);
        const topSongsRes = await spotifyApi.getMyTopTracks({ time_range: "short_term", limit: 20 });
        const topSongs = topSongsRes.body.items;
        const shuffledSongs = topSongs.map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
        const groupUser = group.users.find(u => u.user.userID === user.userID);
        const groupUserPreviousTracks = groupUser.previousTracks.map(track => track.tracks).join().split(',');
        const usedSongs = shuffledSongs.filter(song => groupUserPreviousTracks.includes(song.id));
        const unusedSongs = shuffledSongs.filter(song => !groupUserPreviousTracks.includes(song.id));
        const userTracks = [];
        const mapTrackData = song => {
            const userName = user?.name || user.userID;
            return { trackId: song.id, userName, songName: song.name, artistName: song.artists[0].name }
        }
        if (usersWithExtra?.some(extra => extra.user.userID === user.userID)) {
            userTracks.push(...unusedSongs.slice(0, numberOfSongs + 1).map(song => mapTrackData(song)));
            userTracks.push(...usedSongs.slice(0, numberOfSongs + 1 - userTracks.length).map(song => mapTrackData(song)));
        } else {
            userTracks.push(...unusedSongs.slice(0, numberOfSongs).map(song => mapTrackData(song)));
            userTracks.push(...usedSongs.slice(0, numberOfSongs - userTracks.length).map(song => mapTrackData(song)));
        }
        let userPreviousTracks = groupUser.previousTracks;
        userPreviousTracks.push({ tracks: userTracks.map(track => track.trackId) });
        if (userPreviousTracks.length > 7) {
            userPreviousTracks.shift();
        }
        groupUser.previousTracks = userPreviousTracks;
        tracks.push(...userTracks);
    }
    group.currentTracks = tracks.map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    await group.save();
    await spotifyApi.addTracksToPlaylist(group.spotifyPlaylistID, group.currentTracks.map(track => "spotify:track:" + track.trackId));
    let date = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
    date = new Date(date);
    const formattedDate = (date.getMonth() + 1).toString().padStart(2, "0") + "/" + date.getDate().toString().padStart(2, "0");
    await spotifyApi.changePlaylistDetails(group.spotifyPlaylistID, { name: group.name + " - " + formattedDate, description: "Users in the group: " + group.users.map(user => user.user.name) });
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const getUser = async userID => {

    let user = await userMap.get(userID);

    if (user.expiresAt < Date.now()) {
        user = await refreshLogin(user);
        userMap.put(userID, user);
    }
    return user;
}

cron.schedule('0 5 * * *', async () => {
    const startTime = new Date();
    console.log(`*********** STARTING NIGHTLY JOB ${startTime} ***********`);
    await updatePlaylists();
    const endTime = new Date();
    console.log(`*********** FINISHED NIGHTLY JOB ${endTime} ***********`);
    let timeDiff = (startTime - endTime) / 1000 / 60;
    console.log(`Nightly job completed in ${timeDiff} minutes`);
})

app.listen(process.env.PORT, () => {
    console.log("Node server listening on port", process.env.PORT);
});