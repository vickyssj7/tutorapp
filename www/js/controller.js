angular.module('tutorapp.controller', [])
.controller('loginCtrl', function($scope, $state, $location, $timeout, $ionicHistory, $rootScope, $ionicLoading, $ionicPopup, TutorApi) {
	$scope.user = {};
	$scope.login = function() {
		showLoader($ionicLoading, 'Validating Credentials');
		TutorApi.login($scope.user).then(function(res) {
			console.log(res);
			delete $scope.error;
			delete $scope.success;
			$scope.user.password = '';
			$scope.user.username = '';
			if(typeof res.data.access_token != 'undefined') {
				$scope.success = 'Authenticated Successfully';
				$rootScope.is_loggedin = 1;
				window.localStorage['auth_token'] = res.data.access_token;
				window.localStorage['logged_user'] = res.data.logged_user;
				window.localStorage['logged_user_email'] = res.data.logged_user_email;
				window.localStorage['tutor_name'] = res.data.tutor_name;
				window.localStorage['profile_img'] = res.data.profile_img;
				$rootScope.profile_img = res.data.profile_img;
				$rootScope.logged_user_name = res.data.tutor_name;
				window.localStorage['is_logged'] = 1
				setTimeout(function() {
					delete $scope.success;
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go('menu.tutees',false,{reload: true});
				}, 1500);
			}
			hideLoader($ionicLoading);
		}, function(err) {
			$scope.user.password = '';
			delete $scope.success;
			delete $rootScope.is_loggedin;
			delete $rootScope.useremail;
			window.localStorage.removeItem('is_logged');
			window.localStorage.removeItem('auth_token');
			window.localStorage.removeItem('tutor_name');
			window.localStorage.removeItem('tutor_email');
			window.localStorage.removeItem('profile_img');
			delete $rootScope.profile_img;
			delete $rootScope.logged_user_name;
			window.localStorage.removeItem('logged_user');
			window.localStorage.removeItem('logged_user_email');
			if(typeof err.data != 'undefined') {
				$scope.error = err.data.error;
			}
			hideLoader($ionicLoading);
			console.log(err);
		});
	}
})
.controller('logoutCtrl', function($scope, $state, $rootScope, $ionicHistory, $ionicLoading, $ionicPopup) {
	$scope.logout = function() {
		showLoader($ionicLoading, 'Logging you out');
		setTimeout(function() {
			hideLoader($ionicLoading);
			delete $rootScope.is_loggedin;
			delete $rootScope.useremail;
			delete window.localStorage['auth_token'];
			delete window.localStorage['is_logged'];
			delete window.localStorage['logged_user'];
			delete window.localStorage['selectedTutee'];
			delete window.localStorage['selectedTuteeId'];
			delete window.localStorage['traffic_light'];
			delete window.localStorage['logged_user_email'];
			delete window.localStorage['tutor_name'];
			delete window.localStorage['tutor_email'];
			delete window.localStorage['profile_img'];
			$ionicPopup.alert({
				title: 'Logged Out!',
				template: 'You\'ve successfully been logged out of device.'
			});
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.go('menu.login', {}, {reload: true});
		}, 2500);
	}
})
.controller('tuteesCtrl', function($scope, $state, $rootScope, $ionicHistory, $ionicActionSheet,  $ionicLoading, $ionicPopup, TutorApi, SheetApi, tempSessionData) {
	
	delete $scope.tutees;
	$scope.$on('$ionicView.enter', function() {
		showLoader($ionicLoading, 'Loading Tutees');
		var loggedTutorId = window.localStorage['logged_user'];
		window.localStorage.removeItem('selectedTutee');
		window.localStorage.removeItem('selectedTuteeId');
		delete window.localStorage['traffic_light'];
		console.log(loggedTutorId);
		$scope.loadTutees = function(loggedTutorId) {
			$scope.tutees = [];
			$scope.info_msg = "Loading Tutees...";
			TutorApi.getTutees(loggedTutorId).then(function(res) {
				console.log(res);
				hideLoader($ionicLoading)
				if(res.data.succ == 1) {
					var data = res.data.data;
					angular.forEach(data, function(val, i) {
						$scope.tutees.push(val);
					});
				} else {
					$scope.info_msg = "No Tutees Found";
				}
				console.log($scope.tutees);
			}, function(err) {
				hideLoader($ionicLoading)
				console.log(err);
				$scope.info_msg = "No Tutees Found, please pull down to refresh.";
				if(err.status == 401) {
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go('menu.login', {}, {location: 'replace'});
					$ionicPopup.alert({
						title: 'Unauthorized Access!',
						template: 'You\'ve to login into your account in order to access this page.'
					});
				}
				
			});
		}
		$scope.loadTutees(loggedTutorId);
		
	});
	
	$scope.doRefresh = function() {
		var loggedTutorId = window.localStorage['logged_user'];
		setTimeout(function() {
			$scope.$broadcast('scroll.refreshComplete');
			showLoader($ionicLoading, 'Refreshing List');
			$scope.loadTutees(loggedTutorId);
		},1200);
	}
	
	$scope.selectedTutee = function(event) {
		console.log($(event.target));
		tempSessionData.destsavedTempData();
		var tutee = $(event.target).parent().attr('data-tuteename') || $(event.target).parent().children().attr('data-tuteename');
		var tutee_id = $(event.target).parent().attr('data-tutee') || $(event.target).parent().children().attr('data-tutee');
		console.log(tutee);
		console.log(tutee_id);
		window.localStorage['selectedTutee'] = tutee;
		window.localStorage['selectedTuteeId'] = tutee_id;
		var hideSheet = $ionicActionSheet.show({
			buttons: [
			   { text: '<b>Create Notes</b>' },
			   { text: 'Missed Meeting' }
			],
			titleText: 'Note for Tutee: '+ tutee,
			cancelText: 'Cancel',
			cancel: function() {
				  // add cancel code..
			},
			buttonClicked: function(index) {
				switch(index) {
					case 0: //create note
						$state.go('menu.categories', {
							tutee: tutee_id
						}, {location: 'replace'});
					break;
					case 1: //missed meeting
						console.log(tutee_id);
						hideSheet();
						$ionicLoading.show({
							template: 'Saving your note...',
						});
						$scope.is_clicked = 0;
						if($scope.recordedContent=="") {
							$scope.recordedContent = $('textarea').val();
						}
						var data = {
							speech_text: '',
							category: '',
							category_name: '',
							tutor: window.localStorage['logged_user'],
							tutor_name: window.localStorage['tutor_name'],
							tutor_email: window.localStorage['logged_user_email'],
							tutee: window.localStorage['selectedTutee'],
							tutee_id: tutee_id,
							traffic_light: 'yellow',
							tutor_note: '',
							missed_meeting: true
						}
						SheetApi.sheetApi(data).then(function(res) {
							console.log(res);
							if(res.data.succ==1) {
								$ionicPopup.alert({
									title: 'Thank You!',
									template: 'Your note has been entered!'
								});
								$scope.recordedContent = '';
								$scope.isStopped = 1;
								window.localStorage.removeItem('traffic_light');
								window.localStorage.removeItem('selectedTutee');
								window.localStorage.removeItem('selectedTuteeId');
								$ionicHistory.goBack();
							} else {
								$ionicPopup.alert({
									title: 'Error!',
									template: 'Something went wrong!'
								});
							}
							console.log(tempSessionData.getsavedTempData());
							$ionicLoading.hide();
						}, function(err) {
							if(err.data.succ==0) {
								$ionicPopup.alert({
									title: 'Error!',
									template: err.msg
								});
							}
							$scope.recordedContent = '';
							$scope.isStopped = 1;
							$ionicLoading.hide();
							console.log(err);
						});
					break;
				}
			}
		});
	};
})
.controller('categoriesCtrl', function($scope, $rootScope, $state, $timeout, $ionicHistory, $ionicLoading, $ionicPopup, $ionicScrollDelegate, TutorApi, SheetApi, tempSessionData) {
	delete $scope.categories;
	$scope.$on('$ionicView.enter', function() {
		$scope.selectedTuteeName = window.localStorage['selectedTutee'] || null;
		if($(document).find('.added-cat').length > 0) {
			$(document).find('.added-cat').parents('label').addClass('saved-note-cat');
		}
		if($scope.gettrafficLight) {
			$scope.sendNoteButton = true;
		}
		
		var getNotesData = tempSessionData.getsavedTempData();
		$scope.catData = getNotesData.cat_id;
		showLoader($ionicLoading, 'Loading pastoral categories');
		$scope.trafficLights = false;
		if(angular.isDefined($scope.catData) && $scope.catData.length > 0) {
			$scope.trafficLights = true;
		}
		$scope.loadCategories = function() {
			$scope.info_msg = "Loading pastoral categories...";
			TutorApi.getCategories().then(function(res) {
				$scope.categories = [];
				var data = '';
				if(res.data.succ == 1) {
					data = res.data.data;
					angular.forEach(data, function(val, i) {
						$scope.categories.push(val);
					});
				} else {
					$scope.info_msg = "No pastoral categories found.";
				}
				$timeout(function() {
					if($(document).find('.added-cat').length > 0) {
						console.log($(document).find('.added-cat').parents('label'));
						$(document).find('.added-cat').parents('label').addClass('saved-note-cat');
					}
				},200);
				hideLoader($ionicLoading);
				console.log(res);
			}, function(err) {
				console.log(err);
				hideLoader($ionicLoading);
				$scope.info_msg = "No pastoral categories found. Pull down to refresh.";
				if(err.status == 401) {
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go('menu.login', {}, {location: 'replace'});
					$ionicPopup.alert({
						title: 'Unauthorized Access!',
						template: 'You\'ve to login into your account in order to access this page.'
					});
				}
			});
		};
		$scope.loadCategories();
		
	});
	
	$scope.doRefresh = function() {
		setTimeout(function() {
			$scope.$broadcast('scroll.refreshComplete');
			showLoader($ionicLoading, 'Refreshing List...');
			$scope.loadCategories();
		},1000);
	}
	
	$scope.sendNoteButton = false;
	$scope.selectCategory = function(event) {
		var target = $(event.target); var parentElem = $(target.parent());
		if(parentElem.hasClass('saved-note-cat')) {
			$ionicPopup.alert({
				title: 'Alert!',
				template: 'Choose Different category to add note or select traffic light below if you are satisfied with current note.'
			});
			return false;
		}
		$scope.selectedCatId = target.val();
		$scope.selectedCatName = parentElem.text();
		// $scope.sendNoteButton = true;
		// $scope.trafficLights = true;
		showLoader($ionicLoading, 'Loading Notes Form');
		$timeout(function() {
			$scope.sendNoteButton = false;
			hideLoader($ionicLoading);
			$state.go('menu.notes', {
				category: $scope.selectedCatId,
				category_name: $scope.selectedCatName,
			}, {location: 'replace'});
		}, 1000);
	}
	
	$scope.trafficLight = function(event) {
		// $ionicScrollDelegate.$getByHandle('note-final-actions').scrollTo(0,'100', true);
		$ionicScrollDelegate.scrollTo(0,'100000', true);
		var target = $(event.target); var parentElem = $(target.parent());
		$scope.gettrafficLight = parentElem.attr('ng-value');
		$scope.sendNoteButton = true;
	}
	
	$scope.exitTutorNote = function() {
		tempSessionData.destsavedTempData();
		$state.go('menu.tutees', {
			category: $scope.selectedCatId,
			category_name: $scope.selectedCatName,
		}, {location: 'replace'});
	}
	
	$scope.sendNote = function() {
		
		// console.log(tempSessionData.getsavedTempData());
		// return false;
		var getNotesData = tempSessionData.getsavedTempData();
		showLoader($ionicLoading, 'Sending your note for saving...');
		if(!$scope.gettrafficLight) {
			$ionicPopup.alert({
				title: 'Select Traffic Light!',
				template: 'You must select traffic light to add note.'
			});
			return false;
		}
		// window.localStorage['traffic_light'] = $scope.gettrafficLight;
		var data = {
			speech_text: getNotesData.speechText,
			category: getNotesData.cat_id,
			category_name: getNotesData.cat_names,
			tutor: window.localStorage['logged_user'],
			tutor_name: window.localStorage['tutor_name'],
			tutor_email: window.localStorage['logged_user_email'],
			tutee: window.localStorage['selectedTutee'],
			tutee_id: window.localStorage['selectedTuteeId'],
			traffic_light: $scope.gettrafficLight,
			tutor_note: $scope.recordedContent
		}
		SheetApi.sheetApi(data).then(function(res) {
			console.log(res);
			if(res.data.succ == 1) {
				$ionicPopup.alert({
					title: 'Thank You!',
					template: 'Your note has been entered!'
				});
				$scope.recordedContent = '';
				$scope.isStopped = 1;
				$(document).find('.added-cat').parents('label').removeClass('saved-note-cat');
				$(document).find('.added-cat').remove();
				window.localStorage.removeItem('traffic_light');
				window.localStorage.removeItem('selectedTutee');
				window.localStorage.removeItem('selectedTuteeId');
				$ionicHistory.goBack();
			} else {
				$ionicPopup.alert({
					title: 'Alert!',
					template: 'Something went wrong!'
				});
			}
			tempSessionData.destsavedTempData();
			console.log(tempSessionData.getsavedTempData());
			hideLoader($ionicLoading);
		}, function(err) {
			if(err.data.succ==0) {
				$ionicPopup.alert({
					title: 'Error!',
					template: err.msg
				});
			}
			$scope.recordedContent = '';
			$scope.isStopped = 1;
			hideLoader($ionicLoading);
			console.log(err);
		});
	}
	
	$scope.sendTrafficLight = function() {
		//send traffic light instead of notes via speech/text...
	}
})
.controller('tutornotes', function($scope, $rootScope, $state, $stateParams, $timeout, $ionicLoading, $ionicHistory, $ionicPopup, SheetApi, tempSessionData) {
	$scope.startListening = 0;
	$scope.recordedContent = '';
	$scope.isStopped = 0;
	hideLoader($ionicLoading);
	$scope.is_clicked = 0;
	$scope.cat_id = decodeURI($stateParams['category']);
	$scope.Category = decodeURI($stateParams['category_name']);
	$scope.startRecognition = function() {
		/**let options = {
		  language: 'en-US',
		  matches: 1
		};
		$scope.recognition = window.plugins.speechRecognition;
		$scope.recognition.isRecognitionAvailable(function(avail) {
			if(avail) {
				$scope.recognition.hasPermission(function(granted) {
					if(granted) {
						$scope.recognition.startListening(function(res) {
							$scope.recordedContent = res[0];
							$scope.$apply();
						}, function(err) {
							console.log(err);
						}, options);
					} else {
						$scope.recognition.requestPermission(function(requetsed) {
							$scope.recognition.startListening(function(res) {
								$scope.recordedContent = res[0];
								$scope.$apply();
							}, function(err) {
								console.log(err);
							}, options);
						}, function(err) {
							console.log(err);
						});
					}
				}, function(err) {
					console.log(err);
				});
			}
		}, function(e) {
			console.log(e);
		});**/
		$('textarea').attr('readonly',true);
		$scope.hideSavenote = false;
		$scope.recognition = new SpeechRecognition();
		$scope.recognition.continuous = true;
		$scope.startListening = 1;
		$scope.is_clicked = 1;
		$scope.isStopped = 0;
		$scope.placeholder = "Listening...";
		$('.start-speech').attr('disabled', false);
		$('.start-type').attr('disabled', true);
		$scope.recognition.start();
        $scope.recognition.onresult = function(event) {			
            if (event.results.length > 0) {
				$scope.$apply(function () {
					$scope.recordedContent += event.results[0][0].transcript +" ";
				});
            }
        };
		$scope.recognition.onend = function(event) {
			console.log('end listening: is stopped '+ $scope.isStopped );
			if($scope.isStopped == 0) {
				console.log('started again ');
				$scope.recognition.start();
			}
		}
	}
	
	$scope.stopRecognition = function() {
		if(angular.isDefined($scope.recognition)) {
			$scope.startListening = 0;
			$scope.isStopped = 1;
			$scope.placeholder = '';
			$scope.recognition.stop();
			$scope.is_clicked = 0;
			$('.start-speech').attr('disabled', false);
			$('.start-type').attr('disabled', false);
			if($scope.recordedContent.length > 0) {
				$('textarea').removeAttr('readonly');
			} else {
				$('textarea').attr('readonly',true);
			}
		}
		// $scope.recognition.stopListening(function(res) {
			// console.log(res);
		// }, function(err) {
			// console.log(err);
		// })
	};
	
	$scope.clearInput = function() {
		$scope.startListening = 0;
		$scope.isStopped = 1;
		$scope.recordedContent = "";
		$scope.stopRecognition();
		$scope.placeholder = '';
	};
	
	$scope.typeInput = function() {
		$scope.placeholder = "Provide your input to save note...";
		$scope.is_clicked = 1;
		$('.start-speech').attr('disabled', true);
		$('.start-type').attr('disabled', false);
		$('textarea').removeAttr('readonly');
		$scope.hideSavenote = false;
	};
	
	$scope.cancelInput = function() {
		$scope.stopRecognition();
		$scope.is_clicked = 0;
		$scope.placeholder = '';
		$scope.recordedContent = "";
		$('.start-speech').attr('disabled', false);
		$('.start-type').attr('disabled', false);
		$('textarea').prop('readonly',true);
		$('textarea').prop('value','');
		$scope.hideSavenote = true;
	};
	
	$scope.saveNote = function() {
		$ionicLoading.show({
			template: 'Saving your note...',
		});
		$scope.is_clicked = 0;
		if($scope.recordedContent=="") {
			$scope.recordedContent = $('textarea').val();
		}
		if($scope.recordedContent!='') {
			console.log($scope.recordedContent);
			tempSessionData.savedTempData('speechText', $scope.recordedContent);
		}
		if($scope.cat_id != '') {
			tempSessionData.savedTempData('cat_id', $scope.cat_id);
		}
		if($scope.Category != '') {
			tempSessionData.savedTempData('cat_names', $scope.Category);
		}
		$timeout(function() {
			$ionicHistory.goBack();
			$ionicLoading.hide();
		}, 1000);
	}
	
	/**$scope.sendToSheet = function() {
		$ionicLoading.show({
			template: 'Saving your note...',
		});
		$scope.is_clicked = 0;
		if($scope.recordedContent=="") {
			$scope.recordedContent = $('textarea').val();
		}
		var data = {
			speech_text: $scope.recordedContent,
			category: $scope.cat_id,
			category_name: $scope.Category,
			tutor: window.localStorage['logged_user'],
			tutor_name: window.localStorage['tutor_name'],
			tutor_email: window.localStorage['logged_user_email'],
			tutee: window.localStorage['selectedTutee'],
			tutee_id: window.localStorage['selectedTuteeId'],
			traffic_light: window.localStorage['traffic_light'],
			tutor_note: $scope.recordedContent
		}
		SheetApi.sheetApi(data).then(function(res) {
			console.log(res);
			$ionicPopup.alert({
				title: 'Thank You!',
				template: 'Your note has been entered!'
			});
			$scope.recordedContent = '';
			$scope.isStopped = 1;
			$ionicHistory.goBack();
			$ionicLoading.hide();
			window.localStorage.removeItem('traffic_light');
		}, function(err) {
			if(err.succ==0) {
				$ionicPopup.alert({
					title: 'Error!',
					template: err.msg
				});
			}
			$scope.recordedContent = '';
			$scope.isStopped = 1;
			$ionicLoading.hide();
			console.log(err);
		});
	}*/
})
.controller('MenuCtrl', function($scope, $rootScope) {
	
});

function showLoader($ionicLoading, content) {
	$ionicLoading.show({
		template: '<div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div> '+ content
	});
}

function hideLoader($ionicLoading) {
	$ionicLoading.hide();
}