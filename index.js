require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
app.use(cors());
app.use(express.json());
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// mongo connect

const Database_name = process.env.DB_NAME;
const Database_pass = process.env.DB_PASS;
const JWT_SECRET = process.env.JWT_token;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { error } = require("console");
const uri = `mongodb+srv://${Database_name}:${Database_pass}@cluster0.oikc1wt.mongodb.net/?retryWrites=true&w=majority`;

// Function to generate a random secret key
// const generateRandomKey = () => {
//   return crypto.randomBytes(32).toString("base64");
// };

// // Generate and print a random secret key
// const randomKey = generateRandomKey();
// console.log(randomKey);

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
    const adminCollection = client.db("PodsCastStream").collection("admin");
    const notificationCollection = client
      .db("PodsCastStream")
      .collection("notification");

    //   api
    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.get("/admin", async (req, res) => {
      const result = await adminCollection.find().toArray();
      res.send(result);
    });

    app.post("/login", async (req, res) => {
      const { email, password } = req.body;

      const user = await adminCollection.findOne({ email });
      if (!user) {
        return res.json({ error: "User Not found" });
      }
      if (await (password === user.password)) {
        const token = jwt.sign({ email: user.email }, JWT_SECRET, {
          expiresIn: "15s",
        });

        if (res.status(201)) {
          return res.json({ status: "ok", data: token });
        } else {
          return res.json({ error: "error" });
        }
      }
      res.json({ status: "error", error: "InvAlid Password" });
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

    // notification api
    app.patch("/update_notification/:id", async (req, res) => {
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
      const result = await notificationCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.post("/notification", async (req, res) => {
      const data = req.body;
      const result = await notificationCollection.insertOne(data);
      res.send(result);
    });

    app.get("/notification/:id", async (req, res) => {
      const id = req.params.id;
      const result = await notificationCollection.findOne({
        _id: new ObjectId(id),
      });
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
