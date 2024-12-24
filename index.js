const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 9500;

// Middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aiyi0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("foodShareDB");
    const foodsCollection = database.collection("foods");
    const requestCollection = database.collection("request");

    app.get("/foods", async (req, res) => {
      const result = await foodsCollection.find().toArray();
      res.send(result);
    });

    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await foodsCollection.findOne(filter);
      res.send(result);
    });

    // post food data
    app.post("/add-foods", async (req, res) => {
      const data = req.body;
      const reslut = await foodsCollection.insertOne(data);
      res.send(reslut);
    });

    // =================================
    //   REQUEST COLLECTION SERVER APIS
    // =================================

    // post request data api
    app.post("/request-foods", async (req, res) => {
      const requestData = req.body;
      const result = await requestCollection.insertOne(requestData);
      res.send(result);
    });

    // get user specifice request food data
    app.get("/request-foods/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { requestEmail: email };
      const reslut = await requestCollection.find(filter).toArray();
      res.send(reslut);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log("Food Sharing Server is Comming Soon From ", port);
});
