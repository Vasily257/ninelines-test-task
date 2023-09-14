import './vendor';
import './helpers';
import './components/social';
import {ieFix} from './vendor/ie-fix';
import {vhFix} from './vendor/vh-fix';
import {actualYear} from './modules/actualYear';
import header from './components/header';
import preloader from './components/preloader';
import scrollIndicator from './components/scrollIndicator';
import share from './components/share';
import lazyLoading from './modules/lazyLoading';
import scrollToAnchor from './modules/scrollToAnchor';
import backToTop from './modules/backToTop';
import addFade from './modules/addFade';

ieFix();
vhFix();
actualYear();
scrollToAnchor.init();
backToTop.init();

header.init();
preloader.init();
scrollIndicator.init();
addFade.init();
share.init();

lazyLoading.init();
