import { api } from "./axios";

/**
 * GET /api/courses
 */
export const getAllCourses = async () => {
  const res = await api.get("/api/courses");
  return res.data;
};

/**
 * GET /api/courses/my
 */
export const getMyCourses = async () => {
  const res = await api.get("/api/courses/my");
  return res.data;
};

/**
 * POST /api/courses/enroll
 * body: { course_id }
 */
export const enrollCourse = async (courseId) => {
  const res = await api.post("/api/courses/enroll", {
    course_id: courseId,
  });
  return res.data;
};

export const unenrollCourse = async (courseId) => {
  const res = await api.delete(`/api/courses/unenroll/${courseId}`);
  return res.data;
};

export const getConflicts = async () => {
  const res = await api.get("/api/courses/conflicts");
  return res.data;
};
