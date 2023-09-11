import './vendor';
import './helpers';
import './components/social';
import {ieFix} from './vendor/ie-fix';
import {vhFix} from './vendor/vh-fix';
import {actualYear} from './modules/actualYear';
import header from './components/header';
import preloader from './components/preloader';
import pageScroll from './components/page-scroll';
import share from './components/share';
import lazyLoading from './modules/lazyLoading';
import scrollToAnchor from './modules/scrollToAnchor';
import backToTop from './modules/backToTop';

ieFix();
vhFix();
actualYear();
scrollToAnchor.init();
backToTop.init();

header.init();
preloader.init();
pageScroll.init();
share.init();

lazyLoading.init();
