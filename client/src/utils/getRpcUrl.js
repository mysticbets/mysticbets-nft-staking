import sample from 'lodash/sample'

// export const nodes = ['https://ropsten.infura.io/v3/7ac3cea0cad348c08ba44555f865da36', 'https://ropsten.infura.io/v3/7ac3cea0cad348c08ba44555f865da36', 'https://ropsten.infura.io/v3/7ac3cea0cad348c08ba44555f865da36']
export const nodes = ['https://mainnet.infura.io/v3/7ac3cea0cad348c08ba44555f865da36', 'https://mainnet.infura.io/v3/7ac3cea0cad348c08ba44555f865da36', 'https://mainnet.infura.io/v3/7ac3cea0cad348c08ba44555f865da36']

const getNodeUrl = () => {
  return sample(nodes)
}

export default getNodeUrl
