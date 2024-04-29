import { exec } from "child_process";
import path from "path";
import fs from "fs";

export function buildProject(id: string) {
    return new Promise((resolve, reject) => {
        const projectPath = path.join(__dirname, `output/${id}`);

        // Check if the directory exists
        if (!fs.existsSync(projectPath)) {
            reject(`Directory ${projectPath} does not exist`);
            return;
        }

        const command = `npm install && npm run build`;

        // Execute the command in the project directory
        const child = exec(command, { cwd: projectPath });

        child.stdout?.on('data', function(data) {
            console.log(`stdout: ${data}`);
        });
        child.stderr?.on('data', function(data) {
            console.error(`stderr: ${data}`);
        });

        child.on('close', function(code) {
            if (code === 0) {
                resolve("Build completed successfully");
            } else {
                reject(`Build failed with exit code ${code}`);
            }
        });

        child.on('error', function(err) {
            reject(`Error executing command: ${err.message}`);
        });
    });
}
