'use client';

import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { createSiteContent } from './actions';
import EditContentModal from './EditContentModal';

interface SiteContent {
  id: string;
  key: string;
  type: string;
  value: string;
  altText: string | null;
  linkUrl: string | null;
  group: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SiteContentClientProps {
  contentItems: SiteContent[];
}

export default function SiteContentClient({ contentItems }: SiteContentClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SiteContent | null>(null);

  const groupedContent = contentItems.reduce((acc: Record<string, SiteContent[]>, item: SiteContent) => {
    (acc[item.group] = acc[item.group] || []).push(item);
    return acc;
  }, {});

  const handleEdit = (item: SiteContent) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const initializeContent = async () => {
    // This is a temporary function to create the initial data since seeding failed.
    const initialContent = [
      { key: 'home_hero_image', type: 'image', value: '/hero-bg.jpg', altText: 'A scenic view of the Cyprus coast', group: 'Homepage', linkUrl: null },
      { key: 'promo_banner_1', type: 'image', value: '/10discountbanner.jpg', altText: '10% discount promotion banner', group: 'Promotions', linkUrl: '/promotions/10-percent-off' },
      { key: 'promo_banner_2', type: 'image', value: '/15discountbanner.jpg', altText: '15% discount promotion banner', group: 'Promotions', linkUrl: '/promotions/15-percent-off' },
      { key: 'why_buy_banner', type: 'image', value: '/whybuybanner.jpg', altText: 'Banner explaining the benefits of choosing Petsas', group: 'Homepage', linkUrl: '/about' },
      { key: 'locations_map', type: 'image', value: '/offices_map.jpg', altText: 'Map of Petsas offices across Cyprus', group: 'Locations', linkUrl: '/locations' },
      { key: 'terms-intro', type: 'richtext', value: 'All Rentals are subject to the Terms and Conditions printed on the Rental Agreement.', altText: 'Terms Introduction', group: 'Legal', linkUrl: null },
      { key: 'terms-short-rental-includes', type: 'richtext', value: '<div class="insurance-section bg-gray-50 rounded-2xl p-6 my-4 border border-gray-200"><h4 class="font-semibold text-gray-700 mb-4">1. Full Insurance which covers:</h4><ul class="space-y-2 mb-4"><li class="flex items-start"><span class="text-green-500 font-bold mr-3 mt-0.5">✓</span><span class="text-gray-600">Third Party</span></li><li class="flex items-start"><span class="text-green-500 font-bold mr-3 mt-0.5">✓</span><span class="text-gray-600">Passengers</span></li><li class="flex items-start"><span class="text-green-500 font-bold mr-3 mt-0.5">✓</span><span class="text-gray-600">Collision Damage Waiver (CDW)</span></li><li class="flex items-start"><span class="text-green-500 font-bold mr-3 mt-0.5">✓</span><span class="text-gray-600">Accidental damage to rented vehicle with excess</span></li></ul></div>', altText: 'Short Rental Includes', group: 'Legal', linkUrl: null },
      { key: 'terms-short-rental-excludes', type: 'richtext', value: '<ul class="space-y-3"><li class="flex items-start"><span class="text-red-500 font-bold mr-3 mt-0.5">×</span><span class="text-gray-700">Fuel</span></li><li class="flex items-start"><span class="text-red-500 font-bold mr-3 mt-0.5">×</span><span class="text-gray-700">Additional requested items</span></li></ul>', altText: 'Short Rental Excludes', group: 'Legal', linkUrl: null },
      { key: 'terms-long-rental-includes', type: 'richtext', value: '<div class="insurance-section bg-gray-50 rounded-2xl p-6 my-4 border border-gray-200"><h4 class="font-semibold text-gray-700 mb-4">1. Full Insurance with NO EXCESS which covers:</h4><ul class="space-y-2"><li class="flex items-start"><span class="text-green-500 font-bold mr-3 mt-0.5">✓</span><span class="text-gray-600">Third Party</span></li><li class="flex items-start"><span class="text-green-500 font-bold mr-3 mt-0.5">✓</span><span class="text-gray-600">Passengers</span></li></ul></div>', altText: 'Long Rental Includes', group: 'Legal', linkUrl: null },
      { key: 'terms-long-rental-excludes', type: 'richtext', value: '<ul class="space-y-3"><li class="flex items-start"><span class="text-red-500 font-bold mr-3 mt-0.5">×</span><span class="text-gray-700">Fuel</span></li><li class="flex items-start"><span class="text-red-500 font-bold mr-3 mt-0.5">×</span><span class="text-gray-700">Additional requested items</span></li></ul>', altText: 'Long Rental Excludes', group: 'Legal', linkUrl: null },
      { key: 'terms-general-info', type: 'richtext', value: '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"><div class="bg-white p-6 rounded-xl shadow-md border border-gray-100"><h4 class="font-semibold text-gray-900 mb-3 text-base">Prepayments:</h4><p class="text-gray-600 text-sm leading-relaxed">For certain car groups, prepayment may be required.</p></div></div>', altText: 'General Information', group: 'Legal', linkUrl: null },
      { key: 'terms-additional-services', type: 'richtext', value: '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6"><div class="bg-white p-5 rounded-xl flex justify-between items-center shadow-sm border border-gray-100"><span class="font-semibold text-gray-700">Additional services available</span></div></div>', altText: 'Additional Services', group: 'Legal', linkUrl: null },
      { key: 'terms-payment-methods', type: 'richtext', value: '<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"><div class="bg-white p-6 rounded-xl text-center shadow-md border border-gray-100"><h4 class="font-semibold text-gray-900 mb-3">Online Payments</h4><p class="text-gray-600">We accept major credit cards</p></div></div>', altText: 'Payment Methods', group: 'Legal', linkUrl: null },
      { key: 'terms-company-info', type: 'richtext', value: 'Andreas Petsas & Sons Public Ltd', altText: 'Company Information', group: 'Legal', linkUrl: null },
      { key: 'terms-and-conditions', type: 'richtext', value: '<h1>Terms and Conditions</h1><h2>1. Introduction</h2><p>Welcome to Petsas Car Rental. These terms and conditions outline the rules and regulations for the use of our car rental services.</p><h2>2. Rental Agreement</h2><p>By renting a vehicle from us, you agree to comply with all terms and conditions set forth in this agreement.</p><h2>3. Driver Requirements</h2><p>All drivers must be at least 21 years old and possess a valid driving license for a minimum of 1 year.</p><h2>4. Vehicle Use</h2><p>The rented vehicle must be used in accordance with traffic laws and regulations of Cyprus.</p><h2>5. Insurance</h2><p>Comprehensive insurance is included with all rentals of 7 days or more, with unlimited mileage.</p><h2>6. Damage and Liability</h2><p>The renter is responsible for any damage to the vehicle during the rental period.</p><h2>7. Contact Information</h2><p>For any questions or concerns, please contact us at our offices in Nicosia, Limassol, Paphos, Ayia Napa, or at Larnaca and Paphos International Airports.</p>', altText: 'Terms and Conditions', group: 'Legal', linkUrl: null },
    ];
    
    for (const item of initialContent) {
        const formData = new FormData();
        formData.append('key', item.key);
        formData.append('type', item.type);
        formData.append('value', item.value);
        formData.append('altText', item.altText);
        formData.append('group', item.group);
        if (item.linkUrl) formData.append('linkUrl', item.linkUrl);
        await createSiteContent(formData);
    }
  };

  // Custom ordering for Terms content to match frontend layout
  const orderTermsContent = (items: SiteContent[]) => {
    const termsOrder = [
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
    
    const termsItems = items.filter(item => item.key.startsWith('terms-'));
    const nonTermsItems = items.filter(item => !item.key.startsWith('terms-'));
    
    const orderedTerms = termsOrder
      .map(key => termsItems.find(item => item.key === key))
      .filter((item): item is SiteContent => item !== undefined);
    
    return [...orderedTerms, ...nonTermsItems];
  };

  // Get section info for terms content
  const getTermsSectionInfo = (key: string) => {
    const sectionMap = {
      'terms-intro': { number: '1', title: 'Introduction', description: 'Main intro text at the top' },
      'terms-short-rental-includes': { number: '2a', title: 'Short Rentals - INCLUDES', description: 'What\'s included for rentals under 7 days' },
      'terms-short-rental-excludes': { number: '2b', title: 'Short Rentals - EXCLUDES', description: 'What\'s excluded for rentals under 7 days' },
      'terms-long-rental-includes': { number: '3a', title: 'Long Rentals - INCLUDES', description: 'What\'s included for rentals 7+ days' },
      'terms-long-rental-excludes': { number: '3b', title: 'Long Rentals - EXCLUDES', description: 'What\'s excluded for rentals 7+ days' },
      'terms-general-info': { number: '4', title: 'General Information', description: 'Cards with general rental info' },
      'terms-additional-services': { number: '5', title: 'Additional Services', description: 'Available at extra cost section' },
      'terms-payment-methods': { number: '6', title: 'Payment Methods', description: 'Methods of payment section' },
      'terms-company-info': { number: '7', title: 'Company Information', description: 'Footer company details' }
    };
    return sectionMap[key as keyof typeof sectionMap] || null;
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Site Content Management</h1>
        <div>
          {contentItems.length === 0 && (
            <button
              onClick={initializeContent}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 mr-2"
            >
              <FaPlus />
              <span>Initialize Content</span>
            </button>
          )}
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add New Content</span>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedContent).map(([group, items]) => (
          <div key={group} className="mb-8">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{group}</h2>
              <span className="ml-3 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {group === 'Legal' && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-sm font-medium text-blue-800">Terms & Conditions Sections</h3>
                </div>
                <p className="text-sm text-blue-700">
                  These sections appear on your Terms & Conditions page in the exact order shown below.
                  Each section is numbered to match the page layout.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(group === 'Legal' ? orderTermsContent(items) : items).map((item) => {
                const sectionInfo = getTermsSectionInfo(item.key);
                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {sectionInfo && (
                          <div className="flex items-center mb-3">
                            <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-800 text-sm font-bold rounded-full mr-3">
                              {sectionInfo.number}
                            </span>
                            <span className="text-sm font-semibold text-blue-800">{sectionInfo.title}</span>
                          </div>
                        )}
                        <h3 className="font-semibold text-gray-900 text-base mb-2">{item.key}</h3>
                        {sectionInfo && (
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{sectionInfo.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mb-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            item.type === 'richtext' ? 'bg-green-100 text-green-800' :
                            item.type === 'image' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.type === 'richtext' ? '📝 Rich Text' : 
                             item.type === 'image' ? '🖼️ Image' : '📄 Text'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      {item.type === 'image' ? (
                        <div className="space-y-2">
                          <img 
                            src={item.value} 
                            alt={item.altText || 'Content image'} 
                            className="w-full h-32 object-cover rounded-lg border shadow-sm"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.jpg';
                            }}
                          />
                          <div className="text-xs text-gray-500 text-center">
                            Preview: {item.altText || 'No description'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded border max-h-20 overflow-hidden">
                          {item.value.length > 150 ? 
                            item.value.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 
                            item.value.replace(/<[^>]*>/g, '')
                          }
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
                      >
                        Edit Content
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {contentItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No site content has been defined yet.</p>
            <p className="text-gray-400 text-sm mt-2">Click the "Initialize Content" button to create the default entries.</p>
          </div>
        )}
      </div>
      
      {modalOpen && (
        <EditContentModal
          item={selectedItem}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
} 
 