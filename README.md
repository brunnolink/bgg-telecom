# Sistema de Gerenciamento de Tickets

Projeto fullstack para gerenciamento de chamados de suporte.

## Estrutura para localizar onde criar os arquivos .env. Raiz do projeto (`bgg-telecom/`)
```text
bgg-telecom/
├── apps/app
│        ├── .env
│
├── /apps/server/
│        ├── .env
│
├── .env
├── README.md
```

- ## Tecnologias Utilizadas

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT (JSON Web Token)
- Docker

### Frontend
- React (Vite)
- TypeScript
- TailwindCSS
- Lucide Icons

---

Primeiro, clone o projeto e entre na pasta raiz.

Depois disso, configure os arquivos .env.

No frontend (bgg-telecom/apps/app), crie um arquivo .env as variáveis que verá na sessão de variáveis de ambientes, abaixo.

Na raiz do projeto, crie o .env com as credenciais do PostgreSQL que serão usadas pelo Docker.

Dentro da pasta (bgg-telecom/apps/server), crie outro .env com a DATABASE_URL, a porta da API e a JWT_SECRET e CORS_ORIGIN.

Com os ambientes configurados, suba o banco de dados usando Docker Compose a partir da raiz do projeto. Isso irá criar o container do PostgreSQL e o banco automaticamente.

Em seguida, entre na pasta bbg-telecom/apps/server, instale as dependências e execute as migrations do Prisma para criar as tabelas no banco. Depois disso, rode o servidor.

Com o backend rodando, abra outro terminal, vá até a pasta bbg-telecom/apps/app, instale as dependências e inicie o frontend.

Todas as credenciais estão abaixo, inclusive com mais uma demonstração de seguimento do que fazer.

## Como rodar e variáveis de ambientes:

### Frontend (`/apps/app/.env`)
```
env: VITE_API_URL=http://localhost:3000 
VITE_PORT=5173
```

### Backend (`apps/server/.env`)
```
env:DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bggtelecom
PORT=3000
JWT_SECRET=bggtelecom15
CORS_ORIGIN=http://localhost:5173
```

### Raiz (`bgg-telecom/.env`)
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=bggtelecom
``` 

### Docker (`bgg-telecom/docker-compose.yml´)
```version: "3.8"
services:
  db:
    image: postgres:15
    container_name: bggtelecom_db
    env_file:
      - .env
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

### Subir o banco 
```docker compose up -d``` 

### Backend 
```
Entrar na pasta = cd ./apps/server
instalar dependências = npm install
Rodar migration = npx prisma migrate dev
subir o servidor = npm run dev
``` 

### Frontend
```
Entrar na pasta = cd./apps/app
Instalar dependências = npm install
rodar = npm run dev
```
### script util 
```
npm run test:watch
npx prisma studio
```
