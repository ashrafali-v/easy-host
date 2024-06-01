const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const simpleGit = require('simple-git');
const Docker = require('dockerode');
const fs = require('fs-extra');
const path = require('path');
const tar = require('tar-fs');

const git = simpleGit();
const docker = new Docker();

const createContainer = async(githubRepoUrl) => {
  const IMAGE_NAME = githubRepoUrl.split('/')[4].split('.')[0]
  const CONTAINER_NAME = `my-${IMAGE_NAME}`;
  const TARGET_DIR = path.resolve(__dirname, '..', '..', '..', IMAGE_NAME);

    try {
      await git.clone(githubRepoUrl,TARGET_DIR);
      process.chdir(TARGET_DIR);
      const dockerfileContent = `
        # Use an official Node.js runtime as a parent image
        FROM node:14

        # Set the working directory in the container
        WORKDIR /app

        # Copy the package.json and package-lock.json files
        COPY package*.json ./

        # Install any needed packages
        RUN npm install

        # Copy the rest of the application code
        COPY . .

        # Expose the port the app runs on
        EXPOSE 3009

        # Define the command to run the application
        CMD ["npm", "start"]
        `;
      await fs.writeFile('Dockerfile', dockerfileContent);
      console.log('Creating Dockerfile Success...');

      // Build Docker image from a Dockerfile
      function buildImage(imageName) {
        console.log('start build');
        return new Promise((resolve, reject) => {
          docker.buildImage(tarStream, { t: imageName },(error, stream) => {
            if (error) {
              reject(error);
              return;
            }
            // Log build output
            stream.pipe(process.stdout);

            stream.on('end', () => {
              resolve();
            });
          });
        });
      }

      // Run Docker container from an image
      function runContainer(imageName, containerName, portMapping) {
        return new Promise((resolve, reject) => {
          docker.createContainer({
            Image: imageName,
            name: containerName,
            HostConfig: {
              PortBindings: portMapping
            }
          }, (error, container) => {
            if (error) {
              reject(error);
              return;
            }

            container.start((error) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(container);
            });
          });
        });
      }

      // Build Docker image
      const tarStream = tar.pack(TARGET_DIR);
      await buildImage(IMAGE_NAME);

      // Run Docker container
      const RANDOM_PORT = (Math.floor(Math.random() * (11001 - 10000)) + 10000).toString();
      const portMapping = { '3009/tcp': [{ HostPort: RANDOM_PORT }] }; // Map container port 3009 to host port 3002
      const container = await runContainer(IMAGE_NAME, CONTAINER_NAME, portMapping);
      const serviceUrl = `http://localhost:${RANDOM_PORT}`
      return serviceUrl;

    } catch (err) {
      console.error('Error:', err);
    }
};

module.exports = { createContainer };
