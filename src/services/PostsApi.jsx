import axiosInstance from "./api";

export const login = async (usernameOrEmail, password) => {
  try {
    const response = await axiosInstance.post("/token/", {  username: usernameOrEmail, password });
    return response.data;
  } catch (error) {
    throw new Error("Login failed");
  }
};

export const getPosts = async (search = "", url = null) => {
  if (url) return (await axiosInstance.get(url)).data;
  return (await axiosInstance.get(`/Post/?search=${encodeURIComponent(search)}`)).data;
};

export const getMyPosts = async (search = "", url = null) => {
  if (url) return (await axiosInstance.get(url)).data;
  return (await axiosInstance.get(`/my-posts/?search=${encodeURIComponent(search)}`)).data;
};

export const getPostDetail = async (id) => {
  const response = await axiosInstance.get(`/Post/${id}/`);
  return response.data;
};

export const addPost = async (data) => {
  try {
    const response = await axiosInstance.post("/Post/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to add new post");
  }
};

export const updatePost = async (id, data) => {
  try {
    const response = await axiosInstance.patch(`/Post/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to update post");
  }
};

export const deletePost = async (id) => {
  try {
    await axiosInstance.delete(`/Post/${id}/`);
  } catch (error) {
    throw new Error("Failed to delete post");
  }
};

export const LikePost = async(id) => {
  try{
  await axiosInstance.post(`/Post/${id}/like/`);
  }catch(error){
    throw new Error("Failed to add like")
  }
}

export const CommentPost = async (id, text) => {
  try {
    const res = await axiosInstance.post(
      `/Post/${id}/comment/`,
      { text }
    );
    return res.data;
  } catch (error) {
    throw new Error("Failed to add comment");
  }
};
