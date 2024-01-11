const url = "http://52.45.14.64/wp-json/api/gq_mobile/v1/upload";
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    console.log('formData', formData);
    
    const file = formData.get("file") as File;
    // console.log("file", file);

    if (!file) {
      return Response.json({ error: "File is required." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // console.log("buffer", buffer);
    sendFileToUrl(buffer, file.name, url);


    // const fileName = await uploadFileToS3(buffer, file.name);
    const msg = "Got my file";

    return Response.json({ msg });
  } catch (error: any) {
    const errMsg = `error: ${error}`;
    return Response.json({ errMsg });
  }
}

async function sendFileToUrl(file: Buffer, fileName: string, url: string) {
    const formData = new FormData();
    
    // Create a Blob from the Buffer
    const blob = new Blob([file], { type: 'application/octet-stream' });

    formData.append('file', blob, fileName);
  
    const requestOptions = {
      method: 'POST',
      body: formData,
    };
  
    const wpResponse = await fetch(url, requestOptions);
    console.log("wpResponse", wpResponse);
    
    const wpData = await wpResponse.json()


    
    if (!wpResponse.ok) {
      throw new Error(`Failed to send file to ${url}`);
    }
  
    return wpResponse.json(); // Assuming the server responds with JSON
  }