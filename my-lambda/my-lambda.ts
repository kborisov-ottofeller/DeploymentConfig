exports.handler = async function (event: any) {
  // Generate an error conditionally to test the rollback
  if (event["error"]) {
    throw new Error("Test error");
  }

  return {statusCode: 200, body: `Hello, CDK! You've hit a lambda\n`};
};