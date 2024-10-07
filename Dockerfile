# --------------------------------
# Build Layer
# --------------------------------
FROM node:18.20.4 AS build
COPY . /service
WORKDIR /service
ENV NODE_ENV=production \
  PORT=8080
EXPOSE 8080
CMD ["./start.sh"]
