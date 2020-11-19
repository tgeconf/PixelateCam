import ready from 'domready';

import App from './App';
import Circle from './circle';

ready(() => {
	window.app = new App();
	window.app.init();
	// window.requestAnimationFrame(Circle.updateAll);
	Circle.updateAll();
});
