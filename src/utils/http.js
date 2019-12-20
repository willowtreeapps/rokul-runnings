const axios = require("axios");

function baseGET(url) {
  return axios
    .get(url)
    .then(function(response) {
      return response;
    })
    .catch(function(error) {
      if (
        (error.response.status === 500 || error.response.status === 400) &&
        error.response.data.status
      ) {
        return {
          status: error.response.status,
          body: error.response.data
        };
      } else console.log(error);
    });
}

function basePOST(url, requestBody) {
  return axios
    .post(url, requestBody)
    .then(function(response) {
      return {
        status: response.status,
        body: response.data
      };
    })
    .catch(function(error) {
      if (
        (error.response.status === 500 || error.response.status === 400) &&
        error.response.data.status
      ) {
        return {
          status: error.response.status,
          body: error.response.data
        };
      } else console.log(error);
    });
}

function baseDELETE(url) {
  return axios
    .delete(url)
    .then(function(response) {
      return response;
    })
    .catch(function(error) {
      if (
        (error.response.status === 500 || error.response.status === 400) &&
        error.response.data.status
      ) {
        return {
          status: error.response.status,
          body: error.response.data
        };
      } else console.log(error);
    });
}

module.exports = {
  baseDELETE,
  baseGET,
  basePOST
};
