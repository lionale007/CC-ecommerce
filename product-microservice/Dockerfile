# Use the official Node.js base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app/product-microservice

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

RUN npm install -g nodemon

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the microservice will run on
EXPOSE 8080

# Start the microservice
CMD ["nodemon"]
#CMD echo "hello"
