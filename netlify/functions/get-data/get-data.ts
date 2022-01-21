import { Handler } from "@netlify/functions";
const faunadb = require("faunadb");
const q = faunadb.query;

const faunaSecret = process.env.FAUNADB_SECRET;
const faunaDomain = process.env.FAUNADB_DOMAIN;
const faunaDocumentId =
  process.env.CONTEXT !== "production"
    ? process.env.FAUNADB_DEV_DOCUMENT_ID
    : process.env.FAUNADB_DOCUMENT_ID;

export const handler: Handler = async (event, context) => {
  // create connection with faunaDB
  const client = new faunadb.Client({
    secret: faunaSecret,
    domain: faunaDomain,
  });

  let statusCode = 200;
  let results = {};

  try {
    // query db
    const { data } = await client.query(
      q.Get(q.Ref(q.Collection("Counts"), faunaDocumentId))
    );
    results = data;
    // @ts-ignore-next-line
    delete results._ENVIRONMENT_;
  } catch (error) {
    console.error("Failed to query the db", error);
    statusCode = 500;
  }

  return {
    statusCode,
    body: JSON.stringify({
      results,
    }),
  };
};
