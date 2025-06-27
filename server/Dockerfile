FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# This command now runs inside the container, compiling bcrypt for the correct architecture
RUN npm install

# Bundle app source
COPY . .

# Expose port and start app
EXPOSE 8080
CMD [ "npm", "start" ]