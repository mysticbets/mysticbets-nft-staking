import React, { useState, useEffect } from 'react'
import { BiArrowToLeft, BiArrowToRight, BiLeftArrowAlt, BiRightArrowAlt } from 'react-icons/bi'

import BigNumber from 'bignumber.js'

import StakingService from '../utils/stakingAPI'
import AdminService from '../utils/adminApi'

const LotteryCard = (props) => {
	const [switchHistory, setSwitchHistory] = useState(false)

	const [roundNumber, setRoundNumber] = useState(0)
	const [roundMaxNumber, setRoundMaxNumber] = useState(0)
	const [roundMinNumber, setRoundMinNumber] = useState(1)

	const [allHistory, setAllHistory] = useState([])
	const [userHistory, setUserHistory] = useState([])

	const [depositAmount, setDepositAmount] = useState(0)
	const [userBalance, setUserBalance] = useState(0)
	
	const [ticketPrice, setTicketPrice] = useState(0)
	const [totalReward, setTotalReward] = useState(0)
	
	const [lotteryId, setLotteryId] = useState(0)
	const [lotteryInfo, setLotteryInfo] = useState()

	const [enableSubmit, setEnableSubmit] = useState(false)
	const [ownerAddress, setOwnerAddress] = useState('')

	const [winningNumber, setWinningNumber] = useState('')
	const [winningAmount, setWinningAmount] = useState('')
	const [closeDate, setCloseDate] = useState('')
	const [startDate, setStartDate] = useState('')
	const [winUserId, setWinUserId] = useState('')
	const [isWinner, setIsWinner] = useState(false)
	const [isWithdrawed, setIsWithdrawed] = useState(false)
	const [winUserAddr, setWinUserAddr] = useState('')

	const [isOwner, setIsOwner] = useState(false)
	const [isApproved, setIsApproved] = useState(false)
	const [requestApprove, setRequestApprove] = useState(false)

	useEffect(async () => {
		if(props.userInfo) {
			setTotalReward(props.userInfo.total_reward)
			setUserBalance(props.userInfo.user_data.balance)
			setLotteryInfo(props.userInfo.lottery_data)

			const _ownerAddress = await StakingService.getOwnerInfo()
			setOwnerAddress(_ownerAddress)
		}
	}, [props.userInfo])

	useEffect(() => {
		if(ownerAddress && ownerAddress != '') {
			if(ownerAddress.toLowerCase() === props.walletAccount.toLowerCase()) {
				setIsOwner(true)
			}
		}
	}, [ownerAddress])

	useEffect(() => {
		if(lotteryInfo) {
			const _currentLottery = lotteryInfo[lotteryInfo.length - 1]
			setLotteryId(_currentLottery.lottery_id)
			setTicketPrice(_currentLottery.ticket_price)

			const _user_list = _currentLottery.joined_users
			const index = _user_list.find(element => element === sessionStorage.getItem('user_id'))
			if(index === undefined) {
				setEnableSubmit(true)
			}

			setRoundMaxNumber(lotteryInfo.length)
			setRoundNumber(lotteryInfo.length)
		}
	}, [lotteryInfo])

	const isNumeric = (str) => {
	  if (typeof str != "string") return false
	  return !isNaN(str) && 
	         !isNaN(parseFloat(str)) 
	}

	useEffect(() => {
		if(roundNumber !== 0) {
			if(lotteryInfo[roundNumber - 1].close_date !== '0') {
				setWinningAmount(lotteryInfo[roundNumber - 1].withdraw_price)
				setWinningNumber(AdminService.formatWinningNumber(lotteryInfo[roundNumber - 1].win_nft_number))
				setCloseDate(AdminService.convertTime(lotteryInfo[roundNumber - 1].close_date))
				setWinUserId(lotteryInfo[roundNumber - 1].win_user_id)
				setIsWinner(lotteryInfo[roundNumber - 1].is_winner)
				setWinUserAddr(AdminService.formatWinnerAddress(lotteryInfo[roundNumber - 1].win_user_address, 4, 2))
				setIsWithdrawed(lotteryInfo[roundNumber - 1].is_withdrawed)
				setStartDate(AdminService.convertTime(lotteryInfo[roundNumber - 1].start_date))
			}
			else {
				let _prev_remain_price = 0
				if(roundNumber >= 2) {
					_prev_remain_price = lotteryInfo[roundNumber - 2].remain_price
				}
				const _winningPrice = lotteryInfo[roundNumber - 1].reward_price + (lotteryInfo[roundNumber - 1].ticket_price * lotteryInfo[roundNumber - 1].joined_users.length + _prev_remain_price) * 0.75
				setWinningAmount(_winningPrice)
				setWinningNumber('---')
				setCloseDate('')
				setWinUserId(lotteryInfo[roundNumber - 1].win_user_id)
				setIsWinner(lotteryInfo[roundNumber - 1].is_winner)
				setWinUserAddr(AdminService.formatWinnerAddress(lotteryInfo[roundNumber - 1].win_user_address, 4, 2))
				setIsWithdrawed(lotteryInfo[roundNumber - 1].is_withdrawed)
				setStartDate(AdminService.convertTime(lotteryInfo[roundNumber - 1].start_date))
			}
			
		}
	}, [roundNumber])

	useEffect(() => {
		if(lotteryInfo && lotteryInfo.length >= 1) {
			let items = []
			lotteryInfo.map((item) => {
				const index = item.joined_users.find(element => element.toLowerCase() === sessionStorage.getItem('walletAddress').toLowerCase())
				if(index !== undefined) {
					items.push(item)
					setUserHistory([...items])
				}
			})
		}
	}, [lotteryInfo])

	useEffect(() => {
		const _isApproved = props.walletAccount && new BigNumber(props.allowance) && new BigNumber(props.allowance).isGreaterThan(0)
		setIsApproved(_isApproved)
	}, [props.allowance])

	const handleRoundNumber = (event) => {
		if(event.target.value === '.') {
			return
		}
		if(parseFloat(event.target.value) <= roundMinNumber) {
			setRoundNumber(roundMinNumber)
		}
		else if(parseFloat(event.target.value) >= roundMaxNumber) {
			setRoundNumber(roundMaxNumber)
		}
		else {
			if(!isNumeric(event.target.value)) {
				return
			}
			setRoundNumber(event.target.value)
		}
	}

	const handlePageNation = (type) => {
		switch(type) {
			case 0:
				setRoundNumber(roundMinNumber)
				break
			case 1:
				if(roundNumber <= roundMinNumber)
					break

				setRoundNumber(parseFloat(roundNumber) - 1)
				break
			case 2:
				if(roundNumber >= roundMaxNumber)
					break

				setRoundNumber(parseFloat(roundNumber) + 1)
				break
			case 3:
				setRoundNumber(roundMaxNumber)
				break
			default:
				break
		}
	}

	const handleDepositeChange = (event) => {
		if(parseFloat(event.target.value) === 0 || event.target.value === '') {
			setDepositAmount(0)
			return
		}
		if(!isNumeric(event.target.value)) {
			return
		}
		else {
			setDepositAmount(event.target.value)
		}
	}

	const handleDeposite = async () => {
		if(!props.hasNFT) {
			return
		}

		const balance = await StakingService.deposit(depositAmount)
		const result = await AdminService.deposit(depositAmount)

		if(result.status === 'success') {
			setUserBalance(result.user_data.balance)
		}
	}

	const handleSubmit = async () => {
		if(!props.hasNFT || lotteryId === 0 || !enableSubmit || userBalance < ticketPrice) {
			return
		}

		const result = await AdminService.submit(lotteryId)

		if(result.status === 'success') {
			setUserBalance(result.user_data.balance)
			setEnableSubmit(false)
		}
	}

	const handleWithDraw = async () => {
		if(sessionStorage.getItem('user_id') !== winUserId || !isWinner ) {
			return
		}

		const result = await AdminService.withdraw(roundNumber)
		if(result.status === 'success') {
			await StakingService.withdraw(result)
			const res = await AdminService.successWithdraw(roundNumber)
			if(res === 'success') {
				setIsWithdrawed(true)
			}
		}
	}

	const handleCloseLottery = async () => {
		if(props.walletAccount.toLowerCase() === ownerAddress.toLowerCase()) {
			const close_data = await AdminService.closeLottery(lotteryId)
			if(close_data.status === 'success') {
				const result = await StakingService.closeLottery(close_data)
				setIsOwner(false)
				if(result === undefined) {
					const res = props.checkLotteryInfo()
				}
			}
		}
	}

	const handleApprove = async () => {
		setRequestApprove(true)
		const result = await StakingService.handleLotteryApprove()
		setRequestApprove(result)
		setIsApproved(result)
	}

	return (
		<>
			<div className='lottery-section' id='go-lottery'>
				<h6 style={{fontSize: '1.25rem', marginBottom: '20px'}}>Get your tickets now!</h6>
				<div className='lottery-card-section'>
					<div className='lottery-card-header'>
						<div className='round-title-header' style={{width: '100%', display: 'flex'}}>
							<span className='round-title'>Next Draw ({props.hasNFT ? 'You can take part in lottery' : "You can't take part in lottery because, you have no NFT Jersey"})</span>
							<button className='btn-ticket-submit' style={!props.walletAccount || isApproved || requestApprove ? {background: '#D7D8D8', cursor: 'not-allowed'} : {width: '100px'}} onClick={handleApprove}>Approve</button>
							{	isOwner ?
									<button className='btn-ticket-submit' style={{width: '200px'}} onClick={handleCloseLottery}>Close Lottery</button>
								:
									<></>
							}
						</div>
					</div>
					<div className='winning-number-section'>
						<div className='row' style={{width: '100%', margin: '0px', paddingTop: '10px', paddingBottom: '10px'}}>
							<div className='col-md-3 col-6' style={{marginBottom: '10px'}}><input className='input-ticket-deposit' value={depositAmount} onChange={(e) => handleDepositeChange(e)} disabled={!props.hasNFT} /></div>
							<div className='col-md-3 col-6' style={{marginBottom: '10px'}}><button className='btn-ticket-deposit' style={!props.hasNFT || !isApproved ? {background: '#D7D8D8', cursor: 'not-allowed'} : {}} onClick={handleDeposite}>Deposit</button></div>
							<div className='col-md-6 col-12' style={{marginBottom: '10px'}}><button className='btn-ticket-submit' style={!props.hasNFT || !enableSubmit || userBalance < ticketPrice || !isApproved ? {background: '#D7D8D8', cursor: 'not-allowed', width: '100%', marginRight: '0px'} : {width: '100%', marginRight: '0px'}} onClick={handleSubmit}>Submit</button></div>
						</div>
						<div className='row' style={{width: '100%', margin: '0px', paddingTop: '10px', paddingBottom: '10px'}}>
							<div className='col-md-3 col-6' style={{marginBottom: '10px', marginTop: '12px'}}>Ticket Price</div>
							<div className='col-md-3 col-6' style={{marginBottom: '10px', marginTop: '12px'}}>{ticketPrice}MBT</div>
							<div className='col-md-3 col-6' style={{marginBottom: '10px', marginTop: '12px'}}>Your Balance</div>
							<div className='col-md-3 col-6' style={{marginBottom: '10px', marginTop: '12px'}}>{props.hasNFT ? userBalance : '---'}MBT</div>
						</div>
						<div className='row' style={{width: '100%', margin: '0px', paddingTop: '10px', paddingBottom: '10px'}}>
							<div className='col-md-4 col-12' style={{marginBottom: '10px', marginTop: '12px'}}>Total Reward</div>
							<div className='col-md-8 col-12' style={{marginBottom: '10px', marginTop: '12px'}}>{totalReward}MBT</div>
						</div>
					</div>
				</div>
			</div>

			<div className='lottery-section'>
				<h6 style={{fontSize: '1.25rem', marginBottom: '20px', marginTop: '20px'}}>Mystic Bets Lottery Result</h6>
				<div className='switch-card-section'>
					<div className='switch-card-section-bg'>
						<button className={switchHistory ? 'switch-area-btn switch-btn-active' : 'switch-area-btn'} onClick={() => setSwitchHistory(false)}>All History</button>
						<button className={!switchHistory ? 'switch-area-btn switch-btn-active' : 'switch-area-btn'} onClick={() => setSwitchHistory(true)}>Your History</button>
					</div>
				</div>
				<div className='lottery-card-section'>
					{
						!switchHistory ?
						<>
							<div className='lottery-card-header'>
								<div className='round-title-header'>
									<span className='round-title'>Round Number</span>
									<input className='round-number' value={roundNumber} onChange={(event) => handleRoundNumber(event)} />
								</div>
								<div className='round-pagenation'>
									<span onClick={() => handlePageNation(0)} className={(roundNumber <= roundMinNumber) ? 'custom-pagenation-buttons disable-pagenation-buttons' : 'custom-pagenation-buttons'}><BiArrowToLeft /></span>
									<span onClick={() => handlePageNation(1)} className={(roundNumber <= roundMinNumber) ? 'custom-pagenation-buttons disable-pagenation-buttons' : 'custom-pagenation-buttons'}><BiLeftArrowAlt /></span>
									<span onClick={() => handlePageNation(2)} className={(roundNumber >= roundMaxNumber) ? 'custom-pagenation-buttons disable-pagenation-buttons' : 'custom-pagenation-buttons'}><BiRightArrowAlt /></span>
									<span onClick={() => handlePageNation(3)} className={(roundNumber >= roundMaxNumber) ? 'custom-pagenation-buttons disable-pagenation-buttons' : 'custom-pagenation-buttons'}><BiArrowToRight /></span>
								</div>
							</div>
							<div className='drawn-date-section'>
								<span>{startDate}</span>&nbsp;~&nbsp;<span>{closeDate}</span>
								<button className='btn-ticket-submit' style={sessionStorage.getItem('user_id') !== winUserId || !isWinner || isWithdrawed ? {background: '#D7D8D8', cursor: 'not-allowed'} : {}} onClick={handleWithDraw}>Withdraw</button>
							</div>
							<div className='winning-number-section'>
								<div className='winning-body'>
									<div className='row winning-data'>
										<div className='col-12 col-sm-12 winning-text'>
											<span className='winning-text-area'>Winning Number:<span>&nbsp;{winningNumber && winningNumber !== '' && winningNumber !== 0 ? winningNumber : '---'}</span></span>
										</div>
										<div className='col-12 col-sm-12 winning-text'>
											<span className='winning-text-area'>Reward Amount:<span>&nbsp;{winningAmount && winningAmount !== '' && winningAmount !== 0 ? winningAmount : '---'}</span></span>
										</div>
										<div className='col-12 col-sm-12 winning-text'>
											<span className='winning-text-area'>Winner Address:<span>&nbsp;{winUserAddr && winUserAddr !== '' ? winUserAddr : '---'}</span></span>
										</div>
									</div>
								</div>
							</div>
						</>
						:
						<>
							<div className='lottery-card-header'>
								<div className='round-title-header'>
									<span className='round-title'>Rounds</span>
								</div>
							</div>
							<div className='winning-number-section'>
								<div className='user-his-body'>
									{
										(userHistory.length >= 1 && props.connected) ?
										<>
											<div className='row round-table-header' style={{width: '100%', padding: '5px', backgroundColor: '#d9384d'}}>
												<div className='col-1'>No</div>
												<div className='col-2'>Start Date</div>
												<div className='col-2'>Close Date</div>
												<div className='col-2'>Winning Number</div>
												<div className='col-2'>Ticket Price</div>
												<div className='col-1'>Win</div>
												<div className='col-2'>Withdrawed</div>
											</div>
											{
												userHistory.map((item, index) => {
													return (
														<div className='row user-round-data' key={index} style={{width: '100%', padding: '5px'}}>
															<div className='col-1'>{item.lottery_id}</div>
															<div className='col-2'>{AdminService.convertTime(item.start_date)}</div>
															<div className='col-2'>{item.close_date !== '0' ? AdminService.convertTime(item.close_date) : '---'}</div>
															<div className='col-2'>{item.win_nft_number}</div>
															<div className='col-2'>{item.ticket_price}</div>
															<div className='col-1'>{item.win_user_id === sessionStorage.getItem('user_id') ? 'Yes' : 'No'}</div>
															<div className='col-2'>{item.is_withdrawed ? 'Yes' : 'No'}</div>
														</div>
													)
												})
											}
										</>
										:
										<>
											<span>No User Data Found</span>
										</>	
									}
								</div>
							</div>
						</>
					}
					
				</div>
			</div>

			<div className='row lottery-section'>
				<div className='col-12 col-md-6 lottery-rule'>
					<span style={{fontSize: '25px'}}>How to play</span>
					<div style={{margin: '0px', marginTop: '20px'}}>
						<ul>
						<p className='detail-rule'>1. Connect your MetaMask account that has your MysticBets NFT Jersey.</p>
						<p className='detail-rule'>2. Enter 25,000 $MBT then click deposit. (You may deposit additional funds for future drawings.)</p>
						<p className='detail-rule'>3. Once your balance has shown 25,000 $MBT, click submit.</p>
						<p className='detail-rule'>4. One NFT jersey mint number is randomly drawn weekly.</p>
						<p className='detail-rule'>5. Drawing are held 10PM EST Saturdays.</p>
						<p className='detail-rule'>6. Wait for drawing. Good luck!</p>
						</ul>
					</div>
				</div>
				<div className='col-12 col-md-6 lottery-rule'>
					<span style={{fontSize: '25px'}}>Rules</span>
					<div style={{margin: '0px', marginTop: '20px'}}>
						<ul>
						<p className='detail-rule'>1. You must own a MysticBets NFT Jersey.</p>
						<p className='detail-rule'>2. One ticket costs 25K MBT, one ticket per week, one ticket covers all jerseys.</p>
						<p className='detail-rule'>3. Ticket balance cannot be withdrawn once deposited.</p>
						</ul>
					</div>
				</div>
			</div>
		</>
	)
}

export default LotteryCard