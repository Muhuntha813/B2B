import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJobs } from '../context/JobsContext'

const PostJob = () => {
  const navigate = useNavigate()
  const { addJob, loading, error, clearError } = useJobs()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    material: '',
    quantity: '',
    budget: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    requirements: [''],
    specifications: {
      dimensions: '',
      tolerance: '',
      finish: '',
      color: '',
      packaging: ''
    }
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const categories = [
    'Injection Molding',
    'Blow Molding',
    'Extrusion',
    'Thermoforming',
    'Rotomolding',
    'Custom Manufacturing'
  ]

  const materials = [
    'HDPE', 'LDPE', 'PP', 'PVC', 'ABS', 'PS', 'PC', 'PET', 'PMMA', 'Other'
  ]

  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Hyderabad', 'Other'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...formData.requirements]
    newRequirements[index] = value
    setFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }))
  }

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }))
  }

  const removeRequirement = (index) => {
    if (formData.requirements.length > 1) {
      const newRequirements = formData.requirements.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        requirements: newRequirements
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form data
    if (!isStepValid()) {
      setSubmitError('Please fill in all required fields')
      return
    }
    
    setIsSubmitting(true)
    setSubmitError('')
    clearError()
    
    try {
      // Prepare job data for submission
      const jobData = {
        title: formData.title,
        category: formData.category,
        material: formData.material,
        quantity: parseInt(formData.quantity),
        unit: 'pieces', // Default unit
        budget: parseInt(formData.budget),
        location: formData.location,
        client: 'Your Company', // This would come from user profile
        deadline: formData.endDate,
        description: formData.description,
        requirements: {
          material: formData.material,
          tolerance: formData.specifications.tolerance || 'Standard',
          surfaceFinish: formData.specifications.finish || 'Standard',
          packaging: formData.specifications.packaging || 'Standard'
        },
        specifications: formData.requirements.filter(req => req.trim() !== ''),
        estimatedDuration: calculateEstimatedDuration(formData.startDate, formData.endDate)
      }
      
      const result = await addJob(jobData)
      
      if (result.success) {
        // Show success message
        alert('Job posted successfully!')
        navigate('/jobs')
      } else {
        setSubmitError(result.error || 'Failed to post job')
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred')
      console.error('Error posting job:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const calculateEstimatedDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return '30 days'
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return `${diffDays} days`
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.category && formData.material && formData.quantity
      case 2:
        return formData.budget && formData.location && formData.startDate && formData.endDate
      case 3:
        return formData.description && formData.requirements[0]
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Post a New Job</h1>
          <p className="text-gray-600">Find the right manufacturer for your plastic production needs</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? (
                    <i className="fas fa-check"></i>
                  ) : (
                    step
                  )}
                </div>
                {step < totalSteps && (
                  <div className={`flex-1 h-1 mx-4 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Basic Info</span>
            <span>Project Details</span>
            <span>Requirements</span>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Custom Plastic Bottles Manufacturing"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material *
                    </label>
                    <select
                      name="material"
                      value={formData.material}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Material</option>
                      {materials.map(material => (
                        <option key={material} value={material}>{material}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 10,000 pieces, 500 kg"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Project Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Project Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget (INR) *
                    </label>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your budget"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Location</option>
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Technical Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dimensions
                      </label>
                      <input
                        type="text"
                        name="specifications.dimensions"
                        value={formData.specifications.dimensions}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 100mm x 50mm x 20mm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tolerance
                      </label>
                      <input
                        type="text"
                        name="specifications.tolerance"
                        value={formData.specifications.tolerance}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., ±0.1mm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Surface Finish
                      </label>
                      <input
                        type="text"
                        name="specifications.finish"
                        value={formData.specifications.finish}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Glossy, Matte, Textured"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color
                      </label>
                      <input
                        type="text"
                        name="specifications.color"
                        value={formData.specifications.color}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., White, Black, Transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Requirements */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Project Requirements</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your project in detail..."
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements *
                  </label>
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => handleRequirementChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Requirement ${index + 1}`}
                        required={index === 0}
                      />
                      {formData.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <i className="fas fa-plus mr-1"></i>
                    Add Requirement
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Packaging Requirements
                  </label>
                  <input
                    type="text"
                    name="specifications.packaging"
                    value={formData.specifications.packaging}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Individual boxes, Bulk packaging"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepValid() || isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>
                      Post Job
                    </>
                  )}
                </button>
              )}
            </div>
            
            {/* Error Display */}
            {(submitError || error) && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                  <p className="text-red-700">{submitError || error}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Help Section */}
        <div className="max-w-3xl mx-auto mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              <i className="fas fa-lightbulb mr-2"></i>
              Tips for a Successful Job Post
            </h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Be specific about your requirements and expectations</li>
              <li>• Include detailed technical specifications</li>
              <li>• Set a realistic budget and timeline</li>
              <li>• Provide clear project descriptions</li>
              <li>• Respond promptly to manufacturer inquiries</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostJob