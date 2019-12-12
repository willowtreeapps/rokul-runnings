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
    .post(url, newRequestBody)
    .then(function(response) {
      return response;
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
