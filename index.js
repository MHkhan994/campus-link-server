const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000
require('dotenv').config();

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qmhrwse.mongodb.net/?retryWrites=true&w=majority`;

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


        const collegesCollection = client.db('campusLink').collection('colleges')
        const applicationCollection = client.db('campusLink').collection('applications')
        const usersCollection = client.db('campusLink').collection('users')
        const galleryCollection = client.db('campusLink').collection('gallery')
        const researchCollection = client.db('campusLink').collection('research')
        const reviwesCollection = client.db('campusLink').collection('reviews')


        //===========================colleges==============================
        app.get('/colleges', async (req, res) => {
            const result = await collegesCollection.find().toArray()
            res.send(result)
        })

        // single college
        app.get('/college/:id', async (req, res) => {
            const id = req.params
            const result = await collegesCollection.findOne({ _id: new ObjectId(id) })
            res.send(result)
        })

        app.get('/college/search/:text', async (req, res) => {
            const text = req.params
            const regex = new RegExp(text.text, "i")
            const result = await collegesCollection.find({ name: regex }).toArray()
            res.send(result)
        })


        // ======================application===================================
        app.post('/application', async (req, res) => {
            const data = req.body
            const result = await applicationCollection.insertOne(data)
            res.send(result)
        })

        app.get('/applications', async (req, res) => {
            const email = req.query.email
            console.log(email);
            const result = await applicationCollection.find({ email: email }).toArray()
            res.send(result)
        })

        app.patch('/appliedOrNot', async (req, res) => {
            const data = req.body
            const result = await applicationCollection.findOne({ collegeId: data.id, email: data.email })
            console.log(result);
            if (result === null) {
                res.send({ applied: false })
            }
            else {
                res.send({ applied: true })
            }
        })


        // ================================users======================================
        app.post('/user', async (req, res) => {
            const user = req.body;
            const isUser = await usersCollection.findOne({ email: user.email })
            console.log(isUser);
            if (!isUser) {
                const result = await usersCollection.insertOne(user)
                res.send(result)
            }
            else {
                res.send({ alreadyUser: true })
            }
        })

        app.get('/user', async (req, res) => {
            const email = req.query.email;
            const result = await usersCollection.findOne({ email: email })
            res.send(result)
        })

        app.patch('/updateUser', async (req, res) => {
            const user = req.body
            const result = await usersCollection.replaceOne({ email: user.email }, user)
            res.send(result)
        })


        // =============================gallery============================
        app.get('/gallery', async (req, res) => {
            const result = await galleryCollection.find().toArray()
            res.send(result)
        })


        // ========================research===========================
        app.get('/research', async (req, res) => {
            const sliceNum = req.query.slice;
            if (sliceNum === 0) {
                const result = await researchCollection.find().toArray()
                res.send(result)
            }
            else {
                const result = await researchCollection.find().limit(parseInt(sliceNum)).toArray()
                res.send(result)
            }
        })

        //==========================reviews=========================
        app.get('/reviews', async (req, res) => {
            const result = await reviwesCollection.find().toArray()
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


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

