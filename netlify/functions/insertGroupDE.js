const MongoClient = require('mongodb').MongoClient;

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'kalujo_ja';

exports.handler = async (event, context) => {
  // Ensure you're dealing with a POST request
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const data = JSON.parse(event.body);

  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db(DB_NAME);
    const collection = database.collection('groups_de');

    // Insert the new group into the database
    await collection.insertOne(data);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Group inserted successfully" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() })
    };
  } finally {
    await client.close();
  }
};