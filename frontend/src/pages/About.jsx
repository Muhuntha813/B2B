import { Link } from 'react-router-dom'

const About = () => {
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About B2B Plastics
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              Connecting the plastics industry through innovative B2B solutions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/contact" 
                className="btn btn-white"
              >
                Get in Touch
              </Link>
              <Link 
                to="/machinery" 
                className="btn btn-outline-white"
              >
                Explore Machinery
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Company Overview */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-text-primary mb-6">
                Our Story
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-text-secondary mb-6">
                  <strong>[TBD - Company founding story and mission]</strong> B2B Plastics was founded with a vision to revolutionize the plastics industry by creating a comprehensive platform that connects manufacturers, suppliers, and service providers across the entire value chain.
                </p>
                <p className="text-text-secondary mb-6">
                  <strong>[TBD - Market position and growth]</strong> Since our inception, we have grown to become a leading marketplace for plastics machinery, materials, manpower, and mould design services, serving thousands of businesses worldwide.
                </p>
                <p className="text-text-secondary">
                  <strong>[TBD - Future vision]</strong> Our platform continues to evolve, incorporating cutting-edge technology to streamline operations, reduce costs, and foster innovation within the plastics manufacturing ecosystem.
                </p>
              </div>
            </div>

            {/* Services Grid */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                What We Offer
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="card text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    Machinery
                  </h3>
                  <p className="text-text-secondary">
                    <strong>[TBD]</strong> Industrial-grade plastic manufacturing equipment from trusted suppliers worldwide.
                  </p>
                </div>

                <div className="card text-center">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    Materials
                  </h3>
                  <p className="text-text-secondary">
                    <strong>[TBD]</strong> High-quality raw materials and compounds for all your manufacturing needs.
                  </p>
                </div>

                <div className="card text-center">
                  <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    Manpower
                  </h3>
                  <p className="text-text-secondary">
                    <strong>[TBD]</strong> Skilled professionals and technical experts for your projects and operations.
                  </p>
                </div>

                <div className="card text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    Mould Design
                  </h3>
                  <p className="text-text-secondary">
                    <strong>[TBD]</strong> Custom mould design and manufacturing services from experienced professionals.
                  </p>
                </div>
              </div>
            </div>

            {/* Values Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                Our Values
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    Quality First
                  </h3>
                  <p className="text-text-secondary">
                    <strong>[TBD]</strong> We ensure all products and services meet the highest industry standards.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    Innovation
                  </h3>
                  <p className="text-text-secondary">
                    <strong>[TBD]</strong> Continuously improving our platform with cutting-edge technology.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    Trust
                  </h3>
                  <p className="text-text-secondary">
                    <strong>[TBD]</strong> Building lasting relationships through transparency and reliability.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-background-secondary rounded-xl p-8">
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-text-secondary mb-6">
                <strong>[TBD]</strong> Join thousands of businesses already using our platform to streamline their operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/contact" 
                  className="btn btn-primary"
                >
                  Contact Us
                </Link>
                <Link 
                  to="/machinery" 
                  className="btn btn-outline"
                >
                  Browse Marketplace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About