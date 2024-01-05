exports.handler = async function (event: any) {
  console.log("Request:", JSON.stringify(event, undefined, 2));
  // Generate an error conditionally to test the rollback
  if (event["error"]) {
    throw new Error("Test error");
  }
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, CDK! You've hit a lambda\n`,
  };
};
