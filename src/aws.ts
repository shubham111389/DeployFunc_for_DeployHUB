import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";

require("aws-sdk/lib/maintenance_mode_message").suppress = true;

const s3 = new S3({
    accessKeyId: "a3c34598b4d918c8f1442787286ba705",
    secretAccessKey: "029efee4494385993504d614d2850e178ab717d024f433718c7d6d3f3bbaa90b",
    endpoint: "https://f176de080d946997a747a188e04f44bc.r2.cloudflarestorage.com",
    
})
// output/asdasd
export async function downloadS3Folder(prefix: string) {
    console.log( prefix);
    const allFiles = await s3.listObjectsV2({
        Bucket: "vercel1",
        Prefix: prefix
    }).promise();


    console.log(allFiles)
    
    
    const allPromises = allFiles.Contents?.map(async ({Key}) => {
        return new Promise(async (resolve) => {
            if (!Key) {
                resolve("");
                return;
            }
            const finalOutputPath = path.join(__dirname, Key);
            const outputFile = fs.createWriteStream(finalOutputPath);
            const dirName = path.dirname(finalOutputPath);
            if (!fs.existsSync(dirName)){
                fs.mkdirSync(dirName, { recursive: true });
            }
            
            s3.getObject({
                Bucket: "vercel",
                Key
            }).createReadStream().pipe(outputFile).on("finish", () => {
                resolve("");
            })
        })
    }) || []
    console.log("awaiting");

    await Promise.all(allPromises?.filter(x => x !== undefined));
    
}