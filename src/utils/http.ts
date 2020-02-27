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
        response = await retryCall(retries, 'GET', url);
        return Promise.resolve({
          status: response.status,
          body: response.data,
        });
      }
    } else {
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
        response = await retryCall(retries, 'POST', url, requestBody);
        return Promise.resolve({
          status: response.status,
          body: response.data,
        });
      }
    } else {
      console.log(error);
      throw error;
    }
  }
}

export async function baseDELETE<T>({
  url,
  retries,
}: {
  url: string;
  retries: number;
}): Promise<{ status: number; body: T }> {
  let response;
  try {
    response = await Axios.delete(url);
    return {
      status: response.status,
      body: response.data,
    };
  } catch (error) {
    console.log(error);
    if (error.response.status === 400) {
      console.log(error.response.data);
      throw error.response.data;
    } else if (error.response.status === 500) {
      response = await retryCall(retries, 'GET', url);
      return Promise.resolve({
        status: response.status,
        body: response.data,
      });
    } else {
      console.log(error);
      throw error;
    }
  }
}

async function retryCall(retries: number, method: string, url?: string, requestBody?: Object) {
  let tries = 0;
  while (tries < retries) {
    try {
      if (method === 'POST') {
        return await Axios.post(url, requestBody);
      } else if (method === 'GET') {
        return await Axios.get(url);
      }
    } catch (error) {
      if (error.response.status === 500) {
        if (tries + 1 === retries) {
          console.log(error.response.data.value.message);
          throw error.response.data.value.message;
        }
        tries++;
      } else {
        throw error;
      }
    }
  }
}
