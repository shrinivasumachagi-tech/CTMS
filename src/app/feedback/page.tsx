"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import PageHeader from "@/components/ui/PageHeader"
import {
  Star,
  Send,
  CheckCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { motion } from "framer-motion"

interface RatingStarsProps {
  rating: number
  onRate: (rating: number) => void
  size?: "sm" | "md" | "lg"
}

function RatingStars({ rating, onRate, size = "md" }: RatingStarsProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            )}
          />
        </button>
      ))}
    </div>
  )
}

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false)
  const [issueResolved, setIssueResolved] = useState<boolean | null>(null)
  const [responseQuality, setResponseQuality] = useState(0)
  const [resolutionSpeed, setResolutionSpeed] = useState(0)
  const [overallSatisfaction, setOverallSatisfaction] = useState(0)
  const [comment, setComment] = useState("")

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const isFormValid =
    issueResolved !== null &&
    responseQuality > 0 &&
    resolutionSpeed > 0 &&
    overallSatisfaction > 0

  if (submitted) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#3B4252] mb-2">
              Thank You!
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Your feedback helps us improve our service. We appreciate you taking
              the time to share your thoughts.
            </p>
          </motion.div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Feedback"
          description="Help us improve by sharing your experience"
        />

        <div className="grid gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#D8DDE3] p-6"
          >
            <h3 className="text-lg font-semibold text-[#3B4252] mb-4">
              Was your issue resolved?
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => setIssueResolved(true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                  issueResolved === true
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
                Yes
              </button>
              <button
                onClick={() => setIssueResolved(false)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                  issueResolved === false
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <ThumbsDown className="h-5 w-5" />
                No
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-[#D8DDE3] p-6"
          >
            <h3 className="text-lg font-semibold text-[#3B4252] mb-2">
              Response Quality
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              How would you rate the quality of the response you received?
            </p>
            <RatingStars rating={responseQuality} onRate={setResponseQuality} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-[#D8DDE3] p-6"
          >
            <h3 className="text-lg font-semibold text-[#3B4252] mb-2">
              Resolution Speed
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              How satisfied are you with how quickly your issue was resolved?
            </p>
            <RatingStars rating={resolutionSpeed} onRate={setResolutionSpeed} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-[#D8DDE3] p-6"
          >
            <h3 className="text-lg font-semibold text-[#3B4252] mb-2">
              Overall Satisfaction
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              How satisfied are you with your overall experience?
            </p>
            <RatingStars
              rating={overallSatisfaction}
              onRate={setOverallSatisfaction}
              size="lg"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-[#D8DDE3] p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-[#3B4252]" />
              <h3 className="text-lg font-semibold text-[#3B4252]">
                Additional Comments
              </h3>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share any additional feedback or suggestions..."
              rows={4}
              className="w-full px-4 py-3 border border-[#D8DDE3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B4252] focus:border-transparent resize-none text-sm"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end"
          >
            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                isFormValid
                  ? "bg-[#3B4252] text-white hover:bg-[#2E3440]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Send className="h-4 w-4" />
              Submit Feedback
            </button>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
