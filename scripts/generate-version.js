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

    // Create static/version.json
    const staticDir = path.join(process.cwd(), 'static');
    if (!fs.existsSync(staticDir)) {
        fs.mkdirSync(staticDir);
    }

    fs.writeFileSync(
        path.join(staticDir, 'version.json'),
        JSON.stringify(versionInfo, null, 2)
    );

    console.log('Version information generated successfully');
} catch (error) {
    console.error('Failed to generate version information:', error);
    process.exit(1);
} 