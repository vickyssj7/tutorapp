angular.module('tutorapp.routes',[])

.config(function($stateProvider, $urlRouterProvider) {
	
	$stateProvider
		.state('menu', {
			url: '/menu',
			templateUrl: getTemplate('menu'),
			controller: 'MenuCtrl',
			abstract:true
		})
		.state('menu.login', {
			url: '/login',
			views: {
				'menuContent': {
					templateUrl: getTemplate('login'),
					controller: 'loginCtrl'
				}
			}
		})
		.state('menu.tutees', {
			url: '/tutees',
			views: {
				'menuContent': {
					templateUrl: getTemplate('tutees'),
					controller: 'tuteesCtrl'
				}
			}
		})
		.state('menu.categories', {
			url: '/categories/:tutee',
			views: {
				'menuContent': {
					templateUrl: getTemplate('categories'),
					controller: 'categoriesCtrl'
				}
			}
		})
		.state('menu.notes', {
			url: '/notes/:category/:category_name',
			views: {
			  'menuContent': {
				templateUrl: getTemplate('tutornotes'),
				controller: 'tutornotes'
			  }
			}
		});
	$urlRouterProvider.otherwise('/menu/login');
});

function getTemplate(file) {
	return 'templates/'+ file +'.html';
}