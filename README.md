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
In the previous tutorial, we learned about how to use environment and depends_on attributes while defining a service. In this tutorial, we use that knowledge to introduce a new service **mongo** which uses a 3rd party image from the official DockerHub repository instead of relying on a local Dockerfile. Take a look at the following code snippet below:

```
  mongo:
    image: mongo:latest
    environment:
      # - MONGO_INITDB_ROOT_USERNAME=root
      # - MONGO_INITDB_ROOT_PASSWORD=rootpassword
      - MONGO_INITDB_DATABASE=db
    expose:
      - 5000
    networks:
      - network
```

## Steps
1. Fire up the system using `docker-compose up` or `docker-compose up -d` to run the system in detached mode.
2. Tab over to PostMan and try accessing the GET `/posts/` endpoint. You should get the following output:
![image](https://user-images.githubusercontent.com/7733516/151725182-196c1c10-a0a9-415e-9c76-8a4b33a1fb35.png)
3. Now, try adding a new post by selecting POST from the dropdown and defining the correct payload. You should get the following output:
![image](https://user-images.githubusercontent.com/7733516/151725336-bf893511-9afb-4efe-909f-5c439286866c.png)
4. Now try grabbing the list of posts once more:
![image](https://user-images.githubusercontent.com/7733516/151725411-2f6fd61a-d7e3-40e0-b5a3-6f75c17789ac.png)
You'll see your newly added post with an empty comments list. That's because no comments for this post have been added yet. Let's add a new comment now.
5. Set the method to POST and type `http://localhost:5000/comments/` in the url bar in POSTMAN. Define the payload for the comment in the body and pass in an invalid ID on purpose:
![image](https://user-images.githubusercontent.com/7733516/151725570-0187a2ae-0cb6-48c0-bee0-6fb47f2d8694.png)
Our **reverserproxy** service returns 500 status code because it in turn receives 404 from our comments service. Since we don't have any post with the id 3, our comment service throws 404. It interally communicates with our **posts** service through the private endpoint `/posts/:id` and pieces it together that no such post exists. Let's look at the logs. Tab over to your terminal window and type `docker-compose logs posts`:
![image](https://user-images.githubusercontent.com/7733516/151725941-a8d78ab0-3150-4fcb-8d8b-7b473cd87102.png)

6. Now let's add a new comment for the post which we just created:
![image](https://user-images.githubusercontent.com/7733516/151725769-2e8f65a5-5c25-479d-af18-bde9f9b04854.png)
You should get a 200 status code back and should be able to view your newly added comment in the output.
7. Let's try to get all the posts again:
![image](https://user-images.githubusercontent.com/7733516/151725815-c55457f6-7f7f-406b-a381-dcff7aff381f.png)
You should be able to see your post along with its newly added comment. But wait. How did our **posts** service know that there's a new comment on this post? Let's look at the logs for our **comments** service. Tab over to your terminal window and type `docker-compose logs comments`:
![image](https://user-images.githubusercontent.com/7733516/151725978-390b0fc3-3511-4e4a-8396-b5243b9100c8.png)
Below the verbose 404 stack trace from when we accessed the `/posts/` endpoint when there were no comments for the post, you will see the log message saying that there's been an incoming request to this private endpoint.

## Conclusion
After doing this tutorial, one should have a strong understanding of reverse proxies and its applications. One should be able to use the npm fast-gateway package to create their own reverse proxy and selectively allow access to different API endpoints.

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


