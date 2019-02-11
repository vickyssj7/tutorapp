angular.module('tutorapp.filters', [])
.filter('contains', function() {
	return function (array, needle) {
		return array.indexOf(needle) >= 0;
	};
})
.filter('notcontains', function() {
	return function (array, needle) {
		return array.indexOf(needle) < 0;
	};
});