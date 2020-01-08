import axios from "axios";

export async function baseGET<T>(
  url: string,
  errorAllowed?: boolean
): Promise<{
  status: number;
  body: T;
}> {
  try {
    const response = await axios.get(url);
    return Promise.resolve({
      status: response.status,
      body: response.data
    });
  } catch (error) {
    if (error.response.status === 400) {
      console.log(error.response.data);
      throw error.response.data;
    } else if (error.response.status === 500) {
      if (errorAllowed) {
        return { status: error.response.status, body: error.response.data };
      } else {
        console.log(error.response.data.value.message);
        throw error.response.data.value.message;
      }
    } else {
      console.log(error);
      throw error;
    }
  }
}

export async function basePOST<T>(
  url: string,
  requestBody: Object,
  errorAllowed?: boolean
): Promise<{
  status: number;
  body: T;
}> {
  try {
    const response = await axios.post(url, requestBody);
    return Promise.resolve({
      status: response.status,
      body: response.data
    });
  } catch (error) {
    if (error.response.status === 400) {
      console.log(error.response.data);
      throw error.response.data;
    } else if (error.response.status === 500) {
      if (errorAllowed) {
        return { status: error.response.status, body: error.response.data };
      } else {
        console.log(error.response.data.value.message);
        throw error.response.data.value.message;
      }
    } else {
      console.log(error);
      throw error;
    }
  }
}

export async function baseDELETE<T>(
  url: string
): Promise<{ status: number; body: T }> {
  try {
    const response = await axios.delete(url);
    return {
      status: response.status,
      body: response.data
    };
  } catch (error) {
    if (
      (error.response.status === 500 || error.response.status === 400) &&
      error.response.data.status
    ) {
      return {
        status: error.response.status,
        body: error.response.data
      };
    } else {
      console.log(error);
      throw error;
    }
  }
}
