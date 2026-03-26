const { spawn } = require('child_process');

function addEnv(key, value) {
    return new Promise((resolve, reject) => {
        console.log(`Adding ${key}...`);
        const child = spawn('npx', ['vercel', 'env', 'add', key, 'production'], {
            stdio: ['pipe', 'inherit', 'inherit'],
            shell: true
        });

        child.stdin.write('no\n'); // sensitive? no
        child.stdin.write(value + '\n');
        child.stdin.end();

        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${key} added`);
                resolve();
            } else {
                console.error(`❌ ${key} failed with code ${code}`);
                reject(new Error(`Exit code ${code}`));
            }
        });
    });
}

async function run() {
    try {
        await addEnv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncmhncm9panVudWZzeHdmZXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNDI1MzgsImV4cCI6MjA4OTkxODUzOH0.Q4B-xXWcaST_8RDTeNRJKDbgKTXq11sxl9p5HfjRLUI');
        await addEnv('GOOGLE_AI_API_KEY', 'AIzaSyCCgmpsTqTCAe_ECxP_p8PtO7bDPYvu4Jg');
        console.log('All done!');
    } catch (e) {
        process.exit(1);
    }
}

run();
