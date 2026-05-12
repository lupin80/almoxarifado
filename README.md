# Vault Inventory

Sistema de controle de estoque com frontend em React/Vite e backend em Express + SQLite.

## Stack

- Node.js 20+ recomendado
- npm
- React 18
- Vite 6
- Express 4
- SQLite via `better-sqlite3`

## Estrutura

- `src/`: frontend React
- `server.js`: API HTTP local
- `src/components/database.js`: inicialização do banco SQLite
- `src/controllers/ProductController.js`: controller de produtos com docstrings JSDoc
- `uploads/`: imagens enviadas pela aplicação

## Pré-requisitos

1. Instale o Node.js.
2. Verifique se a porta `3000` está livre para o backend.
3. Verifique se a porta `5173` está livre para o frontend em modo dev.

## Instalação

```bash
npm install
```

## Execução em desenvolvimento

Inicia backend e frontend juntos:

```bash
npm run dev
```

URLs padrão:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Execução separada

Backend:

```bash
npm run dev:server
```

Frontend:

```bash
npm run dev:client
```

## Build de produção

```bash
npm run build
```

Para subir apenas o backend:

```bash
npm start
```

## Validação

Checagem de tipos:

```bash
npx tsc --noEmit
```

Build do frontend:

```bash
npm run build
```

Observação:

- O script `npm run lint` depende de configuração do ESLint, que hoje não está presente no repositório.

## Banco de dados e uploads

- O banco local é inicializado automaticamente pelo backend.
- As imagens enviadas ficam na pasta `uploads/`.
- A aplicação usa SQLite local; mantenha permissão de escrita no diretório do projeto.

## Autenticação padrão

Ao iniciar o backend, o sistema garante um usuário administrador padrão:

- Email: `admin@vault.com`
- Senha: `admin123`

## Observações importantes

- O frontend está configurado para consumir a API em `http://localhost:3000`.
- Se você alterar host ou porta da API, ajuste as chamadas `fetch` do frontend.
- Se adicionar endpoints de produto, concentre a lógica no `ProductController`.
