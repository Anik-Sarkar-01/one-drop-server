require('dotenv').config()
const express = require('express');
var cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bkijc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const database = client.db("oneDropDB");
        const usersCollection = database.collection("users");
        const donationRequestsCollection = database.collection("donationRequests");
        const blogCollection = database.collection("blogs");


        // user related apis
        app.get("/users", async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })

        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.send(user);
        })

        app.get("/users/admin/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === "admin";
            }
            res.send({ admin });
        })

        app.post("/users", async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: "user already exists", insertedId: null })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        app.put("/user/:email", async (req, res) => {
            const user = req.body;
            const email = req.params.email;
            const filter = { email: email };
            const updatedUser = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updatedUser);
            res.send(result);
        })

        // donation requests related apis
        app.get("/donation-requests", async (req, res) => {
            const result = await donationRequestsCollection.find().toArray();
            res.send(result);
        })

        app.get("/donation-requests/:email", async (req, res) => {
            const email = req.params.email;
            const query = { requesterEmail: email };
            const result = await donationRequestsCollection.find(query).toArray();
            res.send(result);
        })

        app.get("/recent-requests/:email", async (req, res) => {
            const email = req.params.email;
            const query = { requesterEmail: email };
            const result = await donationRequestsCollection.find(query).sort({ "_id": -1 }).limit(3).toArray();
            res.send(result);
        })

        app.post("/donation-requests", async (req, res) => {
            const donationRequest = req.body;
            const result = await donationRequestsCollection.insertOne(donationRequest);
            res.send(result);
        })

        // Example: GET /donors/search?bloodGroup=A+&district=Dhaka&upazila=Uttara

        app.get("/search-donor", async (req, res) => {
            const { bloodGroup, district, upazila } = req.query;

            const query = {};

            if (bloodGroup) {
                query.bloodGroup = bloodGroup;
            }

            if (district) {
                query.recipientDistrict = district;
            }

            if (upazila) {
                query.recipientUpazila = upazila;
            }

            const result = await donationRequestsCollection.find(query).toArray();
            res.send(result);
        });




        // blog related apis
        app.get("/blogs", async (req, res) => {
            const result = await blogCollection.find().toArray();
            res.send(result);
        })

        app.post("/blogs", async (req, res) => {
            const blog = req.body;
            const result = await blogCollection.insertOne(blog);
            res.send(result);
        })






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Welcome to OneDrop.")
})

app.listen(port, () => {
    console.log(`OneDrop is running on port ${port}`);
})