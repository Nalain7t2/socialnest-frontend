import axios from "axios"

const BASE_URL = "http://127.0.0.1:8000/api"

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})


axiosInstance.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("access")
    // console.log("Request interceptor - Access token:", access ? "Present" : "Missing");
    
    if (access) {
      config.headers.Authorization = `Bearer ${access}`
    }
    return config
  },
  (error) => {
    // console.error("Request interceptor error:", error);
    return Promise.reject(error)
  }
)


axiosInstance.interceptors.response.use(
  (response) => {
    // console.log("Response success:", response.config.url);
    return response
  },
  async (error) => {
    // console.error("Response error:", {
    //   url: error.config?.url,
    //   status: error.response?.status,
    //   message: error.message
    // });
    
    const originalRequest = error.config

    // Access token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("Token expired, attempting refresh...");
      originalRequest._retry = true

      try {
        const refresh = localStorage.getItem("refresh")

        if (!refresh) {
          throw new Error("No refresh token available");
        }

        const res = await axios.post(
          `${BASE_URL}/token/refresh/`,
          { refresh }
        )

        // Save new access token
        const newAccess = res.data.access;
        localStorage.setItem("access", newAccess)
        console.log("Token refreshed successfully");

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return axiosInstance(originalRequest)

      } catch (err) {
        // console.error("Refresh token failed:", err);
        // Clear all tokens
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        // Optional: Redirect to login
        window.location.href = "/login";
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance

export const forgetPassword = async(email) => {
  const res = await axiosInstance.post("/forget-password/", { email })
  return res.data
}

export const changePassword = async (passwordData) => {
  try {
    const res = await axiosInstance.post("/change-password/", {
      old_password: passwordData.oldPassword,
      new_password: passwordData.newPassword,
      confirm_password: passwordData.confirmPassword
    });
    return res.data;
  } catch (error) {
    const errorData = error.response?.data || {};
    throw {
      status: error.response?.status,
      message: errorData.error || "Failed to change password",
    };
  }
};

export const registerUser = async (formData) => {
  try {
    const res = await axios.post(`${BASE_URL}/register/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 seconds timeout
    });
    return res.data;
  } catch (error) {
    // console.error('Registration API error:', error.response?.data || error.message);
    
    // Re-throw the error with more context
    if (error.response) {

      const serverError = new Error(error.response.data.detail || 'Registration failed');
      serverError.response = error.response;
      serverError.status = error.response.status;
      throw serverError;
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message || 'Request configuration error');
    }
  }
};

export const getFollowSuggestions = async () => {
  const res = await axiosInstance.get('/suggestions/')
  return res.data
}

export const followUser = async (userId) => {
  try {
    const res = await axiosInstance.post("/follow/", {
  user_id: userId,
  action: "follow"
});

    return res.data;
  } catch (error) {
    const errorData = error.response?.data || {};
    throw {
      status: error.response?.status,
      message: errorData.error || "Failed to follow user",
    };
  }
};

export const unfollowUser = async (userId) => {
  try {
    const res = await axiosInstance.post("/follow/", {
    user_id: userId,
    action: "unfollow",
  });

    return res.data;
  } catch (error) {
    const errorData = error.response?.data || {};
    throw {
      status: error.response?.status,
      message: errorData.error || "Failed to unfollow user",
    };
  }
};

export const getUserProfile = async (username) => {
  const res = await axiosInstance.get(`/profile/${username}/`)
  return res.data
}

export const getFollowers = async (search = '', page = 1) => {
  try {
    const res = await axiosInstance.get('/followers/', {
      params: {
        search: search,
        page: page
      }
    });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch followers:', error);
    throw error;
  }
};

export const getFollowing = async (search = '', page = 1) => {
  try {
    const res = await axiosInstance.get('/following/', {
      params: {
        search: search,
        page: page
      }
    });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch following:', error);
    throw error;
  }
};
export const searchUsers = async (query) => {
  const response = await axiosInstance.get(`/users/search/?q=${query}`);
  return response.data;
};
