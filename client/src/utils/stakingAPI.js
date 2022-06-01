import Web3 from 'web3'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import getRpcUrl from './getRpcUrl'

const BSC_BLOCK_TIME = 15
const BLOCKS_PER_YEAR = new BigNumber((60 / BSC_BLOCK_TIME) * 60 * 24 * 365)
// const TOTAL_TOKEN_AMOUNT = 10000000000
const DECIMAL = 18
const TOKEN_PER_BLOCK = '11.89'

const BIG_TEN = new BigNumber(10)

const CHAIN_ID_MINT = 1
const CHAIN_ID_STAKING = 1
const CHAIN_ID_LOTTERY = 1

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

class StakingService {
	async getUserData(tokenContractAccount, stakingContractAccount, walletAccount, tokenAddress, stakingAddress) {
		await this.instanceValues(tokenContractAccount, stakingContractAccount, walletAccount, tokenAddress, stakingAddress)

		const allowance = await this.fetchPoolsAllowance(tokenContractAccount, walletAccount, stakingAddress)
		const stakingTokenBalance = await this.fetchUserBalances(tokenContractAccount, walletAccount)

		const pendingReward = await this.fetchPendingReward(stakingContractAccount, walletAccount)
		const stakedBalance = await this.fetchStakedBalance(stakingContractAccount, walletAccount)

		const aprData = await this.getAPRInfo(tokenContractAccount, stakingContractAccount, walletAccount, tokenAddress)
		const pooledTokenAmount = await this.getPooledTokenAmount()

		const userData = {
			allowance: allowance,
			stakingTokenBalance: stakingTokenBalance,
			pendingReward: pendingReward,
			stakedBalance: stakedBalance,
			pooledTokenAmount: pooledTokenAmount,
			aprData
		}

		return userData
	}

	async instanceValues(_tokenContractAccount, _stakingContractAccount, _walletAccount, _tokenAddress, _stakingAddress) {
		this.tokenContractAccount = _tokenContractAccount
		this.stakingContractAccount = _stakingContractAccount

		this.tokenAddress = _tokenAddress
		this.stakingAddress = _stakingAddress

		this.walletAccount = _walletAccount
	}

	async fetchPoolsAllowance() {
		const allowance = await this.tokenContractAccount.methods.allowance(this.walletAccount, this.stakingAddress).call()
		return new BigNumber(allowance).toJSON()
	}

	async fetchUserBalances() {
		const tokenBalance = await this.tokenContractAccount.methods.balanceOf(this.walletAccount).call()
		return new BigNumber(tokenBalance).toJSON()
	}

	async fetchPendingReward() {
		const pendingReward = await this.stakingContractAccount.methods.pendingReward(this.walletAccount).call()
		return new BigNumber(pendingReward).toJSON()
	}

	async fetchStakedBalance() {
		const stakedBalance = await this.stakingContractAccount.methods.userInfo(this.walletAccount).call()
		return new BigNumber(BigNumber(stakedBalance.amount).toJSON()).dividedBy(BIG_TEN.pow(DECIMAL)).toJSON()
	}

	async switchNetWork(networkType) {
		this.chainId = 1
		const chainId = networkType === 'mint' ? CHAIN_ID_MINT : networkType === 'lottery' ? CHAIN_ID_LOTTERY : CHAIN_ID_STAKING
		if(chainId === this.getChainId()) {
			return
		}
		else {
			await window.ethereum.request({
	          method: 'wallet_switchEthereumChain',
	          params: [{ chainId: Web3.utils.toHex(chainId) }], 
	        });

	        this.setChainId(chainId)
		}
	}

	async getAPRInfo() {
		const RPC_URL = getRpcUrl()
		const simpleRpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL, 1)
		const currentBlock = await simpleRpcProvider.getBlockNumber()
		const isFinished = false

		const blockLimits = await this.fetchPoolsBlockLimits(this.stakingContractAccount)
		const totalStakings = await this.fetchPoolsTotalStaking(this.tokenContractAccount, this.stakingAddress)
		const prices = await this.getTokenPricesFromFarm(this.tokenAddress)

		const blockLimit = blockLimits
		const totalStaking = totalStakings

		const isPoolEndBlockExceeded = currentBlock > 0 && blockLimit ? currentBlock > Number(blockLimit.endBlock) : false
		const isPoolFinished = isFinished || isPoolEndBlockExceeded

		const stakingTokenAddress = this.tokenAddress
		const stakingTokenPrice = stakingTokenAddress ? prices : 0

		const earningTokenAddress = this.tokenAddress
		const earningTokenPrice = earningTokenAddress ? prices : 0

		const totalStaked = await this.getBalanceNumber(new BigNumber(totalStaking.totalStaked).toJSON())
		const apr = !isPoolFinished ? await this.getPoolApr(stakingTokenPrice, earningTokenPrice, totalStaked , parseFloat(TOKEN_PER_BLOCK)) : 0

		return {...blockLimit, ...totalStaking, stakingTokenPrice, earningTokenPrice, apr, isFinished: isPoolFinished}
	}

	async fetchPoolsBlockLimits(stakingContractAccount) {
		const starts = await stakingContractAccount.methods.startBlock().call()
		const ends = await stakingContractAccount.methods.bonusEndBlock().call()

		const blockData = {
			startBlock: new BigNumber(starts).toJSON(),
			endBlock: new BigNumber(ends).toJSON()
		}
		return blockData
	}

	async fetchPoolsTotalStaking(tokenContractAccount, stakingAddress) {
		const nonBnbPoolsTotalStaked = await tokenContractAccount.methods.balanceOf(stakingAddress).call()

		const stakedData = {
			totalStaked: new BigNumber(nonBnbPoolsTotalStaked)
		}
		return stakedData
	}

	async getTokenPricesFromFarm(tokenAddress) {
		var prices = new BigNumber(0.0005141).toNumber()
	    return prices
	}

	async getPoolApr(stakingTokenPrice, rewardTokenPrice, totalStaked, tokenPerBlock) {
		const totalRewardPricePerYear = new BigNumber(rewardTokenPrice).times(tokenPerBlock).times(BLOCKS_PER_YEAR)
		const totalStakingTokenInPool = new BigNumber(stakingTokenPrice).times(totalStaked)
		const apr = totalRewardPricePerYear.div(totalStakingTokenInPool).times(100)

		return apr.isNaN() || !apr.isFinite() ? null : apr.toNumber()
	}

	async getBalanceNumber(balance, decimals = 18) {
		return new BigNumber(balance).dividedBy(BIG_TEN.pow(decimals)).toNumber()
	}

	async getBalanceAmount(balance, decimals = 18) {
		return new BigNumber(balance).dividedBy(BIG_TEN.pow(decimals)).toJSON()
	}

	async getFullDisplayBalance(balance, decimals = 18) {
		return await this.getBalanceAmount()
	}

	async handleApprove() {
		await this.switchNetWork('staking')
		let requestedApproval = false
		// await this.tokenContractAccount.methods.approve(this.stakingAddress, ethers.constants.MaxUint256).send({from: this.walletAccount})
		await this.tokenContractAccount.methods.approve(this.stakingAddress, '10000000000000000000000000000').send({from: this.walletAccount})
		.on('receipt', (receipt) => {
			console.log('You can now stake in the MBT pool!')
			requestedApproval = true
		})
		.on('error', (error) => {
			console.log(error)
			console.log('Please try again. Confirm the transaction and make sure you are paying enough gas!')

			requestedApproval = false
		})
		return requestedApproval
	}

	async onStakeDate() {
		await this.switchNetWork('staking')
		const lockStakeDate = await this.stakingContractAccount.methods.getLockStakeDate().call()
		return lockStakeDate
	}

	async onWithdrawDate() {
		await this.switchNetWork('staking')
		const lockWithdrawDate = await this.stakingContractAccount.methods.getLockStakeDate().call()
		return lockWithdrawDate
	}

	async onStake(amount, decimals = 18) {
		await this.switchNetWork('staking')
		const feeAmount = BigNumber(amount).times(BIG_TEN.pow(decimals)).toString()
		// const feeAmount = amount + '000000000000000000'
		await this.stakingContractAccount.methods.deposit(feeAmount).send({from: this.walletAccount})
		.on('receipt', (receipt) => {
			console.log('You staked ', amount, 'MBT tokens')
			return amount
		})
		.on('error', (error) => {
			console.log(error)
			console.log('Please try again. Confirm the transaction and make sure you are paying enough gas!')
		})
	}

	async onUnstake(amount, decimals = 18) {
		await this.switchNetWork('staking')
		const feeAmount = BigNumber(amount).times(BIG_TEN.pow(decimals)).toString()
		// const feeAmount = amount + '000000000000000000'
		await this.stakingContractAccount.methods.withdraw(feeAmount).send({from: this.walletAccount})
		.on('receipt', (receipt) => {
			console.log('You withdraw ', amount, 'MBT tokens')
			return amount
		})
		.on('error', (error) => {
			console.log(error)
			console.log('Please try again. Confirm the transaction and make sure you are paying enough gas!')
		})
	}

	async onReward() {
		const amount = '0'
		await this.switchNetWork('staking')
		await this.stakingContractAccount.methods.deposit('0').send({from: this.walletAccount})
		.on('receipt', (receipt) => {
			console.log('You harvest ', amount, 'MBT tokens')
			return amount
		})
		.on('error', (error) => {
			console.log(error)
			console.log('Please try again. Confirm the transaction and make sure you are paying enough gas!')
		})
	}

	async getPooledTokenAmount() {
		const amount = await this.tokenContractAccount.methods.balanceOf(this.stakingAddress).call()
		const result = await this.getBalanceNumber(new BigNumber(amount))
		return result
	}

	setChainId(id) {
		this.currentChainId = id
	}

	getChainId() {
		return this.currentChainId
	}

	async getLotteryInfo() {
		await this.switchNetWork('lottery')
		const lottery_info = await this.lotteryContractAccount.methods.ReadAllLotteryInfo().call()
		return lottery_info
	}

	async deposit(balance) {
		const feeAmount = BigNumber(balance).times(BIG_TEN.pow(18)).toString()
		await this.switchNetWork('lottery')
		await this.lotteryContractAccount.methods.Deposit(feeAmount).send({from: this.walletAddress})
		.on('receipt', (receipt) => {
			console.log('You deposit ', balance, 'MBT tokens')
			return 'success'
		})
		.on('error', (error) => {
			console.log(error)
			console.log('Please try again. Confirm the transaction and make sure you are paying enough gas!')
		})
	}

	async withdraw(data) {
		const lottery_id = data.result.lottery_id - 1
		const fee = BigNumber(data.result.left_price).times(BIG_TEN.pow(18)).toString()
		const reward = BigNumber(data.result.total_reward).times(BIG_TEN.pow(18)).toString()

		await this.switchNetWork('lottery')
		await this.lotteryContractAccount.methods.ClaimReward(lottery_id, reward, fee).send({from: this.walletAddress})
		.on('receipt', (receipt) => {
			console.log('You withdraw ', reward, 'MBT tokens')
			return 'success'
		})
		.on('error', (error) => {
			console.log(error)
			console.log('Please try again. Confirm the transaction and make sure you are paying enough gas!')
		})
	}

	async getOwnerInfo() {
		await this.switchNetWork('lottery')
		// const _ownerAddress = await this.lotteryContractAccount.methods.GetOwnerAddress().call()
		const _ownerAddress = '0x45424d5d0e79484be19c5d42480d873f0539d812'
		return _ownerAddress
	}

	async closeLottery(close_data) {
		const users = close_data.users
		await this.switchNetWork('lottery')
		await this.lotteryContractAccount.methods.CloseLottery(users).send({from: this.walletAddress})
		.on('receipt', (receipt) => {
			console.log('You close lottery')
			return 'success'
		})
		.on('error', (error) => {
			console.log(error)
			console.log('Please try again. Confirm the transaction and make sure you are paying enough gas!')
		})
	}

	async getLotteryAllowance() {
		const allowance = await this.tokenContractAccount.methods.allowance(this.walletAddress, this.lotteryAddress).call()
		return new BigNumber(allowance).toJSON()
	}

	async initLotteryInfo(lotteryContractAccount, tokenContractAccount, walletAddress, lotteryAddress) {
		this.lotteryContractAccount = lotteryContractAccount
		this.tokenContractAccount = tokenContractAccount
		this.walletAddress = walletAddress
		this.lotteryAddress = lotteryAddress
	}

	async handleLotteryApprove() {
		await this.switchNetWork('lottery')
		let requestedApproval = false
		// await this.tokenContractAccount.methods.approve(this.stakingAddress, ethers.constants.MaxUint256).send({from: this.walletAccount})
		await this.tokenContractAccount.methods.approve(this.lotteryAddress, '10000000000000000000000000000').send({from: this.walletAddress})
		.on('receipt', (receipt) => {
			console.log('You can now stake in the MBT pool!')
			requestedApproval = true
		})
		.on('error', (error) => {
			console.log(error)
			console.log('Please try again. Confirm the transaction and make sure you are paying enough gas!')

			requestedApproval = false
		})
		return requestedApproval
	}
}

export default new StakingService()