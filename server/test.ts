import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import path from "path";

const successPath = path.join("./", "debug_success_frame.ts");
const errorPath = path.join("./", "debug_error_frame.ts");

function convertBufferToWebP(buffer: Buffer, label: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const inputStream = new PassThrough();
        inputStream.end(buffer);
        const outputChunks: Buffer[] = [];

        console.log(`🔍 [${label}] Lancement conversion...`);

        ffmpeg(inputStream)
            .inputFormat("mpegts")
            .noAudio()
            .outputFormat("webp")
            .outputOptions("-frames:v", "1")
            .on("error", (err) => {
                console.error(
                    `❌ [${label}] Échec de la conversion :`,
                    err.message
                );
                reject(err);
            })
            .on("end", () => {
                console.log(
                    `✅ [${label}] Conversion réussie (taille = ${
                        Buffer.concat(outputChunks).length
                    } octets)`
                );
                resolve();
            })
            .pipe()
            .on("data", (chunk: Buffer) => {
                outputChunks.push(chunk);
            });
    });
}

async function runTests() {
    if (fs.existsSync(successPath)) {
        const buffer = fs.readFileSync(successPath);
        try {
            await convertBufferToWebP(buffer, "Succès");
        } catch (_) {}
    } else {
        console.warn("⚠️ Fichier debug_success_frame.ts introuvable");
    }

    if (fs.existsSync(errorPath)) {
        const buffer = fs.readFileSync(errorPath);
        try {
            await convertBufferToWebP(buffer, "Erreur");
        } catch (_) {}
    } else {
        console.warn("⚠️ Fichier debug_error_frame.ts introuvable");
    }
}

runTests().catch((err) => {
    console.error("❌ Erreur lors des tests :", err);
});
