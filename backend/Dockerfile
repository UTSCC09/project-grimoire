FROM node:18
 
WORKDIR /app
 
COPY package.json package.json
COPY package-lock.json package-lock.json
 
RUN npm install

COPY . .

EXPOSE 8000
EXPOSE 8080
 
CMD [ "npm", "run", "dev" ]