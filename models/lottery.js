const mongoose = require("mongoose")

const Lottery = mongoose.model(
	'lottery_master',
	new mongoose.Schema({
		lottery_id: Number,
		start_date: String,
		close_date: String,
		ticket_price: Number,
		reward_price: Number,
		joined_users: [],
		win_nft_number: String,
		is_winner: Boolean,
		win_user_address: String,
		is_withdrawed: Boolean,
		withdraw_price: Number,
		left_price: Number,
		win_user_id: String,
		remain_price: Number,
		isClosed: {
			type: Boolean,
			default: false
		}
	})
)

module.exports = Lottery