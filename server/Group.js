const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
	spotifyPlaylistID: String,
	name: String,
	owner: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: 'User',
		required: true,
	},
	createdDate: {
		type: Date,
		immutable: true,
		default: () => Date.now(),
	},
	lastUpdated: {
		type: Date,
		default: () => Date.now(),
	},
	currentTracks: [
		{
			trackId: String,
			userName: String,
			songName: String,
			artistName: String,
		},
	],
	users: [
		{
			user: {
				type: mongoose.SchemaTypes.ObjectId,
				ref: 'User',
			},
			previousTracks: [
				{
					tracks: [String],
				},
			],
		},
	],
});

groupSchema.pre('save', function (next) {
	this.lastUpdated = Date.now();
	next();
});

module.exports = mongoose.model('Group', groupSchema);
