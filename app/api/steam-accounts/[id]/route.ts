import { GET as getAccount } from "../route";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const url = new URL(request.url);
  url.searchParams.set("id", id);
  return getAccount(new Request(url, request));
}
