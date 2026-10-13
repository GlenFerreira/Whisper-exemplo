# Whispernodetest

Projeto simples que grava a voz do microfone e a transforma em texto (STT) usando o Whisper rodando localmente com Node.js.

## Requisitos

- **Node.js** 20 ou superior (testado com v24)
- **ffmpeg** (usado para gravar o microfone): não precisa instalar. O `npm install` já baixa um junto com o projeto. Se você já tiver um no PATH, ele usa esse.
- Windows (a gravação usa o `dshow` do ffmpeg)
- Internet apenas na primeira execução, para baixar o modelo (~150 MB)

## Instalação

```
npm install
```

## Microfone

O projeto usa automaticamente o primeiro microfone encontrado e mostra o nome ao iniciar. Se o computador tiver vários e ele pegar o errado, coloque o nome exato (o que aparece com `(audio)` ao listar os dispositivos) em `MIC_MANUAL` no [index.js](index.js):

```js
const MIC_MANUAL = 'Microfone (2- Redragon Gaming Headset)';
```

## Como rodar

```
npm start
```

1. Aguarde o modelo carregar (na 1ª vez ele é baixado).
2. Aperte **Enter** para começar a gravar.
3. Fale uma frase.
4. Aperte **Enter** de novo para parar. O texto transcrito aparece no terminal.
5. Repita quantas vezes quiser. **Ctrl+C** para sair.

> Use sempre `npm start` e não `node index.js`. O script já inclui `--use-system-ca`, que evita o erro `self-signed certificate in certificate chain` em redes ou antivírus que interceptam o HTTPS.

## Ajustes

No [index.js](index.js):

- `MODELO`: `Xenova/whisper-tiny` (mais rápido), `Xenova/whisper-base` (padrão) ou `Xenova/whisper-small` (mais preciso, mais lento).
- `language: 'portuguese'`: idioma da transcrição.

## Problemas comuns

| Problema | Solução |
| --- | --- |
| `self-signed certificate in certificate chain` | Rode com `npm start` (usa o certificado do sistema). |
| Erro de dispositivo / nada é gravado | Defina o nome do microfone em `MIC_MANUAL`. |
| `ffmpeg não encontrado` | Rode `npm install` de novo (baixa o ffmpeg do projeto) ou instale com `winget install Gyan.FFmpeg`. |
| `ECONNRESET` no `npm install` | Problema de rede. Tente `npm cache clean --force` e rode de novo, ou use outra rede. |
| Texto vazio ou "Áudio muito curto" | Grave por pelo menos 1 segundo e verifique o volume do microfone. |
