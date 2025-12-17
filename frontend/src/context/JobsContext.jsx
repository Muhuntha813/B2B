import { createContext, useContext, useReducer, useEffect } from 'react'
import { jobsData } from '../data/jobs'
import jobService from '../services/jobService'
import { useAuth } from '../contexts/AuthContext'

const JobsContext = createContext()

const jobsReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_JOBS_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case 'LOAD_JOBS':
      return {
        ...state,
        jobs: action.payload,
        loading: false,
        error: null
      }
    
    case 'ADD_JOB_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case 'ADD_JOB_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null
      }
    
    case 'ADD_JOB_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    
    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(job =>
          job.id === action.payload.id ? action.payload : job
        )
      }
    
    case 'DELETE_JOB':
      return {
        ...state,
        jobs: state.jobs.filter(job => job.id !== action.payload)
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      }
    
    default:
      return state
  }
}

export const JobsProvider = ({ children }) => {
  const cached = (() => {
    try {
      const raw = localStorage.getItem('jobsCache')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })()

  const [state, dispatch] = useReducer(jobsReducer, {
    jobs: cached,
    loading: true,
    error: null
  })

  // Load jobs from database
  const loadJobs = async () => {
    dispatch({ type: 'LOAD_JOBS_START' });
    try {
      const jobs = await jobService.getAllJobs();
      dispatch({ type: 'LOAD_JOBS', payload: jobs });
      try { localStorage.setItem('jobsCache', JSON.stringify(jobs)) } catch {}
    } catch (error) {
      console.error('Failed to load jobs:', error);
      // Do NOT wipe existing jobs; keep current state and surface error
      dispatch({ type: 'SET_ERROR', payload: 'Unable to load jobs. Showing cached results.' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  // Refresh when document becomes visible again
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        loadJobs()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  const addJob = async (jobData, user) => {
    if (!user) {
      dispatch({ type: 'ADD_JOB_ERROR', payload: 'User must be logged in to post jobs' });
      return { success: false, error: 'User must be logged in to post jobs' };
    }

    try {
      dispatch({ type: 'ADD_JOB_START' });
      
      const result = await jobService.createJob(jobData, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email
      });
      
      if (result.success) {
        // Reload jobs to get the updated list
        loadJobs();
        dispatch({ type: 'ADD_JOB_SUCCESS' });
        // Update cache optimistically
        try {
          const refreshed = await jobService.getAllJobs()
          localStorage.setItem('jobsCache', JSON.stringify(refreshed))
        } catch {}
        return { success: true, jobId: result.jobId };
      } else {
        dispatch({ type: 'ADD_JOB_ERROR', payload: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error adding job:', error);
      dispatch({ type: 'ADD_JOB_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const updateJob = (jobId, updates) => {
    const updatedJob = state.jobs.find(job => job.id === jobId)
    if (updatedJob) {
      dispatch({ 
        type: 'UPDATE_JOB', 
        payload: { ...updatedJob, ...updates } 
      })
    }
  }

  const deleteJob = (jobId) => {
    dispatch({ type: 'DELETE_JOB', payload: jobId })
  }

  const getJobById = (jobId) => {
    return state.jobs.find(job => job.id === parseInt(jobId))
  }

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null })
  }

  return (
    <JobsContext.Provider value={{
      jobs: state.jobs,
      loading: state.loading,
      error: state.error,
      addJob,
      updateJob,
      deleteJob,
      getJobById,
      clearError
    }}>
      {children}
    </JobsContext.Provider>
  )
}

export const useJobs = () => {
  const context = useContext(JobsContext)
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider')
  }
  return context
}

export { JobsContext }