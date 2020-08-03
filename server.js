const express = require("express");
const mongodb = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const uri = process.env.DATABASE_URI;

const mongoOptions = { useUnifiedTopology: true };
const client = new mongodb.MongoClient(uri, mongoOptions);

client.connect(() => {
  const db = client.db("sample_airbnb");

  app.get("/search", (request, response) => {
    const collection = db.collection("listingsAndReviews");
    const { name, summary } = request.query;
    if (name === undefined && summary === undefined) {
      return response.status(400).send("please, try again!");
    }
    const searchObject = { $or: [{ name: name }, { summary: summary }] };

    collection.find(searchObject).toArray((error, results) => {
      if (error) {
        response.status(500).send(error);
      } else {
        results.length > 0
          ? response.status(200).send(results)
          : response.status(404).send("search not found!");
      }
    });
  });

  app.get("/:price", (request, response) => {
    const collection = db.collection("listingsAndReviews");
    const { price } = request.params;
    collection.find({}).toArray((error, results) => {
      if (error) {
        return response.status(500).send(error);
      }
      const filteredPrice = results.filter(
        (room) => room.price == Number(price)
      );
      if (filteredPrice.length > 0) {
        response.status(200).send(filteredPrice);
      } else {
        response.status(404).send("your search not found!");
      }
    });
  });

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running and listening`);
  });
});
