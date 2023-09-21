/**
 * Добавить анимацию «Появление со смещением»
 * @public
 */
const init = () => {
	/** Элементы с анимацией «Появление со смещением» */
	const fadeElements = document.querySelectorAll('.fade-hidden');
	/** Настройки пересечения элементов с вьюпортом */
	const options = {
		threshold: 0,
	};

	/** Коллбэк, чтобы добавить анимацию «Появление со смещением» */
	const addAnimation = (entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('fade-shown');

				observer.unobserve(entry.target);
			}
		});
	};

	/** Наблюдать за пересечением с вьюпортом */
	const observer = new IntersectionObserver(addAnimation, options);

	if (localStorage.getItem('hasBeenLoaded')) {
		// Вручную запустить анимацию сразу для всех элементов
		fadeElements.forEach((element) => element.classList.add('fade-shown'));
	} else {
		// Начать наблюдение за пересечением
		fadeElements.forEach((element) => observer.observe(element));
	}
};

export default {
	init,
};
