const mongoose = require("mongoose")

const User = mongoose.model(
	'user_master',
	new mongoose.Schema({
		walletAddress: String,
		balance: {
			type: Number,
			default: 0
		},
		own_nfts: [],
	})
)

module.exports = User