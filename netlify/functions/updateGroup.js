const MongoClient = require('mongodb').MongoClient;

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'kalujo_ja';

exports.handler = async (event, context) => {
  // Ensure you're dealing with a POST request (or PUT if you prefer that)
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const data = JSON.parse(event.body);

  // Validate that necessary fields are provided
  if (!data.name || !data.words) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Required fields missing" })
    };
  }

  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db(DB_NAME);
    const collection = database.collection('groups');
    
    // Update the group in the database
    const updateResponse = await collection.updateOne(
      { name: data.name },
      { $set: { words: data.words } }
    );

    if (updateResponse.matchedCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Group not found" })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Group updated successfully" })
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


