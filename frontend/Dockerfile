# Etapa 1: Build Angular
FROM node:20.19 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --prod

# Etapa 2: Servir com Nginx
FROM nginx:alpine

# Copia o build final do Angular
COPY --from=build /app/dist/healthgo-dashboard/browser /usr/share/nginx/html

# Copia o arquivo de configuração do Nginx para a pasta padrão de configuração
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]