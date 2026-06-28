# SimpleChain-Bot

Automated task bot for [SimpleChain](https://task.simplechain.com?inviteCode=9v5l6ft3929) — handles daily check-in, web tasks, on-chain swaps, and liquidity provisioning across multiple accounts with 24/7 loop and proxy support.

---

## Features

- ✅ Daily Check-in automation
- ✅ Visit Website task
- ✅ Swap Token task (web + on-chain)
- ✅ Provide Liquidity task (web + on-chain)
- ✅ On-chain swaps: SRW → MERCURY & SRW → MARS (5x each)
- ✅ On-chain liquidity: SRW+MERCURY & SRW+MARS
- ✅ Multi-account support via `accounts.txt`
- ✅ SOCKS5 & HTTP proxy support
- ✅ 24/7 loop with 24h + random jitter interval
- ✅ Colored terminal output with per-cycle stats

---

## Requirements

- Node.js `v18+`
- npm

---

## Installation

```bash
git clone https://github.com/mejri02/SimpleChain-Bot
cd SimpleChain-Bot
npm install
```

---

## Dependencies

```bash
npm install axios ethers socks-proxy-agent https-proxy-agent
```

---

## Configuration

### `accounts.txt`

One private key per line (with or without `0x` prefix):

```
0xYOUR_PRIVATE_KEY_1
0xYOUR_PRIVATE_KEY_2
```

### `proxy.txt` *(optional)*

One proxy per line. Supports HTTP and SOCKS5:

```
http://user:pass@host:port
socks5://user:pass@host:port
```

---

## Usage

```bash
node index.js
```

Then select:

```
[1]  Run WITH Proxy (proxy.txt)
[2]  Run WITHOUT Proxy
[3]  Exit
```

The bot will loop every ~24h with a random jitter of 30–90 minutes.

---

## What the Bot Does Each Cycle

| Step | Type | Description |
|------|------|-------------|
| Login | Web | Signs nonce with wallet, gets auth token |
| Visit Website | Web Task | Completes `ACCESS_LINK` task |
| Swap Token | Web Task | Completes `SWAP_TOKEN` task |
| Provide Liquidity | Web Task | Completes `PROVIDE_LIQUIDITY` task |
| Daily Check-in | Web | Claims daily streak reward |
| Swap SRW→MERCURY | On-Chain | 5 random swaps (0.0001–0.005 SRW each) |
| Swap SRW→MARS | On-Chain | 5 random swaps (0.0001–0.005 SRW each) |
| Add Liquidity MERCURY | On-Chain | Mints LP position (50–100% of balance) |
| Add Liquidity MARS | On-Chain | Mints LP position (50–100% of balance) |

---

## Output Example

```
[0xabc123...]
  ✓ Logged in
  ✓ 12 tasks loaded
  ✓ Visit Website: +50 pts
  ✓ Swap Token: +100 pts
  ✓ Provide Liquidity: +100 pts
  ✓ Daily Check-in: +200 pts (streak: 5)

  🔄 Performing on-chain swaps...
  → SRW → MERCURY
    [1/5] 0.0023 SRW
    ✓ Swap tx: 0xabc...
    [2/5] 0.0041 SRW
    ✓ Swap tx: 0xdef...
  → SRW → MARS
    [1/5] 0.0012 SRW
    ✓ Swap tx: 0x123...

  💧 Adding liquidity...
  ✓ Add liquidity SRW+MERCURY (73%) tx: 0xaaa...
  ✓ Add liquidity SRW+MARS (61%) tx: 0xbbb...

📊 Cycle 1 completed in 48.2s
  ✓ Visit Website: 3/3
  ✓ Swap Token: 3/3
  ✓ Provide Liquidity: 3/3
  ✓ Daily Check-in: 3/3
  ✓ Swaps: 3/3
  ✓ Liquidity: 3/3

💤 Sleeping 25h 12m (24h + 12m jitter)
```

---

## Network Info

| Parameter | Value |
|-----------|-------|
| Chain ID | 1913 |
| RPC | `https://prod-simple-abroad.qukuaicunzheng.top/rpc/` |
| WSRW | `0xec1bF294Ea5b3271A87606B51F5465352bc19bE5` |
| MERCURY | `0x8c0c42fD298623d035eeFd8b2783c94069610d2B` |
| MARS | `0xFC12Ae35889A4a6D0b1cE94a6675Ef869F6eb207` |
| Swap Router | `0x43b06d73dC0dDB9214B28349a913A2b7FAAFCEe8` |
| Liquidity Router | `0x6E172Ba709487fd0Dc47D8A23e128C0328E0646c` |

---

## Disclaimer

Use at your own risk. This tool is for educational purposes only.

---

## Links

- 🌐 [SimpleChain App](https://task.simplechain.com?inviteCode=9v5l6ft3929)
- 💬 [Telegram Community](https://t.me/AirDropXDevs)
- 👤 [GitHub: mejri02](https://github.com/mejri02)
