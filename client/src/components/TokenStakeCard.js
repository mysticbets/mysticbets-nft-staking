import React, {useState, useEffect} from 'react'
import ico from '../img/icon.png'

import { makeStyles, createTheme, ThemeProvider } from '@material-ui/core/styles'
import { styled } from '@material-ui/core/styles'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Button,
  Avatar,
  Box,
  Tooltip,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert'

import BigNumber from 'bignumber.js'

import TextField from './TextField'

import StakingService from '../utils/stakingAPI'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '90%',
    marginBottom: theme.spacing(2),
    marginLeft: 'calc(5%)'
  },
  cardstyle: {
    borderRadius: '15px !important',
    position: 'static',
    border: theme.palette.type === 'dark' ? '1px solid #4A4A4A' : '1px solid #E2E2E2',
    backgroundColor: theme.palette.type === 'dark' ? '#1E1F22' : 'white',
    backgroundColor: '#93298b',
  },
  cardtitle: {
  //   color: theme.palette.type === 'dark' ? 'white' : 'black',
      color:  'white',
      marginBottom: theme.spacing(2),
      paddingTop: theme.spacing(4),
      textAlign: 'center'
  },
  heading: {
    fontWeight: 600,
    color: theme.palette.type === 'dark' ? 'white' : 'black',
    marginLeft: '10px',
  },
  balanceEarnAmount: {
    fontWeight: 600,
    color: theme.palette.type === 'dark' ? '#31C77E' : 'black',
  },
  approveButton: {
    width: '48%',
    height: '50px',
    backgroundImage: 'linear-gradient(to right, #57e3b9 , #25bd91)',
    color: '#fff',
    borderRadius: '7px',
    textTransform: 'none',
  },
  depositButton: {
    width: '48%',
    float: 'right',
    height: '50px',
    borderRadius: '7px',
    textTransform: 'none',
    backgroundImage: 'linear-gradient(to right, #57e3b9 , #25bd91)',
  },
  withdrawButton: {
    width: '100%',
    height: '50px',
    borderRadius: '7px',
    textTransform: 'none',
    backgroundImage: 'linear-gradient(to right, #57e3b9 , #25bd91)',
  },
  claimButton: {
    width: '100%',
    backgroundImage: 'linear-gradient(to right, #58e4b9 , #fec712)',
    height: '50px',
    borderRadius: '7px',
    textTransform: 'none',
  },
  subtitle: {
    color: 'white',
    marginBottom: theme.spacing(1),
    wordWrap: 'break-word',
  },
  totalrewardtitle: {
    color: 'grey',
    marginBottom: theme.spacing(1),
    textAlign: 'center',
  },
  totalvalue: {
    color: '#31c77e',
    textAlign: 'center',
    marginBottom: theme.spacing(2),
    fontSize: '2rem',
  },
  dashBoardCard: {
    alignItems: 'center',
    padding: theme.spacing(3),
    borderBottomLeftRadius: '10px',
    borderBottomRightRadius: '10px',
    display: 'flex',
    flexWrap: 'wrap',
    backgroundColor: theme.palette.type === 'dark' ? 'black' : '#F5F6F6',
  },
  expandMoreIcon: {
    color: theme.palette.type === 'dark' ? 'white' : 'black',
  },
}))
  
const theme = createTheme({
  palette: {
    primary: {
      light: '#ffb74d',
      main: '#FF7511',
      dark: '#f57c00',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ffd453',
      main: '#FFC711',
      dark: '#b28d1c',
      contrastText: '#fff',
    },
  },
})

const StyledAccordionSummary = styled(AccordionSummary)({
  margin: '8px 0',
})

const StyledAvatar = styled(Avatar)({
  width: theme.spacing(8),
  height: theme.spacing(8),
  marginRight: '12px',
})

const StyledButton = styled(Button)({
  margin: theme.spacing(1),
  width: '130px',
  height: '40px',
  borderRadius: '10px',
  fontWeight: 600,
  fontSize: '15px',
})

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const TokenStakeCard = (props) => {
  const [openAlert, setOpenAlert] = React.useState(false)
  const [rewardMsg, setRewardMsg] = React.useState('')

  const [depositVal, setDepositVal] = useState('0')
  const [depositValNumber,setDepositValNumber] = useState('')

  const [withdrawVal, setWithdrawVal] = useState('0')
  const [withdrawValNumber, setWithdrawValNumber] = useState('')

  const [allowance, setAllowance] = useState('')
  const [isApproved, setApproved] = useState(false)

  const [stakedBalance, setStakedBalance] = useState('')
  const [maxStakedBalance, setMaxStakedBalance] = useState('')

  const [maxTokenBalance, setMaxTokenBalance] = useState('')
  const [stakingTokenBalance, setStakingTokenBalance] = useState('')

  const [fullBalance, setFullBalance] = useState()
  const [fullBalanceNumber, setFullBalanceNumber] = useState()

  const [fullStaked, setFullStaked] = useState()
  const [fullStakedNumber, setFullStakedNumber] = useState()

  const [earnings, setEarnings] = useState()
  const [rawEarningsBalance, setRawEarningsBalance] = useState()

  const [requestedDeposit, setRequestedDesposit] = useState(false)
  const [requestedApproval, setRequestedApproval] = useState(false)
  
  const [requestedWithdraw, setRequestedWithdraw] = useState(false)
  const [requestedHarvest, setRequestedHarvest] = useState(false)

  const [actionSuccess, setActionSuccess] = useState(0)
  const [maxDepositeAmount, setMaxDepositeAmount] = useState('')

  const isCompoundPool = 1 === 0
  
  const classes = useStyles()

  useEffect(() => {
    if(props.stakingData !== null) {
      const _allowance = new BigNumber(props.stakingData.allowance)
      setAllowance(_allowance)

      const _isApproved = props.account && _allowance && _allowance.isGreaterThan(0)
      setApproved(_isApproved)

      const _stakingTokenBalance = new BigNumber(props.stakingData.stakingTokenBalance)
      setStakingTokenBalance(_stakingTokenBalance)

      const _stakedBalance = new BigNumber(props.stakingData.stakedBalance)
      setStakedBalance(_stakedBalance)

      const _earnings = new BigNumber(props.stakingData.pendingReward)
      setEarnings(_earnings)
    }
  }, [props.stakingData])

  useEffect(() => {
    if(actionSuccess !== 0) {
      props.handleChanged()
    }
  }, [actionSuccess])

  useEffect(() => {
    setMaxTokenBalance(stakingTokenBalance)
  }, [stakingTokenBalance])

  useEffect(() => {
    setDepositValNumber(new BigNumber(depositVal))
  }, [depositVal])

  useEffect(() => {
    setWithdrawValNumber(new BigNumber(withdrawVal))
  }, [withdrawVal])

  useEffect(async () => {
    const _fullBalance = await StakingService.getFullDisplayBalance(maxTokenBalance)
    setFullBalance(_fullBalance)

    const _maxDepositeAmount = await StakingService.getBalanceNumber(maxTokenBalance)
    setMaxDepositeAmount(_maxDepositeAmount)

    const _fullBalanceNumber = new BigNumber(_fullBalance)
    setFullBalanceNumber(_fullBalanceNumber)
  }, [maxTokenBalance])

  useEffect(() => {
    setMaxStakedBalance(stakedBalance)
  }, [stakedBalance])

  useEffect(() => {
    const _fullStaked = StakingService.getFullDisplayBalance(maxStakedBalance)
    setFullStaked(_fullStaked)

    const _fullStakedNumber = new BigNumber(_fullStaked)
    setFullStakedNumber(_fullStakedNumber)
  }, [maxStakedBalance])

  useEffect(async () => {
    if(earnings !== undefined && earnings !== NaN && earnings !== null) {
      const _rawEarningsBalance = props.account ? await StakingService.getBalanceAmount(earnings) : new BigNumber(0)
      setRawEarningsBalance(_rawEarningsBalance)
    }
  }, [earnings])

  const handleAlertClose = (event, reason) => {
    if(reason === 'clickaway') {
      return
    }
    
    setOpenAlert(false)
  }

  const handleStake = async (amount) => {
    try {
      await StakingService.onStake(amount)
      setActionSuccess(actionSuccess + 1)
    }
    catch(exception) {
      console.log(exception)
    }
  }

  const handleUnstake = async (amount) => {
    try {
      await StakingService.onUnstake(amount)
      setActionSuccess(actionSuccess + 1)
    } catch (err) {
      console.log(err)
    }
  }

  const handleApprove = async () => {
    const _requestedApproval = await StakingService.handleApprove()
    setRequestedApproval(_requestedApproval)
    setActionSuccess(actionSuccess + 1)
  }

  const handleDeposit = async () => {
    setRequestedDesposit(true)

    try {
      var stakeLockDate = await StakingService.onStakeDate()
      var stakeTimestamp = Number(stakeLockDate) + 3 * 60

      var currentTimeInSeconds = Math.floor(Date.now() / 1000)

      if(currentTimeInSeconds < stakeTimestamp) {
        await handleStake(depositVal)
      }
      else {
        let date = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).format(stakeTimestamp * 1000)

        setOpenAlert(true)
        setRewardMsg('you can not stake now, staking was finished at ' + date)

        console.log('you can not stake now, staking was finished at ' + date)
      }
    }
    catch(exception) {
      console.log(exception)
    }

    setRequestedDesposit(false)
  }

  const handleWithDraw = async () => {
    setRequestedWithdraw(true)

    try {
      var withdrawDate = await StakingService.onWithdrawDate()
      var withdrawTimestamp = Number(withdrawDate) + 3 * 60

      var currentTimeInSeconds = Math.floor(Date.now() / 1000)

      // if (withdrawTimestamp < currentTimeInSeconds) {
      await handleUnstake(withdrawVal)
      // } else {
      //   let date = new Intl.DateTimeFormat('en-US', {
      //     year: 'numeric',
      //     month: '2-digit',
      //     day: '2-digit',
      //     hour: '2-digit',
      //     minute: '2-digit',
      //   }).format(withdrawTimestamp * 1000)

      //   console.log('you can withdraw at ' + date)
      // }
    } catch (err) {
      console.log(err)
    }

    setRequestedWithdraw(false)
  }

  const handleClaim = async () => {
    setRequestedHarvest(true)

    if (isCompoundPool) {
      // try {
      //   await onStake(fullEarningBalance, earningToken.decimals)
      //   setRequestedHarvest(false)
      // } catch (e) {
      //   console.error(e)
      //   setRequestedHarvest(false)
      // }
    } else {
      // harvesting
      try {
        await StakingService.onReward()
        setRequestedHarvest(false)
        setActionSuccess(actionSuccess + 1)
      } catch (e) {
        console.error(e)
        setRequestedHarvest(false)
        console.log('harvest error')
      }
    }

    setRequestedHarvest(false)
  }

  return (
    <div className={classes.root} id='go-staking'>
      <Typography variant="h6" className={classes.cardtitle}>
        Stake MBT token to earn MBT rewards
      </Typography>
      <ThemeProvider theme={theme}>
        <Accordion className={classes.cardstyle}>
          <StyledAccordionSummary
            expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon} />}
            aria-controls="panel1c-content"
            id="panel1c-header"
          >
            <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} width="100%">
              <Box
                display="flex"
                flexWrap="wrap"
                flexDirection={{ xs: 'column', sm: 'row' }}
                width={{ xs: '100%', lg: '50%' }}
                alignItems="center"
                mx={2}
              >
                <Box
                  width={{ xs: '100%', md: '40%' }}
                  display="flex"
                  alignItems="center"
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                >
                  <StyledAvatar alt="Token image" src={ico} />
                  {/*<img src={ico} className="link-token-img" />*/}
                  <Typography variant="h6" className={classes.heading}>
                    MBT-MBT Pool
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  flexWrap="wrap"
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  alignItems="center"
                  justifyContent={{
                    xs: 'center',
                    md: 'flex-end',
                  }}
                  width={{ xs: '80%', md: '45%' }}
                >
                  <StyledButton variant="contained" size="small" color="primary">
                    APR {props.stakingData !== null && props.stakingData.aprData.apr !== null ? parseFloat(props.stakingData.aprData.apr).toFixed(2) : 0}%
                  </StyledButton>
                </Box>
                <Box
                  width={{ xs: '20%', md: '5%' }}
                  display="flex"
                  alignItems="center"
                  justifyContent={{ xs: 'center', md: 'flex-end' }}
                >
                  <Tooltip title="Information" placement="top">
                    <InfoOutlinedIcon
                      style={{
                        verticalAlign: 'middle',
                        color: '#9D9D9D',
                      }}
                    />
                  </Tooltip>
                </Box>
              </Box>
              <Box
                display="flex"
                flexWrap="wrap"
                textAlign={{ xs: 'center', md: 'left' }}
                flexDirection={{ xs: 'colomn', sm: 'row' }}
                alignItems="center"
                width={{ xs: '100%', lg: '60%' }}
                mx={2}
              >
                <Box width={{ xs: '100%', sm: '35%' }}>
                  <Typography variant="h6" className={classes.subtitle}>
                    Total Staked Balance:
                  </Typography>
                  <Typography variant="h6" className={classes.balanceEarnAmount}>
                    {props.stakingData !== null ? (props.stakingData.pooledTokenAmount).toFixed(3) : 0} {/*MBT Token*/}
                  </Typography>
                </Box>
                <Box
                  width={{ xs: '100%', sm: '35%' }}
                  borderLeft={{ xs: 'none', sm: '2px solid lightgrey' }}
                  pl={{ xs: 0, sm: 2 }}
                  mt={{ xs: 1, sm: 0 }}
                >
                  <Typography variant="h6" className={classes.subtitle}>
                    Staked Balance:
                  </Typography>
                  <Typography variant="h6" className={classes.balanceEarnAmount}>
                    {props.stakingData !== null ? props.stakingData.stakedBalance : 0} {/*MBT Token*/}
                  </Typography>
                </Box>
                <Box
                  width={{ xs: '100%', sm: '30%' }}
                  borderLeft={{ xs: 'none', sm: '2px solid lightgrey' }}
                  pl={{ xs: 0, sm: 2 }}
                  mt={{ xs: 1, sm: 0 }}
                >
                  <Typography variant="h6" className={classes.subtitle}>
                    MBT Earned:
                  </Typography>
                  <Typography variant="h6" className={classes.balanceEarnAmount}>
                    {(props.stakingData !== null && parseFloat(rawEarningsBalance) !== 0) ? parseFloat(rawEarningsBalance).toFixed(5) : 0}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </StyledAccordionSummary>
          <AccordionDetails className={classes.dashBoardCard}>
            <Box width={{ xs: '100%', lg: '35%' }} alignSelf="center" px={1}>
              <Snackbar anchorOrigin = {{vertical: 'top', horizontal: 'right'}} autoHideDuration={6000} open={openAlert} onClose={handleAlertClose} >
                <Alert onClick={handleAlertClose} severity='warning' >{rewardMsg}</Alert>
              </Snackbar>
              <Typography variant="h6" className={classes.subtitle} style={{color: "#93298b"}}>
                Stake
              </Typography>
              <TextField value={depositVal} setValue={setDepositVal} maxValue={maxDepositeAmount ? maxDepositeAmount : 0} />
              <Box>
                <Button variant="contained" size="medium" className={classes.approveButton} style={(!props.isActionEnable || !props.account || requestedApproval || isApproved) ? {background: '#D7D8D8'} : {}} onClick={handleApprove} disabled={!props.isActionEnable || !props.account || requestedApproval || isApproved}>
                  Approve
                </Button>
                <Button variant="contained" size="medium" color="primary" className={classes.depositButton} style={(!props.isActionEnable || !isApproved || requestedDeposit || !depositValNumber.isFinite() || !depositValNumber.gt(0) || depositValNumber.gt(fullBalanceNumber)) ? {background: '#D7D8D8'} : {}} onClick={handleDeposit} disabled={!props.isActionEnable || !isApproved || requestedDeposit || !depositValNumber.isFinite() || !depositValNumber.gt(0) || depositValNumber.gt(fullBalanceNumber)}>
                  Deposit
                </Button>
              </Box>
            </Box>
            <Box width={{ xs: '100%', lg: '35%' }} alignSelf="center" px={1}>
              <Typography variant="h6" className={classes.subtitle} style={{color: "#93298b"}}>
                Unstake
              </Typography>
              <TextField value={withdrawVal} setValue={setWithdrawVal} maxValue={maxStakedBalance ? maxStakedBalance.toNumber() : 0} />
              <Button variant="contained" size="medium" className={classes.withdrawButton} color="primary"style={(!props.isActionEnable || !isApproved || requestedWithdraw || !stakedBalance.gt(0) || !withdrawValNumber.isFinite() || !withdrawValNumber.gt(0) || withdrawValNumber.gt(fullStakedNumber)) ? {background: '#D7D8D8'} : {}} onClick={handleWithDraw} disabled={!props.isActionEnable || !isApproved || requestedWithdraw || !stakedBalance.gt(0) || !withdrawValNumber.isFinite() || !withdrawValNumber.gt(0) || withdrawValNumber.gt(fullStakedNumber)}>
                Withdraw
              </Button>
            </Box>
            <Box width={{ xs: '100%', lg: '30%' }} alignSelf="center" px={1}>
              <Typography variant="h6" className={classes.totalrewardtitle}>
                Total MBT-MBT Rewards:
              </Typography>
              <Typography className={classes.totalvalue} variant="h3" gutterBottom>
                {(props.stakingData !== null && parseFloat(rawEarningsBalance) !== 0) ? parseFloat(rawEarningsBalance).toFixed(5) : 0}
              </Typography>
              <Button variant="contained" size="medium" color="primary" className={classes.claimButton} onClick={handleClaim} disabled={!props.isActionEnable || rawEarningsBalance === 0}>
                Claim
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </ThemeProvider>
    </div>  
  );
}

export default TokenStakeCard;