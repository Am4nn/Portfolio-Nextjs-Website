export async function GET(request: Request) {
  console.log(request.method, request.url);
  return Response.json({ message: 'API is up and running !' });
}
