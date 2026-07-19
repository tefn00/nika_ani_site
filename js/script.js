const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const navLinks = navigation ? Array.from(navigation.querySelectorAll('a')) : [];
const languageButtons = Array.from(document.querySelectorAll('[data-lang-option]'));

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
    'about.eyebrow': 'ABOUT US',
    'about.title': 'Personal website developers for businesses that need a stronger online presence.',
    'about.intro': 'We are Ani Mamucharashvili and Nika Tepnadze. We build websites for businesses that do not have a website yet, or already have one that does not represent them well enough.',
    'about.approach.title': 'Our approach',
    'about.approach.text': 'We can prepare a website for your business in advance, show you the result, and then offer a price for it. If you want changes, we can adjust the design, structure, content, or features, and the final price will change depending on those updates.',
    'profile.role': 'Developer',
    'ani.age': '19 years old',
    'ani.born': 'Born on 7 March 2007',
    'ani.school': 'Graduated from Tbilisi Public School No. 42, Physics and Mathematics, named after Academician Ilia Vekua, in 2024',
    'ani.course': 'Finished an AI course in Spain',
    'ani.university': 'Studying Computer Science and Artificial Intelligence at BTU, Business and Technology University',
    'nika.age': '19 years old',
    'nika.born': 'Born on 1 June 2006',
    'nika.school': 'Graduated from 163 Public School',
    'nika.course': 'Finished the Mziuri programming course',
    'nika.university': 'Studying Computer Science and Artificial Intelligence at BTU, Business and Technology University',
    'nika.builds': 'Builds clean, responsive websites with practical features for real businesses',
    'nika.works': 'Works with Ani on design decisions, development, and website improvements',
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
    'about.title': 'პერსონალური ვებსაიტების დეველოპერები ბიზნესებისთვის, რომლებსაც ძლიერი ონლაინ παρουσία სჭირდებათ.',
    'about.intro': 'ჩვენ ვართ ანი მამუჩარაშვილი და ნიკა თეფნაძე. ვქმნით ვებსაიტებს ბიზნესებისთვის, რომლებსაც ვებსაიტი ჯერ არ აქვთ, ან არსებული საიტი საკმარისად კარგად არ წარმოაჩენს მათ.',
    'about.approach.title': 'ჩვენი მიდგომა',
    'about.approach.text': 'შეგვიძლია თქვენი ბიზნესისთვის წინასწარ მოვამზადოთ ვებსაიტი, გაჩვენოთ შედეგი და შემდეგ შემოგთავაზოთ ფასი. თუ ცვლილებები დაგჭირდებათ, შეგვიძლია შევცვალოთ დიზაინი, სტრუქტურა, კონტენტი ან ფუნქციები, საბოლოო ფასი კი ამ განახლებებზე იქნება დამოკიდებული.',
    'profile.role': 'დეველოპერი',
    'ani.age': '19 წლის',
    'ani.born': 'დაიბადა 2007 წლის 7 მარტს',
    'ani.school': '2024 წელს დაამთავრა თბილისის N42 ფიზიკა-მათემატიკის საჯარო სკოლა, აკადემიკოს ილია ვეკუას სახელობის',
    'ani.course': 'დაასრულა AI კურსი ესპანეთში',
    'ani.university': 'სწავლობს კომპიუტერულ მეცნიერებასა და ხელოვნურ ინტელექტს BTU-ში, ბიზნესისა და ტექნოლოგიების უნივერსიტეტში',
    'nika.age': '19 წლის',
    'nika.born': 'დაიბადა 2006 წლის 1 ივნისს',
    'nika.school': 'დაამთავრა 163-ე საჯარო სკოლა',
    'nika.course': 'დაასრულა მზიურის პროგრამირების კურსი',
    'nika.university': 'სწავლობს კომპიუტერულ მეცნიერებასა და ხელოვნურ ინტელექტს BTU-ში, ბიზნესისა და ტექნოლოგიების უნივერსიტეტში',
    'nika.builds': 'ქმნის სუფთა, რესპონსიულ ვებსაიტებს პრაქტიკული ფუნქციებით რეალური ბიზნესებისთვის',
    'nika.works': 'ანისთან ერთად მუშაობს დიზაინის გადაწყვეტილებებზე, დეველოპმენტსა და საიტის გაუმჯობესებაზე',
    'footer.text': 'გააზრებული ციფრული გამოცდილებები, შექმნილი ერთად.',
    'footer.copyright': '(c)',
    'footer.rights': 'ყველა უფლება დაცულია.',
    'footer.top': 'ზემოთ დაბრუნება',
  },
};

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
