const PYTHON_BACKEND = process.env.ARCHMIND_BACKEND_URL ?? "http://127.0.0.1:8000";

export async function POST(req: Request) {
  const body = await req.text();

  let pythonRes: Response;
  try {
    pythonRes = await fetch(`${PYTHON_BACKEND}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch {
    return new Response("Could not reach the ArchMind Python backend. Is it running?", {
      status: 502,
    });
  }

  if (!pythonRes.ok) {
    const detail = await pythonRes.text();
    return new Response(`Backend error: ${detail}`, { status: pythonRes.status });
  }

  return new Response(pythonRes.body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
