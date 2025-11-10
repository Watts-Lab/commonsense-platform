const { feedbacks } = require("../models");
const { send_report } = require("./emails.js");
const { validationResult } = require("express-validator");
const xss = require("xss");

// Whitelist of allowed feedback types
const ALLOWED_TYPES = ["bug", "idea"];

async function saveFeedBack(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Additional validation
    const type = req.body.type.trim();
    let comment = req.body.comment.trim();

    // Validate type against whitelist
    if (!ALLOWED_TYPES.includes(type.toLowerCase())) {
      return res.status(400).json({
        error: "Invalid feedback type",
      });
    }

    // Extra XSS protection for email content
    comment = xss(comment, {
      whiteList: {}, // No HTML tags allowed
      stripIgnoreTag: true,
    });

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b)/gi,
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
    ];

    if (suspiciousPatterns.some((pattern) => pattern.test(comment))) {
      console.warn("Suspicious feedback attempt blocked:", {
        ip: req.session?.ip,
        sessionId: req.sessionID,
        type,
      });
      return res.status(400).json({
        error: "Invalid content detected",
      });
    }

    const feedbackData = {
      type,
      comment,
      sessionId: req.sessionID,
      ipAddress: req.session?.ip || "unknown",
      userAgent: req.headers["user-agent"] || "",
      createdAt: new Date(),
    };

    const answer = await feedbacks.create(feedbackData);

    // Send emails asynchronously (don't wait for them)
    Promise.all([
      send_report("markew@seas.upenn.edu", comment, type),
      send_report("amirhossein.nakhaei@rwth-aachen.de", comment, type),
    ]).catch((err) => console.error("Email sending failed:", err));

    res.json({ success: true, id: answer.id });
  } catch (error) {
    console.error("Feedback error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
}

module.exports = {
  saveFeedBack,
};
