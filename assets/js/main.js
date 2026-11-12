
/* ==========================================
   SOUTHWEST CHAPTER
   MAIN JAVASCRIPT
========================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------
       MOBILE NAVIGATION
    -------------------------------------- */

    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.navigation');

    if (menuToggle && navigation) {

        menuToggle.addEventListener('click', () => {

            const isOpen = navigation.classList.toggle('show');

            menuToggle.setAttribute(
                'aria-expanded',
                String(isOpen)
            );

        });

        // Close menu after selecting a navigation link

        navigation.querySelectorAll('a').forEach(link => {

            link.addEventListener('click', () => {

                navigation.classList.remove('show');

                menuToggle.setAttribute(
                    'aria-expanded',
                    'false'
                );

            });

        });

        // Close menu when clicking outside

        document.addEventListener('click', event => {

            const clickedInsideMenu =
                navigation.contains(event.target);

            const clickedToggle =
                menuToggle.contains(event.target);

            if (!clickedInsideMenu && !clickedToggle) {

                navigation.classList.remove('show');

                menuToggle.setAttribute(
                    'aria-expanded',
                    'false'
                );

            }

        });

    }


    /* --------------------------------------
       ACTIVE NAVIGATION LINK
    -------------------------------------- */

    const currentPage = window.location.hash || '#home';

    document.querySelectorAll('.navigation a[href^="#"]').forEach(link => {

        if (link.getAttribute('href') === currentPage) {

            link.classList.add('active');

        }

    });


    /* --------------------------------------
       SMOOTH SCROLL
    -------------------------------------- */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener('click', event => {

            const targetId = link.getAttribute('href');

            if (!targetId || targetId === '#') {
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                history.replaceState(null, '', targetId);

            }

        });

    });


    /* --------------------------------------
       HERO BUTTON INTERACTIONS
    -------------------------------------- */

    const discoverButton = document.querySelector(
        '.secondary-button'
    );

    if (discoverButton) {

        discoverButton.addEventListener('click', event => {

            const target = document.querySelector('#about');

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: 'smooth'
                });

            }

        });

    }


    /* --------------------------------------
       HEADER SCROLL EFFECT
    -------------------------------------- */

    const header = document.querySelector('.main-header');

    if (header) {

        window.addEventListener('scroll', () => {

            if (window.scrollY > 40) {

                header.classList.add('header-scrolled');

            } else {

                header.classList.remove('header-scrolled');

            }

        });

    }


    /* --------------------------------------
       FOOTER YEAR
    -------------------------------------- */

    const yearElement = document.getElementById('current-year');

    if (yearElement) {

        yearElement.textContent = new Date().getFullYear();

    }


    /* --------------------------------------
       INITIALIZATION
    -------------------------------------- */

    console.log('Southwest Chapter website initialized.');

});
