# 🦙 Ollama API Server
[![Docker](https://img.shields.io/docker/v/gitmotion/ollama-api-server?logo=docker&label=Docker)](https://hub.docker.com/r/gitmotion/ollama-api-server)


A simple, easy-to-use api server that sits in front of your local ollama instance to add additional security when making requests to ollama.

<a href="https://www.buymeacoffee.com/gitmotion" target="_blank" rel="noopener noreferrer">
  <img src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png" alt="Buy me a coffee" width="150px" />
</a>

## 📑 Table of Contents
- [⭐ Features](#-features)
- [🎛️ Example Flow](#-example-flow)
- [🚀 Quick Start](#-quick-start)
  - [🐳 Docker Setup (Recommended)](#-docker-setup-recommended)
  - [📂 Docker Image](#-docker-image)
  - [🚀 Docker Run](#-docker-run)
  - [📄 Docker Compose Configuration](#-docker-compose-configuration)
  - [💻 Local Setup](#-local-setup)
- [⚙️ Configuration](#-configuration)
- [🔌 API Endpoints](#-api-endpoints)
- [🔐 Authentication](#-authentication)

## ⭐ Features
- 🔑 API Key Authentication
- 🔄 CORS Support
- 🚀 Connection Pooling
- 🌊 Streaming Support
- 🐳 Easy Docker Setup
- 🔌 All Ollama API Endpoints Supported

## 🎛️ Example Flow
- Example of connecting a local ollama instance to an open-webui docker container on the same docker network

<div align="center">
  <img src="https://github.com/user-attachments/assets/2840746e-9ea0-4f92-bcee-39115c5990ab" width=50% />
</div>

```mermaid
flowchart TD
    user([External User]) --> webui[Open WebUI]
    
    webui -->|Request with API Key| api[Ollama API Server]
    
    api --> auth{API Key Valid?}
    auth -->|No| reject[Reject Connection]
    auth -->|Yes| ollama[Ollama LLM Service]
    
    ollama -->|Response| api
    api -->|Response| webui
    webui -->|Response| user
    
    subgraph "Docker: ollama-network"
        webui
        api
        auth
        ollama
    end
    
    classDef green fill:#d1e7dd,stroke:#0f5132,stroke-width:1px,color:#0f5132;
    classDef blue fill:#cfe2ff,stroke:#084298,stroke-width:1px,color:#084298;
    classDef red fill:#f8d7da,stroke:#842029,stroke-width:1px,color:#842029;
    classDef yellow fill:#fff3cd,stroke:#664d03,stroke-width:1px,color:#664d03;
    classDef gray fill:#f8f9fa,stroke:#343a40,stroke-width:1px,color:#343a40;
    
    class user gray
    class webui blue
    class api blue
    class auth yellow
    class ollama green
    class reject red
```

## 🚀 Quick Start

### 🐳 Docker Setup (Recommended)

### 📂 Docker Image

The official Docker image is available on Docker Hub and GitHub Container Registry:

```bash
# Docker Hub
docker pull gitmotion/ollama-api-server:latest

# GitHub Container Registry
docker pull ghcr.io/gitmotion/ollama-api-server:latest
```

### 🚀 Docker Run

```bash
docker run -d \
  --name ollama-api-server \
  --restart unless-stopped \
  -p 7777:7777 \
  -e PORT=7777 \
  -e OLLAMA_BASE_URL=http://internal-ip-where-ollama-installed:11434 \
  -e CORS_ORIGIN=* \
  -e API_KEYS=default-key-1,default-key-2 \
  gitmotion/ollama-api-server:latest
```

### 📄 Docker Compose Configuration

The server uses the following `docker-compose.yml` configuration:

```yaml
services:
  api:
    image: gitmotion/ollama-api-server:latest
    container_name: ollama-api-server
    restart: unless-stopped
    ports:
      - "${PORT_EXTERNAL:-7777}:7777"
    environment:
      - PORT=7777
      - OLLAMA_BASE_URL=http://internal-ip-where-ollama-installed:11434 # must serve your ollama server with 0.0.0.0
      - CORS_ORIGIN=*
      - API_KEYS=${API_KEYS:-default-key-1,default-key-2}
```

#### Example of ollama-api-server with your open-webui stack:
```yaml
services:
  ollama-api-server:
    image: gitmotion/ollama-api-server:latest
    container_name: ollama-api-server
    restart: unless-stopped
    ports:
      - "${PORT_EXTERNAL:-7777}:7777"
    environment:
      - PORT=7777
      - OLLAMA_BASE_URL=http://internal-ip-where-ollama-installed:11434 # must serve your ollama server with 0.0.0.0
      - CORS_ORIGIN=*
      - API_KEYS=${API_KEYS:-secure-api-key-1,secure-api-key-2} # UPDATE THESE KEYS - comma separated
    networks:
      - ollama-network

  open-webui:
    image: openwebui/open-webui:latest
    container_name: open-webui
    restart: unless-stopped
    depends_on:
      - ollama-api-server
    ports:
      - "3000:3000"
    environment:
      - OLLAMA_BASE_URL=http://ollama-api-server:7777 # Configure the api key via UI
      - WEBUI_SECRET_KEY=${WEBUI_SECRET_KEY}
    volumes:
      - ./open-webui-data:/app/backend/data
    networks:
      - ollama-network
      - your-external-reverse-proxy

networks:
  ollama-network:
    driver: bridge
  your-external-reverse-proxy:
    external: true
```

This configuration:
- Uses the official Docker image
- Maps the container's port 7777 to your host's port (configurable via PORT_EXTERNAL)
- Sets up the required environment variables
- Provides default API keys if none are specified

You can customize the configuration by:
1. Changing the external port (PORT_EXTERNAL in .env)
2. Setting your API keys (API_KEYS in .env)
3. Modifying the Ollama base URL if needed
4. Adjusting CORS settings for your environment

### 💻 Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/gitmotion/ollama-api-server.git
   cd ollama-api-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create and configure .env file:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. Build and start the server:
   ```bash
   npm run build
   npm start
   ```

## ⚙️ Configuration

The server can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 7777 |
| OLLAMA_BASE_URL | URL of your Ollama instance | http://localhost:11434 |
| CORS_ORIGIN | CORS origin setting | * |
| API_KEYS | Comma-separated list of valid API keys | default-key-1,default-key-2 |

## 🔌 API Endpoints

All Ollama API endpoints are supported with authentication:

- `POST /api/chat` - Chat completion
- `POST /api/generate` - Text generation
- `POST /api/embeddings` - Generate embeddings
- `GET /api/tags` - List available models
- `POST /api/show` - Show model details
- `POST /api/pull` - Pull a model
- `DELETE /api/delete` - Delete a model
- `POST /api/copy` - Copy a model
- `GET /api/version` - Get Ollama version
- `GET /health` - Health check endpoint

## 🔐 Authentication

Include your API key in requests using one of these methods:

1. X-API-Key header:
   ```bash
   curl -H "x-api-key: your-api-key" http://localhost:7777/api/tags
   ```

2. Authorization header:
   ```bash
   curl -H "Authorization: Bearer your-api-key" http://localhost:7777/api/tags
   ```

3. Request body:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
        -d '{"apiKey": "your-api-key"}' \
        http://localhost:7777/api/tags
   ```
___

Made with ❤️ by [gitmotion](https://github.com/gitmotion)