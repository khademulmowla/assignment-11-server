const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const port = process.env.PORT || 3000
const app = express()
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iuytv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const db = client.db('art-db')
        const artCollection = db.collection('arts')
        const likedCollection = db.collection('likes')
        // save a art in db //
        app.post('/add-artifact', async (req, res) => {
            const artData = req.body;
            const result = await artCollection.insertOne(artData)
            res.send(result)
        })
        // get all art data //
        app.get('/artifacts', async (req, res) => {
            const result = await artCollection.find().toArray()
            res.send(result)
        })
        //get all artifact posted by a specific user
        app.get('/artifacts/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const result = await artCollection.find(query).toArray()
            res.send(result)

        })
        // get a single artifact data by id from db //
        app.get('/artifact/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await artCollection.findOne(query)
            res.send(result)
        })
        // delete a single artifact data by id from db //
        app.delete('/artifact/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await artCollection.deleteOne(query)
            res.send(result)
        })
        // update by put //
        app.put('/update-artifact/:id', async (req, res) => {
            const id = req.params.id
            const artData = req.body
            const updated = {
                $set: artData
            }
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const result = await artCollection.updateOne(query, updated, options)
            res.send(result)
        })

        /////////////////////////////////////////////
        //////////////////////////////////////////////
        // save a liked artifact it db 
        app.post('/add-like', async (req, res) => {
            const likeData = req.body
            // check if a user already liked a artifact 
            const query = { email: likeData.email, artLikeId: likeData.artLikeId }
            const alreadyLiked = await likedCollection.findOne(query)
            // console.log('already exist', alreadyLiked)
            if (alreadyLiked) {
                return res.status(400).send('You have already liked this artifact!')
            }
            // save data in like collection 
            const result = await likedCollection.insertOne(likeData)
            // increase bid count in art collection 
            const filter = { _id: new ObjectId(likeData.artLikeId) }
            const update = {
                $inc: { like_count: 1 }
            }
            const updateLikeCount = await artCollection.updateOne(filter, update)
            res.send(result)
        })

        // get all liked artifact for  specific user //
        app.get('/liked/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const result = await likedCollection.find(query).toArray()
            res.send(result)


        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Assignment 11 server is running')
})
app.listen(port, () => {
    console.log(`Assignment 11 is running:${port}`)
})
