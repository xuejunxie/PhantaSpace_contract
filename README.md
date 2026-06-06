# PhantaSpace Smart Contracts

Solidity smart contracts powering the [PhantaSpace](https://phanta.space) earth-scale mixed reality metaverse.

---

## Contracts

| Contract | Token | Description |
|---|---|---|
| `PhantaSpace.sol` | `🌐` (ERC-721) | Space Non-Fungible Token (NFT) — own and govern real-world locations on the PhantaSpace map |
| `Phanton.sol` | `Phanton` (ERC-20) | Utility token — check-in-to-earn, NFT ranking, space rent, and marketplace rewards |
| `PhantaX.sol` | — | NFT marketplace exchange contract for buying and selling on PhantaSpace |

All contracts are **upgradeable** via the [OpenZeppelin UUPS proxy pattern](https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable) and target Solidity `^0.8.10`.

---

## PhantaSpace NFT (`PhantaSpace.sol`)

An ERC-721 upgradeable contract representing ownership of a 3D geocode-addressed location.

**Key features:**
- **Vending mint** — fixed-price minting at `vendingPrice`
- **On-chain auction** — bid-based minting with configurable floor price and duration; auctions auto-extend on late bids
- **Subspace auctions** — space owners can open their space for sub-division auctions
- **ERC-2981 royalties** — configurable royalty fee in basis points
- **Pausable / Ownable** — standard safety controls

**Events:** `SpaceMinted`, `AuctionStarted`, `AuctionExtended`, `AuctionEnded`, `HighestBidIncreased`

---

## Phanton Token (`Phanton.sol`)

An ERC-20 upgradeable utility token with a capped supply.

**Key features:**
- Configurable maximum supply set at initialization
- Seed sale with on-chain accounting (`seedTokenSold`, `seedFundRaised`)
- Burnable, Pausable, Permit (EIP-2612 gasless approvals)
- Reentrancy-guarded withdrawal

**Events:** `tokenMinted`, `seedFund`, `totalSupplyIncreased`

---

## PhantaX Marketplace (`PhantaX.sol`)

NFT exchange contract for peer-to-peer buying and selling within PhantaSpace.

**Key features:**
- Upgradeable UUPS proxy
- Pausable / Ownable with reentrancy guard
- Designed to integrate with both `PhantaSpace` Space NFTs and third-party ERC-721 tokens

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Hardhat](https://hardhat.org/) | Compile, test, deploy |
| [OpenZeppelin Upgradeable Contracts](https://docs.openzeppelin.com/upgrades-plugins/) | ERC-721, ERC-20, UUPS proxy |
| [hardhat-deploy](https://github.com/wighawag/hardhat-deploy) | Deployment management |
| [hardhat-gas-reporter](https://github.com/cgewecke/hardhat-gas-reporter) | Gas cost reporting |
| [@openzeppelin/hardhat-upgrades](https://docs.openzeppelin.com/upgrades-plugins/1.x/api-hardhat-upgrades) | Safe upgrade management |
| Ethers.js + Waffle + Chai | Testing |

---

## Getting Started

### Prerequisites

- Node.js ≥ 16
- An Ethereum node provider (e.g. [Alchemy](https://alchemy.com), [Infura](https://infura.io), or [Moralis](https://moralis.io))
- A deployer wallet and its private key (never commit this)

### Install

```bash
git clone https://github.com/xuejunxie/PhantaSpace_contract.git
cd PhantaSpace_contract
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

> ⚠️ **Never commit `.env`.** It is already listed in `.gitignore`.

### Compile

```bash
npx hardhat compile
```

### Test

```bash
npx hardhat test
```

### Deploy

```bash
# Rinkeby testnet
npx hardhat deploy --network rinkeby

# Ethereum Mainnet
npx hardhat deploy --network mainnet

# Polygon Mainnet
npx hardhat deploy --network polygon
```

### Verify on Etherscan / PolygonScan

```bash
npx hardhat verify --network mainnet <DEPLOYED_CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## Project Structure

```
PhantaSpace_contract/
├── contracts/
│   ├── PhantaSpace.sol     # Space NFT (ERC-721, UUPS upgradeable)
│   ├── Phanton.sol         # Utility token (ERC-20, UUPS upgradeable)
│   └── PhantaX.sol         # NFT marketplace exchange
├── test/
│   ├── PhantaSpace_test.js
│   ├── Phanton_test.js
│   └── PhantaX_test.js
├── hardhat.config.js       # Network, compiler, plugin config (reads from .env)
├── .env.example            # Environment variable template
└── package.json
```

---

## Security

- All contracts use OpenZeppelin audited base implementations.
- Upgrades are owner-gated via UUPS (`_authorizeUpgrade`).
- Reentrancy guards are applied to all fund-handling functions.
- **Never share or commit private keys or mnemonics.** Use `.env` (gitignored) or a hardware wallet for deployments.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Links

- **App:** [https://phanta.space](https://phanta.space)
- **Frontend repo:** [PhantaSpace_Web3](https://github.com/xuejunxie/PhantaSpace_Web3)
