const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

// mongo connect

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://PodsStream:8Kri2j8QKUENjxJH@cluster0.oikc1wt.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const podcastCollections = client
      .db("PodsCastStream")
      .collection("podsCasts");

    //   api

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    // app.get("/podCasts/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const result = await podcastCollections.findOne({
    //     _id: new ObjectId(id),
    //   });
    //   res.send(result);
    // });

    app.post("/upload_podcast", async (req, res) => {
      const data = req.body;
      const result = await podcastCollections.insertOne(data);
      res.send(result);
    });

    app.patch("/update_podcast/:id", async (req, res) => {
      const id = req.params.id;
      const updatePodcastData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          ...updatePodcastData,
        },
      };
      delete updateDoc.$set._id;
      const options = { upsert: true };
      const result = await podcastCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.delete("/delete_podcast/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await podcastCollections.deleteOne(filter);
      res.send(result);
    });

    // filter by category
    app.get("/podCasts", async (req, res) => {
      let query = {};
      if (req.query?.category) {
        query = { category: req.query.category };
      }
      const result = await podcastCollections.find(query).toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// 8Kri2j8QKUENjxJH
// PodsStream
