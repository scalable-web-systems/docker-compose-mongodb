const cors = require('cors')
const express = require("express")
const { MongoClient, ObjectId } = require('mongodb')
const axios = require("axios").default

const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.port || 5000
const commentsCollectionName = `comments`

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

app.get('/', async (req, res) => {
    try {
        const connection = await connectToDatabase()
        if (!connection) {
            throw new Error("Unable to connect to database.")
        }

        const collection = connection.collection(commentsCollectionName)
        let comments = await collection
            .find({})
            .toArray()

        return res.status(200).json(comments)
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({"error": error.message})
    }
})

app.post('/', async (req, res) => {
    const payload = req.body
    const { postId, message } = payload
    try {
        if (postId == null || message == null) {
            throw new Error("Incorrect payload")
        }
        const postServiceName = process.env.POSTS
        if (!postServiceName) {
            return res.status(400).json({"msg": "Environment variable for posts service name not set!"})
        }
        const fetchPostRequest = await axios.get(`http://${postServiceName}:${port}/${postId}`)
        const post = await fetchPostRequest.data
        if (!post) {
            return res.status(400).json({"msg": `Post with ID #${postId} not found!`})
        }

        const connection = await connectToDatabase()
        if (!connection) {
            throw new Error("Unable to connect to database.")
        }

        const collection = connection.collection(commentsCollectionName)
        const comment = await collection.insertOne(payload)
        return res.status(201).json(comment)
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({error: error.message})
    }
})

app.get('/:id', async (req, res) => {
    try {
        const postId = req.params['id']
        console.log(`Incoming request to return comments associated with post ID #${postId}`)
        const connection = await connectToDatabase()
        if (!connection) {
            throw new Error("Unable to connect to database.")
        }

        const collection = connection.collection(commentsCollectionName)
        const comments = await collection.find({postId: postId}).toArray()
        return res.status(200).json(comments)
    }
    catch(error) {
        console.error(error)
        return res.status(500).json({"error": error.message})
    }
})

/*
    * OVER ENGINEERED HERE, DELETE ENDPOINT NOT NECESSARY FOR THE GATEWAY TUTORIAL
*/
// app.delete('/:postId', (req, res) => {
//     try {
//         const postId = parseInt(req.params['postId'])
//         console.log(`Incoming request to delete comments associated with post ID # ${postId}`)
//         const filteredComments = comments
//             .filter(c => c.postId === postId)
//         filteredComments
//             .forEach(
//                 fc => comments.splice(
//                     comments.indexOf(comments.find(c => c.id === fc.id)),
//                     1,
//                 )
//             )
//         return res.status(200).json({
//             "msg": `All comments associated with the post #${postId} have been deleted`, 
//             "data": comments
//         })
//     }
//     catch(error) {
//         console.error(error)
//         return res.status(500).json({error: error.message})
//     }
// })

app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`)
})