import React, {useEffect, useState} from 'react'
import Web3 from 'web3'
import hero1 from '../img/American/img1.png'
import logo from '../img/logo.png'
import logo1 from '../img/logo1.png'
import ico from '../img/icon.png'
import twitter from '../img/twitter-ico.png'
import sports from '../img/sports.png'
import metamask from '../img/metamask.png'
import Alert from 'react-bootstrap/Alert'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from 'react-bootstrap/Image'
import NFTInfo from './NFTInfo'
import TokenStakeCard from './TokenStakeCard'
import NumericInput from 'react-numeric-input'
import LotteryCard from './LotteryCard'

import StakingService from '../utils/stakingAPI'
import AdminService from '../utils/adminApi'

import MYSTIC_ABI from '../config/mystic_abi.json'
import STAKING_ABI from '../config/staking_abi.json'
import TOKEN_ABI from '../config/mbt_token_abi.json'
import LOTTERY_ABI from '../config/lottery_abi.json'
 
// import MYSTIC_ABI from '../config/rop_mystic_abi.json'
// import STAKING_ABI from '../config/rop_staking_abi.json'
// import TOKEN_ABI from '../config/rop_mbt_token_abi.json'
// import LOTTERY_ABI from '../config/rop_lottery_abi.json'

const contract_address = "0x7363A63368Bef01fd29f4e06f5990f784D995363"
const staking_address = "0xb41f318abb5c698ebdbc4688640fbc3cdf032fff"
const token_address = "0xc42b81292cdf84a1b01c24bbac94043b12a3478f"
const lottery_address = "0xC6fF6EDB0b52e6792A976A869628D005686452a6"

// const contract_address = "0x150DBf1EdfE663BB9B6100692AE0E72cc72d8B73"
// const staking_address = "0x8Fe6E5e6B14b5Ca7f6365720eBBf5EC0F9F2AE9C"
// const token_address = "0x62822646F510EA3381d0711424fb0518D86141B4"
// const lottery_address = "0xd29BA39F16014F46951E2DF06a5aa5686CDC9c52"


function MainPart() {
    const [value,setValue]=useState(10);

    const [show, setShow] = useState(false)
    const [connected, setConnected] = useState(false)
    const [formattedAddress, setFormattedAddress] = useState('')

    const [account, setAccount] = useState(null)
    const [minted, setMinted] = useState(0)
    const [address, setAddress] = useState('')
    const [ownerImage, setOwnerImage] = useState([])
    const [isLoaded, setLoaded] = useState(false)
    const [mintCounter, setMintCounter] = useState(1)
    const [mintValue, setMintValue] = useState('')

    const [stakingContractAccount, setStakingContract] = useState(null)
    const [stakingData, setStakingData] = useState(null)

    const [isActionEnable, setActionEnable] = useState(false)
    const [tokenContractAccount, setTokenContract] = useState(null)

    const [nftNumbers, setNftNumbers] = useState([])
    const [loginEnable, setLoginEnable] = useState(false)
    const [lotteryContractAccount, setLotteryContract] = useState(null)
    const [userInfo, setUserInfo] = useState(null)
    const [lotteryAllowance, setLotteryAllowance] = useState('')

    const [disconnectShow, setDisconnectShow] = useState(false)

    useEffect(() => {
        if(sessionStorage.getItem('walletAddress')) {
            setAddress(sessionStorage.getItem('walletAddress'))
        }
    }, [])

    useEffect(async () => {
        if(address && address !== '') {
            setLoginEnable(true)

            setFormattedAddress(AdminService.formatWinnerAddress(address, 6, 5))
            setConnected(true)

            const web3 = new Web3(window.ethereum)

            const _mysticContract = new web3.eth.Contract(MYSTIC_ABI, contract_address)
            setAccount({..._mysticContract})

            const _tokenContract = new web3.eth.Contract(TOKEN_ABI, token_address)
            setTokenContract({..._tokenContract})

            await StakingService.switchNetWork('mint')
            const mintedNum = await _mysticContract.methods.totalSupply().call()
            setMinted(mintedNum)

            await loadLotteryData(address, web3, _tokenContract)

            await handleChanged(_tokenContract)
            setActionEnable(true)

            const interval = setInterval(async () => {
                await handleChanged(_tokenContract)
            }, 30000)

            return () => clearInterval(interval)
        }
        else {
            setLoginEnable(false)
            setConnected(false)
            sessionStorage.clear()
        }
    }, [address])

    const loadStakingData = async (walletAccount, web3Object, _tokenContract) => {
        const _stakingContract = new web3Object.eth.Contract(STAKING_ABI, staking_address)
        setStakingContract({..._stakingContract})

        await StakingService.switchNetWork('staking')
        const userData = await StakingService.getUserData(_tokenContract, _stakingContract, walletAccount, token_address, staking_address)
        setStakingData(userData)
    }

    const initialNetWork = async () => {
        let currentChainId = window.ethereum.networkVersion
        StakingService.setChainId(currentChainId)
    }

    const loadLotteryData = async (walletAccount, web3Object, _tokenContract) => {
        const _lotteryContract = new web3Object.eth.Contract(LOTTERY_ABI, lottery_address)
        setLotteryContract({..._lotteryContract})

        await StakingService.switchNetWork('lottery')
        await initLotteryInfo(_lotteryContract, _tokenContract, walletAccount)
        await checkLotteryInfo()

        const _allowance = await StakingService.getLotteryAllowance()
        setLotteryAllowance(_allowance)
    }

    const handleConnectWallet = async () => {
        const { ethereum } = window

        if(!ethereum) {
            setShow(true)
        }
        let accounts
        try {
            accounts = await ethereum.request({ method: 'eth_requestAccounts' })
            console.log("Found an account! Address: ", accounts[0])
        } catch(err) {
            console.log(err)
        }
        setAddress(accounts[0])
    }

    const handleDisconnectWallet = async () => {
        setAddress('')
    }

    //Mint Actions Start

    useEffect(async () => {
        if(minted == 0)
            return

        await StakingService.switchNetWork('mint')
        let items = []
        for(let i = 1; i <= minted; i ++) {
            const isOwner = await isOwnerToken(i)
            if(isOwner) {
                items.push(i)
                setNftNumbers([...items])

                const tokenURI = await account.methods.tokenURI(i).call()
                loadMetaDatafromURI(tokenURI)
            }
        }
    }, [minted])

    useEffect(async () => {
        if(ownerImage.length === 0)
            return
        setLoaded(true)
    }, [ownerImage])

    const loadMetaDatafromURI = async(uri) => {
        if(uri === '')
            return

        await fetch(uri)
          .then(response => response.json())
          .then((jsonData) => {
            setOwnerImage(oldArray => [...oldArray, jsonData])
          })
          .catch((error) => {
            console.error(error)
          })
    }

    useEffect(() => {
        if(mintCounter !== 0) {
            let temp = (mintCounter * 50).toString() + '000000000000000'
            setMintValue(temp)
        }
    }, [mintCounter])

    const isOwnerToken = async(index) => {
        if(address === undefined)
            return null

        await StakingService.switchNetWork('mint')
        try {
            const ownerAccount = await account.methods.ownerOf(index).call()
            return ownerAccount.toLowerCase() === address.toLowerCase()
        }
        catch(exception) {
            console.log(exception)
            return null
        }
    }

    const mintHandler = async () => {
        await StakingService.switchNetWork('mint')
        await account.methods.mint(mintCounter).send({from: address, value: mintValue}).on("receipt", (receipt) => {
            console.log(receipt)
          })
          .on("error", (err) => {
            console.log(err)
          })
    }

    //Mint Action Ends
    
    const handleChanged = async (_tokenContract) => {
        const web3 = new Web3(window.ethereum)

        await initialNetWork()
        await loadStakingData(address, web3, _tokenContract)
    }

    useEffect(async () => {
        if(loginEnable) {
            const res = await AdminService.login(address, nftNumbers)
            setUserInfo(res)
        }
    }, [loginEnable])

    const initLotteryInfo = async (lotteryContractAccount, tokenContractAccount, walletAddress) => {
        await StakingService.initLotteryInfo(lotteryContractAccount, tokenContractAccount, walletAddress, lottery_address)
    }

    const checkLotteryInfo = async () => {
        const _lotterys = await StakingService.getLotteryInfo(lotteryContractAccount, address)
        let i = 1
        do {
            const ticket_price =  await StakingService.getBalanceNumber(_lotterys[i - 1]._ticketPrice)
            const reward_price =  await StakingService.getBalanceNumber(_lotterys[i - 1]._reward)
            const withdraw_price =  await StakingService.getBalanceNumber(_lotterys[i - 1]._winnerReward)
            const left_price =  await StakingService.getBalanceNumber(_lotterys[i - 1]._fee)
            const remain_price =  await StakingService.getBalanceNumber(_lotterys[i - 1]._remainPrice)
            let item = {
                lottery_id: i,
                start_date: _lotterys[i - 1]._startDate,
                close_date: _lotterys[i - 1]._closeDate,
                ticket_price: ticket_price,
                reward_price: reward_price,
                win_nft_number: _lotterys[i - 1]._winNumber,
                withdraw_price: withdraw_price,
                left_price: left_price,
                is_withdrawed: _lotterys[i - 1]._paid,
                joined_users: _lotterys[i - 1]._playerList,
                win_user_address: _lotterys[i - 1]._winnerAddress,
                remain_price: remain_price
            }
            const res = await AdminService.checkLotteryInfo(item)
            i++
        } while(i <= _lotterys.length)
    }

    const disconnectShowAction = (type) => {
        if(type === 0) {
            window.setTimeout(function() {
                setDisconnectShow(!disconnectShow)
            }, 30)
        }
        else {
            setDisconnectShow(false)
        }
    } 

    return (
        <>
        { show && (
            <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                <p>
                    Please install Metamask.
                </p>
            </Alert>
        )}
        <section className="hero-bg-img" onClick={() => disconnectShowAction(1, false)}>
            <nav className="navbar navbar-expand-lg navbar-light navbar-bg-rgb z-1 py-lg-20 py-8">
                <div className="container">
                    <a className="navbar-brand me-0 me-md-0 " href="#"><img className="w-sm-240 lg-logo" src={logo} alt="" /><img className="w-sm-240 sm-logo" src={logo1} alt="" /></a>
                    <div className="top-button-area">
                        <div>
                            <a href="https://mysticbetstoken.com/" target="_blank" className="text-decoration-none link-token"><img src={ico} className="link-token-img" /></a>
                            <a href="https://twitter.com/mysticbets_" target="_blank" className="text-decoration-none link-twitter" style={{marginRight: '8px'}}><img src={twitter} className="link-token-img" /></a>
                            <a href="https://mysticbets.io" target="_blank" className="text-decoration-none link-twitter"><img src={sports} className="link-token-img" style={{width:'35px'}} /></a>
                        </div>
                    </div>

                </div>
            </nav>
            <div>
                <div className='row' style={{position: 'absolute', width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: '18px'}}>
                    <a href="#home" className='menu-btns'>Minting</a>
                    <a href="#go-staking" className='menu-btns'>Staking</a>
                    <a href="#go-lottery" className='menu-btns'>Lottery</a>
                </div>
            </div>

            <div className='row'>
                <div className='connection-section' style={{marginTop: '20px', textAlign: 'right', zIndex: '100'}}>
                    {!connected ?
                        <a href="#" onClick={handleConnectWallet} className="text-decoration-none link-token" style={{textAlign: 'right'}}><span className='connect-wallet-btn'>Connect Wallet</span></a>
                    :
                        <>
                            <span className='formattedAddress' onClick={() => disconnectShowAction(0)}>{formattedAddress}</span>
                            {
                                disconnectShow ? 
                                    <div className='disconnect-wallet'>
                                        <span onClick={handleDisconnectWallet} className='disconnect-btn'><img src={metamask} style={{width: '20px'}} alt="" />Disconnect</span>
                                    </div>
                                :
                                    <>
                                    </>
                            }
                        </>
                    }
                </div>
            </div>

            <div className="container mt-sm-5 pt-xxxxl-70" id="home">
                <div className="row">
                    <div className="col-md-7 col-lg-6 d-flex align-items-center order-1 order-md-0" data-aos="fade-right"
                        data-aos-duration="2000">
                        <div className="text-center text-md-start">
                            <h1 className="main-heading">Release of Mystic Bets official jerseys</h1>
                            <p className="para mb-4 mb-lg-5">We are releasing 10,000 randomly generated NFT Jerseys.  Jerseys will act as profile picture and leaderboard initially.  They will continue to have upgraded utility on Mystic Bets platform.</p>
                            <div className="pt-3 mint-div">
                                <NumericInput mobile className="form-control" min={1} max={10} step={1} value={mintCounter} onChange={(e) => setMintCounter(e)} style={{
                                    wrap: {
                                        width: '200px',
                                        marginBottom: '30px'
                                    },
                                    input: {
                                        backgroundColor: "#93298b",
                                        borderColor: "#93298b",
                                        color: "#fff",
                                        height: '48px'
                                    },
                                    'input:focus': {
                                        backgroundColor: "#93298b",
                                        borderColor: "#93298b",
                                        outline: 'none',
                                        boxShadow: 'unset',
                                    },
                                }} />
                                <a href="#" className="common-btn text-decoration-none" onClick={mintHandler}>MINT NOW</a>
                                <a href="https://opensea.io/collection/mystic-bets-jersey" target="_blank" className="common-btn text-decoration-none connect-opensea">See Jerseys here!</a>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-5 col-lg-5 mb-2 mb-md-0" data-aos="fade-left" data-aos-duration="2000">
                        <div><img className="hero-vampire-img" src={hero1} alt="" /></div>
                    </div>
                </div>
            </div>
            <TokenStakeCard stakingData={stakingData} account={address} handleChanged={handleChanged} isActionEnable={isActionEnable} />
            <LotteryCard connected={connected} walletAccount={address} hasNFT={isLoaded} userInfo={userInfo} checkLotteryInfo={checkLotteryInfo} allowance={lotteryAllowance} />
        </section>

        { isLoaded && (
            <section className = "listing-myNFTs">
                 <Row>
                        {(ownerImage).map((ownimg, index) =>
                        <Col key={index} xs={{ span: 12 }} sm={{ span: 4 }} md={{ span: 4 }} lg={{ span: 3 }} xl={{ span: 3 }}>
                            <NFTInfo mintData={ownimg} index={index}/>
                        </Col>
                        )}
                 </Row>
            </section>
        )}
        </>
    );
}

export default MainPart;