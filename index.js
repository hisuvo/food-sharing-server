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
      const search = req.query.search;
      const sort = req.query.sort;

      let options = {};
      if (sort) options = { sort: { expireDate: sort === "asc" ? 1 : -1 } };

      let query = {
        name: {
          $regex: search,
          $options: "i",
        },
      };
      const result = await foodsCollection.find(query, options).toArray();
      res.send(result);
    });

    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await foodsCollection.findOne(filter);
      res.send(result);
    });

    // update food data in db
    app.put("/update-foods/:id", async (req, res) => {
      const id = req.params.id;
      const foodData = req.body;
      const update = {
        $set: foodData,
      };
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const result = await foodsCollection.updateOne(filter, update, options);
      res.send(result);
    });

    // get donator email specifice manage food api
    app.get("/manage-foods/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { "donor.email": email };
      const result = await foodsCollection.find(filter).toArray();
      res.send(result);
    });

    // post food data
    app.post("/add-foods", async (req, res) => {
      const data = req.body;
      const reslut = await foodsCollection.insertOne(data);
      res.send(reslut);
    });

    // delete food from in db
    app.delete("/food/:id", async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const reslut = await foodsCollection.deleteOne(quary);
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
