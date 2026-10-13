# Whispernodetest

Projeto simples que grava a voz do microfone e a transforma em texto (STT) usando o Whisper rodando localmente com Node.js.

## Requisitos

- **Node.js** 20 ou superior (testado com v24)
- **ffmpeg** instalado e disponível no PATH (usado para gravar o microfone)
  - Confira com: `ffmpeg -version`
- Windows (a gravação usa o `dshow` do ffmpeg)
- Internet apenas na primeira execução, para baixar o modelo (~150 MB)

## Instalação

```
npm install
```

## Configurar o microfone

Liste os microfones disponíveis:

```
ffmpeg -list_devices true -f dshow -i dummy
```

Copie o nome que aparece com `(audio)` e coloque na constante `MIC` no início do [index.js](index.js):

```js
const MIC = 'Microfone (2- Redragon Gaming Headset)';
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
| Erro de dispositivo / nada é gravado | Confira o nome em `MIC` com o comando de listagem acima. |
| `ffmpeg` não encontrado | Instale o ffmpeg e adicione a pasta `bin` ao PATH. |
| Texto vazio ou "Áudio muito curto" | Grave por pelo menos 1 segundo e verifique o volume do microfone. |
