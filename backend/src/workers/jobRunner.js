const { GenerationJob, Submission } = require('../models/Submission');
const { callAIProvider } = require('../services/aiProvider');
const { broadcastToRoom } = require('../socket/socketManager');

const JOB_TIMEOUT_MS = 45_000; // 45 seconds

/**
 * Runs the AI generation job asynchronously.
 * This function is intentionally NOT awaited by the HTTP route handler.
 * It manages its own lifecycle: queued → running → completed | failed | timed_out
 */
async function runGenerationJob(jobId, submissionId, roomId) {
  let job;
  let submission;

  try {
    // Load records
    job = await GenerationJob.findById(jobId);
    submission = await Submission.findById(submissionId);

    if (!job || !submission) {
      console.error(`Job/Submission not found: job=${jobId}, sub=${submissionId}`);
      return;
    }

    // ── RUNNING ──────────────────────────────────────────────
    job.status = 'running';
    job.startedAt = new Date();
    await job.save();

    submission.status = 'running';
    await submission.save();

    broadcastToRoom(roomId, {
      event: 'job_status_changed',
      submissionId: submission._id,
      jobId: job._id,
      participantName: submission.participantName,
      userPrompt: submission.userPrompt,
      status: 'running',
    });

    console.log(`⚙️  Job ${jobId} running for submission ${submissionId}`);

    // ── AI CALL (with timeout) ────────────────────────────────
    const aiOutput = await Promise.race([
      callAIProvider(submission.userPrompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), JOB_TIMEOUT_MS)
      ),
    ]);

    // ── COMPLETED ────────────────────────────────────────────
    job.status = 'completed';
    job.completedAt = new Date();
    await job.save();

    submission.status = 'completed';
    submission.aiOutput = aiOutput;
    await submission.save();

    broadcastToRoom(roomId, {
      event: 'job_status_changed',
      submissionId: submission._id,
      jobId: job._id,
      participantName: submission.participantName,
      userPrompt: submission.userPrompt,
      status: 'completed',
      aiOutput,
    });

    console.log(`✅ Job ${jobId} completed`);

  } catch (err) {
    const isTimeout = err.message === 'TIMEOUT';
    const status = isTimeout ? 'timed_out' : 'failed';
    const errorMessage = isTimeout
      ? 'AI generation timed out (45s). Host can trigger a retry.'
      : err.message || 'Unknown error during generation';

    console.error(`❌ Job ${jobId} ${status}:`, errorMessage);

    try {
      if (job) {
        job.status = status;
        job.errorMessage = errorMessage;
        job.completedAt = new Date();
        await job.save();
      }

      if (submission) {
        submission.status = status;
        await submission.save();
      }

      broadcastToRoom(roomId, {
        event: 'job_status_changed',
        submissionId: submission?._id,
        jobId: job?._id,
        participantName: submission?.participantName,
        userPrompt: submission?.userPrompt,
        status,
        error: errorMessage,
      });
    } catch (saveErr) {
      console.error('Failed to save job error state:', saveErr);
    }
  }
}

module.exports = { runGenerationJob };
