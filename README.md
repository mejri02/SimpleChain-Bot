# SimpleChaain-Bot

Automated task bot for [SimpleChain](https://task.simplechain.com?inviteCode=9v5l6ft3929) — handles daily check-in, website visit, and block explorer tasks across multiple accounts with 24/7 loop and proxy support.

---

## Features

- ✅ Daily Check-in automation
- ✅ Visit Website & Block Explorer tasks
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

## Output Example

```
[0xabc123...]
  ✓ Logged in
  ✓ Daily Check-in: +100 pts (streak: 5)
  ✓ Visit Website: +50 pts
  ✓ Block Explorer: +50 pts

📊 Cycle 1 completed in 12.4s
  ✓ Daily Check-in: 3/3
  ✓ Visit Website: 3/3
  ✓ Block Explorer: 3/3

💤 Sleeping 25h 42m (24h + 42m jitter)
```

---

## Disclaimer

Use at your own risk. This tool is for educational purposes only.

---

## Links

- 🌐 [SimpleChain App](https://task.simplechain.com?inviteCode=9v5l6ft3929)
- 💬 [Telegram Community](https://t.me/AirDropXDevs)
- 👤 [GitHub: mejri02](https://github.com/mejri02)
