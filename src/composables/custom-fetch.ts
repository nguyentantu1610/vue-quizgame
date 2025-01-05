// Init data
let data: any = {};
let status: number = 400;
let fileName: string = "file_name";

/**
 * This function perform handle response from server
 *
 * @param {Headers} headers The fetch headers
 * @param {Response} response The response from server
 */
async function handleResponse(headers: Headers, response: Response) {
  // Reset data
  data = {};
  // Assign response status to status
  status = response.status;
  // Check if user is unauthenticated then remove token if present
  status === 401 && localStorage.getItem("token")
    ? localStorage.removeItem("token")
    : "";
  const acceptType = headers.get("Accept");
  const contentType = response.headers.get("Content-Type");
  // Handle accept type application/json
  if (acceptType && acceptType.includes("application/json")) {
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
    } else if (acceptType === "application/json") {
      throw new TypeError("Oops, we haven't got JSON!");
    }
  }
  // Handle accept type text/csv
  if (acceptType && acceptType.includes("text/csv")) {
    if (contentType && contentType.includes("text/csv")) {
      // Reset file name
      fileName = "file_name";
      const disposition = response.headers.get("Content-Disposition");
      if (disposition && disposition.includes("attachment")) {
        // Get file name from server if present
        fileName = disposition.slice(disposition.indexOf("filename=") + 9);
      }
      data = await response.blob();
      if (!response.ok) {
        throw new Error(await response.text());
      }
    }
  }
}

/**
 * This function perform custom get fetch
 *
 * @param {string} uri The fetch uri
 * @param {Headers} myHeaders The fetch headers
 * @returns {Promise<{ data: any; status: number; fileName: string }>} The response
 */
async function useGetFetch(
  uri: string,
  myHeaders: Headers
): Promise<{ data: any; status: number; fileName: string }> {
  try {
    const response = await fetch(uri, { headers: myHeaders });
    await handleResponse(myHeaders, response);
  } catch (error) {
    console.error(error);
  }
  return { data, status, fileName };
}

/**
 * This function is custom post or patch fetch
 *
 * @param {string} myMethod The fetch method
 * @param {string} uri The fetch uri
 * @param {FormData} formData The fetch body
 * @param {Headers} myHeaders The fetch headers
 * @returns {Promise<{ data: any; status: number }>} The response from server
 */
async function usePostOrPatchFetch(
  myMethod: string,
  uri: string,
  formData: FormData,
  myHeaders: Headers
): Promise<{ data: any; status: number }> {
  try {
    const response = await fetch(uri, {
      method: myMethod,
      body: formData,
      headers: myHeaders,
    });
    await handleResponse(myHeaders, response);
  } catch (error) {
    console.error(error);
  }
  return { data, status };
}

/**
 * This function is custom delete fetch
 *
 * @param {string} uri The fetch uri
 * @param {Headers} myHeaders The fetch headers
 * @returns {Promise<{ data: any; status: number }>} The response from server
 */
async function useDeleteFetch(
  uri: string,
  myHeaders: Headers
): Promise<{ data: any; status: number }> {
  try {
    const response = await fetch(uri, {
      method: "DELETE",
      headers: myHeaders,
    });
    await handleResponse(myHeaders, response);
  } catch (error) {
    console.error(error);
  }
  return { data, status };
}

export { useGetFetch, usePostOrPatchFetch, useDeleteFetch };
