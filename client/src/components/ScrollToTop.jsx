import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Automatically resets window scroll to (0, 0) whenever the route pathname changes,
 * or smoothly scrolls to the target anchor element if a hash (#) is present.
 */
const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            // Small timeout to allow target DOM element to render
            const timer = setTimeout(() => {
                const targetId = hash.replace('#', '');
                const element = document.getElementById(targetId) || document.querySelector(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 50);
            return () => clearTimeout(timer);
        } else {
            // Instant scroll to top on new page navigation
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant'
            });
        }
    }, [pathname, hash]);

    return null;
};

export default ScrollToTop;
