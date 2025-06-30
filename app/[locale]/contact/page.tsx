import { useTranslations } from 'next-intl';
import { FaPhone, FaFax, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const ContactUsPage = () => {
  const t = useTranslations('ContactUs');

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative h-64 md:h-80 w-full bg-cover bg-center" style={{ backgroundImage: "url('/hero-bg.jpg')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wider">
            {t('title')}
          </h1>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('officeTitle')}</h2>
            <div className="space-y-4 text-gray-600">
              <p className="flex items-start">
                <FaMapMarkerAlt className="h-6 w-6 text-primary mt-1 mr-4" />
                <span>{t('address')}</span>
              </p>
              <p className="flex items-center">
                <FaPhone className="h-5 w-5 text-primary mr-4" />
                <span>{t('phone')}</span>
              </p>
              <p className="flex items-center">
                <FaFax className="h-5 w-5 text-primary mr-4" />
                <span>{t('fax')}</span>
              </p>
              <p className="flex items-center">
                <FaEnvelope className="h-5 w-5 text-primary mr-4" />
                <a href={`mailto:${t('email1')}`} className="hover:text-primary transition">{t('email1')}</a>
              </p>
               <p className="flex items-center ml-9">
                <a href={`mailto:${t('email2')}`} className="hover:text-primary transition">{t('email2')}</a>
              </p>
            </div>
            <p className="mt-8 text-gray-600">
              {t('viewLocationsPrompt.text')}
              <a href="/locations" className="text-primary font-semibold hover:underline ml-1">
                {t('viewLocationsPrompt.link')}
              </a>
            </p>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('formTitle')}</h2>
            <form action="#" method="POST" className="space-y-6">
              <div>
                <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">{t('form.fullName')}</label>
                <input type="text" name="full-name" id="full-name" autoComplete="name" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('form.email')}</label>
                <input type="email" name="email" id="email" autoComplete="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('form.phone')}</label>
                <input type="text" name="phone" id="phone" autoComplete="tel" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">{t('form.message')}</label>
                <textarea id="message" name="message" rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"></textarea>
              </div>
              <div className="flex justify-end space-x-4">
                <button type="button" className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                  {t('form.clear')}
                </button>
                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                  {t('form.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage; 