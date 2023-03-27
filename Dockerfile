# FROM postgres

# COPY seed.sql /docker-entrypoint-initdb.d/

# ENV POSTGRES_USER=fatbo
# ENV POSTGRES_PASSWORD=mysecretpassword
# ENV POSTGRES_DB=link
# ENV DATABASE_URL=postgres://fatbo:mysecretpassword@172.17.0.2:5432/link

# EXPOSE 5432



# ENV DATABASE_URL=postgresql://postgres:5tOQp55MM6CRY4zSzuny@containers-us-west-77.railway.app:6267/railway

# ENV REDIS_URL=redis://default:1nQuv6n3dznYazXcT7ZS@containers-us-west-86.railway
FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]

