import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";

require("aws-sdk/lib/maintenance_mode_message").suppress = true;

const s3 = new S3({
    accessKeyId: "a3c34598b4d918c8f1442787286ba705",
    secretAccessKey: "029efee4494385993504d614d2850e178ab717d024f433718c7d6d3f3bbaa90b",
    endpoint: "https://f176de080d946997a747a188e04f44bc.r2.cloudflarestorage.com",
});

// output/asdasd
export async function downloadS3Folder(prefix: string) {
    const allFiles = await s3.listObjectsV2({
        Bucket: "vercel1",
        Prefix: prefix
    }).promise();

    console.log("Files in S3 bucket:", allFiles.Contents);

    if (!allFiles.Contents || allFiles.Contents.length === 0) {
        console.log("No files found in the specified prefix:", prefix);
        return;
    }

    const allPromises = allFiles.Contents.map(async ({ Key }) => {
        console.log( Key);        
        return new Promise((resolve) => {
            if (!Key) {
                resolve("");
                return;
            }

            const finalOutputPath = path.join(__dirname, Key);
            const outputFile = fs.createWriteStream(finalOutputPath);
            const dirName = path.dirname(finalOutputPath);

            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName, { recursive: true });
            }

            const downloadStream = s3.getObject({
                Bucket: "vercel1",
                Key
            }).createReadStream();

            downloadStream.pipe(outputFile);

            downloadStream.on("error", (error) => {
                console.error("Error downloading object:", error);
                resolve("");
            });

            outputFile.on("finish", () => {
                console.log("Downloaded object:", Key);
                resolve("");
            });
        });
    });

    console.log("Awaiting completion of download promises");
    await Promise.all(allPromises || []);
    console.log("Downloads completed");
}

export function copyFinalDist(id: string) {
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach(file => {
        uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
    })
}
const getAllFiles = (folderPath: string) => {
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath))
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}

const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel1",
        Key: fileName,
    }).promise();
    console.log(response);
}