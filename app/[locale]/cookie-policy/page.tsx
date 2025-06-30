import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - Petsas Car Rentals',
  description: 'Cookie Policy for Petsas Car Rentals - How we use cookies and similar technologies on our website.',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">What Are Cookies</h2>
            <p className="mb-6">
              As is common practice with almost all professional websites, our site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience.
            </p>
            
            <p className="mb-6">
              This document describes what information they gather, how we use it and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or 'break' certain elements of the sites functionality.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">How We Use Cookies</h2>
            <p className="mb-6">
              We use cookies for a variety of reasons detailed below. Unfortunately, in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to the site. It is recommended that you leave on all cookies if you are not sure whether you need them or not, in case they are used to provide a service that you use.
            </p>
            
            <p className="mb-4">
              The types of cookies used on this website can be classified into one of three categories:
            </p>
            
            <ol className="list-decimal list-inside mb-6 space-y-4">
              <li>
                <strong>Strictly Necessary Cookies.</strong> These are essential in order to enable you to use certain features of the website, such as submitting forms on the website.
              </li>
              <li>
                <strong>Functionality Cookies.</strong> These are used to allow the website to remember choices you make (such as your language) and provide enhanced features to improve your web experience.
              </li>
              <li>
                <strong>Analytical / Navigation Cookies.</strong> These cookies enable the site to function correctly and are used to gather information about how visitors use the site. This information is used to compile reports and help us to improve the site. Cookies gather information in anonymous form, including the number of visitors to the site, where visitors came from and the pages they viewed.
              </li>
            </ol>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Disabling Cookies</h2>
            <p className="mb-6">
              You can prevent the setting of cookies by adjusting the settings on your browser (see your browser's "Help" option on how to do this). Be aware that disabling cookies may affect the functionality of this and many other websites that you visit. Therefore, it is recommended that you do not disable cookies.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Third Party Cookies</h2>
            <p className="mb-6">
              In some special cases we also use cookies provided by trusted third parties. Our site uses Google Analytics which is one of the most widespread and trusted analytics solution on the web for helping us to understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit so that we can continue to produce engaging content. For more information on Google Analytics cookies, see the official Google Analytics page.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Google Analytics</h2>
            <p className="mb-6">
              Google Analytics is Google's analytics tool that helps our website to understand how visitors engage with their properties. It may use a set of cookies to collect information and report website usage statistics without personally identifying individual visitors to Google.
            </p>
            
            <p className="mb-6">
              In addition to reporting website usage statistics, Google Analytics can also be used, together with some of the advertising cookies, to help show more relevant ads on Google properties (like Google Search) and across the web and to measure interactions with the ads Google shows.
            </p>
            
            <p className="mb-6">
              Learn more about <a href="https://developers.google.com/analytics/devguides/collection/analyticsjs/cookie-usage" className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">Analytics cookies and privacy information</a>.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Use of IP Addresses</h2>
            <p className="mb-6">
              An IP address is a numeric code that identifies your computer on the Internet. We might use your IP address and browser type to help analyze usage patterns and diagnose problems on this website and to improve the service we offer to you. But without additional information your IP address does not identify you as an individual.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Choice</h2>
            <p className="mb-6">
              When you accessed this website, our cookies were sent to your web browser and stored on your computer. By using our website, you agree to the use of cookies and similar technologies.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">More Information</h2>
            <p className="mb-6">
              Hopefully the above information has clarified things for you. As it was previously mentioned, if you are not sure whether you want to allow the cookies or not, it is usually safer to leave cookies enabled in case it interacts with one of the features you use on our site. However, if you are still looking for more information, then feel free to contact us via email at <a href="mailto:carrentals@petsas.com.cy" className="text-blue-600 hover:text-blue-800">carrentals@petsas.com.cy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 