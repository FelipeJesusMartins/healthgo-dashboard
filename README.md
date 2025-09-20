# HealthGo

Teste técnico

## 🚀 Como Rodar o Projeto

Este projeto utiliza **Docker** e **Docker Compose** para gerenciar o ambiente de desenvolvimento, garantindo que ele rode de forma consistente em qualquer máquina.

### Pré-requisitos

Certifique-se de que você tem o Docker e o Docker Compose instalados em sua máquina.

  * [**Instalar Docker**](https://docs.docker.com/get-docker/)
  * [**Instalar Docker Compose**](https://docs.docker.com/compose/install/)

### Passo a Passo

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/FelipeJesusMartins/healthgo-dashboard
    cd healthgo-dashboard
    ```

2.  **Suba a aplicação com Docker Compose:**
    Este comando irá construir as imagens do Docker para o frontend e o backend, e iniciar os dois contêineres.

    ```bash
    docker-compose up --build
    ```

    (Se encontrar problemas e precisar de uma reconstrução forçada, use `docker-compose up --build --force-recreate`).

3.  **Acesse a aplicação:**

      * **Frontend (Angular):** Abra seu navegador e acesse `http://localhost:4200`.
      * **Backend (FastAPI):** A API estará disponível em `http://localhost:8000`.

## 📁 Estrutura do Projeto

A estrutura de pastas está organizada para separar o frontend do backend, com um arquivo `docker-compose.yml` na raiz para orquestração.

```
.
├── backend/                  # Servidor Python/FastAPI
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # Aplicação Angular
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── .gitignore
├── docker-compose.yml
└── README.md
```

## 🛠️ Detalhes Técnicos

  * **Frontend:** Uma aplicação Angular compilada e servida por um servidor web Nginx em um contêiner Docker. O Nginx está configurado para encaminhar requisições da rota `/api` para o backend.
  * **Backend:** Uma API RESTful construída com FastAPI, rodando em um servidor Uvicorn dentro de um contêiner Python.
  * **Orquestração:** O `docker-compose.yml` define os serviços, mapeia as portas (`4200:80` para o frontend e `8000:8000` para o backend) e gerencia a comunicação entre eles.

## 🪲 Solução de Problemas Comuns

  * **Aparece a página "Welcome to nginx\!"**: Isso significa que a configuração do Nginx não foi carregada. Tente rodar `docker-compose up --build --force-recreate` para garantir que o contêiner do frontend seja reconstruído com a configuração correta.
  * **Erro `404 Not Found` ao fazer upload**: Verifique se a sua rota `/api/upload-csv/` está correta no `app.py` do backend. Lembre-se que o backend é case-sensitive.
  * **`Property 'files' does not exist`**: Este erro de compilação do Angular indica que o código `dashboard.html` não está sincronizado com o `dashboard.ts`. Certifique-se de que a sua tag `<option>` no HTML itera sobre a propriedade `patients` e não sobre `files`.