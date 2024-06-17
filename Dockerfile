FROM node:20-slim

ENV DEBIAN_FRONTEND noninteractive
RUN  apt-get -y update && apt-get -y install --no-install-recommends \
  build-essential git \
  telnet iputils-ping procps curl jq \
  python3 \
  && apt-get clean && rm -Rf /usr/share/doc
RUN npm -g install pnpm && SHELL=/bin/bash pnpm setup

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
# COPY package*.json ./
# Bundle app source
COPY . .

# Install app dependencies
RUN pnpm install


# Creates a "dist" folder with the production build
RUN npm run build

EXPOSE 3000
#EXPOSE 2567
# Start the server using the production build
CMD [ "node", "dist/main.js" ]
