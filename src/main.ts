import './index.css';

// Type declarations to ensure TS compiles smoothly
interface Stat {
  element: HTMLElement;
  targetValue: number;
  currentValue: number;
  duration: number;
  started: boolean;
}

document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initNavbarScroll();
  initMobileMenu();
  initStatsCounter();
  initAboutTabs();
  initCarousel();
  initDonationModal();
  initFAQAccordion();
  initContactForm();
  initJoinModal();
});

/* ==========================================================================
   01. DARK MODE MANAGER
   ========================================================================== */
function initDarkMode() {
  const toggleBtnDesktop = document.getElementById('theme-toggle-desktop') as HTMLButtonElement | null;
  const toggleBtnMobile = document.getElementById('theme-toggle-mobile') as HTMLButtonElement | null;

  const sunIconClass = 'theme-sun-icon';
  const moonIconClass = 'theme-moon-icon';

  const updateIcons = (isDark: boolean) => {
    const sunIcons = document.querySelectorAll(`.${sunIconClass}`);
    const moonIcons = document.querySelectorAll(`.${moonIconClass}`);
    
    if (isDark) {
      sunIcons.forEach(icon => icon.classList.remove('hidden'));
      moonIcons.forEach(icon => icon.classList.add('hidden'));
    } else {
      sunIcons.forEach(icon => icon.classList.add('hidden'));
      moonIcons.forEach(icon => icon.classList.remove('hidden'));
    }
  };

  const setDarkTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    updateIcons(isDark);
  };

  // Check saved preferences of user
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initiallyDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
  setDarkTheme(initiallyDark);

  const toggleHandler = () => {
    const activeDark = document.documentElement.classList.contains('dark');
    setDarkTheme(!activeDark);
    showToast(`Switched to ${!activeDark ? 'Dark Theme 🌙' : 'Light Theme ☀️'}`, 'info');
  };

  if (toggleBtnDesktop) {
    toggleBtnDesktop.addEventListener('click', toggleHandler);
  }
  if (toggleBtnMobile) {
    toggleBtnMobile.addEventListener('click', toggleHandler);
  }
}

/* ==========================================================================
   02. GLASSNAV & SCROLL SPY
   ========================================================================== */
function initNavbarScroll() {
  const header = document.getElementById('main-header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('glass-nav', 'py-3');
      header.classList.remove('bg-transparent', 'py-5');
    } else {
      header.classList.remove('glass-nav', 'py-3');
      header.classList.add('bg-transparent', 'py-5');
    }

    // Scroll spy link highlighting
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = (section as HTMLElement).offsetTop;
      const sectionHeight = (section as HTMLElement).offsetHeight;
      const sectionId = section.getAttribute('id');
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = sectionId || '';
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('text-brand-orange', 'font-semibold');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('text-brand-orange', 'font-semibold');
      }
    });
  };

  window.addEventListener('scroll', onScroll);
  onScroll(); // initial check
}

/* ==========================================================================
   03. MOBILE MENUDRAWER
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn') as HTMLButtonElement | null;
  const closeBtn = document.getElementById('mobile-menu-close') as HTMLButtonElement | null;
  const menuDrawer = document.getElementById('mobile-menu-drawer');
  const drawerOverlay = document.getElementById('mobile-drawer-overlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  const openDrawer = () => {
    if (menuDrawer && drawerOverlay) {
      menuDrawer.classList.remove('translate-x-full');
      drawerOverlay.classList.remove('hidden', 'opacity-0');
      drawerOverlay.classList.add('opacity-100');
      document.body.classList.add('overflow-hidden');
    }
  };

  const closeDrawer = () => {
    if (menuDrawer && drawerOverlay) {
      menuDrawer.classList.add('translate-x-full');
      drawerOverlay.classList.remove('opacity-100');
      drawerOverlay.classList.add('opacity-0');
      setTimeout(() => {
        drawerOverlay.classList.add('hidden');
      }, 300);
      document.body.classList.remove('overflow-hidden');
    }
  };

  if (menuBtn) menuBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* ==========================================================================
   04. ANIMATED KPI COUNTER
   ========================================================================== */
function initStatsCounter() {
  const elements = document.querySelectorAll('.stat-number');
  const statsArray: Stat[] = [];

  elements.forEach((el) => {
    const rawVal = el.getAttribute('data-target') || '0';
    const targetValue = parseInt(rawVal, 10);
    statsArray.push({
      element: el as HTMLElement,
      targetValue: targetValue,
      currentValue: 0,
      duration: 2000, // 2s duration
      started: false
    });
  });

  const animateStats = (stat: Stat) => {
    if (stat.started) return;
    stat.started = true;
    
    let startTime: number | null = null;
    const startValue = 0;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / stat.duration, 1);
      
      // Quartic Out ease
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      stat.currentValue = Math.floor(easeProgress * stat.targetValue);
      
      stat.element.innerText = stat.currentValue.toLocaleString('en-IN') + (stat.element.getAttribute('data-suffix') || '');
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        stat.element.innerText = stat.targetValue.toLocaleString('en-IN') + (stat.element.getAttribute('data-suffix') || '');
      }
    };

    window.requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const targetElement = entry.target;
        const found = statsArray.find(s => s.element === targetElement);
        if (found) {
          animateStats(found);
          observer.unobserve(targetElement);
        }
      }
    });
  }, { threshold: 0.2 });

  elements.forEach(element => observer.observe(element));
}

/* ==========================================================================
   05. ABOUT TAB PORTAL
   ========================================================================== */
function initAboutTabs() {
  const tabButtons = document.querySelectorAll('.about-tab-btn');
  const tabPanels = document.querySelectorAll('.about-tab-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPanelId = btn.getAttribute('data-target');

      tabButtons.forEach(b => {
        b.classList.remove('bg-brand-blue', 'text-white', 'shadow-md', 'scale-105');
        b.classList.add('bg-white', 'text-slate-700', 'hover:bg-slate-100', 'dark:bg-zinc-800', 'dark:text-slate-300', 'dark:hover:bg-zinc-700');
      });

      btn.classList.add('bg-brand-blue', 'text-white', 'shadow-md', 'scale-105');
      btn.classList.remove('bg-white', 'text-slate-700', 'hover:bg-slate-100', 'dark:bg-zinc-800', 'dark:hover:bg-zinc-700');

      tabPanels.forEach(panel => {
        if (panel.id === targetPanelId) {
          panel.classList.remove('hidden');
          panel.classList.add('animate-fade-in-up');
        } else {
          panel.classList.add('hidden');
          panel.classList.remove('animate-fade-in-up');
        }
      });
    });
  });
}

/* ==========================================================================
   06. INTERACTIVE MEDIA DRIVE CAROUSEL
   ========================================================================== */
function initCarousel() {
  const slides = document.querySelectorAll('.slider-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');
  const carouselContainer = document.getElementById('carousel-container');

  if (slides.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer: ReturnType<typeof setInterval> | null = null;

  const showSlide = (index: number) => {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('bg-orange-600', 'scale-125'));
    dots.forEach(dot => dot.classList.add('bg-slate-300', 'dark:bg-zinc-700'));

    currentIndex = (index + slides.length) % slides.length;
    slides[currentIndex].classList.add('active');
    
    if (dots[currentIndex]) {
      dots[currentIndex].classList.remove('bg-slate-300', 'dark:bg-zinc-700');
      dots[currentIndex].classList.add('bg-orange-600', 'scale-125');
    }
  };

  const nextSlide = () => {
    showSlide(currentIndex + 1);
  };

  const prevSlide = () => {
    showSlide(currentIndex - 1);
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, 5000); // 5 seconds interval
  };

  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoplay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      startAutoplay();
    });
  });

  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoplay);
    carouselContainer.addEventListener('mouseleave', startAutoplay);
  }

  // Initialize first slide
  showSlide(0);
  startAutoplay();
}

/* ==========================================================================
   07. MULTI-STEP DONATION PORTAL & TAX EXEMPTION CALCULATOR
   ========================================================================== */
function initDonationModal() {
  const openDonationButtons = document.querySelectorAll('.open-donate-modal');
  const closeDonationBtn = document.getElementById('close-donate-modal');
  const donationOverlay = document.getElementById('donation-modal-overlay');
  const donationModal = document.getElementById('donation-modal');

  // Steps
  const steps = document.querySelectorAll('.donation-step');
  const stepIndicators = document.querySelectorAll('.donate-step-indicator');
  let activeStep = 1;

  // State selection data
  let selectedCause = 'Child Education Support';
  let selectedAmount = 1000;
  let matchesPreset = true;

  // Step 1 controls
  const presetButtons = document.querySelectorAll('.preset-amount-btn');
  const customAmountInput = document.getElementById('custom-amount-input') as HTMLInputElement | null;
  const causeRadioCards = document.querySelectorAll('.cause-radio-card');
  const calculatedTaxSavingsDisplay = document.getElementById('donation-impact-banner');

  // Step 2 controls
  const taxBracketSelect = document.getElementById('tax-bracket') as HTMLSelectElement | null;
  const calculatedExemptionSpan = document.getElementById('calculated-exemption-amount');
  const donorNameInput = document.getElementById('donor-name') as HTMLInputElement | null;
  const donorEmailInput = document.getElementById('donor-email') as HTMLInputElement | null;
  const donorPhoneInput = document.getElementById('donor-phone') as HTMLInputElement | null;
  const donorPanInput = document.getElementById('donor-pan') as HTMLInputElement | null;

  // Exemption calculation elements
  const finalSummaryAmount = document.getElementById('summary-amount');
  const finalSummaryCause = document.getElementById('summary-cause');
  const finalSummaryTaxSaved = document.getElementById('summary-tax-saved');

  // Navigation operations
  const btnStep1Next = document.getElementById('donate-btn-step1');
  const btnStep2Back = document.getElementById('donate-btn-step2-back');
  const btnStep2Next = document.getElementById('donate-btn-step2');
  const btnStep3Back = document.getElementById('donate-btn-step3-back');
  const btnStep3Pay = document.getElementById('donate-btn-submit-payment');
  const btnStep4Done = document.getElementById('donate-btn-step4-done');
  
  // Custom Dynamic Receipt Certificate elements for Step 4
  const receiptDonorName = document.getElementById('receipt-donor-name');
  const receiptAmountWords = document.getElementById('receipt-amount-words');
  const receiptAmountDigits = document.getElementById('receipt-amount-digits');
  const receiptTaxBenefit = document.getElementById('receipt-tax-benefit');
  const receiptDate = document.getElementById('receipt-date');
  const receiptDocNo = document.getElementById('receipt-doc-no');
  const printCertificateBtn = document.getElementById('print-certificate-btn');

  // Open triggers
  const openModal = () => {
    if (donationOverlay && donationModal) {
      donationOverlay.classList.remove('hidden', 'opacity-0');
      donationOverlay.classList.add('opacity-100');
      donationModal.classList.remove('translate-y-12', 'scale-95');
      document.body.classList.add('overflow-hidden');
      goToStep(1);
    }
  };

  const closeModal = () => {
    if (donationOverlay && donationModal) {
      donationOverlay.classList.remove('opacity-100');
      donationOverlay.classList.add('opacity-0');
      donationModal.classList.add('translate-y-12', 'scale-95');
      setTimeout(() => {
        donationOverlay.classList.add('hidden');
      }, 300);
      document.body.classList.remove('overflow-hidden');
    }
  };

  openDonationButtons.forEach(btn => btn.addEventListener('click', openModal));
  if (closeDonationBtn) closeDonationBtn.addEventListener('click', closeModal);

  // Step Navigator function
  const goToStep = (stepNumber: number) => {
    activeStep = stepNumber;
    steps.forEach(step => {
      const idx = parseInt(step.getAttribute('data-step') || '0', 10);
      if (idx === stepNumber) {
        step.classList.remove('hidden');
        step.classList.add('animate-fade-in-up');
      } else {
        step.classList.add('hidden');
        step.classList.remove('animate-fade-in-up');
      }
    });

    // Update step line headers in UI
    stepIndicators.forEach(ind => {
      const idx = parseInt(ind.getAttribute('data-step') || '0', 10);
      if (idx <= stepNumber) {
        ind.classList.add('text-brand-orange', 'dark:text-orange-500', 'border-brand-orange');
        ind.classList.remove('text-slate-400', 'border-slate-300', 'dark:border-zinc-700');
      } else {
        ind.classList.remove('text-brand-orange', 'dark:text-orange-500', 'border-brand-orange');
        ind.classList.add('text-slate-400', 'border-slate-300', 'dark:border-zinc-700');
      }
    });

    // Run dynamic summaries
    if (stepNumber === 2) {
      updateExemptionCalculation();
    }
    if (stepNumber === 3) {
      updateSummaryStage();
    }
    if (stepNumber === 4) {
      generateInteractiveCertificate();
    }
  };

  // Preset click handlings
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('bg-orange-600', 'text-white', 'border-orange-600', 'scale-105'));
      presetButtons.forEach(b => b.classList.add('bg-white', 'text-slate-700', 'border-slate-200', 'dark:bg-zinc-800', 'dark:text-slate-300', 'dark:border-zinc-700'));
      
      btn.classList.remove('bg-white', 'text-slate-700', 'border-slate-200', 'dark:bg-zinc-800', 'dark:border-zinc-700');
      btn.classList.add('bg-orange-600', 'text-white', 'border-orange-600', 'scale-105');

      selectedAmount = parseInt(btn.getAttribute('data-amount') || '1000', 10);
      if (customAmountInput) customAmountInput.value = ''; // Reset custom field
      matchesPreset = true;

      updateExemptionGlow();
    });
  });

  if (customAmountInput) {
    customAmountInput.addEventListener('input', () => {
      const customVal = parseInt(customAmountInput.value, 10);
      if (!isNaN(customVal) && customVal > 0) {
        selectedAmount = customVal;
        matchesPreset = false;
        
        // Remove preset buttons selection highlight
        presetButtons.forEach(b => {
          b.classList.remove('bg-orange-600', 'text-white', 'border-orange-600', 'scale-105');
          b.classList.add('bg-white', 'text-slate-700', 'border-slate-200', 'dark:bg-zinc-800', 'dark:text-slate-300', 'dark:border-zinc-700');
        });
        updateExemptionGlow();
      }
    });
  }

  // Cause selector cards click
  causeRadioCards.forEach(card => {
    card.addEventListener('click', () => {
      causeRadioCards.forEach(c => c.classList.remove('border-brand-orange', 'bg-orange-50/10'));
      causeRadioCards.forEach(c => c.classList.add('border-slate-200', 'dark:border-zinc-800'));
      
      card.classList.remove('border-slate-200', 'dark:border-zinc-800');
      card.classList.add('border-brand-orange', 'bg-orange-50/10');
      
      selectedCause = card.getAttribute('data-cause') || 'General Foundation Support';
    });
  });

  // Dynamic feedback update banner on pricing
  const updateExemptionGlow = () => {
    if (calculatedTaxSavingsDisplay) {
      // 80G tax limit is 50% threshold saving
      const potential80GExemption = selectedAmount * 0.50;
      calculatedTaxSavingsDisplay.innerHTML = `
        <div class="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-500 mb-1">🔥 80G Tax Exemption Applied!</div>
        <div class="text-sm">By contributing <b class="text-slate-900 dark:text-white">₹${selectedAmount.toLocaleString('en-IN')}</b>, <b class="text-green-600 dark:text-green-500">₹${potential80GExemption.toLocaleString('en-IN')}</b> will be completely exempt from taxable income under Sec 80G.</div>
      `;
    }
  };
  updateExemptionGlow(); // initial glow

  // Dynamic calculations in Step 2 based on income brackets
  const updateExemptionCalculation = () => {
    const rate = taxBracketSelect ? parseFloat(taxBracketSelect.value) : 0.30;
    // 80G deduction reduces taxable income by 50% of the donation amount.
    // So actual tax saved = donation amount * 50% * tax slab rate.
    const actualTaxSaved = selectedAmount * 0.50 * rate;
    
    if (calculatedExemptionSpan) {
      calculatedExemptionSpan.innerText = `₹${actualTaxSaved.toFixed(0)}`;
    }
  };

  if (taxBracketSelect) {
    taxBracketSelect.addEventListener('change', updateExemptionCalculation);
  }

  // Final confirmation review summary calculations
  const updateSummaryStage = () => {
    const rate = taxBracketSelect ? parseFloat(taxBracketSelect.value) : 0.30;
    const actualTaxSaved = selectedAmount * 0.50 * rate;

    if (finalSummaryAmount) finalSummaryAmount.innerText = `₹${selectedAmount.toLocaleString('en-IN')}`;
    if (finalSummaryCause) finalSummaryCause.innerText = selectedCause;
    if (finalSummaryTaxSaved) finalSummaryTaxSaved.innerText = `₹${actualTaxSaved.toFixed(0)} (${(rate * 100).toFixed(0)}% Tax Bracket})`;
  };

  // Convert numbers to word form for receipt certificate elegance
  const numberToWords = (num: number): string => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    const translate = (n: number): string => {
      let str = '';
      if (n >= 100) {
        str += a[Math.floor(n / 100)] + 'Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        str += b[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 0) {
        str += a[n];
      }
      return str;
    };

    let result = '';
    if (num >= 10000000) {
      result += translate(Math.floor(num / 10000000)) + 'Crore ';
      num %= 10000000;
    }
    if (num >= 100000) {
      result += translate(Math.floor(num / 100000)) + 'Lakh ';
      num %= 100000;
    }
    if (num >= 1000) {
      result += translate(Math.floor(num / 1000)) + 'Thousand ';
      num %= 1000;
    }
    result += translate(num);
    return result.trim() + ' Rupees Only';
  };

  // Draw high fidelity interactive certificate details
  const generateInteractiveCertificate = () => {
    const donorName = (donorNameInput && donorNameInput.value.trim()) ? donorNameInput.value.trim() : 'Esteemed Donor';
    const rate = taxBracketSelect ? parseFloat(taxBracketSelect.value) : 0.30;
    const taxSaving = selectedAmount * 0.50 * rate;

    if (receiptDonorName) receiptDonorName.innerText = donorName;
    if (receiptAmountWords) receiptAmountWords.innerText = numberToWords(selectedAmount);
    if (receiptAmountDigits) receiptAmountDigits.innerText = `₹${selectedAmount.toLocaleString('en-IN')}`;
    if (receiptTaxBenefit) receiptTaxBenefit.innerText = `Exemptable Income Amount: ₹${(selectedAmount * 0.50).toLocaleString('en-IN')} (Under Sec 80G)`;
    
    // Date & Document numbers
    const now = new Date();
    if (receiptDate) receiptDate.innerText = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    if (receiptDocNo) {
      const serial = Math.floor(100000 + Math.random() * 900000);
      receiptDocNo.innerText = `NPF/2026-27/80G-${serial}`;
    }
  };

  // Step 1 Validation & Flow
  if (btnStep1Next) {
    btnStep1Next.addEventListener('click', () => {
      if (selectedAmount <= 0) {
        showToast('Please enter a valid donation value.', 'error');
        return;
      }
      goToStep(2);
    });
  }

  // Step 2 Validation & Flow
  if (btnStep2Back) btnStep2Back.addEventListener('click', () => goToStep(1));
  if (btnStep2Next) {
    btnStep2Next.addEventListener('click', () => {
      const name = donorNameInput ? donorNameInput.value.trim() : '';
      const email = donorEmailInput ? donorEmailInput.value.trim() : '';
      const phone = donorPhoneInput ? donorPhoneInput.value.trim() : '';
      const pan = donorPanInput ? donorPanInput.value.trim() : '';

      if (!name) {
        showToast('Please enter your full name.', 'error');
        return;
      }
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }
      if (!phone || phone.length < 10) {
        showToast('Please provide a valid 10-digit telephone number.', 'error');
        return;
      }
      if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(pan)) {
        showToast('Please check the formats of your PAN Card details.', 'error');
        return;
      }

      goToStep(3);
    });
  }

  // Step 3 Validation & Flow
  if (btnStep3Back) btnStep3Back.addEventListener('click', () => goToStep(2));
  if (btnStep3Pay) {
    btnStep3Pay.addEventListener('click', () => {
      // Simulate real-time secure transaction gateway trigger callback
      btnStep3Pay.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Securing Bank Connect...
      `;
      btnStep3Pay.setAttribute('disabled', 'true');

      setTimeout(() => {
        btnStep3Pay.innerHTML = 'Donate Securely';
        btnStep3Pay.removeAttribute('disabled');
        showToast('Transaction fully approved! Certificate Generated.', 'success');
        goToStep(4);
      }, 1500);
    });
  }

  // Done button triggers
  if (btnStep4Done) btnStep4Done.addEventListener('click', closeModal);

  // Print Exemption Certificate callback
  if (printCertificateBtn) {
    printCertificateBtn.addEventListener('click', () => {
      const receiptCard = document.getElementById('receipt-certificate-content');
      if (receiptCard) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>NayePankh Foundation Exemption Certificate</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                <style>
                  body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
                  .receipt-box { border: 2px solid #e2e8f0; border-radius: 8px; padding: 32; position: relative; }
                </style>
              </head>
              <body>
                <div class="receipt-box max-w-4xl mx-auto border-4 border-double border-slate-300 p-8">
                  ${receiptCard.innerHTML}
                </div>
                <script>
                  window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
    });
  }
}

/* ==========================================================================
   08. DYNAMIC ACCORDION (FAQ)
   ========================================================================== */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.accordion-item');

  faqItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    
    if (header) {
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Collapse all other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
        
        // Toggle active item
        if (isActive) {
          item.classList.remove('active');
        } else {
          item.classList.add('active');
        }
      });
    }
  });
}

/* ==========================================================================
   09. FEEDBACK CONTACT FORM HANDLER
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-us-form') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contact-name') as HTMLInputElement | null;
    const emailInput = document.getElementById('contact-email') as HTMLInputElement | null;
    const subjectInput = document.getElementById('contact-subject') as HTMLInputElement | null;
    const msgInput = document.getElementById('contact-message') as HTMLTextAreaElement | null;
    const submitBtn = form.querySelector('[type="submit"]') as HTMLButtonElement | null;

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const subject = subjectInput ? subjectInput.value.trim() : '';
    const message = msgInput ? msgInput.value.trim() : '';

    if (!name ||!email || !subject || !message) {
      showToast('Please insert all requested information fields.', 'error');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      showToast('Please provide a valid email structure.', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Routing feedback...
      `;
      submitBtn.setAttribute('disabled', 'true');
    }

    // Simulate backend submission delay
    setTimeout(() => {
      form.reset();
      if (submitBtn) {
        submitBtn.innerHTML = 'Send Message';
        submitBtn.removeAttribute('disabled');
      }
      showToast('Thank you! Your query has been successfully received.', 'success');
    }, 1200);
  });
}

/* ==========================================================================
   10. VOLUNTEER PANEL MODAL REGISTRATIONS
   ========================================================================== */
function initJoinModal() {
  const joinTriggers = document.querySelectorAll('.open-join-modal');
  const closeBtn = document.getElementById('close-join-modal');
  const modalOverlay = document.getElementById('join-modal-overlay');
  const modalContainer = document.getElementById('join-modal');
  const joinForm = document.getElementById('join-team-form') as HTMLFormElement | null;

  const openJoin = () => {
    if (modalOverlay && modalContainer) {
      modalOverlay.classList.remove('hidden', 'opacity-0');
      modalOverlay.classList.add('opacity-100');
      modalContainer.classList.remove('translate-y-12', 'scale-95');
      document.body.classList.add('overflow-hidden');
    }
  };

  const closeJoin = () => {
    if (modalOverlay && modalContainer) {
      modalOverlay.classList.remove('opacity-100');
      modalOverlay.classList.add('opacity-0');
      modalContainer.classList.add('translate-y-12', 'scale-95');
      setTimeout(() => {
        modalOverlay.classList.add('hidden');
      }, 300);
      document.body.classList.remove('overflow-hidden');
    }
  };

  joinTriggers.forEach(btn => btn.addEventListener('click', openJoin));
  if (closeBtn) closeBtn.addEventListener('click', closeJoin);

  if (joinForm) {
    joinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = (document.getElementById('vol-name') as HTMLInputElement).value.trim();
      const email = (document.getElementById('vol-email') as HTMLInputElement).value.trim();
      const phone = (document.getElementById('vol-phone') as HTMLInputElement).value.trim();
      const city = (document.getElementById('vol-city') as HTMLInputElement).value.trim();
      const specialty = (document.getElementById('vol-specialty') as HTMLSelectElement).value;
      const hours = (document.getElementById('vol-hours') as HTMLSelectElement).value;
      const submitBtn = joinForm.querySelector('[type="submit"]') as HTMLButtonElement | null;

      if (!name || !email || !phone || !city) {
        showToast('Please fill out all personal contact fields.', 'error');
        return;
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        showToast('Please check your email address format.', 'error');
        return;
      }

      if (phone.length < 10) {
        showToast('Provide a valid 10-digit Indian contact number.', 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Registering Application...
        `;
        submitBtn.setAttribute('disabled', 'true');
      }

      setTimeout(() => {
        joinForm.reset();
        if (submitBtn) {
          submitBtn.innerHTML = 'Submit Application';
          submitBtn.removeAttribute('disabled');
        }
        closeJoin();
        showToast('Awesome! Application filed successfully. We will reach out on WhatsApp/Email! 🚀', 'success');
      }, 1500);
    });
  }
}

/* ==========================================================================
   11. DYNAMIC SYSTEM ALERT TOAST
   ========================================================================== */
function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  // Check if active container exists, else construct
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0';
    document.body.appendChild(container);
  }

  const toastCard = document.createElement('div');
  
  // Custom styles for error / success / warning
  let bgClass = 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-xl border border-slate-700/50';
  let icon = `
    <svg class="w-5 h-5 text-blue-500 mr-2.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  `;

  if (type === 'success') {
    bgClass = 'bg-green-600 text-white shadow-green-500/10 shadow-xl';
    icon = `
      <svg class="w-5 h-5 text-white mr-2.5 shrink-0 animate-bounce" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    `;
  } else if (type === 'error') {
    bgClass = 'bg-red-600 text-white shadow-red-500/10 shadow-xl';
    icon = `
      <svg class="w-5 h-5 text-white mr-2.5 shrink-0 animate-pulse" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    `;
  }

  toastCard.className = `${bgClass} flex items-center p-4 rounded-lg transform translate-y-4 opacity-0 transition-all duration-300 pointer-events-auto rounded-xl border border-white/10`;
  toastCard.innerHTML = `
    ${icon}
    <div class="text-sm font-medium pr-2 break-words flex-1">${message}</div>
    <button class="ml-2 pl-2 text-white/70 hover:text-white border-l border-white/20 text-xs font-semibold focus:outline-none" onclick="this.parentElement.remove()">
      Dismiss
    </button>
  `;

  container.appendChild(toastCard);

  // Animate Entrance
  setTimeout(() => {
    toastCard.classList.remove('translate-y-4', 'opacity-0');
  }, 10);

  // Auto Dismiss timer
  setTimeout(() => {
    toastCard.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => {
      toastCard.remove();
    }, 300);
  }, 4000);
}
