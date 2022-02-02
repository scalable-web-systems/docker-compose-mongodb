const cors = require('cors')
const express = require("express")
const { MongoClient, ObjectId } = require('mongodb')
const axios = require('axios').default


const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.port || 5000
const postsCollection = `posts`

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

        const commentServiceName = process.env.COMMENTS
        if (!commentServiceName) {
            return res.status(400).json({"error": "Comments service name environment variable - COMMENTS not defined."})
        }

        const collection = connection.collection(postsCollection)
        let posts = await collection
            .find({})
            .toArray()
        
        posts = await Promise.all(posts
            .map(async (post) => {
                const comments = await (await axios.get(`http://${commentServiceName}:${port}/${post._id.toHexString()}`)).data
                return {
                    ...post,
                    comments
                }
            }))

        return res.status(200).json(posts)
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({"error": error.message})
    }
})

app.get('/:id', async (req, res) => {
    try {
        const _id = req.params['id']
        const oid = new ObjectId(_id)
        console.log(`Incoming request to find post with ID #${_id}`)

        const connection = await connectToDatabase()
        if (!connection) {
            throw new Error("Unable to connect to database.")
        }

        const collection = connection.collection(postsCollection)
        let post = await collection
            .findOne({_id: oid})
        
        console.log(post)
        return res.status(post ? 200 : 404).json(post)
    }
    catch (error) {
        return res.status(500).json({"error": error.message})
    }
})

app.post('/', async (req, res) => {
    const payload = req.body
    const { title, description } = payload
    try {
        if (title == null || description == null) {
            throw new Error("Incorrect payload")
        }

        const connection = await connectToDatabase()
        if (!connection) {
            throw new Error("Unable to connect to database.")
        }

        const collection = connection.collection(postsCollection)
        const post = await collection
            .insertOne(payload)

        return res.status(201).json(post)
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({error: error.message})
    }
})

/*
    * OVER ENGINEERED HERE, DELETE ENDPOINT NOT NECESSARY FOR THE GATEWAY TUTORIAL
*/
// app.delete('/:id', async (req, res) => {
//     try {
//         const id = parseInt(req.params['id'])
//         const post = posts.find(p => p.id === id)
//         if (!post) {
//             return res.status(404).json({"error": `Post with ID #${id} not found.`})
//         }
//         const commentServiceName = process.env.COMMENTS
//         if (!commentServiceName) {
//             return res.status(400).json({"error": "Comments service name environment variable - COMMENTS not defined."})
//         }
//         await axios.delete(`http://${commentServiceName}:${port}/${id}`)
//         posts
//             .splice(posts.indexOf(post), 1)
//         return res.status(200).json({
//             msg: `Post with ID #${id} successfully deleted`,
//             data: posts,
//         })
//     }
//     catch(error) {
//         return res.status(500).json({"error": error.message})
//     }
// })

app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`)
})