# Tutorial on Docker Compose 3 | Mongo DB

## Objective
This tutorial is the third tutorial in the docker-compose series and focuses on persisting data using a database service. In this tutorial, we will use MongoDB for data storage.
## Prerequisites
##### Side note: There are links attached to the bottom of this tutorial for our readers who may not be familiar with the technologies used here.
1. The reader should have completed the [first](https://github.com/scalable-web-systems/docker-compose-node) and [second](https://github.com/scalable-web-systems/docker-compose-gateway) of this series. 
2. The reader should be familiar with axios, asynchrous operations, promises, etc.
3. The reader should have PostMan installed on their machine. Alternatively, one can use CLI tools such as Curl, WGet etc. to make the API calls.
4. The reader should clone this repository to their local machine before moving on to the next section.

## Docker Container v/s Local Installation

* Setting up a database manually is more time consuming
* Harder to completely uninstall
* May cause compatibility issues

Most of the popular databases have their Docker image available on the Docker Hub Image Registry. It's a lot more straighforward and easier to fire up a MongoDB container, for example, than to waste time configuring a local installation. Sometimes, we inadvertently install softwares for all users even if we need it for just ourselves. Some softwares get so deeply embedded in our system that it becomes a herculean task to completely wipe out the installation, if required. Furthermore, sometimes our system may not be compatible with the version of the database we want to use. With Docker, we don't have to worry about neither the compatibility issues nor any uninstallation hassle. All it takes is one command to obliterate a running database container.

## Let's Look at the Code

### Docker Compose
In the previous tutorial, we learned about how to use environment and depends_on attributes while defining a service. In this tutorial, we use that knowledge to introduce a new service **mongo** which uses a 3rd party image from the official Docker Hub repository instead of relying on a local Dockerfile. Take a look at the following code snippet below:

```
  mongo:
    image: mongo:latest
    environment:
      - MONGO_INITDB_DATABASE=db
    volumes:
      - ./data:/data/db
    expose:
      - 5000
    networks:
      - network
```

So it's very similiar to how we have defined other services in the preivous tutorials. We expose port 5000 but don't make it known to the outside world. We set a configuration environment variable called **MONGO_INITDB_DATABASE** to **db**. This will be our database name. We attach this service to our network **network**. Note how inside of defining the `build` section, we just set the `image` property to **mongo:latest**. This pulls the latest version of the image named **mongo** from Docker Hub. One major difference between this service and our other services is that we define a new section here called **volumes**. Putting very succintly, we're simply telling docker compose to overwrite the contents of `/data/db` subdirectory of our **mongo** service container with the contents of the subdirectory `/data` on our local machine. `/data/db` is the place where MongoDB stores our data. By overwriting its contents, we make sure that the data is persisted even when we shut down our services.

## Steps

**IMPORTANT:** Create a new folder called **data** in the root directory of the repository before performing the steps.

Perform the same steps as outlined in [Tutorial 2](https://github.com/scalable-web-systems/docker-compose-gateway) of this series and you should achieve the same results. Try shutting down the services using `docker-compose down` and fire up the system again. Your data should persist.

## Conclusion
After doing this tutorial, one should be to use MongoDB as a docker-compose service. Additionally, one should be able to use the npm **mongodb** package in their node applications to communicate with the mongodb server. 

### Links
1. [Javascript Tutorial](https://www.w3schools.com/js/)
2. [Npm](https://www.npmjs.com/)
3. [NodeJS](https://nodejs.org/en/docs/)
4. [Express](https://expressjs.com/en/starter/hello-world.html)
5. [Docker](https://docs.docker.com/get-started/)
6. [Fast Gateway NPM Package](https://www.npmjs.com/package/fast-gateway)
7. [Promises, Async, Await - JS](https://javascript.info/async)
8. [Axios](https://github.com/axios/axios)
9. [MongoDB NPM package](https://www.npmjs.com/package/mongodb)


