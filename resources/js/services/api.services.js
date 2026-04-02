import axios from "axios";
import { Toast } from "../helpers";
import Swal from "sweetalert2";

let headers = {
  key: import.meta.env.VITE_API_KEY || "devkey123456",
  Accept: "application/json",
};

const apiClient = axios.create({
  headers: headers,
});

/**
 * Function to call an API using Axios
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} url - API endpoint
 * @param {object} [options] - Additional options for the request
 * @param {object} [options.headers] - Custom headers
 * @param {object} [options.params] - Query parameters
 * @param {object} [options.data] - Request body (for POST, PUT, etc.)
 * @returns {Promise<object>} - Response from the API
 */
export const apiService = async (method, url, options = {}) => {
  const { headers = {}, params = {}, data = {}, signal = null, cancelToken = null } = options;
  const  token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    const response = await axios({
      method,
      url: url,
      headers: { ...apiClient.defaults.headers, ...headers },
      params,
      data,
      signal,
      cancelToken,
    });
    return response;
  } catch (error) {
    if (error.response) {
      return error.response;
    }

    if (error.request) {
      Swal.fire({
        title: "Failed",
        text: `${"We indicated an issue, no response from the server, please check your network connection or server is under maintenance, please try again later"}`,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#004C68"
      });
    } else {
      Swal.fire({
        title: "Failed",
        text: `${"Call API configuration error"} ${error.message}`,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#004C68"
      });
    }

    return error;
  }
};

export const apiServicePost = async (url, data, options = {}) => {
  const { headers = {} } = options;
  const token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    Swal.fire({
      title: 'Loading...',
      html: '<p>Please wait while we process your request</p>',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    const response = await axios.post(url, data, {
      headers: { ...apiClient.defaults.headers, ...headers },
    });
    Swal.close();
    return response;
  } catch (error) {
    Swal.close();
    if (error.response) {
      if (error.response.data) {
        Swal.fire({
          title: "Failed",
          html: `
            <p class="mb-3">${error.response.data?.message || "Response error"}</p>
            <div class="text-left ps-6">
              <ul class="list-disc">
                ${Object.keys(error.response.data.errors || {}).map(key => `<li>${error.response.data.errors[key][0]}</li>`).join('')}
              </ul>
            </div>
          `,
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#004C68"
        });
      }
      return error.response;
    }

    if (error.request) {
      Swal.fire({
        title: "Failed",
        text: `${"We indicated an issue, no response from the server, please check your network connection or server is under maintenance, please try again later"}`,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#004C68"
      });
    } else {
      Swal.fire({
        title: "Failed",
        text: `${"Call API configuration error"} ${error.message}`,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#004C68"
      });
    }

    return error;
  }
}

export const apiServiceDelete = async (url, options = {}, type = 0) => {
  const { headers = {} } = options;
  const token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    Swal.fire({
      title: 'Loading...',
      text: 'Please wait while we process your request',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    const response = await axios.delete(url, {
      headers: { ...apiClient.defaults.headers, ...headers }
    });
    Swal.close();
    return response;
  } catch (error) {
    Swal.close();
    if (error.response) {
      if (error.response.data) {
        Swal.fire({
          title: "Failed",
          text: `${error.response.data?.message || "Response error"}`,
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#004C68"
        });
      }
      return error.response;
    }

    if (error.request) {
      Swal.fire({
        title: "Failed",
        text: `${"We indicated an issue, no response from the server, please check your network connection or server is under maintenance, please try again later"}`,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#004C68"
      });
    } else {
      Swal.fire({
        title: "Failed",
        text: `${"Call API configuration error"} ${error.message}`,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#004C68"
      });
    }

    return error;
  }
}
