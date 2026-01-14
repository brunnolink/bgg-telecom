# Sistema de Gerenciamento de Tickets

Projeto fullstack para gerenciamento de chamados de suporte.

## Estrutura
- `server/` → API REST (Node.js, Express, Prisma, PostgreSQL)
- `client/` → Interface Web (ReactJS, tailwind)

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
No frontend (client/), crie um arquivo .env e coloque a url do backend.
Na raiz do projeto, crie o .env com as credenciais do PostgreSQL que serão usadas pelo Docker.
Dentro da pasta server, crie outro .env com a DATABASE_URL, a porta da API e a JWT_SECRET.

Com os ambientes configurados, suba o banco de dados usando Docker Compose a partir da raiz do projeto. Isso irá criar o container do PostgreSQL e o banco automaticamente.

Em seguida, entre na pasta server, instale as dependências e execute as migrations do Prisma para criar as tabelas no banco. Depois disso, inicie o backend.

Com o backend rodando, abra outro terminal, vá até a pasta client, instale as dependências e inicie o frontend.

Todas as credenciais estão abaixo, inclusive com mais uma demonstração de seguimento do que fazer.

## Como rodar

### Frontend (`client/.env`)
```env: VITE_API_URL=http://localhost:3000 ```
### Backend (`bgg-telecom/.env`)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=bggtelecom

### Docker (`bgg-telecom/docker-compose.yml´)
version: "3.8"
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

### Subir o banco = docker compose up -d

### Backend 
cd server
npm install
npx prisma migrate dev
subir o servidor = npm run dev

### Frontend
cd client
npm install
npm run dev

### script util 
npx prisma studio
