const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const navLinks = navigation ? Array.from(navigation.querySelectorAll('a')) : [];
const languageButtons = Array.from(document.querySelectorAll('[data-lang-option]'));
const bookingForm = document.querySelector('#booking-form');

const translations = {
  en: {
    'menu.open': 'Open menu',
    'nav.home': 'Home',
    'nav.about': 'About us',
    'nav.services': 'Services',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',
    'nav.cta': "Let's talk",
    'home.eyebrow': 'DESIGN x DEVELOPMENT',
    'home.title': 'We build digital experiences <em>together.</em>',
    'home.text': 'We are a couple of passionate developers turning ideas into clean, functional, and beautiful websites.',
    'home.work': 'View our work',
    'home.contact': 'Contact us',
    'services.eyebrow': 'WHAT WE DO',
    'services.title': 'Built for the way people use the web.',
    'services.text': 'We combine creativity and code to deliver modern web solutions.',
    'services.web.title': 'Web development',
    'services.web.text': 'Fast, responsive, and user-friendly websites that work beautifully on every screen.',
    'services.web.link': "Let's build",
    'services.design.title': 'UI/UX design',
    'services.design.text': 'Clear, intuitive interfaces designed around your audience and your goals.',
    'services.design.link': "Let's design",
    'services.performance.title': 'Performance',
    'services.performance.text': 'Thoughtful improvements that help your site feel quick, smooth, and reliable.',
    'services.performance.link': "Let's improve",
    'projects.eyebrow': 'SELECTED WORK',
    'projects.title': 'A few projects we are proud of.',
    'projects.more': 'See more projects',
    'projects.brand': 'Brand website',
    'projects.portfolio': 'Creative portfolio',
    'projects.business': 'Business platform',
    'contact.eyebrow': 'HAVE A PROJECT?',
    'contact.title': "Let's make something great.",
    'contact.say': 'Say hello',
    'booking.name': 'Your name',
    'booking.email': 'Your email',
    'booking.date': 'Meeting date',
    'booking.time': 'Meeting time',
    'booking.time.placeholder': 'Choose time',
    'booking.duration': 'Meeting length',
    'booking.duration.15': '15 min',
    'booking.duration.30': '30 min',
    'booking.notes': 'Project notes',
    'booking.notes.placeholder': 'Tell us what you want to build',
    'booking.send': 'Send!',
    'about.eyebrow': 'ABOUT US',
    'about.title': 'Personal website developers for businesses that need a stronger online presence.',
    'about.intro': 'We are Ani Mamucharashvili and Nika Tepnadze. We build websites for businesses that do not have a website yet, or already have one that does not represent them well enough.',
    'about.approach.title': 'Our approach',
    'about.approach.text': 'We can prepare a website for your business in advance, show you the result, and then offer a price for it. If you want changes, we can adjust the design, structure, content, or features, and the final price will change depending on those updates.',
    'profile.role': 'Developer',
    'ani.name': 'Ani<br />Mamucharashvili',
    'ani.age': '19 years old',
    'ani.born': 'Born on 7 March 2007',
    'ani.school': 'Graduated from Tbilisi Public School No. 42, Physics and Mathematics, named after Academician Ilia Vekua, in 2024',
    'ani.course': 'Finished an AI course in Spain',
    'ani.university': 'Studying Computer Science and Artificial Intelligence at BTU, Business and Technology University',
    'nika.name': 'Nika<br />Tepnadze',
    'nika.age': '19 years old',
    'nika.born': 'Born on 1 June 2006',
    'nika.school': 'Graduated from 163 Public School',
    'nika.course': 'Finished the Mziuri programming course',
    'nika.university': 'Studying Computer Science and Artificial Intelligence at BTU, Business and Technology University',
    'footer.text': 'Thoughtful digital experiences, made together.',
    'footer.copyright': '(c)',
    'footer.rights': 'All rights reserved.',
    'footer.top': 'Back to top',
  },
  ka: {
    'menu.open': 'მენიუს გახსნა',
    'nav.home': 'მთავარი',
    'nav.about': 'ჩვენ შესახებ',
    'nav.services': 'სერვისები',
    'nav.projects': 'პროექტები',
    'nav.contact': 'კონტაქტი',
    'nav.cta': 'დაგვიკავშირდით',
    'home.eyebrow': 'დიზაინი x დეველოპმენტი',
    'home.title': 'ჩვენ ვქმნით ციფრულ გამოცდილებებს <em>ერთად.</em>',
    'home.text': 'ჩვენ ვართ დეველოპერების წყვილი, რომელიც იდეებს სუფთა, ფუნქციურ და ლამაზ ვებსაიტებად აქცევს.',
    'home.work': 'ნახეთ ნამუშევრები',
    'home.contact': 'კონტაქტი',
    'services.eyebrow': 'რას ვაკეთებთ',
    'services.title': 'ვქმნით ვებსაიტებს ისე, როგორც ადამიანები იყენებენ ვებს.',
    'services.text': 'კრეატივსა და კოდს ვაერთიანებთ თანამედროვე ვებ გადაწყვეტილებებისთვის.',
    'services.web.title': 'ვებ დეველოპმენტი',
    'services.web.text': 'სწრაფი, რესპონსიული და მარტივად გამოსაყენებელი ვებსაიტები ყველა ეკრანისთვის.',
    'services.web.link': 'ავაწყოთ',
    'services.design.title': 'UI/UX დიზაინი',
    'services.design.text': 'მარტივი და გასაგები ინტერფეისები, შექმნილი თქვენი აუდიტორიისა და მიზნებისთვის.',
    'services.design.link': 'დავგეგმოთ დიზაინი',
    'services.performance.title': 'ოპტიმიზაცია',
    'services.performance.text': 'გაუმჯობესებები, რომ თქვენი საიტი იყოს სწრაფი, გლუვი და სანდო.',
    'services.performance.link': 'გავაუმჯობესოთ',
    'projects.eyebrow': 'რჩეული ნამუშევრები',
    'projects.title': 'რამდენიმე პროექტი, რომლითაც ვამაყობთ.',
    'projects.more': 'მეტი პროექტი',
    'projects.brand': 'ბრენდის ვებსაიტი',
    'projects.portfolio': 'კრეატიული პორტფოლიო',
    'projects.business': 'ბიზნეს პლატფორმა',
    'contact.eyebrow': 'გაქვთ პროექტი?',
    'contact.title': 'შევქმნათ რამე კარგი.',
    'contact.say': 'მოგვწერეთ',
    'about.eyebrow': 'ჩვენ შესახებ',
    'about.title': 'პერსონალური ვებსაიტების დეველოპერები ბიზნესებისთვის, რომლებსაც ძლიერი ონლაინ წარდგენა სჭირდებათ.',
    'about.intro': 'ჩვენ ვართ ანი მამუჩარაშვილი და ნიკა თეფნაძე. ვქმნით ვებსაიტებს ბიზნესებისთვის, რომლებსაც ვებსაიტი ჯერ არ აქვთ, ან არსებული საიტი საკმარისად კარგად არ წარმოაჩენს მათ.',
    'about.approach.title': 'ჩვენი მიდგომა',
    'about.approach.text': 'შეგვიძლია თქვენი ბიზნესისთვის წინასწარ მოვამზადოთ ვებსაიტი, გაჩვენოთ შედეგი და შემდეგ შემოგთავაზოთ ფასი. თუ ცვლილებები დაგჭირდებათ, შეგვიძლია შევცვალოთ დიზაინი, სტრუქტურა, კონტენტი ან ფუნქციები, საბოლოო ფასი კი ამ განახლებებზე იქნება დამოკიდებული.',
    'profile.role': 'დეველოპერი',
    'ani.name': 'ანი<br />მამუჩარაშვილი',
    'ani.age': '19 წლის',
    'ani.born': 'დაიბადა 2007 წლის 7 მარტს',
    'ani.school': '2024 წელს დაამთავრა თბილისის N42 ფიზიკა-მათემატიკის საჯარო სკოლა, აკადემიკოს ილია ვეკუას სახელობის',
    'ani.course': 'დაასრულა AI კურსი ესპანეთში',
    'ani.university': 'სწავლობს კომპიუტერულ მეცნიერებასა და ხელოვნურ ინტელექტს BTU-ში, ბიზნესისა და ტექნოლოგიების უნივერსიტეტში',
    'nika.name': 'ნიკა<br />ტეფნაძე',
    'nika.age': '19 წლის',
    'nika.born': 'დაიბადა 2006 წლის 1 ივნისს',
    'nika.school': 'დაამთავრა 163-ე საჯარო სკოლა',
    'nika.course': 'დაასრულა მზიურის პროგრამირების კურსი',
    'nika.university': 'სწავლობს კომპიუტერულ მეცნიერებასა და ხელოვნურ ინტელექტს BTU-ში, ბიზნესისა და ტექნოლოგიების უნივერსიტეტში',
    'footer.text': 'გააზრებული ციფრული გამოცდილებები, შექმნილი ერთად.',
    'footer.copyright': '(c)',
    'footer.rights': 'ყველა უფლება დაცულია.',
    'footer.top': 'ზემოთ დაბრუნება',
  },
};

Object.assign(translations.en, {
  'meta.home.title': 'Nika & Ani - Website Developers',
  'meta.home.description': 'Personal website developers creating modern business websites.',
  'meta.about.title': 'About Us - Nika & Ani',
  'meta.about.description': 'About Ani Mamucharashvili and Nika Tepnadze, personal website developers.',
  'nav.main': 'Main navigation',
  'language.switch': 'Language switch',
  'logo.alt': 'Nika & Ani logo',
  'home.hero.alt': 'The people behind Nika and Ani',
  'services.web.aria': 'Ask about web development',
  'services.design.aria': 'Ask about UI and UX design',
  'services.performance.aria': 'Ask about performance optimisation',
  'projects.preview.alt': 'Website project preview',
  'skills.aria': 'Programming languages we know',
  'ani.photo.alt': 'Ani Mamucharashvili',
  'nika.photo.alt': 'Nika Tepnadze',
});

Object.assign(translations.ka, {
  'meta.home.title': 'ნიკა და ანი - ვებსაიტების დეველოპერები',
  'meta.home.description': 'პერსონალური ვებსაიტების დეველოპერები, რომლებიც თანამედროვე ბიზნეს ვებსაიტებს ქმნიან.',
  'meta.about.title': 'ჩვენ შესახებ - ნიკა და ანი',
  'meta.about.description': 'ანი მამუჩარაშვილისა და ნიკა ტეფნაძის შესახებ, პერსონალური ვებსაიტების დეველოპერები.',
  'menu.open': 'მენიუს გახსნა',
  'nav.main': 'მთავარი ნავიგაცია',
  'language.switch': 'ენის შეცვლა',
  'logo.alt': 'ნიკა და ანის ლოგო',
  'nav.home': 'მთავარი',
  'nav.about': 'ჩვენ შესახებ',
  'nav.services': 'სერვისები',
  'nav.projects': 'პროექტები',
  'nav.contact': 'კონტაქტი',
  'nav.cta': 'დაგვიკავშირდით',
  'home.eyebrow': 'დიზაინი x დეველოპმენტი',
  'home.title': 'ჩვენ ვქმნით ციფრულ გამოცდილებებს <em>ერთად.</em>',
  'home.text': 'ჩვენ ვართ დეველოპერების წყვილი, რომელიც იდეებს სუფთა, ფუნქციურ და ლამაზ ვებსაიტებად აქცევს.',
  'home.work': 'ნახეთ ჩვენი ნამუშევრები',
  'home.contact': 'დაგვიკავშირდით',
  'home.hero.alt': 'ნიკა და ანი',
  'services.eyebrow': 'რას ვაკეთებთ',
  'services.title': 'ვებსაიტებს ვქმნით ისე, როგორც ადამიანები რეალურად იყენებენ ვებს.',
  'services.text': 'კრეატივსა და კოდს ვაერთიანებთ თანამედროვე ვებ გადაწყვეტილებების შესაქმნელად.',
  'services.web.title': 'ვებ დეველოპმენტი',
  'services.web.text': 'სწრაფი, რესპონსიული და მარტივად გამოსაყენებელი ვებსაიტები, რომლებიც ყველა ეკრანზე კარგად მუშაობს.',
  'services.web.link': 'ავაწყოთ',
  'services.web.aria': 'ვებ დეველოპმენტის შესახებ კითხვა',
  'services.design.title': 'UI/UX დიზაინი',
  'services.design.text': 'გასაგები და ინტუიციური ინტერფეისები, შექმნილი თქვენი აუდიტორიისა და მიზნებისთვის.',
  'services.design.link': 'დავგეგმოთ დიზაინი',
  'services.design.aria': 'UI და UX დიზაინის შესახებ კითხვა',
  'services.performance.title': 'ოპტიმიზაცია',
  'services.performance.text': 'გააზრებული გაუმჯობესებები, რომ თქვენი საიტი იყოს სწრაფი, გლუვი და სანდო.',
  'services.performance.link': 'გავაუმჯობესოთ',
  'services.performance.aria': 'ოპტიმიზაციის შესახებ კითხვა',
  'projects.eyebrow': 'რჩეული ნამუშევრები',
  'projects.title': 'რამდენიმე პროექტი, რომლითაც ვამაყობთ.',
  'projects.more': 'მეტი პროექტის ნახვა',
  'projects.brand': 'ბრენდის ვებსაიტი',
  'projects.portfolio': 'კრეატიული პორტფოლიო',
  'projects.business': 'ბიზნეს პლატფორმა',
  'projects.preview.alt': 'ვებსაიტის პროექტის ხედი',
  'contact.eyebrow': 'გაქვთ პროექტი?',
  'contact.title': 'შევქმნათ რამე კარგი.',
  'contact.say': 'მოგვწერეთ',
  'booking.name': 'თქვენი სახელი',
  'booking.email': 'თქვენი ელ. ფოსტა',
  'booking.date': 'შეხვედრის თარიღი',
  'booking.time': 'შეხვედრის დრო',
  'booking.time.placeholder': 'აირჩიეთ დრო',
  'booking.duration': 'შეხვედრის ხანგრძლივობა',
  'booking.duration.15': '15 წუთი',
  'booking.duration.30': '30 წუთი',
  'booking.notes': 'პროექტის დეტალები',
  'booking.notes.placeholder': 'მოგვწერეთ, რისი შექმნა გსურთ',
  'booking.send': 'გაგზავნა!',
  'about.eyebrow': 'ჩვენ შესახებ',
  'about.title': 'პერსონალური ვებსაიტების დეველოპერები ბიზნესებისთვის, რომლებსაც ძლიერი ონლაინ წარდგენა სჭირდებათ.',
  'about.intro': 'ჩვენ ვართ ანი მამუჩარაშვილი და ნიკა ტეფნაძე. ვქმნით ვებსაიტებს ბიზნესებისთვის, რომლებსაც ვებსაიტი ჯერ არ აქვთ, ან არსებული საიტი საკმარისად კარგად არ წარმოაჩენს მათ.',
  'about.approach.title': 'ჩვენი მიდგომა',
  'about.approach.text': 'შეგვიძლია თქვენი ბიზნესისთვის წინასწარ მოვამზადოთ ვებსაიტი, გაჩვენოთ შედეგი და შემდეგ შემოგთავაზოთ ფასი. თუ ცვლილებები დაგჭირდებათ, შეგვიძლია შევცვალოთ დიზაინი, სტრუქტურა, კონტენტი ან ფუნქციები. საბოლოო ფასი ამ განახლებებზე იქნება დამოკიდებული.',
  'skills.aria': 'პროგრამირების ენები, რომლებიც ვიცით',
  'profile.role': 'დეველოპერი',
  'ani.name': 'ანი<br />მამუჩარაშვილი',
  'ani.photo.alt': 'ანი მამუჩარაშვილი',
  'ani.age': '19 წლის',
  'ani.born': 'დაიბადა 2007 წლის 7 მარტს',
  'ani.school': '2024 წელს დაამთავრა თბილისის N42 ფიზიკა-მათემატიკის საჯარო სკოლა, აკადემიკოს ილია ვეკუას სახელობის',
  'ani.course': 'დაასრულა AI კურსი ესპანეთში',
  'ani.university': 'სწავლობს კომპიუტერულ მეცნიერებასა და ხელოვნურ ინტელექტს BTU-ში, ბიზნესისა და ტექნოლოგიების უნივერსიტეტში',
  'nika.name': 'ნიკა<br />ტეფნაძე',
  'nika.photo.alt': 'ნიკა ტეფნაძე',
  'nika.age': '19 წლის',
  'nika.born': 'დაიბადა 2006 წლის 1 ივნისს',
  'nika.school': 'დაამთავრა 163-ე საჯარო სკოლა',
  'nika.course': 'დაასრულა მზიურის პროგრამირების კურსი',
  'nika.university': 'სწავლობს კომპიუტერულ მეცნიერებასა და ხელოვნურ ინტელექტს BTU-ში, ბიზნესისა და ტექნოლოგიების უნივერსიტეტში',
  'footer.text': 'გააზრებული ციფრული გამოცდილებები, შექმნილი ერთად.',
  'footer.copyright': '(c)',
  'footer.rights': 'ყველა უფლება დაცულია.',
  'footer.top': 'ზემოთ დაბრუნება',
});

const closeMenu = () => {
  navigation?.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  if (menuButton) menuButton.querySelector('i').className = 'fa-solid fa-bars';
};

const getCurrentNavTarget = () => {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  if (page === 'about.html') {
    return './about.html';
  }

  return window.location.hash || '#home';
};

const setActiveNavLink = (target = getCurrentNavTarget()) => {
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const isHomeLink = target === '#home' && (href === '#home' || href === './index.html#home');
    link.classList.toggle('is-active', href === target || isHomeLink);
  });
};

const setLanguage = (language) => {
  const selectedLanguage = translations[language] ? language : 'en';

  document.documentElement.lang = selectedLanguage === 'ka' ? 'ka' : 'en';

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;
    if (translations[selectedLanguage][key]) element.textContent = translations[selectedLanguage][key];
  });

  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    const key = element.dataset.i18nHtml;
    if (translations[selectedLanguage][key]) element.innerHTML = translations[selectedLanguage][key];
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const key = element.dataset.i18nAriaLabel;
    if (translations[selectedLanguage][key]) element.setAttribute('aria-label', translations[selectedLanguage][key]);
  });

  document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
    const key = element.dataset.i18nAlt;
    if (translations[selectedLanguage][key]) element.setAttribute('alt', translations[selectedLanguage][key]);
  });

  document.querySelectorAll('[data-i18n-content]').forEach((element) => {
    const key = element.dataset.i18nContent;
    if (translations[selectedLanguage][key]) element.setAttribute('content', translations[selectedLanguage][key]);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    if (translations[selectedLanguage][key]) element.setAttribute('placeholder', translations[selectedLanguage][key]);
  });

  languageButtons.forEach((button) => {
    const isActive = button.dataset.langOption === selectedLanguage;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive);
  });

  localStorage.setItem('siteLanguage', selectedLanguage);
};

menuButton?.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', isOpen);
  menuButton.querySelector('i').className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    setActiveNavLink(link.getAttribute('href'));
    closeMenu();
  });
});

document.addEventListener('click', (event) => {
  if (!navigation?.classList.contains('is-open')) return;
  if (navigation.contains(event.target) || menuButton?.contains(event.target)) return;
  closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 800) closeMenu();
});

window.addEventListener('hashchange', () => setActiveNavLink());
setActiveNavLink();

languageButtons.forEach((button) => {
  button.addEventListener('click', () => setLanguage(button.dataset.langOption));
});

setLanguage(localStorage.getItem('siteLanguage') || 'en');

document.querySelector('#year').textContent = new Date().getFullYear();

const dateInput = bookingForm?.querySelector('input[name="date"]');
if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

bookingForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!bookingForm.reportValidity()) return;

  const data = new FormData(bookingForm);
  const selectedLanguage = document.documentElement.lang === 'ka' ? 'ka' : 'en';
  const labels = selectedLanguage === 'ka'
    ? {
        subject: 'ახალი შეხვედრის მოთხოვნა',
        name: 'სახელი',
        email: 'ელ. ფოსტა',
        date: 'თარიღი',
        time: 'დრო',
        duration: 'ხანგრძლივობა',
        notes: 'პროექტის დეტალები',
      }
    : {
        subject: 'New meeting request',
        name: 'Name',
        email: 'Email',
        date: 'Date',
        time: 'Time',
        duration: 'Duration',
        notes: 'Project notes',
      };

  const body = [
    `${labels.name}: ${data.get('name')}`,
    `${labels.email}: ${data.get('email')}`,
    `${labels.date}: ${data.get('date')}`,
    `${labels.time}: ${data.get('time')}`,
    `${labels.duration}: ${data.get('duration')}`,
    `${labels.notes}: ${data.get('notes') || '-'}`,
  ].join('\n');

  window.location.href = `mailto:animamucharashvili@gmail.com,nikatepna2@gmail.com?subject=${encodeURIComponent(labels.subject)}&body=${encodeURIComponent(body)}`;
});
