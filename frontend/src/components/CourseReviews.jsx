import { useState, useEffect, useCallback } from "react";
import { getFeedback, getFeedbackStats, submitFeedback, voteFeedback } from "../api/feedbackApi";
import { getMe } from "../api/authApi";

function getSemesterOptions() {
  const now = new Date();
  const year = now.getFullYear();
  const isSpring = now.getMonth() < 8;
  if (isSpring) {
    return [
      `${year} Spring`,
      `${year - 1} Fall`,
      `${year - 1} Spring`,
      `${year - 2} Fall`,
    ];
  }
  return [
    `${year} Fall`,
    `${year} Spring`,
    `${year - 1} Fall`,
    `${year - 1} Spring`,
  ];
}

function getRatingLabel(pct) {
  if (pct >= 95) return "Overwhelmingly Positive";
  if (pct >= 80) return "Very Positive";
  if (pct >= 70) return "Mostly Positive";
  if (pct >= 40) return "Mixed";
  if (pct >= 20) return "Mostly Negative";
  return "Overwhelmingly Negative";
}

function getRatingColor(pct) {
  if (pct >= 70) return "text-green-600";
  if (pct >= 40) return "text-yellow-500";
  return "text-red-500";
}

function getRatingBarColor(pct) {
  if (pct >= 70) return "bg-green-500";
  if (pct >= 40) return "bg-yellow-400";
  return "bg-red-500";
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const SEMESTER_OPTIONS = getSemesterOptions();

export default function CourseReviews({ course, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [semesterFilter, setSemesterFilter] = useState("");
  const [sort, setSort] = useState("helpful");

  const [myVote, setMyVote] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewSemester, setReviewSemester] = useState(SEMESTER_OPTIONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const loadReviews = useCallback(async () => {
    try {
      const data = await getFeedback(course.id, { semester: semesterFilter || undefined, sort });
      setReviews(data);
    } catch {
      // keep existing
    }
  }, [course.id, semesterFilter, sort]);

  const loadStats = useCallback(async () => {
    try {
      const data = await getFeedbackStats(course.id);
      setStats(data);
    } catch {
      // keep existing
    }
  }, [course.id]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      try {
        const [reviewsData, statsData, userData] = await Promise.all([
          getFeedback(course.id, { semester: semesterFilter || undefined, sort }),
          getFeedbackStats(course.id),
          getMe().catch(() => null),
        ]);
        if (!cancelled) {
          setReviews(reviewsData);
          setStats(statsData);
          setCurrentUser(userData);

          // Pre-fill vote if user has already reviewed this course+semester
          if (userData) {
            const existing = reviewsData.find(
              (r) => r.user_id === userData.id && r.semester === reviewSemester
            );
            if (existing) setMyVote(existing.is_positive ? "up" : "down");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [course.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading) loadReviews();
  }, [semesterFilter, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVote = async (feedbackId, vote) => {
    // Optimistic update
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== feedbackId) return r;
        const uid = currentUser?.id;
        let upvotes = [...(r.upvotes || [])];
        let downvotes = [...(r.downvotes || [])];
        if (vote === "up") {
          if (upvotes.includes(uid)) {
            upvotes = upvotes.filter((id) => id !== uid);
          } else {
            upvotes.push(uid);
            downvotes = downvotes.filter((id) => id !== uid);
          }
        } else {
          if (downvotes.includes(uid)) {
            downvotes = downvotes.filter((id) => id !== uid);
          } else {
            downvotes.push(uid);
            upvotes = upvotes.filter((id) => id !== uid);
          }
        }
        return { ...r, upvotes, downvotes };
      })
    );

    try {
      const updated = await voteFeedback(feedbackId, vote);
      setReviews((prev) => prev.map((r) => (r.id === feedbackId ? updated : r)));
    } catch {
      // revert on failure
      loadReviews();
    }
  };

  const handleSubmit = async () => {
    if (!myVote) return setSubmitError("Please select Recommended or Not Recommended.");
    if (!reviewText.trim()) return setSubmitError("Please write a review.");
    setSubmitError("");
    setSubmitting(true);
    try {
      await submitFeedback(course.id, {
        is_positive: myVote === "up",
        text: reviewText.trim(),
        semester: reviewSemester,
      });
      setReviewText("");
      await Promise.all([loadReviews(), loadStats()]);
    } catch (err) {
      setSubmitError(err.response?.data?.detail || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const availableSemesters = [...new Set(reviews.map((r) => r.semester))].sort().reverse();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between gap-3 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-tight">{course.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{course.code} · Student Reviews</p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400">Loading reviews...</div>
          ) : (
            <>
              {/* Stats Bar */}
              {stats && (
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className={`text-5xl font-black ${getRatingColor(stats.positive_pct)}`}>
                        {stats.total === 0 ? "—" : `${Math.round(stats.positive_pct)}%`}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">positive</div>
                    </div>
                    <div className="flex-1">
                      <div className={`text-lg font-bold ${getRatingColor(stats.positive_pct)}`}>
                        {stats.total === 0 ? "No Reviews Yet" : getRatingLabel(stats.positive_pct)}
                      </div>
                      <div className="text-sm text-slate-500 mt-0.5">
                        {stats.total === 0
                          ? "Be the first to review this course"
                          : `${stats.total} review${stats.total !== 1 ? "s" : ""} · ${stats.positive_count} positive · ${stats.negative_count} negative`}
                      </div>
                      {stats.total > 0 && (
                        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getRatingBarColor(stats.positive_pct)} rounded-full transition-all`}
                            style={{ width: `${stats.positive_pct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Bar */}
              <div className="px-6 py-3 border-b border-slate-100 flex gap-3 items-center flex-wrap">
                <select
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All semesters</option>
                  {availableSemesters.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSort("helpful")}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${sort === "helpful" ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    Most Helpful
                  </button>
                  <button
                    onClick={() => setSort("recent")}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${sort === "recent" ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    Most Recent
                  </button>
                </div>
              </div>

              {/* Reviews List */}
              <div className="divide-y divide-slate-100">
                {reviews.length === 0 ? (
                  <div className="px-6 py-10 text-center text-slate-400 text-sm">
                    No reviews{semesterFilter ? ` for ${semesterFilter}` : ""} yet.
                  </div>
                ) : (
                  reviews.map((review) => {
                    const isOwn = currentUser?.id === review.user_id;
                    const hasUpvoted = currentUser && (review.upvotes || []).includes(currentUser.id);
                    const hasDownvoted = currentUser && (review.downvotes || []).includes(currentUser.id);
                    const score = (review.upvotes?.length || 0) - (review.downvotes?.length || 0);

                    return (
                      <div key={review.id} className="px-6 py-5">
                        <div className="flex items-start gap-3">
                          {/* Thumb icon */}
                          <div className={`mt-0.5 text-xl shrink-0 ${review.is_positive ? "text-green-500" : "text-red-500"}`}>
                            {review.is_positive ? "👍" : "👎"}
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* Header row */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-semibold ${review.is_positive ? "text-green-700" : "text-red-600"}`}>
                                {review.is_positive ? "Recommended" : "Not Recommended"}
                              </span>
                              <span className="text-xs bg-indigo-50 text-primary px-2 py-0.5 rounded-full font-medium">
                                {review.semester}
                              </span>
                              {isOwn && (
                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Your review</span>
                              )}
                            </div>

                            {/* Meta */}
                            <p className="text-xs text-slate-400 mt-0.5">
                              {review.username} · {formatDate(review.created_at)}
                            </p>

                            {/* Review text */}
                            <p className="text-sm text-slate-700 mt-2 leading-relaxed">{review.text}</p>

                            {/* Helpful row */}
                            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                              <span>Was this helpful?</span>
                              <button
                                disabled={isOwn || !currentUser}
                                onClick={() => handleVote(review.id, "up")}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition ${
                                  hasUpvoted
                                    ? "border-green-400 bg-green-50 text-green-700 font-medium"
                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                }`}
                              >
                                👍 {review.upvotes?.length || 0}
                              </button>
                              <button
                                disabled={isOwn || !currentUser}
                                onClick={() => handleVote(review.id, "down")}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition ${
                                  hasDownvoted
                                    ? "border-red-400 bg-red-50 text-red-700 font-medium"
                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                }`}
                              >
                                👎 {review.downvotes?.length || 0}
                              </button>
                              {score !== 0 && (
                                <span className={score > 0 ? "text-green-600" : "text-red-500"}>
                                  {score > 0 ? `+${score}` : score} helpful
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Write a Review */}
              <div className="px-6 py-6 border-t-4 border-slate-100 bg-slate-50">
                <h3 className="text-base font-semibold text-slate-800 mb-4">Write a Review</h3>

                {/* Recommended / Not Recommended toggle */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => setMyVote(myVote === "up" ? null : "up")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition ${
                      myVote === "up"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl">👍</span> Recommended
                  </button>
                  <button
                    onClick={() => setMyVote(myVote === "down" ? null : "down")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition ${
                      myVote === "down"
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl">👎</span> Not Recommended
                  </button>
                </div>

                {/* Semester selector */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Semester taken</label>
                  <select
                    value={reviewSemester}
                    onChange={(e) => setReviewSemester(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    {SEMESTER_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Review text */}
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this course..."
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-white"
                />

                {submitError && (
                  <p className="text-xs text-red-500 mt-2">{submitError}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="mt-3 w-full bg-primary text-white py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
