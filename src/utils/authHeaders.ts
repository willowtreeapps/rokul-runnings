import { Method } from '../types/RokulRunnings';
import { IncomingHttpHeaders } from 'http';
import axios from 'axios';
import * as FormData from 'form-data';

/** Function to generate auth headers */
export async function generateHeaders({
  method,
  address,
  formData,
}: {
  method: Method;
  address: string;
  formData?: FormData;
}): Promise<IncomingHttpHeaders> {
  /** If executing a GET */
  if (method === 'GET') {
    return generateGetHeaders(address);
  } else {
    /** If executing a POST */
    return generatePostHeaders({
      address,
      formData: formData,
    });
  }
}

/** Function to return headers for a GET request */
async function generateGetHeaders(url: string): Promise<IncomingHttpHeaders> {
  try {
    const result = await axios.get(url);
    return result.headers;
  } catch (error) {
    if (error.response) {
      if (error.response.status !== 401) console.error(error);
      else return error.response.headers;
    }
  }
}

/** Function to return headers for a POST request */
async function generatePostHeaders({
  address,
  formData,
}: {
  address: string;
  formData: FormData;
}): Promise<IncomingHttpHeaders> {
  try {
    const result = await axios.post(address, formData, {
      headers: formData.getHeaders(),
    });
    return result.headers;
  } catch (error) {
    if (error.response) {
      if (error.response.status !== 401) throw error;
      else {
        return error.response.headers;
      }
    }
  }
}
