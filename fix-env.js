const { spawn } = require('child_process');

function addEnv(key, value) {
    return new Promise((resolve, reject) => {
        console.log(`Adding ${key}...`);
        const child = spawn('npx', ['vercel', 'env', 'add', key, 'production'], {
            stdio: ['pipe', 'inherit', 'inherit'],
            shell: true
        });

        // Vercel CLI prompts:
        // 1. sensitive? (y/N) -> we send "no\n"
        // 2. value? -> we send the value without extra final newline if possible, 
        // but the library might expect one after the answer to the prompt.
        // Actually, when piping, Vercel might behave differently.

        // Let's try sending the value as an argument if possible.
        // Documentation says: vercel env add [name] [environment] [value]
    });
}

// Actually, I'll just use run_command with a clean string if possible.
// Or a simpler Node script for one-off execution.
const { execSync } = require('child_process');
try {
    console.log('Cleaning up...');
    try { execSync('npx vercel env rm CRON_SECRET production --yes', { stdio: 'inherit' }); } catch (e) { }

    console.log('Adding CRON_SECRET...');
    // Using the 3rd argument for value to avoid stdin issues
    execSync('npx vercel env add CRON_SECRET production 82b71e35f208799b8effabf4b5017116923b83eb71a3e1e8f827477861080ddc', { stdio: 'inherit' });
    console.log('Done!');
} catch (e) {
    console.error(e);
    process.exit(1);
}
