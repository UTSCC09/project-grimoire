FROM --platform=linux/amd64 node:lts-slim as build

RUN mkdir -p /app
WORKDIR /app
COPY ./backend /app
COPY ./.env /app
RUN npm install

FROM --platform=linux/amd64 node:lts-slim as main
WORKDIR /app
COPY --from=build /app /app
EXPOSE 4000
CMD ["npm","run","prod"]