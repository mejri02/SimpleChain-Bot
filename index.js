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

const TASKS = [
    { id: "TK-202604-DT-0006", name: "Daily Check-in" },
    { id: "TK-202604-DT-0007", name: "Visit Website" },
    { id: "TK-202604-CT-0006", name: "Block Explorer" }
];

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36"
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
║${c.cy('                   SIMPLECHAIN TASK BOT                       ')}║
║${c.w('                Daily Checkin | Website | Explorer             ')}║
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
        this.session = axios.create({
            baseURL: BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
                'Origin': BASE_URL,
                'Referer': BASE_URL + '/'
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
    }

    async completeTask(taskId) {
        const resp = await this.session.post('/api/v1/task/complete', { taskId: taskId });
        if (resp.data?.code === 200 || resp.data?.code === 0) {
            const points = resp.data?.data?.rewardPoints || 0;
            return { success: true, message: `+${points} pts` };
        }
        if (resp.data?.message?.toLowerCase().includes('already')) {
            return { success: true, message: "Already completed" };
        }
        return { success: false, message: resp.data?.message || "Failed" };
    }

    async run() {
        this.createSession();
        console.log(c.cy(`\n[${this.account.address.substring(0, 10)}...]`));
        
        if (!await this.login()) {
            console.log(c.r(`  ✗ Login failed`));
            return;
        }
        console.log(c.g(`  ✓ Logged in`));
        
        for (const task of TASKS) {
            await jitter(2, 4);
            let result;
            if (task.id === "TK-202604-DT-0006") {
                result = await this.dailyCheckin();
            } else {
                result = await this.completeTask(task.id);
            }
            const icon = result.success ? c.g(`✓`) : c.r(`✗`);
            console.log(`  ${icon} ${task.name}: ${result.message}`);
            this.results[task.name] = result.success;
        }
    }
}

async function runCycle(cycleNum, proxyManager) {
    const accountManager = new AccountManager();
    if (accountManager.accounts.length === 0) return false;
    
    console.log(c.m(`\n════════════════════════════════════════════════════════════`));
    console.log(c.m(`  CYCLE #${cycleNum} - ${new Date().toLocaleString()}`));
    console.log(c.m(`════════════════════════════════════════════════════════════`));
    
    const taskStats = {};
    for (const task of TASKS) taskStats[task.name] = 0;
    const start = Date.now();
    
    for (let i = 0; i < accountManager.accounts.length; i++) {
        const acc = accountManager.accounts[i];
        const bot = new Bot(acc, proxyManager);
        await bot.run();
        
        for (const task of TASKS) {
            if (bot.results[task.name]) taskStats[task.name]++;
        }
        
        if (i < accountManager.accounts.length - 1) {
            await jitter(5, 15);
        }
    }
    
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(c.cy(`\n📊 Cycle ${cycleNum} completed in ${elapsed}s`));
    for (const task of TASKS) {
        console.log(c.g(`  ✓ ${task.name}: ${taskStats[task.name]}/${accountManager.accounts.length}`));
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
    
    console.log(c.g('\n[INFO] Starting 24/7 auto loop mode...'));
    console.log(c.gr('  Tasks: Daily Check-in | Visit Website | Block Explorer\n'));
    
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
