import { getSiteContent } from '@/lib/siteContent';
import { getLocale } from 'next-intl/server';

// Helper function to get multiple site content entries
async function getTermsSections() {
  const sectionKeys = [
    'terms-intro',
    'terms-short-rental-includes',
    'terms-short-rental-excludes', 
    'terms-long-rental-includes',
    'terms-long-rental-excludes',
    'terms-general-info',
    'terms-additional-services',
    'terms-payment-methods',
    'terms-company-info'
  ];

  const sections: Record<string, string> = {};
  
  for (const key of sectionKeys) {
    sections[key] = await getSiteContent(key) || '';
  }
  
  return sections;
}

const fallbackContent = {
  'terms-intro': 'All Rentals are subject to the Terms and Conditions printed on the Rental Agreement.',
  'terms-short-rental-includes': `<div class="insurance-section bg-gray-50 rounded-2xl p-6 my-4 border border-gray-200">
    <h4 class="font-semibold text-gray-700 mb-4">1. Full Insurance which covers:</h4>
    <ul class="space-y-2 mb-4">
      <li class="flex items-start"><span class="text-green-500 font-bold mr-3 mt-0.5">✓</span><span class="text-gray-600">Third Party</span></li>
      <li class="flex items-start"><span class="text-green-500 font-bold mr-3 mt-0.5">✓</span><span class="text-gray-600">Passengers</span></li>
      <li class="flex items-start"><span class="text-green-500 font-bold mr-3 mt-0.5">✓</span><span class="text-gray-600">Collision Damage Waiver (CDW)</span></li>
      <li class="flex items-start"><span class="text-green-500 font-bold mr-3 mt-0.5">✓</span><span class="text-gray-600">Accidental damage to rented vehicle with excess</span></li>
    </ul>
  </div>`,
  'terms-short-rental-excludes': `<ul class="space-y-3">
    <li class="flex items-start"><span class="text-red-500 font-bold mr-3 mt-0.5">×</span><span class="text-gray-700">Fuel</span></li>
    <li class="flex items-start"><span class="text-red-500 font-bold mr-3 mt-0.5">×</span><span class="text-gray-700">Additional requested items</span></li>
  </ul>`,
  'terms-long-rental-includes': `<div class="insurance-section bg-gray-50 rounded-2xl p-6 my-4 border border-gray-200">
    <h4 class="font-semibold text-gray-700 mb-4">1. Full Insurance with NO EXCESS which covers:</h4>
    <ul class="space-y-2">
      <li class="flex items-start"><span class="text-green-500 font-bold mr-3 mt-0.5">✓</span><span class="text-gray-600">Third Party</span></li>
      <li class="flex items-start"><span class="text-green-500 font-bold mr-3 mt-0.5">✓</span><span class="text-gray-600">Passengers</span></li>
    </ul>
  </div>`,
  'terms-long-rental-excludes': `<ul class="space-y-3">
    <li class="flex items-start"><span class="text-red-500 font-bold mr-3 mt-0.5">×</span><span class="text-gray-700">Fuel</span></li>
    <li class="flex items-start"><span class="text-red-500 font-bold mr-3 mt-0.5">×</span><span class="text-gray-700">Additional requested items</span></li>
  </ul>`,
  'terms-general-info': `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
    <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h4 class="font-semibold text-gray-900 mb-3 text-base">Prepayments:</h4>
      <p class="text-gray-600 text-sm leading-relaxed">For certain car groups, prepayment may be required.</p>
    </div>
  </div>`,
  'terms-additional-services': `<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
    <div class="bg-white p-5 rounded-xl flex justify-between items-center shadow-sm border border-gray-100">
      <span class="font-semibold text-gray-700">Additional services available</span>
    </div>
  </div>`,
  'terms-payment-methods': `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
    <div class="bg-white p-6 rounded-xl text-center shadow-md border border-gray-100">
      <h4 class="font-semibold text-gray-900 mb-3">Online Payments</h4>
      <p class="text-gray-600">We accept major credit cards</p>
    </div>
  </div>`,
  'terms-company-info': 'Andreas Petsas & Sons Public Ltd'
};

export default async function TermsAndConditionsPage() {
  const locale = await getLocale();
  const sections = await getTermsSections();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Modern Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Legal Information
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Please read these terms carefully before using our car rental services
            </p>
            <div className="mt-8 flex items-center justify-center text-blue-200">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Last updated: {new Date().toLocaleDateString('en-GB')}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-8 lg:p-12">
            
            {/* Introduction */}
            <div className="terms-intro bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mb-12 border border-gray-200 text-center">
              <p className="text-lg font-medium text-gray-700 mb-0">
                {sections['terms-intro'] || fallbackContent['terms-intro']}
              </p>
            </div>

            {/* Two Column Layout */}
            <div className="terms-grid grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              
              {/* Left Column - Rentals Less Than 7 Days */}
              <div className="terms-column bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-xl border border-gray-100 relative overflow-hidden" style={{borderTop: '4px solid #3b82f6'}}>
                <div className="terms-section">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200 relative">
                    For Rentals of Less Than 7 Days:
                    <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700"></span>
                  </h2>
                  
                  <div className="subsection mb-8">
                    <h3 className="text-lg font-semibold mb-4 px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 text-green-800 rounded-xl border border-green-200">Our Car Hire Prices INCLUDE:</h3>
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: sections['terms-short-rental-includes'] || fallbackContent['terms-short-rental-includes']
                      }} 
                    />
                  </div>

                  <div className="subsection">
                    <h3 className="text-lg font-semibold mb-4 px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 text-red-800 rounded-xl border border-red-200">Car Hire prices EXCLUDE:</h3>
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: sections['terms-short-rental-excludes'] || fallbackContent['terms-short-rental-excludes']
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Rentals 7 Days Plus */}
              <div className="terms-column bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-xl border border-gray-100 relative overflow-hidden" style={{borderTop: '4px solid #3b82f6'}}>
                <div className="terms-section">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200 relative">
                    For Rentals of 7 Days Plus:
                    <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700"></span>
                  </h2>
                  
                  <div className="subsection mb-8">
                    <h3 className="text-lg font-semibold mb-4 px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 text-green-800 rounded-xl border border-green-200">Our Car Hire Prices INCLUDE:</h3>
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: sections['terms-long-rental-includes'] || fallbackContent['terms-long-rental-includes']
                      }} 
                    />
                  </div>

                  <div className="subsection">
                    <h3 className="text-lg font-semibold mb-4 px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 text-red-800 rounded-xl border border-red-200">Car Hire prices EXCLUDE:</h3>
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: sections['terms-long-rental-excludes'] || fallbackContent['terms-long-rental-excludes']
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* General Information Section */}
            <div className="general-info bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 my-12 border border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200 relative">
                General Information
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700"></span>
              </h2>
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: sections['terms-general-info'] || fallbackContent['terms-general-info']
                }} 
              />
            </div>

            {/* Additional Services */}
            <div className="additional-services bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-8 my-12 border border-yellow-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200 relative">
                Available at Extra Cost
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-yellow-500 to-yellow-700"></span>
              </h2>
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: sections['terms-additional-services'] || fallbackContent['terms-additional-services']
                }} 
              />
            </div>

            {/* Payment Methods */}
            <div className="payment-methods bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 my-12 border border-purple-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200 relative">
                Methods of Payment
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-purple-500 to-purple-700"></span>
              </h2>
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: sections['terms-payment-methods'] || fallbackContent['terms-payment-methods']
                }} 
              />
            </div>
          </div>
        </div>

        {/* Company Info Footer */}
        <div className="mt-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {sections['terms-company-info'] ? sections['terms-company-info'].split(' - ')[0] : 'Andreas Petsas & Sons Public Ltd'}
            </h3>
            {sections['terms-company-info'] && (
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                {sections['terms-company-info'].split(' - ').slice(1).map((info, index) => (
                  <span key={index}>{info}</span>
                ))}
              </div>
            )}
            <p className="mt-4 text-xs text-gray-500">
              These terms and conditions are governed by the laws of Cyprus
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 
 
 