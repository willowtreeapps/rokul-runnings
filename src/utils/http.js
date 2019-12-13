const axios = require("axios");
const sleep = require("./sleep");

function baseGET(url) {
  return axios
    .get(url)
    .then(function(response) {
      return response;
    })
    .catch(function(error) {
      console.log(error);
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
      console.log(error);
    });
}

function baseDELETE(url) {
  return axios
    .delete(url)
    .then(function(response) {
      return response;
    })
    .catch(function(error) {
      console.log(error);
    });
}

module.exports = {
  baseDELETE,
  baseGET,
  basePOST
};
