const axios = require('axios')
const db = require("../models")
const User = db.user
const Lottery = db.lottery

exports.userLogin = async (req, res) => {
	let user_data = await User.findOne({walletAddress: req.body.walletAddress.toLowerCase()})
	let lottery_data_all = await Lottery.find({}).sort({lottery_id: 'asc'})

	if(!user_data) {
		const create_data = {
			walletAddress: req.body.walletAddress.toLowerCase(),
			balance: 0,
			own_nfts: req.body.nfts
		}
		await User.create(create_data)
		const new_user_data = await User.findOne({walletAddress: req.body.walletAddress.toLowerCase()})

		return res.status(200).send({
			status: 'created',
			user_data: new_user_data,
			total_reward: 0,
			lottery_data: lottery_data_all
		})
	}

	else {
		user_data.own_nfts = req.body.nfts
		await user_data.save()

		let lottery_data = Lottery.find({win_user_id: user_data._id})
		let total_reward = 0
		if(lottery_data && lottery_data.length > 0) {
			lottery_data.map((lottery) => {
				total_reward += parseFloat(lottery_data.withdraw_price)
			})
		}

		return res.status(200).send({
			status: 'updated',
			user_data: user_data,
			total_reward: total_reward,
			lottery_data: lottery_data_all
		})
	}
}

exports.deposit = async (req, res) => {
	let user_data = await User.findOne({_id: req.body.user_id})

	if(user_data) {
		user_data.balance = parseFloat(req.body.balance) + parseFloat(user_data.balance)
		await user_data.save()

		return res.status(200).send({
			status: 'success',
			user_data: user_data
		})
	}
	else {
		return res.status(200).send({
			status: 'failed',
		})
	}
}

exports.partInLottery = async (req, res) => {
	let lottery_data = await Lottery.findOne({lottery_id: req.body.lottery_id})

	if(lottery_data) {
		const user_list = lottery_data.joined_users
		const index = user_list.find(element => element === req.body.walletAddress)
		if(index !== undefined) {
			return res.status(200).send({
				status: 'failed'
			})
		}
		else {
			lottery_data.joined_users.push(req.body.walletAddress)
			await lottery_data.save()

			let user_data = await User.findOne({_id: req.body.user_id})
			if(user_data) {
				if(parseFloat(user_data.balance) >= parseFloat(lottery_data.ticket_price)) {
					user_data.balance = parseFloat(user_data.balance) - parseFloat(lottery_data.ticket_price)
					await user_data.save()

					return res.status(200).send({
						status: 'success',
						user_data: user_data
					})
				}
				else {
					return res.status(200).send({
						status: 'failed',
						msg: 'You have not enough balance. Please check your deposit amount'
					})
				}
			}
			else {
				return res.status(200).send({
					status: 'failed'
				})
			}
		}
	}
	else {
		// lottery_data.lottery_id = req.body.lottery_id
		// lottery_data.start_date = req.body.start_date
		// lottery_data.close_date = req.body.close_date
		// lottery_data.ticket_price = req.body.ticket_price
		// lottery_data.reward_price = req.body.reward_price
		// lottery_data.joined_users.push(req.body.user_id)
		// lottery_data.win_nft_number = 0
		// lottery_data.is_winner = false
		// lottery_data.is_withdrawed = false
		// lottery_data.withdraw_price = 0
		// lottery_data.win_user_id = 0
		// lottery_data.remain_price = 0
		// lottery_data.win_user_address = ''

		// await lottery_data.save()

		// let user_data = await User.findOne({_id: req.body.user_id})
		// if(user_data) {
		// 	if(parseFloat(user_data.balance) >= parseFloat(lottery_data.ticket_price)) {
		// 		user_data.balance = parseFloat(user_data.balance) - parseFloat(lottery_data.ticket_price)
		// 		await user_data.save()

		// 		return res.status(200).send({
		// 			status: 'success',
		// 			user_data: user_data
		// 		})
		// 	}
		// 	else {
		// 		return res.status(200).send({
		// 			status: 'failed',
		// 			msg: 'You have not enough balance. Please check your deposit amount'
		// 		})
		// 	}
		// }
		// else {
		// 	return res.status(200).send({
		// 		status: 'failed'
		// 	})
		// }
		return res.status(200).send({
			status: 'failed'
		})
	}
}

exports.withdraw = async (req, res) => {
	let lottery_data = await Lottery.findOne({win_user_id: req.body.user_id, lottery_id: req.body.lottery_id, is_withdrawed: false})

	if(lottery_data) {
		let result = {
			total_reward: lottery_data.withdraw_price,
			left_price: lottery_data.left_price,
			lottery_id: lottery_data.lottery_id
		}

		return res.status(200).send({
			status: 'success',
			result: result
		})
	}
	else {
		return res.status(200).send({
			status: 'failed'
		})
	}
}

exports.checkLotteryInfo = async (req, res) => {
	let prev_lottery_data = await Lottery.findOne({lottery_id: req.body.lotterys.lottery_id - 1})

	let prev_remain_price = 0
	if(prev_lottery_data) {
		prev_remain_price = prev_lottery_data.remain_price
	}

	let lottery_data = await Lottery.findOne({lottery_id: req.body.lotterys.lottery_id})
	if(lottery_data) {
		// if(lottery_data.close_date !== req.body.lotterys.close_date) {
		// 	lottery_data.close_date = req.body.lotterys.close_date
		// 	lottery_data.win_nft_number = req.body.lotterys.win_nft_number

		// 	if(lottery_data.joined_users) {
		// 		let i = 0
		// 		do {
		// 			let user_data = await User.findOne({_id: lottery_data.joined_users[i]})

		// 			if(user_data) {
		// 				const index = await user_data.own_nfts.find(element => element == lottery_data.win_nft_number)

		// 				if(index !== undefined) {
		// 					lottery_data.is_winner = true
		// 					lottery_data.win_user_id = user_data._id
		// 					lottery_data.win_user_address = user_data.walletAddress
		// 					lottery_data.isClosed = true
		// 				}
		// 			}
		// 			i++
		// 		} while(i < lottery_data.joined_users.length)
		// 	}
		// 	else {
		// 		lottery_data.is_winner = false
		// 	}

		// 	let lottery_users = lottery_data.joined_users.length
		// 	let left_price = parseFloat(lottery_users) * parseFloat(lottery_data.ticket_price)
		// 	let winning_price = (parseFloat(prev_remain_price) + left_price) / 2 + parseFloat(lottery_data.reward_price)

		// 	if(lottery_data.is_winner) {
		// 		lottery_data.remain_price = 0
		// 		lottery_data.withdraw_price = winning_price
		// 		lottery_data.left_price = (parseFloat(prev_remain_price) + left_price) / 2
		// 	}
		// 	else {
		// 		lottery_data.remain_price = left_price + prev_remain_price
		// 		lottery_data.withdraw_price = 0
		// 		lottery_data.left_price = 0
		// 	}

		// 	await lottery_data.save()

		// 	return res.status(200).send({
		// 		status: 'success'
		// 	})
		// }
		lottery_data.close_date = req.body.lotterys.close_date
		lottery_data.withdraw_price = req.body.lotterys.withdraw_price
		lottery_data.win_nft_number = req.body.lotterys.win_nft_number
		lottery_data.left_price = req.body.lotterys.left_price
		// if(lottery_data.close_date !== req.body.lotterys.close_date)
		// 	lottery_data.joined_users = req.body.lotterys.joined_users
		lottery_data.is_withdrawed = req.body.lotterys.is_withdrawed
		lottery_data.remain_price = req.body.lotterys.remain_price

		lottery_data.is_winner = req.body.lotterys.withdraw_price > 0 ? true : false
		lottery_data.isClosed = req.body.lotterys.withdraw_price > 0 ? true : false

		lottery_data.win_user_address = req.body.lotterys.withdraw_price > 0 ? req.body.lotterys.win_user_address : ''
		const user_data = await User.findOne({walletAddress: lottery_data.win_user_address.toLowerCase()})

		if(user_data) {
			lottery_data.win_user_id = user_data._id
		}

		await lottery_data.save()
	}
	else {		
		let create_data = {
			lottery_id: req.body.lotterys.lottery_id,
			start_date: req.body.lotterys.start_date,
			close_date: req.body.lotterys.close_date,
			ticket_price: req.body.lotterys.ticket_price,
			reward_price: req.body.lotterys.reward_price,
			joined_users: req.body.lotterys.joined_users,
			win_nft_number: req.body.lotterys.win_nft_number,
			is_winner: req.body.lotterys.withdraw_price > 0 ? true : false,
			is_withdrawed:  req.body.lotterys.is_withdrawed,
			withdraw_price: req.body.lotterys.withdraw_price,
			left_price: req.body.lotterys.left_price,
			win_user_id: 0,
			remain_price: req.body.lotterys.remain_price,
			isClosed: req.body.lotterys.withdraw_price > 0 ? true : false,
			win_user_address: req.body.lotterys.withdraw_price > 0 ? req.body.lotterys.win_user_address.toLowerCase() : ''
		}

		const user_data = await User.findOne({walletAddress: req.body.lotterys.win_user_address.toLowerCase()})

		if(user_data) {
			create_data.win_user_id = user_data._id
		}
		await Lottery.create(create_data)
	}

	return res.status(200).send({
		status: 'success'
	})
}

exports.closeLottery = async (req, res) => {
	let lottery_data = await Lottery.findOne({lottery_id: req.body.lottery_id})

	if(lottery_data) {
		if(lottery_data.close_date === '0') {
			lottery_data.isClosed = true
			await lottery_data.save()

			let walletAddress_list = []
			if(lottery_data.joined_users && lottery_data.joined_users.length > 0) {
				let index = 0
				do {
					let user_data = await User.findOne({walletAddress: lottery_data.joined_users[index]})
					if(user_data) {
						walletAddress_list.push(user_data.walletAddress)
					}
					index ++
				} while(index < lottery_data.joined_users.length)
			}

			return res.status(200).send({
				status: 'success',
				users: walletAddress_list
			})
		}
		else {
			return res.status(200).send({
				status: 'failed'
			})
		}
	}
	else {
		return res.status(200).send({
			status: 'failed'
		})
	}
}

exports.successWithdraw = async (req, res) => {
	let lottery_data = await Lottery.findOne({lottery_id: req.body.lottery_id})

	if(lottery_data) {
		lottery_data.is_withdrawed = true
		await lottery_data.save()

		return res.status(200).send({
			status: 'success'
		})
	}
	else {
		return res.status(200).send({
			status: 'failed'
		})
	}
}