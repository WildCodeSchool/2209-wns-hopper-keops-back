# Environnement
FROM node:alpine

# Fichiers/Dossiers nécéssaires pour mon application
# Si le dossier n'existe pas il sera créé
WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm i

COPY src src
COPY tsconfig.json tsconfig.json

CMD npm start