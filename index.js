import { spawn, spawnSync } from 'node:child_process';
import readline from 'node:readline/promises';
import { pipeline } from '@huggingface/transformers';
import ffmpegEmbutido from 'ffmpeg-static';

// Usa o ffmpeg do sistema se existir; senão, o que veio no npm install
const FFMPEG = spawnSync('ffmpeg', ['-version']).error ? ffmpegEmbutido : 'ffmpeg';

// Deixe null para usar o 1º microfone encontrado, ou escreva o nome exato:
// ffmpeg -list_devices true -f dshow -i dummy
const MIC_MANUAL = null;
const MODELO = 'Xenova/whisper-base'; // tiny | base | small (mais lento, mais preciso)

function descobrirMic() {
    const r = spawnSync(FFMPEG, ['-hide_banner', '-list_devices', 'true', '-f', 'dshow', '-i', 'dummy'], {
        encoding: 'utf8',
    });
    if (r.error) {
        console.error('\n❌ ffmpeg não encontrado. Rode npm install de novo ou instale com: winget install Gyan.FFmpeg');
        process.exit(1);
    }
    const mics = [...(r.stderr ?? '').matchAll(/"([^"]+)" \(audio\)/g)].map((m) => m[1]);
    if (mics.length === 0) {
        console.error('\n❌ Nenhum microfone encontrado. Conecte um microfone e tente de novo.');
        process.exit(1);
    }
    return mics[0];
}

const MIC = MIC_MANUAL ?? descobrirMic();
console.log('Microfone:', MIC);

console.log('Carregando modelo (baixa só na 1ª vez)...');
const transcrever = await pipeline('automatic-speech-recognition', MODELO);

// Grava o mic via ffmpeg: PCM float32, 16kHz, mono, direto no stdout
function gravar() {
    const ff = spawn(FFMPEG, [
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
