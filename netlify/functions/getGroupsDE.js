const MongoClient = require('mongodb').MongoClient;

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'kalujo_ja';

exports.handler = async (event, context) => {
  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db(DB_NAME);
    const collection = database.collection('groups_de');
    
    const groups = await collection.find({}).toArray();

    return {
      statusCode: 200,
      body: JSON.stringify(groups)
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