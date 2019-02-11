angular.module('tutorapp', ['ionic','ionic-material','tutorapp.controller','tutorapp.services','tutorapp.routes','tutorapp.filters'])
.constant('TUTOR_API', {
	'server': 'http://tutormate.mydigitallab.in/api'
})
.config(function($httpProvider) {
        $httpProvider.interceptors.push(['$q', '$location', '$window', '$rootScope' , function($q, $location, $window, $rootScope) {
            return {
                'request': function(config) {
                    config.headers = config.headers || {};
                    $rootScope.isLoggedIn = window.localStorage['is_logged'] || 0;
					$rootScope.login_token = window.localStorage['auth_token'] || null;
					$rootScope.logged_user = window.localStorage['logged_user'] || null;
					$rootScope.profile_img = window.localStorage['profile_img'] || null;
					$rootScope.logged_user_name = window.localStorage['tutor_name'];
					if ($rootScope.isLoggedIn == 1 && $rootScope.login_token) {
						config.headers.Authorization = 'Bearer ' + $rootScope.login_token;
					}
                    return config;
                },
                'responseError': function(response) {
                    if (response.status === 407) {
                        if (response.data.logout) {
                        }
                    }
                    var i = 1;
                    if (response.status === 401 || response.status === 403 || response.status === 400) {
                    }
                    return $q.reject(response);
                }
            };
        }]);
    })
.run(function($ionicPlatform, $rootScope, $location, $timeout, $state, $ionicPopup, $ionicLoading, $ionicHistory, $ionicViewSwitcher, TutorApi, connectionCheck) {
	
	
	$ionicPlatform.ready(function() {
		$rootScope.goBackState = function(){
		  $ionicViewSwitcher.nextDirection('back');
		  $ionicHistory.goBack(); 
		}
		if(window.localStorage['is_logged'] != null) {
			$rootScope.is_loggedin = window.localStorage['is_logged'];
		}
		if(window.localStorage['logged_user'] != null && window.localStorage['logged_user'] > 0) {
			$rootScope.logged_user = window.localStorage['logged_user'];
			$rootScope.logged_user_name = window.localStorage['tutor_name'];
		}
		if(connectionCheck.hasConnection() == false) {
			$ionicPopup.alert({
				title: "Connection Error!",
				template: "Please check your internet connection, or connect to a faster internet!"
			});
			return false;
		}
		if($rootScope.logged_user > 0) {
			TutorApi.checkUser($rootScope.logged_user).then(function(res) {
				if(res.data.succ != 1) {
					window.localStorage.removeItem('logged_user');
					window.localStorage.removeItem('is_logged');
					window.localStorage.removeItem('auth_token');
					$rootScope.profile_img = res.data.profile_img;
					$ionicPopup.alert({
						title: "Validation Error!",
						template: "Please try logging into your account again"
					});
					$state.go('menu.login',false,{reload: true});
				}
			}, function(err) {
				if(angular.isDefined(err.data.succ) && err.data.succ == 0) {
					window.localStorage.removeItem('logged_user');
					window.localStorage.removeItem('is_logged');
					window.localStorage.removeItem('auth_token');
					delete $rootScope.profile_img;
					$ionicPopup.alert({
						title: "Validation Error!",
						template: "Please try logging into your account again"
					});
					$state.go('menu.login',false,{reload: true});
				}
			});
		}
		
		
		if (window.cordova && window.Keyboard) {
			window.Keyboard.hideKeyboardAccessoryBar(true);
		}
		
		if(connectionCheck.hasConnection()==false) {
			$ionicPopup.alert({
			  title: 'Connection Error!',
			  template: 'Please check if you are connected to fast internet connection.'
			});
			return false;
		}
		
		
		$rootScope.useremail = window.localStorage['useremail'] || null;
		if(angular.isDefined($rootScope.is_loggedin) && $rootScope.is_loggedin=="1") {
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.go('menu.tutees',false,{reload: true});
		}
		

		if (window.StatusBar) {
			// Set the statusbar to use the default style, tweak this to
			// remove the status bar on iOS or change it to use white instead of dark colors.
			StatusBar.styleDefault();
		}
	});
});
