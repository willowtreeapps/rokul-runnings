import Axios from 'axios';

export async function baseGET<T>({
  url,
  errorAllowed = false,
  retries,
}: {
  url: string;
  errorAllowed?: boolean;
  retries: number;
}): Promise<{
  status: number;
  body: T;
}> {
  let response: any;
  let tries = 0;
  try {
    response = await Axios.get(url);
    return Promise.resolve({
      status: response.status,
      body: response.data,
    });
  } catch (error) {
    console.log(error);
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
      while (tries < retries) {
        try {
          response = await Axios.get(url);
          return Promise.resolve({ status: response.status, body: response.data });
        } catch (error) {
          if (error.response.status === 500) {
            tries++;
          } else {
            throw error;
          }
        }
      }
      console.log(error);
      throw error;
    }
  }
}

export async function basePOST<T>({
  url,
  requestBody,
  errorAllowed = false,
  retries,
}: {
  url: string;
  requestBody: Object;
  errorAllowed?: boolean;
  retries: number;
}): Promise<{
  status: number;
  body: T;
}> {
  let tries = 0;
  let response;
  try {
    response = await Axios.post(url, requestBody);
    return Promise.resolve({
      status: response.status,
      body: response.data,
    });
  } catch (error) {
    if (error.response.status === 400) {
      console.log(error.response.data);
      throw error.response.data;
    } else if (error.response.status === 500) {
      if (errorAllowed) {
        return { status: error.response.status, body: error.response.data };
      } else {
        while (tries < retries) {
          try {
            response = await Axios.post(url, requestBody);
            return Promise.resolve({ status: response.status, body: response.data });
          } catch (error) {
            if (error.response.status === 500) {
              tries++;
            } else {
              throw error;
            }
          }
        }
        console.log(error.response.data.value.message);
        throw error.response.data.value.message;
      }
    } else {
      console.log(error);
      throw error;
    }
  }
}

export async function baseDELETE<T>(url: string): Promise<{ status: number; body: T }> {
  try {
    const response = await Axios.delete(url);
    return {
      status: response.status,
      body: response.data,
    };
  } catch (error) {
    console.log(error);
    if ((error.response.status === 500 || error.response.status === 400) && error.response.data.status) {
      return {
        status: error.response.status,
        body: error.response.data,
      };
    } else {
      console.log(error);
      throw error;
    }
  }
}
