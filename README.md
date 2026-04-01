# Levity

<p align="center">
  <img src="levity_logo.png" alt="Levity Logo" width="150" />
</p>

<p align="center">
  <strong>Aplicação corporativa de Workspace Kanban estruturada sobre Next.js 15+</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.0+-000000?logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Platform-Web-brightgreen" alt="Platform" />
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License" />
</p>

---

## Descrição

Levity é um Kanban Workspace avançado construído com Next.js, focado em alta performance, interações em tempo real e experiência de usuário imersiva. A aplicação implementa um pipeline completo de edições ricas, colaboração de equipes em massa e armazenamento em nuvem escalável, removendo atrasos no lado do cliente em favor da moderna arquitetura de Next.js Server Actions.

---

## Funcionalidades

### Edição e Colaboração Avançada

* Interface de edição Rich Text (TipTap) perfeitamente integrada, com compatibilidade de saída Markdown
* Suporte nativo a Drag and Drop ou Copy/Paste de imagens com upload e renderização automática
* Componentes de renderização Markdown flexíveis para os campos de preview (React Markdown)
* Menções interativas diretamente no texto (`@username`) com painéis de autocompletar flutuantes
* Integração de sistema dinâmico de emojis (`emoji-picker-react`)

### Organização e Interações UI

* Paginação otimizada sequencial por cursor (Timestamp), controlando massivos históricos de comentários sem lentidão
* Threads de conversas aninhadas e expansíveis, permitindo moderação de discussões diretas em cada etapa do Card
* Skeleton loaders escuros (graphite UI) e progressão de estado assíncrono perfeitamente ancorados no recurso `Suspense` nativo
* Animações ricas fluidas elaboradas nativamente com Framer Motion

### Armazenamento de Assets e Arquivos

* Integração nativa robusta (`@backblaze/b2`) com o Backblaze B2, removendo layers desnecessárias S3
* Proxy interno (`/app/file/...`) desenvolvido via API do próprio Next.js, permitindo proteger os tokens de acesso nas imagens mesmo rodando sobre buckets privados
* Compilação avançada de Buffer de arquivos redimensionáveis usando pipeline server-side (`Sharp`)

---

## Tecnologias

| Categoria     | Tecnologia                        |
| ------------- | --------------------------------- |
| Framework     | Next.js 15+ (App Router)          |
| Linguagem     | TypeScript 5.0+                   |
| Engine UI     | React 19                          |
| Estilização   | Tailwind CSS v4 + Framer Motion   |
| Componentes   | TipTap + React Markdown           |
| Back-end      | Supabase (Auth + PostgreSQL)      |
| Armazenamento | Backblaze B2 API + Sharp          |

---

## Arquitetura

O projeto segue uma estrutura moderna do App Router focada na orquestração entre Client Side Components (`use client`) e blindagem de lógicas em Server Actions:

```
src/
├── actions/        # Comandos executados no backend seguro (Serviços e Regras de Negócio)
├── app/            # Estrutura principal de Roteamento, Rotas Proxy e Loader UI
├── components/     # Módulos Modais, RichTextEditor e Elementos de Interação
├── interfaces/     # Contratos TypeScript definitivos de Storage e Modelos de Dado
└── lib/            # Provedores de Acesso Restrito (BackblazeProvider, DB Client)
```

---

## Execução

### Pré-requisitos

* Ambiente Node.js configurado (>= 18.x)
* Chaves Supabase disponíveis com Auth ativado
* Chaves e Bucket Privado originado no respectivo portal do Backblaze B2

### Setup

```bash
git clone https://github.com/Boyce22/levity.git
cd levity

npm install
```

Defina com assertividade o painel `.env` na raiz do escopo:

```shell
SUPABASE_URL=<<sua_url>>
SUPABASE_SERVICE_KEY=<<sua_secret_key>>

BACKBLAZE_KEY_ID=<<seu_key_id>>
BACKBLAZE_APP_KEY=<<sua_app_key>>
BACKBLAZE_BUCKET_ID=<<seu_bucket_id>>
BACKBLAZE_BUCKET_NAME=<<seu_bucket_name>>
```

### Build e Início da Produção

```bash
npm run build
npm start
```

Ou simplesmente teste/visualize rapidamente montando o ambiente de desenvolvimento local:

```bash
npm run dev
```