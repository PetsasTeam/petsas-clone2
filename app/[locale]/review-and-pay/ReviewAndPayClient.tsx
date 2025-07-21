'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import GlassmorphismControl from '../../components/GlassmorphismControl';
import { MapPin } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { E164Number } from 'libphonenumber-js/core';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface Vehicle {
  id: string;
  name: string;
  image: string;
  category: string;
  transmission: string;
  seats: number;
  doors: number;
  ac: boolean;
}

interface RentalOption {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface GeneralSettings {
  payOnlineDiscount: number;
  payOnArrivalDiscount: number;
  vatPercentage: number;
}

interface SearchParams {
  vehicleId?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  dropoffDate?: string;
  pickupTime?: string;
  dropoffTime?: string;
  days?: string;
  paymentType?: string;
  promoCode?: string;
  promoDiscount?: string;
  basePrice?: string;
  discountedPrice?: string;
  extrasTotal?: string;
  totalAmount?: string;
  [key: string]: string | undefined; // For dynamic extra_* parameters
}

interface ReviewAndPayClientProps {
  glassmorphismEnabled: boolean;
  generalSettings: GeneralSettings;
  searchParams: SearchParams;
  vehicle: Vehicle;
  rentalOptions: RentalOption[];
}

export default function ReviewAndPayClient({
  glassmorphismEnabled,
  generalSettings,
  searchParams,
  vehicle,
  rentalOptions,
}: ReviewAndPayClientProps) {
  const router = useRouter();

  // Validate required parameters
  useEffect(() => {
    console.log('🔍 VALIDATING SEARCH PARAMS ON COMPONENT MOUNT');
    console.log('All searchParams:', JSON.stringify(searchParams, null, 2));
    console.log('vehicleId:', searchParams.vehicleId);
    console.log('vehicle prop:', vehicle);

    if (!searchParams.vehicleId) {
      console.error('❌ Missing vehicleId in search parameters');
      alert('Vehicle selection is required. Please start from the vehicle selection page.');
      router.push('/en/search');
      return;
    }

    if (!vehicle || !vehicle.id) {
      console.error('❌ Vehicle data not found');
      alert('Vehicle information is missing. Please select a vehicle again.');
      router.push('/en/search');
      return;
    }

        console.log('✅ Required parameters validated successfully');
  }, [searchParams, vehicle, router]);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggedInCustomer, setLoggedInCustomer] = useState<any>(null);
  const [createAccount, setCreateAccount] = useState(false);
  // Parse selected extras from URL parameters
  const [selectedExtras, setSelectedExtras] = useState<{[key: string]: number}>(() => {
    const extras: {[key: string]: number} = {};
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key.startsWith('extra_') && value) {
        const optionId = key.replace('extra_', '');
        extras[optionId] = parseInt(value);
      }
    });
    return extras;
  });
  
  const [promoCode, setPromoCode] = useState(searchParams.promoCode || '');
  const [paymentType, setPaymentType] = useState<'online' | 'arrival'>(
    (searchParams.paymentType as 'online' | 'arrival') || 'online'
  );
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [phone, setPhone] = useState<E164Number | undefined>();
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    postalAddress: '',
    flightNo: '',
    airline: '',
    arrivalTime: '',
    comments: '',
    howDidYouFindUs: '',
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Calculate pricing using data from extras page
  const days = parseInt(searchParams.days || '3');
  const baseRate = parseFloat(searchParams.basePrice || '0');
  const extrasTotal = parseFloat(searchParams.extrasTotal || '0');
  const discountedPrice = parseFloat(searchParams.discountedPrice || '0');
  const totalAmount = parseFloat(searchParams.totalAmount || '0');
  
  const subtotal = baseRate + extrasTotal;
  const discount = paymentType === 'online' 
    ? baseRate * (generalSettings.payOnlineDiscount / 100)
    : baseRate * (generalSettings.payOnArrivalDiscount / 100);
  const total = totalAmount || (discountedPrice + extrasTotal);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success) {
        setLoggedInCustomer(data.customer);
        setShowLoginModal(false);
        
        // Pre-fill form with customer data
        setFormData(prev => ({
          ...prev,
          firstName: data.customer.firstName || '',
          lastName: data.customer.lastName || '',
          email: data.customer.email || '',
          postalAddress: data.customer.address || '',
        }));
        
        if (data.customer.phone) {
          setPhone(data.customer.phone as E164Number);
        }
        
        if (data.customer.dateOfBirth) {
          setDateOfBirth(new Date(data.customer.dateOfBirth));
        }
        
        // Reset login form
        setLoginData({ email: '', password: '' });
      } else {
        setLoginError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Network error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setLoggedInCustomer(null);
    setFormData(prev => ({
      ...prev,
      firstName: '',
      lastName: '',
      email: '',
      postalAddress: ''
    }));
    setPhone(undefined);
    setDateOfBirth(null);
  };

  const handleConflictResolve = async (action: 'update' | 'different-email' | 'login') => {
    if (action === 'update') {
      // Update existing customer with new information
      try {
        const updateResponse = await fetch('/api/auth/update-customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: conflictData.existingCustomer.id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: phone,
            dateOfBirth: dateOfBirth?.toISOString(),
            address: formData.postalAddress,
          }),
        });

        const updateData = await updateResponse.json();
        
        if (updateData.success) {
          console.log('✅ Customer data updated successfully');
          setConflictData(null);
          setShowConflictModal(false);
          // Continue with booking using updated customer
          continueWithExistingCustomer(conflictData.existingCustomer.id);
        } else {
          console.log('❌ Failed to update customer data:', updateData.message);
          alert('Failed to update customer information. Please try again.');
        }
      } catch (error) {
        console.error('Error updating customer:', error);
        alert('Error updating customer information. Please try again.');
      }
    } else if (action === 'different-email') {
      // Clear email field and close modal
      setFormData(prev => ({ ...prev, email: '' }));
      setConflictData(null);
      setShowConflictModal(false);
      alert('Please enter a different email address.');
    } else if (action === 'login') {
      // Show login modal
      setConflictData(null);
      setShowConflictModal(false);
      setShowLoginModal(true);
    }
  };

  const continueWithExistingCustomer = async (customerId: string) => {
    // Continue with the booking process using the existing customer ID
    console.log('Continuing with existing customer ID:', customerId);
    
    // Continue with the same booking logic from handleSubmit
    try {
      console.log('=== CREATING BOOKING ===');
      console.log('🔍 SearchParams analysis:');
      console.log('  - pickupDate:', searchParams.pickupDate, 'type:', typeof searchParams.pickupDate);
      console.log('  - dropoffDate:', searchParams.dropoffDate, 'type:', typeof searchParams.dropoffDate);
      console.log('  - pickupLocation:', searchParams.pickupLocation);
      console.log('  - dropoffLocation:', searchParams.dropoffLocation);
      console.log('  - vehicleId:', searchParams.vehicleId);
      console.log('  - totalAmount:', searchParams.totalAmount);
      console.log('  - days:', searchParams.days);
      
      // Generate dates if missing (fallback)
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(today.getDate() + (parseInt(searchParams.days || '3')));
      
      const fallbackPickupDate = today.toISOString().split('T')[0];
      const fallbackDropoffDate = dayAfterTomorrow.toISOString().split('T')[0];
      
      console.log('🔄 Fallback dates generated:');
      console.log('  - fallbackPickupDate:', fallbackPickupDate);
      console.log('  - fallbackDropoffDate:', fallbackDropoffDate);
      
      const bookingPayload = {
        customerId,
        vehicleId: searchParams.vehicleId || vehicle.id,
        pickupDate: searchParams.pickupDate || fallbackPickupDate,
        dropoffDate: searchParams.dropoffDate || fallbackDropoffDate,
        pickupLocation: searchParams.pickupLocation || 'Not specified',
        dropoffLocation: searchParams.dropoffLocation || 'Not specified',
        pickupTime: searchParams.pickupTime || '09:00',
        dropoffTime: searchParams.dropoffTime || '09:00',
        totalPrice: total,
        paymentType: paymentType === 'online' ? 'online' : 'arrival',
        selectedExtras: Object.entries(selectedExtras).map(([optionId, quantity]) => {
          const option = rentalOptions.find(opt => opt.id === optionId);
          return {
            id: optionId,
            name: option?.name || '',
            quantity: quantity,
            price: option?.price || 0,
          };
        }),
        flightInfo: {
          flightNo: formData.flightNo,
          airline: formData.airline,
          arrivalTime: formData.arrivalTime,
        },
        comments: formData.comments,
        howDidYouFindUs: formData.howDidYouFindUs,
      };
      
      console.log('Booking payload:', bookingPayload);
      
      // Validate vehicleId before sending
      if (!bookingPayload.vehicleId) {
        console.error('❌ No vehicleId available for booking');
        alert('Vehicle selection is missing. Please go back and select a vehicle.');
        router.push('/en/search');
        return;
      }
      
      // Create booking
      const bookingResponse = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      });

      console.log('Booking response status:', bookingResponse.status);
      const bookingData = await bookingResponse.json();
      console.log('Booking response data:', bookingData);

      if (bookingData.success) {
        console.log('✅ BOOKING CREATED SUCCESSFULLY');
        console.log('Booking details:', bookingData.booking);
        
        // Store booking data for confirmation page
        localStorage.setItem('latestBooking', JSON.stringify(bookingData.booking));
        
        // Redirect to confirmation page or payment
        if (paymentType === 'online') {
          console.log('=== PROCESSING ONLINE PAYMENT ===');
          console.log('Payment type: online, total amount:', total);
          
          // Redirect to JCC payment gateway
          try {
            console.log('Creating JCC payment order...');
            
            const paymentPayload = {
              bookingId: bookingData.booking.id,
              amount: total,
              currency: 'EUR',
              customerEmail: formData.email,
              customerPhone: phone?.toString() || '',
              customerFirstName: formData.firstName,
              customerLastName: formData.lastName,
            };
            
            console.log('Payment payload:', paymentPayload);
            
            const paymentResponse = await fetch('/api/payment/create-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(paymentPayload),
            });

            console.log('Payment response status:', paymentResponse.status);
            const paymentData = await paymentResponse.json();
            console.log('Payment response data:', paymentData);

            if (paymentData.success && paymentData.paymentUrl) {
              console.log('✅ Payment order created successfully');
              console.log('Redirecting to JCC payment page:', paymentData.paymentUrl);
              // Redirect to JCC payment page
              window.location.href = paymentData.paymentUrl;
            } else {
              console.log('❌ Payment setup failed:', paymentData.error);
              alert(`Payment setup failed: ${paymentData.error}. Please try again or contact support.`);
            }
          } catch (error) {
            console.error('❌ Payment creation error:', error);
            alert('Failed to setup payment. Please try again or contact support.');
          }
        } else {
          console.log('=== PAY ON ARRIVAL SELECTED ===');
          console.log('Booking confirmed, order number:', bookingData.booking.orderNumber);
          // Pay on arrival - redirect to confirmation page
          router.push(`/en/booking-confirmation?bookingId=${bookingData.booking.id}`);
        }
              } else {
          console.log('❌ BOOKING CREATION FAILED');
          console.log('Booking error:', bookingData.message);
          console.log('Full booking response:', bookingData);
          
          // Check if it's a validation error for missing vehicleId
          if (bookingData.errors && bookingData.errors.vehicleId) {
            alert('Vehicle selection is required. Please go back and select a vehicle first.');
            router.push('/en/search');
          } else {
            alert(bookingData.message || 'Failed to create booking');
          }
          return;
        }
    } catch (error) {
      console.error('❌ BOOKING SUBMISSION ERROR');
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Full error object:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
      alert('Network error. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== BOOKING FORM SUBMISSION STARTED ===');
    console.log('🔍 COMPLETE STATE DUMP:');
    console.log('  - formData:', JSON.stringify(formData, null, 2));
    console.log('  - phone:', phone, 'type:', typeof phone);
    console.log('  - dateOfBirth:', dateOfBirth, 'type:', typeof dateOfBirth);
    console.log('  - agreeToTerms:', agreeToTerms, 'type:', typeof agreeToTerms);
    console.log('  - createAccount:', createAccount, 'type:', typeof createAccount);
    console.log('  - loggedInCustomer:', loggedInCustomer ? 'YES' : 'NO');
    console.log('  - paymentType:', paymentType);
    console.log('  - selectedExtras:', selectedExtras);
    console.log('  - searchParams:', JSON.stringify(searchParams, null, 2));
    
    console.log('🔍 FORM ELEMENT VALUES:');
    const form = e.currentTarget;
    if (!(form instanceof HTMLFormElement)) {
      console.error('❌ currentTarget is not an HTMLFormElement:', form);
    } else {
      const formDataObj = new FormData(form);
      for (let [key, value] of formDataObj.entries()) {
        console.log(`  - ${key}:`, value);
      }
    }
    
    console.log('🔍 DOM ELEMENT CHECKS:');
    const firstNameInput = document.querySelector('input[name="firstName"]') as HTMLInputElement;
    const lastNameInput = document.querySelector('input[name="lastName"]') as HTMLInputElement;
    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
    const termsCheckbox = document.querySelector('input[name="agreeToTerms"]') as HTMLInputElement;
    
    console.log('  - firstName DOM value:', firstNameInput?.value, 'required:', firstNameInput?.required);
    console.log('  - lastName DOM value:', lastNameInput?.value, 'required:', lastNameInput?.required);
    console.log('  - email DOM value:', emailInput?.value, 'required:', emailInput?.required);
    console.log('  - terms DOM checked:', termsCheckbox?.checked, 'required:', termsCheckbox?.required);
    
    console.log('Search params:', searchParams);
    
    // Frontend validation
    const errors: string[] = [];
    
    console.log('=== FRONTEND VALIDATION CHECKS ===');
    console.log('🚀 Starting validation process...');
    console.log('📊 Initial validation state:');
    console.log('  - errors array initialized:', errors.length === 0);
    console.log('  - about to check firstName...');
    
    if (!formData.firstName.trim()) {
      console.log('❌ First Name validation failed:', formData.firstName);
      errors.push('First Name is required');
    } else {
      console.log('✅ First Name validation passed:', formData.firstName);
    }
    
    if (!formData.lastName.trim()) {
      console.log('❌ Last Name validation failed:', formData.lastName);
      errors.push('Last Name is required');
    } else {
      console.log('✅ Last Name validation passed:', formData.lastName);
    }
    
    if (!formData.email.trim()) {
      console.log('❌ Email validation failed:', formData.email);
      errors.push('Email is required');
    } else {
      console.log('✅ Email validation passed:', formData.email);
    }
    
    if (!phone) {
      console.log('❌ Phone validation failed:', phone);
      errors.push('Phone number is required');
    } else {
      console.log('✅ Phone validation passed:', phone);
    }
    
    if (!dateOfBirth) {
      console.log('❌ Date of birth validation failed:', dateOfBirth);
      errors.push('Date of birth is required');
    } else {
      console.log('✅ Date of birth provided:', dateOfBirth);
      // Check if customer is at least 21 years old
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      console.log('Age calculated:', age);
      
      if (age < 21) {
        console.log('❌ Age validation failed - too young:', age);
        errors.push('You must be at least 21 years old to rent a vehicle');
      } else {
        console.log('✅ Age validation passed:', age);
      }
    }
    
    if (!agreeToTerms) {
      console.log('❌ Terms validation failed:', agreeToTerms);
      errors.push('Please agree to the Terms and Conditions');
    } else {
      console.log('✅ Terms validation passed:', agreeToTerms);
    }
    
    // Password validation if creating account
    if (createAccount) {
      console.log('=== PASSWORD VALIDATION (Account Creation) ===');
      if (!formData.password) {
        console.log('❌ Password required for account creation');
        errors.push('Password is required when creating an account');
      }
      if (!formData.confirmPassword) {
        console.log('❌ Password confirmation required');
        errors.push('Please confirm your password');
      }
      if (formData.password !== formData.confirmPassword) {
        console.log('❌ Passwords do not match');
        errors.push('Passwords do not match');
      }
      if (formData.password && formData.password.length < 6) {
        console.log('❌ Password too short:', formData.password.length);
        errors.push('Password must be at least 6 characters');
      }
    }
    
    if (errors.length > 0) {
      console.log('❌ FRONTEND VALIDATION FAILED');
      console.log('Total errors found:', errors.length);
      console.log('Error list:', errors);
      
      // Log which specific validations failed
      console.log('🔍 DETAILED VALIDATION FAILURE ANALYSIS:');
      console.log('  - firstName.trim():', `"${formData.firstName.trim()}"`, 'length:', formData.firstName.trim().length);
      console.log('  - lastName.trim():', `"${formData.lastName.trim()}"`, 'length:', formData.lastName.trim().length);
      console.log('  - email.trim():', `"${formData.email.trim()}"`, 'length:', formData.email.trim().length);
      console.log('  - phone value:', phone, 'truthy:', !!phone);
      console.log('  - dateOfBirth value:', dateOfBirth, 'truthy:', !!dateOfBirth);
      console.log('  - agreeToTerms value:', agreeToTerms, 'truthy:', !!agreeToTerms);
      
      // Create a more user-friendly validation dialog
      const errorMessage = 'Please fix the following errors:\n\n' + errors.join('\n');
      
      // Show a custom modal instead of basic alert
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <div class="flex items-center mb-4">
            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Validation Failed</h3>
          </div>
          <div class="text-sm text-gray-600 mb-6">
            <p class="mb-2">Please fix the following issues:</p>
            <ul class="list-disc list-inside space-y-1">
              ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
          </div>
          <button onclick="this.closest('.fixed').remove()" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            OK
          </button>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Scroll to first error field
      const firstErrorField = document.querySelector('.border-red-300') || document.querySelector('input[required]:invalid');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }

    console.log('✅ FRONTEND VALIDATION PASSED - Proceeding with booking creation');

    try {
      console.log('=== CUSTOMER DATA PREPARATION ===');
      
      // Prepare customer data
      const customerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: phone || '',
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
        address: formData.postalAddress,
      };

      console.log('Customer data prepared:', customerData);

      let customerId = null;

      if (loggedInCustomer) {
        console.log('=== USING EXISTING LOGGED-IN CUSTOMER ===');
        console.log('Logged-in customer ID:', loggedInCustomer.id);
        // Use existing logged-in customer
        customerId = loggedInCustomer.id;
      } else if (createAccount && formData.password) {
        console.log('=== CREATING NEW ACCOUNT WITH PASSWORD ===');
        console.log('Account creation data:', { ...customerData, password: '[HIDDEN]' });
        
        // Create account with password
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...customerData,
            password: formData.password,
          }),
        });

        console.log('Register response status:', registerResponse.status);
        const registerData = await registerResponse.json();
        console.log('Register response data:', registerData);
        
        if (registerData.success) {
          customerId = registerData.customer.id;
          console.log('✅ Account created successfully, customer ID:', customerId);
          // Store customer data for session
          localStorage.setItem('customer', JSON.stringify(registerData.customer));
        } else {
          console.log('❌ Account creation failed:', registerData.message);
          alert(registerData.message || 'Failed to create account');
          return;
        }
      } else {
        console.log('=== CREATING GUEST CUSTOMER ===');
        console.log('Guest customer data:', customerData);
        
        // Create guest customer (no password)
        const guestResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...customerData,
            password: '', // No password for guest
          }),
        });

        console.log('Guest response status:', guestResponse.status);
        const guestData = await guestResponse.json();
        console.log('Guest response data:', guestData);
        
        if (guestData.success) {
          customerId = guestData.customer.id;
          console.log('✅ Guest customer created successfully, customer ID:', customerId);
        } else {
          console.log('❌ Guest customer creation failed:', guestData.message);
          
          if (guestData.type === 'DATA_CONFLICT') {
            // Data conflicts detected - show conflict resolution modal
            console.log('Data conflicts detected:', guestData.conflicts);
            setConflictData(guestData);
            setShowConflictModal(true);
            return; // Stop here until user resolves conflicts
          } else if (guestData.type === 'EXACT_MATCH') {
            // Same data - use existing customer
            console.log('Exact match found, using existing customer');
            customerId = guestData.existingCustomer.id;
          } else if (guestData.message?.includes('already exists')) {
            // Fallback for old response format
            console.log('Customer already exists, attempting to find existing customer...');
            
            try {
              const findCustomerResponse = await fetch('/api/auth/find-customer', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: formData.email }),
              });
              
              const findCustomerData = await findCustomerResponse.json();
              
              if (findCustomerData.success && findCustomerData.customer) {
                customerId = findCustomerData.customer.id;
                console.log('✅ Found existing customer, ID:', customerId);
              } else {
                console.log('❌ Could not find existing customer');
                alert('Unable to process booking with this email. Please try logging in first.');
                return;
              }
            } catch (error) {
              console.error('Error finding existing customer:', error);
              alert('Unable to process booking. Please try again.');
              return;
            }
          } else {
            alert(guestData.message || 'Failed to process booking');
            return;
          }
        }
      }

      console.log('=== CREATING BOOKING ===');
      console.log('🔍 SearchParams analysis:');
      console.log('  - pickupDate:', searchParams.pickupDate, 'type:', typeof searchParams.pickupDate);
      console.log('  - dropoffDate:', searchParams.dropoffDate, 'type:', typeof searchParams.dropoffDate);
      console.log('  - pickupLocation:', searchParams.pickupLocation);
      console.log('  - dropoffLocation:', searchParams.dropoffLocation);
      console.log('  - vehicleId:', searchParams.vehicleId);
      console.log('  - totalAmount:', searchParams.totalAmount);
      console.log('  - days:', searchParams.days);
      
      // Generate dates if missing (fallback)
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(today.getDate() + (parseInt(searchParams.days || '3')));
      
      const fallbackPickupDate = today.toISOString().split('T')[0];
      const fallbackDropoffDate = dayAfterTomorrow.toISOString().split('T')[0];
      
      console.log('🔄 Fallback dates generated:');
      console.log('  - fallbackPickupDate:', fallbackPickupDate);
      console.log('  - fallbackDropoffDate:', fallbackDropoffDate);
      
      const bookingPayload = {
          customerId,
        vehicleId: searchParams.vehicleId || vehicle.id,
        pickupDate: searchParams.pickupDate || fallbackPickupDate,
        dropoffDate: searchParams.dropoffDate || fallbackDropoffDate,
          pickupLocation: searchParams.pickupLocation || 'Not specified',
          dropoffLocation: searchParams.dropoffLocation || 'Not specified',
          pickupTime: searchParams.pickupTime || '09:00',
          dropoffTime: searchParams.dropoffTime || '09:00',
          totalPrice: +(searchParams.totalAmount || '0'),
          paymentType: paymentType === 'online' ? 'online' : 'arrival',
          selectedExtras: Object.entries(selectedExtras).map(([optionId, quantity]) => {
            const option = rentalOptions.find(opt => opt.id === optionId);
            return {
              id: optionId,
              name: option?.name || '',
              quantity: quantity,
              price: option?.price || 0,
            };
          }),
          flightInfo: {
            flightNo: formData.flightNo,
            airline: formData.airline,
            arrivalTime: formData.arrivalTime,
          },
          comments: formData.comments,
          howDidYouFindUs: formData.howDidYouFindUs,
      };
      
      console.log('Booking payload:', bookingPayload);
      
      // Validate vehicleId before sending
      if (!bookingPayload.vehicleId) {
        console.error('❌ No vehicleId available for booking');
        alert('Vehicle selection is missing. Please go back and select a vehicle.');
        router.push('/en/search');
        return;
      }
      
      // Create booking
      const bookingResponse = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      });

      console.log('Booking response status:', bookingResponse.status);
      const bookingData = await bookingResponse.json();
      console.log('Booking response data:', bookingData);

      if (bookingData.success) {
        console.log('✅ BOOKING CREATED SUCCESSFULLY');
        console.log('Booking details:', bookingData.booking);
        
        // Store booking data for confirmation page
        localStorage.setItem('latestBooking', JSON.stringify(bookingData.booking));
        
        // Redirect to confirmation page or payment
        if (paymentType === 'online') {
          console.log('=== PROCESSING ONLINE PAYMENT ===');
          console.log('Payment type: online, total amount:', total);
          
          // Redirect to JCC payment gateway
          try {
            console.log('Creating JCC payment order...');
            
            const paymentPayload = {
                bookingId: bookingData.booking.id,
                amount: total,
                currency: 'EUR',
                customerEmail: formData.email,
                customerPhone: phone?.toString() || '',
                customerFirstName: formData.firstName,
                customerLastName: formData.lastName,
            };
            
            console.log('Payment payload:', paymentPayload);
            
            const paymentResponse = await fetch('/api/payment/create-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(paymentPayload),
            });

            console.log('Payment response status:', paymentResponse.status);
            const paymentData = await paymentResponse.json();
            console.log('Payment response data:', paymentData);

            if (paymentData.success && paymentData.paymentUrl) {
              console.log('✅ Payment order created successfully');
              console.log('Redirecting to JCC payment page:', paymentData.paymentUrl);
              // Redirect to JCC payment page
              window.location.href = paymentData.paymentUrl;
            } else {
              console.log('❌ Payment setup failed:', paymentData.error);
              alert(`Payment setup failed: ${paymentData.error}. Please try again or contact support.`);
            }
          } catch (error) {
            console.error('❌ Payment creation error:', error);
            alert('Failed to setup payment. Please try again or contact support.');
          }
        } else {
          console.log('=== PAY ON ARRIVAL SELECTED ===');
          console.log('Booking confirmed, order number:', bookingData.booking.orderNumber);
          // Pay on arrival - redirect to confirmation page
          router.push(`/en/booking-confirmation?bookingId=${bookingData.booking.id}`);
        }
      } else {
        console.log('❌ BOOKING CREATION FAILED');
        console.log('Booking error:', bookingData.message);
        console.log('Full booking response:', bookingData);
        
        // Check if it's a validation error for missing vehicleId
        if (bookingData.errors && bookingData.errors.vehicleId) {
          alert('Vehicle selection is required. Please go back and select a vehicle first.');
          router.push('/en/search');
      } else {
        alert(bookingData.message || 'Failed to create booking');
        }
        return;
      }
      
    } catch (error) {
      console.error('❌ BOOKING SUBMISSION ERROR');
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Full error object:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
      alert('Network error. Please try again.');
    }
  };

  const navigateToStep = (step: number) => {
    // Build the current URL parameters to preserve state
    const currentParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) currentParams.set(key, value);
    });
    
    // Navigate to different steps
    switch (step) {
      case 1:
        router.push(`/en/search?${currentParams.toString()}`);
        break;
      case 2:
        router.push(`/en/vehicle-guide?${currentParams.toString()}`);
        break;
      case 3:
        router.push(`/en/extras?${currentParams.toString()}`);
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Helper function to format date input
  const formatDateInput = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Add slashes at appropriate positions
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
  };

  // Helper function to parse formatted date string to Date object
  const parseFormattedDate = (value: string): Date | null => {
    if (!value || value.length < 10) return null;
    
    const parts = value.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) return null;
    
    return new Date(year, month - 1, day);
  };

  // State for the formatted date input
  const [dateInputValue, setDateInputValue] = useState<string>('');

  // Update dateInputValue when dateOfBirth changes (from calendar)
  useEffect(() => {
    if (dateOfBirth) {
      const formatted = dateOfBirth.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      setDateInputValue(formatted);
    } else {
      setDateInputValue('');
    }
  }, [dateOfBirth]);

  // Handle typed input
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    setDateInputValue(formatted);
    
    // Try to parse the date if it's complete
    if (formatted.length === 10) {
      const parsedDate = parseFormattedDate(formatted);
      if (parsedDate) {
        setDateOfBirth(parsedDate);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <GlassmorphismControl enabled={glassmorphismEnabled} />
      
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-8">
            <button 
              onClick={() => router.push('/en/search')}
              className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span className="ml-2 text-sm font-medium text-gray-900">Search</span>
            </button>
            <div className="w-16 h-0.5 bg-blue-600"></div>
            <button 
              onClick={() => router.push('/en/search')}
              className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span className="ml-2 text-sm font-medium text-gray-900">Choose vehicle</span>
            </button>
            <div className="w-16 h-0.5 bg-blue-600"></div>
            <button 
              onClick={() => {
                // Navigate to extras page with current search params
                const extrasParams = new URLSearchParams();
                Object.entries(searchParams).forEach(([key, value]) => {
                  if (value) extrasParams.set(key, value);
                });
                router.push(`/en/extras?${extrasParams.toString()}`);
              }}
              className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span className="ml-2 text-sm font-medium text-gray-900">Choose extras</span>
            </button>
            <div className="w-16 h-0.5 bg-blue-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <span className="ml-2 text-sm font-medium text-yellow-600">Review and Pay</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Customer Details Form */}
          <div className="lg:col-span-2">
            <div className="glass-card p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Place your order</h2>
              
              {/* Existing Customer Login */}
              {!loggedInCustomer ? (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">Existing Customer? Login to retrieve your details</span>
                  </div>
                  <button 
                      onClick={() => setShowLoginModal(true)}
                    className="bg-yellow-500 text-black px-4 py-2 rounded font-bold text-sm hover:bg-yellow-600 transition-colors"
                  >
                    LOGIN
                  </button>
                </div>
              </div>
              ) : (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        {loggedInCustomer.firstName?.charAt(0)}{loggedInCustomer.lastName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Welcome back, {loggedInCustomer.firstName}!</p>
                        <p className="text-xs text-gray-600">{loggedInCustomer.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}

              <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`form-input ${!formData.firstName.trim() ? 'border-red-300' : 'border-gray-300'}`}
                      required
                    />
                    {!formData.firstName.trim() && (
                      <p className="text-red-600 text-xs mt-1">First name is required</p>
                    )}
                  </div>
                  <div>
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`form-input ${!formData.lastName.trim() ? 'border-red-300' : 'border-gray-300'}`}
                      required
                    />
                    {!formData.lastName.trim() && (
                      <p className="text-red-600 text-xs mt-1">Last name is required</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="form-label">Date of birth *</label>
                    <div className="relative">
                      {/* Custom formatted input with calendar icon */}
                      <input
                        type="text"
                        value={dateInputValue}
                        onChange={handleDateInputChange}
                        placeholder="DD/MM/YYYY"
                        maxLength={10}
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-medium ${!dateOfBirth ? 'border-red-300' : 'border-gray-300'}`}
                      />
                      {/* Hidden DatePicker with calendar icon trigger */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <DatePicker
                          selected={dateOfBirth}
                          onChange={(date) => setDateOfBirth(date)}
                          dateFormat="dd/MM/yyyy"
                          maxDate={new Date()}
                          showYearDropdown
                          yearDropdownItemNumber={100}
                          scrollableYearDropdown
                          customInput={
                            <button
                              type="button"
                              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </button>
                          }
                        />
                      </div>
                    </div>
                    {!dateOfBirth && (
                      <p className="text-red-600 text-xs mt-1">Date of birth is required (must be 21+ years old)</p>
                    )}
                    {dateOfBirth && (() => {
                      const today = new Date();
                      const birthDate = new Date(dateOfBirth);
                      let age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                      }
                      
                      if (age < 21) {
                        return <p className="text-red-600 text-xs mt-1">You must be at least 21 years old to rent a vehicle</p>;
                      }
                      return null;
                    })()}
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`form-input ${!formData.email.trim() ? 'border-red-300' : 'border-gray-300'}`}
                      required
                    />
                    {!formData.email.trim() && (
                      <p className="text-red-600 text-xs mt-1">Email is required</p>
                    )}
                  </div>
                </div>

                {/* Account Creation */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="createAccount"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="createAccount" className="text-sm font-medium text-gray-700">
                    Create a new account (optional)
                  </label>
                </div>

                {createAccount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="form-input"
                        required={createAccount}
                      />
                    </div>
                    <div>
                      <label className="form-label">Confirm Password *</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="form-input"
                        required={createAccount}
                      />
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Telephone *</label>
                    <PhoneInput
                      international
                      defaultCountry="CY"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500 phone-input ${!phone ? 'border-red-300' : 'border-gray-300'}`}
                      value={phone}
                      onChange={setPhone}
                      required
                    />
                    {!phone && (
                      <p className="text-red-600 text-xs mt-1">Phone number is required</p>
                    )}
                  </div>
                  <div>
                    <label className="form-label">Postal Address</label>
                    <input
                      type="text"
                      name="postalAddress"
                      value={formData.postalAddress}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Flight Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="form-label">Flight No</label>
                    <input
                      type="text"
                      name="flightNo"
                      value={formData.flightNo}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Airline</label>
                    <input
                      type="text"
                      name="airline"
                      value={formData.airline}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Arrival HH:MM</label>
                    <input
                      type="time"
                      name="arrivalTime"
                      value={formData.arrivalTime}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="form-label">Comments/Special Requests</label>
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleInputChange}
                    className="form-input min-h-[100px] resize-y"
                    rows={4}
                  />
                </div>

                {/* How did you find us */}
                <div>
                  <label className="form-label">How did you find us?</label>
                  <select
                    name="howDidYouFindUs"
                    value={formData.howDidYouFindUs}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Please select...</option>
                    <option value="google">Google Search</option>
                    <option value="social-media">Social Media</option>
                    <option value="recommendation">Recommendation</option>
                    <option value="repeat-customer">Repeat Customer</option>
                    <option value="travel-agent">Travel Agent</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Terms and Conditions */}
                <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                  !agreeToTerms ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                    required
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-medium">I have read and agree to the{' '}
                    <a href="/en/terms" target="_blank" className="text-green-600 hover:text-green-700 underline font-semibold">Terms and Conditions</a>
                    {' '}and{' '}
                    <a href="/en/privacy-policy" target="_blank" className="text-green-600 hover:text-green-700 underline font-semibold">Privacy Policy</a>
                    </span>
                    {!agreeToTerms && (
                      <div className="text-red-600 font-medium mt-1 text-xs">
                        ⚠️ You must agree to the terms and conditions to proceed
                      </div>
                    )}
                  </label>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-blue-600 mr-2">Your Selection</span>
                <button 
                  onClick={() => router.push('/en/search')}
                  className="text-sm text-blue-600 hover:underline ml-auto cursor-pointer"
                >
                  change
                </button>
              </h3>

              {/* Vehicle Summary */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Image
                    src={vehicle.image}
                    alt={vehicle.name}
                    width={120}
                    height={80}
                    className="object-contain bg-gray-50 rounded"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{vehicle.name}</h4>
                    <p className="text-sm text-gray-600">or similar</p>
                  </div>
                </div>
              </div>

              {/* Rental Details */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center justify-between">
                  Rental Details
                  <button 
                    onClick={() => router.push('/en/search')}
                    className="text-sm text-blue-600 hover:underline cursor-pointer"
                  >
                    change
                  </button>
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="text-gray-600">{days} day{days > 1 ? 's' : ''}</div>
                  
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Pick up</div>
                      <div className="text-gray-600">{searchParams.pickupLocation}</div>
                      <div className="text-gray-600">{formatDate(searchParams.pickupDate || '')} - {searchParams.pickupTime}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Drop off</div>
                      <div className="text-gray-600">{searchParams.dropoffLocation}</div>
                      <div className="text-gray-600">{formatDate(searchParams.dropoffDate || '')} - {searchParams.dropoffTime}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Basic Rate:</span>
                    <span className="font-bold">€{baseRate.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Extras */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center justify-between">
                  Extras
                  <button 
                    onClick={() => {
                      // Navigate to extras page with current search params
                      const extrasParams = new URLSearchParams();
                      Object.entries(searchParams).forEach(([key, value]) => {
                        if (value) extrasParams.set(key, value);
                      });
                      router.push(`/en/extras?${extrasParams.toString()}`);
                    }}
                    className="text-sm text-blue-600 hover:underline cursor-pointer"
                  >
                    change
                  </button>
                </h4>
                {Object.keys(selectedExtras).length === 0 ? (
                  <p className="text-gray-600 text-sm">No extras selected</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(selectedExtras).map(([optionId, quantity]) => {
                      const option = rentalOptions.find(opt => opt.id === optionId);
                      if (!option || quantity === 0) return null;
                      return (
                        <div key={optionId} className="flex justify-between items-center text-sm">
                          <span>{option.name} x{quantity}</span>
                          <span>€{(option.price * quantity * days).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Promotion Code */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3">Promotion Code</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="form-input flex-1"
                  />
                  <button className="bg-yellow-500 text-black px-4 py-2 rounded font-bold text-sm hover:bg-yellow-600 transition-colors">
                    APPLY
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center justify-between">
                  Payment Method
                  <button 
                    onClick={() => {
                      // Navigate to extras page to change payment method
                      const extrasParams = new URLSearchParams();
                      Object.entries(searchParams).forEach(([key, value]) => {
                        if (value) extrasParams.set(key, value);
                      });
                      router.push(`/en/extras?${extrasParams.toString()}`);
                    }}
                    className="text-sm text-blue-600 hover:underline cursor-pointer"
                  >
                    change
                  </button>
                </h4>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm font-medium">
                        {paymentType === 'online' 
                          ? `Pay Online (${generalSettings.payOnlineDiscount}% off)` 
                          : `Pay on Arrival (${generalSettings.payOnArrivalDiscount}% off)`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="border border-yellow-400 rounded-lg p-4 bg-yellow-50">
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold">€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>
                      {paymentType === 'online' ? 'Online' : 'Arrival'} Discount 
                      ({paymentType === 'online' ? generalSettings.payOnlineDiscount : generalSettings.payOnArrivalDiscount}%):
                    </span>
                    <span className="font-bold">
                      -€{paymentType === 'online' 
                        ? (subtotal * generalSettings.payOnlineDiscount / 100).toFixed(2)
                        : (subtotal * generalSettings.payOnArrivalDiscount / 100).toFixed(2)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 mb-4">
                  * The discount is applicable on basic rate only.
                </div>

                <button
                  type="submit"
                  form="booking-form"
                  className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-bold text-lg hover:bg-teal-700 transition-colors"
                >
                  CHECKOUT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Login to Your Account</h3>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginError('');
                    setLoginData({ email: '', password: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{loginError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <a href="/en/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <a href="/en/register" className="text-green-600 hover:text-green-700 font-semibold">
                    Create one here
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Resolution Modal */}
      {showConflictModal && conflictData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Email Already Exists</h3>
                <button
                  onClick={() => {
                    setShowConflictModal(false);
                    setConflictData(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm font-medium text-yellow-800">
                      This email address is already registered with different information.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Data Comparison:</h4>
                  {conflictData.conflicts.map((conflict: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-700 mb-2 capitalize">
                        {conflict.field.replace(/([A-Z])/g, ' $1').trim()}:
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Existing:</span>
                          <div className="font-medium text-gray-900">{conflict.existing}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Your Input:</span>
                          <div className="font-medium text-blue-600">{conflict.new}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  Please choose how you'd like to proceed:
                </p>
                
                <button
                  onClick={() => handleConflictResolve('update')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  This is me - Update my information
                </button>
                
                <button
                  onClick={() => handleConflictResolve('login')}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login to verify my identity
                </button>
                
                <button
                  onClick={() => handleConflictResolve('different-email')}
                  className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  Use a different email address
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Security Note:</strong> We protect customer data by preventing unauthorized bookings. 
                  If this is your email address, please verify your identity to proceed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .glass-card {
          background: var(--glass-bg-main, rgba(255, 255, 255, 0.9)) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border-radius: 16px;
          box-shadow: 
            0 15px 35px -10px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          background: white;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .form-input:hover, .form-select:hover {
          border-color: #d1d5db;
        }

        @media (max-width: 768px) {
          .glass-card {
            padding: 1.5rem;
          }
        }

        .phone-input {
          display: flex;
          align-items: center;
        }

        .phone-input .PhoneInputInput {
          flex: 1;
          border: none;
          outline: none;
          background-color: transparent;
          height: 100%;
          padding-left: 8px;
        }

        .phone-input .PhoneInputInput:focus {
          ring-width: 0;
          box-shadow: none;
        }

        .phone-input .PhoneInputCountry {
          display: flex;
          align-items: center;
        }

        .date-picker-wrapper {
          width: 100%;
        }
        
        .date-picker-wrapper .react-datepicker-wrapper {
          width: 100% !important;
        }
        
        .date-picker-wrapper .react-datepicker__input-container {
          width: 100% !important;
        }
        
        .date-picker-wrapper .react-datepicker__input-container input {
          width: 100% !important;
          padding: 12px 16px !important;
          border: 2px solid #d1d5db !important;
          border-radius: 12px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          background: white !important;
          box-sizing: border-box !important;
          font-family: inherit !important;
          margin: 0 !important;
          color: #374151 !important;
        }
        
        .date-picker-wrapper .react-datepicker__input-container input:focus {
          outline: none !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
        }
        
        .date-picker-wrapper .react-datepicker__input-container input:hover {
          border-color: #9ca3af !important;
        }
        
        /* Modern Green DatePicker Calendar Styles */
        .react-datepicker {
          border: 2px solid #047857 !important;
          border-radius: 12px !important;
          font-family: inherit !important;
          box-shadow: 0 10px 25px rgba(4, 120, 87, 0.15) !important;
          overflow: hidden !important;
        }
        .react-datepicker__header {
          background: linear-gradient(135deg, #047857, #059669) !important;
          border-bottom: none !important;
          border-radius: 10px 10px 0 0 !important;
          padding: 16px 0 !important;
        }
        .react-datepicker__current-month {
          color: white !important;
          font-weight: 600 !important;
          font-size: 18px !important;
          margin-bottom: 8px !important;
        }
        .react-datepicker__day-name {
          color: white !important;
          font-weight: 500 !important;
          width: 40px !important;
          margin: 2px !important;
        }
        .react-datepicker__navigation {
          top: 18px !important;
          width: 24px !important;
          height: 24px !important;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.2) !important;
          transition: all 0.2s ease !important;
        }
        .react-datepicker__navigation:hover {
          background: rgba(255, 255, 255, 0.3) !important;
          transform: scale(1.1) !important;
        }
        .react-datepicker__navigation--previous {
          border-right-color: white !important;
          left: 12px !important;
        }
        .react-datepicker__navigation--next {
          border-left-color: white !important;
          right: 12px !important;
        }
        .react-datepicker__day {
          color: #374151 !important;
          font-weight: 500 !important;
          border-radius: 8px !important;
          margin: 3px !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          transition: all 0.2s ease !important;
          position: relative !important;
        }
        .react-datepicker__day:hover {
          background: linear-gradient(135deg, #10b981, #047857) !important;
          color: white !important;
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(4, 120, 87, 0.3) !important;
        }
        .react-datepicker__day--selected {
          background: linear-gradient(135deg, #047857, #059669) !important;
          color: white !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(4, 120, 87, 0.4) !important;
        }
        .react-datepicker__day--selected:hover {
          background: linear-gradient(135deg, #059669, #047857) !important;
          transform: scale(1.05) !important;
        }
        .react-datepicker__day--today {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0) !important;
          color: #047857 !important;
          font-weight: 600 !important;
          border: 2px solid #10b981 !important;
        }
        .react-datepicker__day--disabled {
          color: #d1d5db !important;
          cursor: not-allowed !important;
          background: #f9fafb !important;
        }
        .react-datepicker__day--disabled:hover {
          background: #f9fafb !important;
          transform: none !important;
          box-shadow: none !important;
        }
        .react-datepicker__month-container {
          background: white !important;
        }
        .react-datepicker__week {
          display: flex !important;
          justify-content: space-around !important;
        }
        .react-datepicker__year-dropdown {
          background: white !important;
          border: 1px solid #d1d5db !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
        .react-datepicker__year-option {
          padding: 8px 12px !important;
          cursor: pointer !important;
        }
        .react-datepicker__year-option:hover {
          background: #f3f4f6 !important;
        }
        .react-datepicker__year-option--selected {
          background: #047857 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
} 