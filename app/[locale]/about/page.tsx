import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FaCar, FaAward, FaBullseye, FaFlag } from 'react-icons/fa';

const AboutUsPage = () => {
  const t = useTranslations('AboutUs');

  return (
    <div className="bg-white text-gray-700">
      {/* Hero Section */}
      <div className="relative h-80 w-full">
        <Image
          src="/hero-bg.jpg"
          alt="Company background"
          layout="fill"
          objectFit="cover"
          className="opacity-90"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight shadow-lg">
            {t('title')}
          </h1>
        </div>
      </div>

      {/* Intro Section */}
      <div className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-secondary tracking-tight sm:text-4xl">
          {t('intro.company')}
          <span className="text-primary">{t('intro.pioneer')}</span>
        </h2>
        <p className="mt-6 text-xl text-gray-600">
          {t('intro.description')}
        </p>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <FaAward className="mx-auto h-12 w-12 text-primary" />
              <p className="mt-4 text-4xl font-bold text-secondary">60+</p>
              <p className="mt-2 text-lg font-medium text-gray-500">{t('stats.experience')}</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md">
              <FaCar className="mx-auto h-12 w-12 text-primary" />
              <p className="mt-4 text-4xl font-bold text-secondary">1,800+</p>
              <p className="mt-2 text-lg font-medium text-gray-500">{t('stats.vehicles')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission and Vision Section */}
      <div className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div className="prose lg:prose-lg">
            <h3 className="text-3xl font-bold text-secondary">{t('mission.title')}</h3>
            <p>{t('mission.text')}</p>
            <blockquote className="border-l-4 border-primary italic my-6 pl-4">
              <p>{t('quote')}</p>
            </blockquote>
          </div>
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <FaBullseye className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-xl font-bold text-secondary">{t('ourValues.quality.title')}</h4>
                <p className="mt-1 text-gray-600">{t('ourValues.quality.text')}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <FaFlag className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-xl font-bold text-secondary">{t('ourValues.modernization.title')}</h4>
                <p className="mt-1 text-gray-600">{t('ourValues.modernization.text')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Presence Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-secondary tracking-tight sm:text-4xl">{t('presence.title')}</h2>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600">
            {t('presence.text')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage; 