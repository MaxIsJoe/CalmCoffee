import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

try {
    const hash = execSync('git rev-parse --short HEAD').toString().trim();
    const message = execSync('git log -1 --pretty=%B').toString().trim();

    const versionInfo = {
        hash,
        message,
        timestamp: new Date().toISOString()
    };

    // Create .env file with version info
    const envContent = `PUBLIC_GIT_HASH=${hash}\nPUBLIC_GIT_MESSAGE="${message}"\nPUBLIC_BUILD_TIME="${versionInfo.timestamp}"`;
    fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);

    console.log('Version information generated successfully');
} catch (error) {
    console.error('Failed to generate version information:', error);
    process.exit(1);
} 