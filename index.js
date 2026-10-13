import { spawn } from 'node:child_process';
import readline from 'node:readline/promises';
import { pipeline } from '@huggingface/transformers';

const MIC = 'Microfone (2- Redragon Gaming Headset)'; // ffmpeg -list_devices true -f dshow -i dummy
const MODELO = 'Xenova/whisper-base'; // tiny | base | small (mais lento, mais preciso)

console.log('Carregando modelo (baixa só na 1ª vez)...');
const transcrever = await pipeline('automatic-speech-recognition', MODELO);

// Grava o mic via ffmpeg: PCM float32, 16kHz, mono, direto no stdout
function gravar() {
    const ff = spawn('ffmpeg', [
        '-loglevel', 'error',
        '-f', 'dshow', '-i', `audio=${MIC}`,
        '-ar', '16000', '-ac', '1', '-f', 'f32le', 'pipe:1',
    ]);
    const chunks = [];
    ff.stdout.on('data', (c) => chunks.push(c));
    ff.stderr.on('data', (d) => process.stderr.write(d));
    const parar = () =>
        new Promise((resolve) => {
            ff.on('close', () => {
                const buf = Buffer.concat(chunks);
                const len = Math.floor(buf.length / 4);
                resolve(new Float32Array(buf.buffer, buf.byteOffset, len));
            });
            ff.stdin.write('q'); // pede ao ffmpeg para encerrar limpo
        });
    return parar;
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

while (true) {
    await rl.question('\nEnter para começar a gravar (Ctrl+C sai)... ');
    const parar = gravar();
    await rl.question('🎙️  Gravando... Enter para parar. ');
    const audio = await parar();

    if (audio.length < 16000 * 0.5) {
        console.log('Áudio muito curto.');
        continue;
    }
    const { text } = await transcrever(audio, { language: 'portuguese', task: 'transcribe' });
    console.log('\n📝', text.trim());
}
