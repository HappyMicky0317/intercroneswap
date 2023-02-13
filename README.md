# ISwap Interface


An open source interface for ISwap -- a protocol for decentralized exchange of Ethereum tokens.

- Website: [InterCroneswap.com](https://intercroneswap.com)
- Interface: [TRX.Iswap](https://trx.intercroneswap.com)
- Docs: [ISwap/docs/](https://docs.intercroneswap.finance)
- Reddit: [/r/]()
- Email: [office@intercroneswap.finance](mailto:office@intercroneswap.finance)

## Accessing the ISwap Interface

To access the ISwap Interface, use an IPFS gateway link from the
[latest release](https://github.com/ISwap/ISwap-interface/releases/latest), 
or visit [InterCrone World](https://Intercroneswap.com).

## Listing a token

Please see the
[@ISwap/default-token-list](https://github.com/ISwap/default-token-list) 
repository.

## Development

### Install Dependencies

```bash
yarn
```

### Run

```bash
yarn start
```

### Configuring the environment (optional)

To have the interface default to a different network when a wallet is not connected:

1. Make a copy of `.env` named `.env.local`
2. Change `REACT_APP_NETWORK_ID` to `"{YOUR_NETWORK_ID}"`
3. Change `REACT_APP_NETWORK_URL` to e.g. `"https://{YOUR_NETWORK_ID}.infura.io/v3/{YOUR_INFURA_KEY}"` 

Note that the interface only works on testnets where both 
[ISwap V1](https://intercroneswap.com/docs/v1/smart-contracts/factory/) and 
[multicall](https://github.com/makerdao/multicall) are deployed.
The interface will not work on other networks.

## Contributions

**Please open all pull requests against the `master` branch.** 
CI checks will run against all PRs.

## Accessing ISwap Interface 

The ISwap Interface supports swapping against, and migrating or removing liquidity from ISwap . However,
if you would like to use ISwap, the ISwap interface for mainnet and testnets is accessible via IPFS gateways 
linked from the [v1.0.0 release](https://github.com/ISwap/ISwap-interface/releases/tag/v1.0.0).
