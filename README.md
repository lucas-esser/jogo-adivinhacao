# Jogo de Adivinhação

Aplicativo mobile Expo/React Native inspirado na estrutura do app de filmes: Expo Router, telas em `src/app`, componentes React Native e Firebase. O jogador informa um nickname, tenta descobrir o número sorteado entre 1 e 100 e vê o ranking das partidas com menos tentativas.

## Ambiente

- Node.js 18 ou superior
- npm
- JDK 17
- Android Studio com Android SDK Platform 34 e um emulador configurado
- Expo SDK 50 / React Native 0.73

O Expo SDK 50 foi escolhido porque sua configuração Android usa API 34 e JDK 17. O Expo CLI exige Node 18 ou superior.

## Executar

```bash
npm install
npm run android
```

`npm run android` usa `expo run:android` e prepara o projeto Android nativo quando necessário. Para iniciar apenas o servidor Expo, use `npm start`.

## Firebase Firestore

O app grava cada vitória na coleção `results` do projeto Firebase configurado em `firebaseConfig.ts`. Cada documento contém `nickname`, `attempts` e `createdAt` (timestamp em milissegundos). O ranking consulta os 100 melhores resultados, ordenados pelo menor número de tentativas.

No Firebase Console, abra **Firestore Database > Regras** e configure leitura pública e criação de resultados sem permitir edição ou exclusão:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /results/{resultId} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasOnly(['nickname', 'attempts', 'createdAt'])
        && request.resource.data.nickname is string
        && request.resource.data.nickname.size() > 0
        && request.resource.data.nickname.size() <= 18
        && request.resource.data.attempts is int
        && request.resource.data.attempts >= 1
        && request.resource.data.createdAt is int;
      allow update, delete: if false;
    }
  }
}
```

Essas regras deixam o ranking público e permitem envios sem autenticação. Para produção, proteja o banco com autenticação e controles contra abuso.
