import { createContext, useContext, useReducer, useEffect } from 'react'
import { jobsData } from '../data/jobs'

const JobsContext = createContext()

const jobsReducer = (state, action) => {
  switch (action.type) {
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
        jobs: [action.payload, ...state.jobs],
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
  const [state, dispatch] = useReducer(jobsReducer, {
    jobs: [],
    loading: true,
    error: null
  })

  // Load jobs from localStorage or use default data
  useEffect(() => {
    const savedJobs = localStorage.getItem('jobs')
    if (savedJobs) {
      try {
        const parsedJobs = JSON.parse(savedJobs)
        dispatch({ type: 'LOAD_JOBS', payload: parsedJobs })
      } catch (error) {
        console.error('Error parsing saved jobs:', error)
        dispatch({ type: 'LOAD_JOBS', payload: jobsData })
      }
    } else {
      dispatch({ type: 'LOAD_JOBS', payload: jobsData })
    }
  }, [])

  // Save jobs to localStorage whenever jobs change
  useEffect(() => {
    if (state.jobs.length > 0) {
      localStorage.setItem('jobs', JSON.stringify(state.jobs))
    }
  }, [state.jobs])

  const addJob = async (jobData) => {
    dispatch({ type: 'ADD_JOB_START' })
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate new job with unique ID
      const newJob = {
        ...jobData,
        id: Date.now(), // Simple ID generation
        postedDate: new Date().toISOString().split('T')[0],
        status: 'Open',
        bidsReceived: 0,
        rating: 0
      }
      
      dispatch({ type: 'ADD_JOB_SUCCESS', payload: newJob })
      return { success: true, job: newJob }
    } catch (error) {
      dispatch({ type: 'ADD_JOB_ERROR', payload: error.message })
      return { success: false, error: error.message }
    }
  }

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