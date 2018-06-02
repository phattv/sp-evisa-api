FROM node:alpine

# Create app directory
RUN mkdir -p usr/src/evisa-api
WORKDIR usr/src/evisa-api

# Install app dependencies
COPY package.json /usr/src/evisa-api
COPY yarn.lock /usr/src/evisa-api
RUN yarn install --production

# Bundle app source
COPY . /usr/src/evisa-api

CMD [ "yarn", "start:prod" ]
