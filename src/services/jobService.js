const API_BASE_URL = 'http://localhost:3001/api';

const jobService = {
  // Create a new job
  async createJob(jobData, user) {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobData, user }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create job');
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating job:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all jobs
  async getAllJobs() {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const jobs = await response.json();
      return jobs;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  },

  // Get job by ID
  async getJobById(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch job');
      }
      
      const job = await response.json();
      return job;
    } catch (error) {
      console.error('Error fetching job:', error);
      return null;
    }
  },

  // Get jobs by user
  async getJobsByUser(firebaseUid) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/jobs`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user jobs');
      }
      
      const jobs = await response.json();
      return jobs;
    } catch (error) {
      console.error('Error fetching user jobs:', error);
      return [];
    }
  },

  // Update job
  async updateJob(jobId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update job');
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating job:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete job
  async deleteJob(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting job:', error);
      return { success: false, error: error.message };
    }
  }
};

export default jobService