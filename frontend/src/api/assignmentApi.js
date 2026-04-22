import axios from 'axios';

// Assuming your FastAPI server is on localhost:8000
const API_URL = 'http://localhost:8000/api/assignments';

/**
 * Helper to get the auth token from local storage.
 * Adjust this if you store your JWT differently.
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

  /**
   * Fetches all assignments for the current user
   */
export const getAllAssignments = async () => {
    const response = await axios.get(`${API_URL}/`, getAuthHeader());
	return response.data;
}

  /**
   * Creates a new assignment
   * @param {Object} assignmentData - { title, due_date, risk_level, description, course_id }
   */
export const createAssignment = async (assignmentData) => {
    const response = await axios.post(`${API_URL}/`, assignmentData, getAuthHeader());
    return response.data;
}

