const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const simpleGit = require('simple-git');
const Docker = require('dockerode');
const fs = require('fs-extra');
const path = require('path');
const tar = require('tar-fs');


const REPO_URL = 'https://github.com/ashrafali-v/simple-express-app.git'; // Replace with your GitHub repo URL
const IMAGE_NAME = 'my-node-app-ash';
const TARGET_DIR = path.resolve(__dirname, '..', '..','..','docker-cloned-project');

const git = simpleGit();
const docker = new Docker();
const serviceUrl = 'http://localhost:3005'

const createContainer = async(githubRepoUrl) => {
  console.log(githubRepoUrl);
  const CONTAINER_NAME = 'my-test-app44';
  //const REPO_URL = githubRepoUrl;
  console.log(REPO_URL);

    try {
      await git.clone(REPO_URL,TARGET_DIR);
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
      function buildImage(imageName, dockerfilePath, contextPath) {
        return new Promise((resolve, reject) => {
          //const tarStream = fs.createReadStream(contextPath);
          console.log(process.cwd());
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
      console.log('Building Docker image...');
      const tarStream = tar.pack(TARGET_DIR);
      await buildImage(IMAGE_NAME, 'Dockerfile', TARGET_DIR);
      console.log('Docker image built successfully');

      // Run Docker container
      const portMapping = { '3009/tcp': [{ HostPort: '3002' }] }; // Map container port 80 to host port 8080
      console.log('Starting Docker container...');
      const container = await runContainer(IMAGE_NAME, CONTAINER_NAME, portMapping);
      console.log('Docker container started:', container.id);
      return { CONTAINER_NAME, serviceUrl };

    } catch (err) {
      console.error('Error:', err);
    }
};

module.exports = { createContainer };
