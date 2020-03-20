import Axios, { AxiosResponse } from 'axios';

export async function baseGET({ url, retries }: { url: string; retries: number }) {
  return callsWithRetries({ responseFunction: Axios.get(url), retries, value: 'data' });
}

export async function basePOST({ url, params, retries }: { url: string; params?: Object; retries: number }) {
  return callsWithRetries({ responseFunction: Axios.post(url, null, { params }), retries, value: 'status' });
}

async function callsWithRetries({
  responseFunction,
  value,
  retries,
}: {
  responseFunction: Promise<AxiosResponse<any>>;
  value: string;
  retries: number;
}) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await responseFunction;
      return Promise.resolve(response[value]);
    } catch (error) {
      if (i === retries - 1) {
        return `Request Failed with an error code of: ${error.response.status}, and \nan error message of: ${error.response.statusText}`;
      } else {
        console.error(error);
      }
    }
  }
}
