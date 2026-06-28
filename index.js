#!/usr/bin/env node

const axios = require('axios');
const { ethers } = require('ethers');
const fs = require('fs');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');

const c = {
    y: (s) => `\x1b[33m${s}\x1b[0m`,
    g: (s) => `\x1b[32m${s}\x1b[0m`,
    r: (s) => `\x1b[31m${s}\x1b[0m`,
    cy: (s) => `\x1b[36m${s}\x1b[0m`,
    w: (s) => `\x1b[37m${s}\x1b[0m`,
    gr: (s) => `\x1b[90m${s}\x1b[0m`,
    m: (s) => `\x1b[35m${s}\x1b[0m`,
    b: (s) => `\x1b[34m${s}\x1b[0m`
};

const BASE_URL = "https://task.simplechain.com";
const INVITE_CODE = "9v5l6ft3929";

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/120.0",
    "Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 12; SM-S908B) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
];

const RPC_URL = "https://prod-simple-abroad.qukuaicunzheng.top/rpc/";
const CHAIN_ID = 1913;
const WSRW = "0xec1bF294Ea5b3271A87606B51F5465352bc19bE5";
const MERCURY = "0x8c0c42fD298623d035eeFd8b2783c94069610d2B";
const MARS = "0xFC12Ae35889A4a6D0b1cE94a6675Ef869F6eb207";
const SWAP_ROUTER = "0x43b06d73dC0dDB9214B28349a913A2b7FAAFCEe8";
const LIQUIDITY_ROUTER = "0x6E172Ba709487fd0Dc47D8A23e128C0328E0646c";
const FEE_TIER = 3000;
const SWAP_MIN = ethers.parseEther("0.0001");
const SWAP_MAX = ethers.parseEther("0.005");
const SWAP_COUNT = 5;

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address owner) external view returns (uint256)",
];

const SWAP_ROUTER_ABI = [
    "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)",
];

const LIQUIDITY_ABI = [
    "function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline) params) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
];

function banner() {
    console.log(c.cy(`
╔════════════════════════════════════════════════════════════════════╗
║${c.g('                                                              ')}║
║${c.g('     ███████╗██╗███╗   ███╗██████╗ ██╗     ███████╗ ██████╗██╗  ██╗')}║
║${c.g('     ██╔════╝██║████╗ ████║██╔══██╗██║     ██╔════╝██╔════╝██║ ██╔╝')}║
║${c.g('     ███████╗██║██╔████╔██║██████╔╝██║     █████╗  ██║     █████╔╝ ')}║
║${c.g('     ╚════██║██║██║╚██╔╝██║██╔═══╝ ██║     ██╔══╝  ██║     ██╔═██╗ ')}║
║${c.g('     ███████║██║██║ ╚═╝ ██║██║     ███████╗███████╗╚██████╗██║  ██╗')}║
║${c.g('     ╚══════╝╚═╝╚═╝     ╚═╝╚═╝     ╚══════╝╚══════╝ ╚═════╝╚═╝  ╚═╝')}║
║${c.m('                                                              ')}║
║${c.cy('                   SIMPLECHAIN BOT                            ')}║
║${c.w('         Web Tasks + On-Chain (Swap & Liquidity)              ')}║
║${c.w('                  24/7 Loop | Proxy Support                    ')}║
╚════════════════════════════════════════════════════════════════════╝
`));
}

function showMenu() {
    console.log(c.cy(`\n┌─────────────────────────────────────┐`));
    console.log(c.cy(`│            PROXY SELECTION           │`));
    console.log(c.cy(`├─────────────────────────────────────┤`));
    console.log(c.g(`│  [1]  Run WITH Proxy (proxy.txt)     │`));
    console.log(c.y(`│  [2]  Run WITHOUT Proxy              │`));
    console.log(c.cy(`├─────────────────────────────────────┤`));
    console.log(c.r(`│  [3]  Exit                           │`));
    console.log(c.cy(`└─────────────────────────────────────┘`));
}

function askQuestion(query) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => readline.question(query, ans => {
        readline.close();
        resolve(ans);
    }));
}

function jitter(minSec, maxSec) {
    const ms = (Math.random() * (maxSec - minSec) + minSec) * 1000;
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
}

function randomBetween(min, max) {
    return min + BigInt(Math.floor(Math.random() * Number(max - min)));
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

class ProxyManager {
    constructor(useProxy = false) {
        this.proxies = [];
        this.useProxy = useProxy;
        if (useProxy) this.loadProxies();
    }

    loadProxies() {
        try {
            if (fs.existsSync('proxy.txt')) {
                const content = fs.readFileSync('proxy.txt', 'utf8');
                this.proxies = content.split('\n')
                    .filter(l => l.trim() && !l.startsWith('#'));
                if (this.proxies.length > 0) {
                    console.log(c.g(`✓ Loaded ${this.proxies.length} proxies`));
                } else {
                    console.log(c.y(`! No proxies found, running without proxy`));
                    this.useProxy = false;
                }
            } else {
                console.log(c.y(`! proxy.txt not found, running without proxy`));
                this.useProxy = false;
            }
        } catch(e) { this.useProxy = false; }
    }

    getAgent() {
        if (!this.useProxy || this.proxies.length === 0) return null;
        const proxy = this.proxies[Math.floor(Math.random() * this.proxies.length)];
        try {
            if (proxy.toLowerCase().startsWith('socks')) {
                return new SocksProxyAgent(proxy);
            }
            return new HttpsProxyAgent(proxy);
        } catch(e) { return null; }
    }
}

class AccountManager {
    constructor() {
        this.accounts = [];
        this.loadAccounts();
    }

    loadAccounts() {
        if (!fs.existsSync('accounts.txt')) {
            console.log(c.r('✗ accounts.txt not found'));
            process.exit(1);
        }
        const content = fs.readFileSync('accounts.txt', 'utf8');
        const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
        for (const line of lines) {
            let pk = line.trim();
            if (!pk.startsWith('0x')) pk = '0x' + pk;
            try {
                const wallet = new ethers.Wallet(pk);
                this.accounts.push({ privateKey: pk, address: wallet.address.toLowerCase(), wallet });
            } catch(e) {
                console.log(c.r(`✗ Invalid key: ${line.substring(0, 20)}...`));
            }
        }
        console.log(c.g(`✓ Loaded ${this.accounts.length} accounts`));
    }
}

class Bot {
    constructor(account, proxyManager) {
        this.account = account;
        this.proxyManager = proxyManager;
        this.token = null;
        this.session = null;
        this.results = {};
    }

    createSession() {
        const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        this.session = axios.create({
            baseURL: BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': userAgent,
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/?inviteCode=${INVITE_CODE}`
            }
        });
        const agent = this.proxyManager.getAgent();
        if (agent) this.session.defaults.httpsAgent = agent;
    }

    async login() {
        const resp = await this.session.post('/api/v1/get/nonce', { address: this.account.address });
        const nonce = resp.data?.data?.nonce || resp.data?.nonce;
        const message = `Welcome to SimpleChain!\n\nClick to sign in and accept the SimpleChain Terms of Service.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nNonce: ${nonce}`;
        const signature = await this.account.wallet.signMessage(message);
        const login = await this.session.post('/api/v1/login', {
            address: this.account.address,
            inviteCode: INVITE_CODE,
            message: message,
            signature: signature
        });
        this.token = login.data?.data?.token || login.data?.token;
        if (this.token) {
            this.session.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
            return true;
        }
        return false;
    }

    async dailyCheckin() {
        try {
            const status = await this.session.get('/api/v1/campaign/checkin/status');
            if (status.data?.data?.todayChecked === true) {
                return { success: true, message: "Already checked in" };
            }
            const checkin = await this.session.post('/api/v1/campaign/checkin', {});
            if (checkin.data?.code === 200 || checkin.data?.code === 0) {
                const points = checkin.data?.data?.totalReward || 0;
                const streak = checkin.data?.data?.currentStreak || 0;
                return { success: true, message: `+${points} pts (streak: ${streak})` };
            }
            return { success: false, message: checkin.data?.message || "Failed" };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async completeTask(taskId) {
        try {
            const resp = await this.session.post('/api/v1/task/complete', { taskId: taskId });
            if (resp.data?.code === 200 || resp.data?.code === 0) {
                const points = resp.data?.data?.rewardPoints || 0;
                return { success: true, message: `+${points} pts` };
            }
            if (resp.data?.message?.toLowerCase().includes('already')) {
                return { success: true, message: "Already completed" };
            }
            return { success: false, message: resp.data?.message || "Failed" };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async getTaskList() {
        try {
            const resp = await this.session.get('/api/v1/task/list');
            if (resp.data?.code === 200 || resp.data?.code === 0) {
                return resp.data?.data?.tasks || [];
            }
            return [];
        } catch (e) {
            return [];
        }
    }

    async doSwap(tokenOut, amountIn) {
        try {
            const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);
            const signer = new ethers.Wallet(this.account.privateKey, provider);
            const router = new ethers.Contract(SWAP_ROUTER, SWAP_ROUTER_ABI, signer);
            
            const tx = await router.exactInputSingle(
                {
                    tokenIn: WSRW,
                    tokenOut: tokenOut,
                    fee: FEE_TIER,
                    recipient: signer.address,
                    amountIn: amountIn,
                    amountOutMinimum: 0n,
                    sqrtPriceLimitX96: 0n,
                },
                { value: amountIn, gasLimit: 500000 }
            );
            const receipt = await tx.wait();
            console.log(c.g(`  ✓ Swap tx: ${receipt.hash}`));
            return receipt;
        } catch (error) {
            console.log(c.r(`  ✗ Swap failed: ${error.message}`));
            return null;
        }
    }

    async ensureApproval(signer, tokenAddress, spender, amount) {
        try {
            const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
            const allowance = await token.allowance(signer.address, spender);
            if (allowance < amount) {
                console.log(c.gr(`  → Approving ${ethers.formatEther(amount)} tokens...`));
                const tx = await token.approve(spender, ethers.MaxUint256);
                await tx.wait();
                console.log(c.g(`  ✓ Approved`));
            }
        } catch (error) {
            console.log(c.r(`  ✗ Approval failed: ${error.message}`));
            throw error;
        }
    }

    async doAddLiquidity(tokenAddress, tokenName) {
        try {
            const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);
            const signer = new ethers.Wallet(this.account.privateKey, provider);
            const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
            const bal = await tokenContract.balanceOf(signer.address);
            const MIN_AMOUNT = ethers.parseEther("0.0001");

            if (bal === 0n || bal < MIN_AMOUNT) {
                console.log(c.y(`  ⚠️ Balance ${tokenName} empty (${ethers.formatEther(bal)}), skip`));
                return;
            }

            const pct = BigInt(Math.floor(Math.random() * 30) + 20);
            const amountByPct = (bal * pct) / 100n;
            const amountToken = amountByPct;
            const amountSRW = amountToken / 10n;

            if (amountToken < MIN_AMOUNT || amountSRW < MIN_AMOUNT) {
                console.log(c.y(`  ⚠️ Amount too small, skip (${ethers.formatEther(amountToken)} ${tokenName})`));
                return;
            }

            await this.ensureApproval(signer, tokenAddress, LIQUIDITY_ROUTER, amountToken);

            let t0, t1, a0, a1, nativeValue;
            if (WSRW.toLowerCase() < tokenAddress.toLowerCase()) {
                t0 = WSRW;
                t1 = tokenAddress;
                a0 = amountSRW;
                a1 = amountToken;
                nativeValue = amountSRW;
            } else {
                t0 = tokenAddress;
                t1 = WSRW;
                a0 = amountToken;
                a1 = amountSRW;
                nativeValue = amountSRW;
            }

            const posManager = new ethers.Contract(LIQUIDITY_ROUTER, LIQUIDITY_ABI, signer);
            const deadline = Math.floor(Date.now() / 1000) + 600;

            console.log(c.gr(`  → Adding ${ethers.formatEther(amountToken)} ${tokenName} + ${ethers.formatEther(amountSRW)} SRW`));

            const tx = await posManager.mint(
                {
                    token0: t0,
                    token1: t1,
                    fee: FEE_TIER,
                    tickLower: -887160,
                    tickUpper: 887160,
                    amount0Desired: a0,
                    amount1Desired: a1,
                    amount0Min: 0n,
                    amount1Min: 0n,
                    recipient: signer.address,
                    deadline,
                },
                { value: nativeValue, gasLimit: 3000000 }
            );
            const receipt = await tx.wait();
            console.log(c.g(`  ✓ Add liquidity SRW+${tokenName} (${pct}%) tx: ${receipt.hash}`));
        } catch (error) {
            console.log(c.r(`  ✗ Add liquidity failed: ${error.message}`));
        }
    }

    async run() {
        this.createSession();
        console.log(c.cy(`\n[${this.account.address.substring(0, 10)}...]`));
        
        if (!await this.login()) {
            console.log(c.r(`  ✗ Login failed`));
            return;
        }
        console.log(c.g(`  ✓ Logged in`));
        
        const tasks = await this.getTaskList();
        console.log(c.gr(`  ✓ ${tasks.length} tasks loaded`));

        const webTasks = tasks.filter(t => t.status === "ACTIVE");
        const taskMap = {};
        for (const t of webTasks) {
            taskMap[t.taskCode] = t.taskId;
        }

        const taskList = [
            { code: "ACCESS_LINK", name: "Visit Website" },
            { code: "SWAP_TOKEN", name: "Swap Token" },
            { code: "PROVIDE_LIQUIDITY", name: "Provide Liquidity" }
        ];

        for (const task of taskList) {
            await jitter(2, 4);
            if (taskMap[task.code]) {
                const result = await this.completeTask(taskMap[task.code]);
                const icon = result.success ? c.g(`✓`) : c.r(`✗`);
                console.log(`  ${icon} ${task.name}: ${result.message}`);
                this.results[task.name] = result.success;
            } else {
                console.log(c.y(`  ⚠️ ${task.name}: Task not found`));
                this.results[task.name] = false;
            }
        }

        await jitter(2, 4);
        const checkinResult = await this.dailyCheckin();
        const icon = checkinResult.success ? c.g(`✓`) : c.r(`✗`);
        console.log(`  ${icon} Daily Check-in: ${checkinResult.message}`);
        this.results["Daily Check-in"] = checkinResult.success;

        console.log(c.cy(`\n  🔄 Performing on-chain swaps...`));
        const tokens = [
            { address: MERCURY, name: "MERCURY" },
            { address: MARS, name: "MARS" }
        ];
        
        for (const token of tokens) {
            console.log(c.gr(`  → SRW → ${token.name}`));
            for (let s = 1; s <= SWAP_COUNT; s++) {
                const amount = randomBetween(SWAP_MIN, SWAP_MAX);
                console.log(c.gr(`    [${s}/${SWAP_COUNT}] ${ethers.formatEther(amount)} SRW`));
                await this.doSwap(token.address, amount);
                if (s < SWAP_COUNT) await sleep(3000);
            }
        }

        console.log(c.cy(`\n  💧 Adding liquidity...`));
        for (const token of tokens) {
            await this.doAddLiquidity(token.address, token.name);
            await sleep(3000);
        }

        this.results["Swaps"] = true;
        this.results["Liquidity"] = true;
    }
}

async function runCycle(cycleNum, proxyManager) {
    const accountManager = new AccountManager();
    if (accountManager.accounts.length === 0) return false;
    
    console.log(c.m(`\n════════════════════════════════════════════════════════════`));
    console.log(c.m(`  CYCLE #${cycleNum} - ${new Date().toLocaleString()}`));
    console.log(c.m(`════════════════════════════════════════════════════════════`));
    
    const taskStats = {};
    const taskNames = ["Visit Website", "Swap Token", "Provide Liquidity", "Daily Check-in", "Swaps", "Liquidity"];
    for (const name of taskNames) taskStats[name] = 0;
    const start = Date.now();
    
    for (let i = 0; i < accountManager.accounts.length; i++) {
        const acc = accountManager.accounts[i];
        const bot = new Bot(acc, proxyManager);
        await bot.run();
        
        for (const name of taskNames) {
            if (bot.results[name]) taskStats[name]++;
        }
        
        if (i < accountManager.accounts.length - 1) {
            await jitter(5, 15);
        }
    }
    
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(c.cy(`\n📊 Cycle ${cycleNum} completed in ${elapsed}s`));
    for (const name of taskNames) {
        console.log(c.g(`  ✓ ${name}: ${taskStats[name]}/${accountManager.accounts.length}`));
    }
    
    return true;
}

async function main() {
    banner();
    
    showMenu();
    const proxyChoice = await askQuestion(c.cy('\n  Enter choice (1-3): '));
    
    if (proxyChoice === '3') {
        console.log(c.y('\n  Exiting...\n'));
        process.exit(0);
    }
    
    const useProxy = (proxyChoice === '1');
    const proxyManager = new ProxyManager(useProxy);
    
    console.log(c.g('\n[INFO] Starting 24/7 auto loop mode with jitter...'));
    console.log(c.gr('  Tasks: Daily Check-in | Visit Website | Swap | Liquidity\n'));
    
    let cycle = 1;
    const BASE_WAIT = 24 * 60 * 60;
    
    while (true) {
        await runCycle(cycle, proxyManager);
        
        const jitterSeconds = Math.floor(Math.random() * 3600) + 1800;
        const totalWait = BASE_WAIT + jitterSeconds;
        
        console.log(c.b(`\n💤 Sleeping ${formatTime(totalWait)} (24h + ${Math.floor(jitterSeconds/60)}m jitter)`));
        
        for (let i = totalWait; i > 0; i--) {
            process.stdout.write(`\r   Next cycle in: ${formatTime(i)}    `);
            await new Promise(r => setTimeout(r, 1000));
        }
        
        console.log(c.g(`\n\n🔄 Starting cycle #${++cycle}\n`));
    }
}

main().catch(console.error);