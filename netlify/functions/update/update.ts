import { Handler } from "@netlify/functions";
const faunadb = require("faunadb");
const q = faunadb.query;

const faunaSecret = process.env.FAUNADB_SECRET;
const faunaDomain = process.env.FAUNADB_DOMAIN;
const faunaDocumentId =
  process.env.CONTEXT === "dev"
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

  let body: any;
  try {
    // @ts-ignore-next-line
    body = JSON.parse(event.body);
  } catch (error) {
    console.error("Failed to parse the request body", error);
    statusCode = 500;
    return {
      statusCode,
      body: "Failed to parse the request body: " + error,
    };
  }

  try {
    // read the current values from db
    const queryRes = await client.query(
      q.Get(q.Ref(q.Collection("Counts"), faunaDocumentId))
    );
    // console.log("Current values are: ", queryRes);
    const data = queryRes.data || {};

    // update the values
    const finalValues: any = {};
    Object.entries(data).forEach(([key, value]) => {
      finalValues[key] = value;
    });
    Object.entries(body.data || {}).forEach(([key, value]) => {
      if (key !== "_ENVIRONMENT_") {
        finalValues[key] = finalValues[key] ? finalValues[key] + value : value;
      }
    });

    // console.log("Updating values to: ", finalValues);

    // set the new value
    const res = await client.query(
      q.Update(q.Ref(q.Collection("Counts"), faunaDocumentId), {
        data: finalValues,
      })
    );
    results = res.data;
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
