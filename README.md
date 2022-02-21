# Tutorial on Docker Compose 3 | Mongo DB
> **Author -** Ishaan Khurana, [LinkedIn](https://www.linkedin.com/in/ishaan-khurana-46968679/)

## Objective
This tutorial is the third tutorial in the docker-compose series and focuses on persisting data using a database service. In this tutorial, we will use MongoDB for data storage. We'll be learning about how to use bind mounts in docker compose and how to use the **mongodb** npm library and its APIs in our node application to communicate with our Mongo database.

## Prerequisites
##### Side note: There are links attached to the bottom of this tutorial for our readers who may not be familiar with the technologies used here.
1. The reader should have completed the [first](https://github.com/scalable-web-systems/docker-compose-node) and [second](https://github.com/scalable-web-systems/docker-compose-gateway) tutorial of this series. 
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
      - 27017
    networks:
      - network
```

So it's very similiar to how we have defined other services in the preivous tutorials. We expose port 27017 but don't make it known to the outside world. We set a configuration environment variable called **MONGO_INITDB_DATABASE** to **db**. This will be our database name. We attach this service to our network **network**. Note how inside of defining the `build` section, we just set the `image` property to **mongo:latest**. This pulls the latest version of the image named **mongo** from Docker Hub. One major difference between this service and our other services is that we define a new section here called **volumes**. Putting very succintly, we're simply telling docker compose to overwrite the contents of `/data/db` subdirectory of our **mongo** service container with the contents of the subdirectory `/data` on our local machine. `/data/db` is the place where MongoDB stores our data. By overwriting its contents, we make sure that the data is persisted even when we shut down our services.

### src/posts/index.js (or src/comments/index.js)

We'll be working with 2 exported members of the **mongodb** package. The import statement looks like:
`const { MongoClient, ObjectId } = require('mongodb')`

Let's inspect a little utility function that connects to our Mongo database and returns the connection object which we will use throughout our API to communicate with the database.

```
const connectToDatabase = async () => {
    try {
        const dbConnectionString = process.env.DBCONNECTIONSTRING
        const dbName = process.env.DBNAME
        if (!dbConnectionString || !dbName)
            throw new Error("Environment variable for db connection string or db name not defined.")
        
        const url = `mongodb://${dbConnectionString}/${dbName}`
        const client = new MongoClient(url)
        await client.connect()
        console.log('connected!')
        return client.db(dbName)
    }
    catch(error) {
        console.error(error.message)
        return undefined
    }
}
```
We start off with a few sanity checks to make sure that all the configuration environment variables are set properly. Then we instantiate a new object of type **MongoClient**. and pass in our connection string as the argument. Next, we attempt to connect to our database by invoking the connect method on our **MongoClient** object. We perform this connection inside of a try block. So if the connection fails, we log the error message and return undefined. Otherwise, we log a success message ('connected') and return the database object (of type **Db**). Note that `client.connect()` creates a pool of connections and not is __NOT__ a singleton object. So it should be defined once and should be used throughout the code.

Next, we define a method called **runServer**. Here we invoked our **connectToDatabase** method and store the resulting database object in a variable called **connection**. We then define our routes and use this **connection** variable to communicate with the database. Note that all of this code is executed in a try block. This means that if the connection to database fails, the line `app.listen ....` won't be executed and hence the server won't start.

Now let' look at a few function calls interspersed between the code:

* `connection.collection(collectionName: string)` - A **Collection** object is defined by invoking the `collection` method on the database object. The collection name needs to be passed in as a string.
* `collection.find({... search parameters})` - The **find** method is used to query a MongoDB collection. Search parameters are passed in as an object. For example, if we want to look up a post with title **UMass Amherst**, we'd write:
```
const collection = connection.collection("posts")
collection.find({title: "UMass Amherst"})
```

`.find` doesn't directly return an array of results. Instead it returns an iterable object called **WithCursor** that can be used to apply even more filters. To 
convert the results into an array, we say `.toArray()` on the iterable returned by `.find`. So the entire code snippet would look like:

```
const collection = connection.collection("posts")
const results = collection
  .find({title: "UMass Amherst"})
  .toArray()
```

* `collection.findOne({... search parameters})` - It's quite intuitive. It returns the first object that matches the provided parameters.
* `collection.insertOne` - Inserts a new record into the collection. Note that a MongoDB adds an **\_id** property to all newly inserted records. If you wanna look up for records and filter by their **\_id** property, you need to convert the hexadecimal 26 characters string into an **ObjectId**. The entire operation would like:

```
const collection = connection.collection("posts")
const results = collection
  .find({_id: new ObjectId("26 characters hexadecimal string")})
  .toArray()
```

Conversely, to convert an **ObjectId** to a hexadecimal string, we do `ObjectId.toHexString()`, as on line 54 of `src/posts/index.js`:

```
const comments = await (await axios.get(`http://${commentServiceName}:${port}/${post._id.toHexString()}`)).data
```


## Steps

**IMPORTANT:** Create a new folder called **data** in the root directory of the cloned repository before performing the steps.

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


