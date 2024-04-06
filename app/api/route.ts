export async function GET(request: Request) {
  console.log('GET ', request.url);
  return Response.json({ message: 'Hello World' });
}