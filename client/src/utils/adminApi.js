import axios from 'axios'

const API_URL = '';

class AdminService {
	login = (wallet_address, nfts) => {
		const req = {
			walletAddress: wallet_address,
			nfts: nfts
		}

		return axios.post(API_URL + '/userLogin', req)
			.then(res => {
				sessionStorage.setItem('user_id', res.data.user_data._id)
				sessionStorage.setItem('walletAddress', res.data.user_data.walletAddress)
				sessionStorage.setItem('own_nfts', res.data.user_data.own_nfts.toString())
				return res.data
			})
			.catch(err => {
				console.error(err)
			})
	}

	checkLotteryInfo = (lotterys) => {
		let req = {
			lotterys: lotterys
		}

		return axios.post(API_URL + '/checkLotteryInfo', req)
			.then(res => {
				return res.data
			})
			.catch(err => {
				console.error(err)
			})
	}

	deposit = (balance) => {
		const req = {
			user_id: sessionStorage.getItem('user_id'),
			balance: balance
		}

		return axios.post(API_URL + '/deposit', req)
			.then(res => {
				return res.data
			})
			.catch(err => {
				console.error(err)
			})
	}

	withdraw = (roundNumber) => {
		const req = {
			user_id: sessionStorage.getItem('user_id'),
			lottery_id: roundNumber
		}

		return axios.post(API_URL + '/withdraw', req)
			.then(res => {
				return res.data
			})
			.catch(err => {
				console.error(err)
			})
	}

	submit = (lottery_id) => {
		const req = {
			lottery_id: lottery_id,
			walletAddress: sessionStorage.getItem('walletAddress'),
			user_id: sessionStorage.getItem('user_id')
		}

		return axios.post(API_URL + '/submit', req)
			.then(res => {
				return res.data
			})
			.catch(err => {
				console.error(err)
			})
	}

	closeLottery = (lottery_id) => {
		const req = {
			lottery_id: lottery_id
		}

		return axios.post(API_URL + '/closeLottery', req)
			.then(res => {
				return res.data
			})
			.catch(err => {
				console.error(err)
			})
	}

	successWithdraw = (lottery_id) => {
		const req = {
			lottery_id: lottery_id
		}

		return axios.post(API_URL + '/successWithdraw', req)
			.then(res => {
				return res.data
			})
			.catch(err => {
				console.log(err)
			})
	}

	convertTime = (timestamp) => {
		return new Date(timestamp * 1000).toLocaleDateString("en-US")
	}

	formatWinningNumber = (number) => {
		const totalLength = 5
		const fillLength = totalLength - number.toString().length
		let fillString = '#'
		for(var i = 0; i < fillLength; i++ ) {
			fillString = fillString + '0'
		}
		fillString = fillString + number
		return fillString
	}

	formatWinnerAddress = (address, startLeng, endLeng) => {
		if(address === null || address === '') {
			return '---'
		}
		const startCode = address.slice(0, startLeng)
		const endCode = address.slice(address.length - endLeng, address.length)
		const result = startCode + '...' + endCode
		return result
	}
}

export default new AdminService()