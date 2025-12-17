import { getApiBaseUrlDynamic } from '../config/api';

const jobService = {
  // Create a new job
  async createJob(jobData, user) {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobData, user }),
      });
      
      // Handle network errors or non-JSON responses
      if (!response.ok) {
        let errorMessage = 'Failed to create job';
        try {
          const result = await response.json();
          errorMessage = result.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        return { success: false, error: errorMessage };
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating job:', error);
      // Provide more helpful error messages
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        const currentUrl = getApiBaseUrlDynamic();
        const port = currentUrl.match(/:(\d+)/)?.[1] || '3002';
        return { 
          success: false, 
          error: `Unable to connect to server at ${currentUrl}. Please ensure the backend server is running on port ${port}.` 
        };
      }
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  // Get all jobs
  async getAllJobs() {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'N/A';
      const currentUrl = typeof window !== 'undefined' ? window.location.href : 'N/A';
      console.log('=== JOB FETCH DEBUG ===');
      console.log('Current page URL:', currentUrl);
      console.log('Current hostname:', currentHostname);
      console.log('API URL being used:', API_BASE_URL);
      console.log('Fetching jobs from:', `${API_BASE_URL}/jobs`);
      console.log('========================');
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Jobs response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch jobs. Status:', response.status, 'Response:', errorText);
        throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
      }
      
      const jobs = await response.json();
      console.log('Jobs fetched successfully:', jobs.length, 'jobs');
      return Array.isArray(jobs) ? jobs : [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      const API_BASE_URL = getApiBaseUrlDynamic();
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        API_BASE_URL,
        currentHostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A'
      });
      // Return empty array but log the error clearly
      return [];
    }
  },

  // Get job by ID
  async getJobById(jobId) {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
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
      const API_BASE_URL = getApiBaseUrlDynamic();
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
      const API_BASE_URL = getApiBaseUrlDynamic();
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
      const API_BASE_URL = getApiBaseUrlDynamic();
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