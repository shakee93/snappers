const apiUrl = "http://52.45.14.64/wp-json/api/gq_mobile/v1/upload";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const orderID = formData.get("order_id") as string;

    if (!file) {
      return new Response(JSON.stringify({ error: "File is required." }), {
        status: 400,
      });
    }

    const buffer = await readBufferFromFile(file);
    await sendFileToUrl(file, buffer, orderID);

    return new Response(JSON.stringify({ message: "succuss" }));
  } catch (error) {
    return new Response(JSON.stringify({ error: `Error: ${error}` }));
  }
}

async function readBufferFromFile(file: File): Promise<ArrayBuffer> {
  return await file.arrayBuffer();
}

async function sendFileToUrl(
  file: File,
  buffer: ArrayBuffer,
  order_id: string | null
) {
  const formData = new FormData();
  formData.append("file", new Blob([buffer], { type: file.type }), file.name);
  formData.append("order_id", order_id || "");

  const requestOptions = {
    method: "POST",
    body: formData,
  };

  let wpResponse;
  try {
    wpResponse = await fetch(apiUrl, requestOptions);
    if (!wpResponse.ok) {
      const errorText = await wpResponse.text();
      throw new Error(
        `Server responded with ${wpResponse.status}: ${errorText}`
      );
    }
    const wpData = await wpResponse.json();
    return wpData; // or process this as needed
  } catch (error) {
    console.error("Failed to send file:", error);
    throw new Error(`Failed to send file to ${apiUrl}: ${error}`);
  }
}
