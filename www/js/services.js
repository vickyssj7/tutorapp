angular.module('tutorapp.services', [])

.factory('SheetApi', ['$q', '$http', 'TUTOR_API', function($q, $http, TUTOR_API) {
	function sheetApi(inputData) {
		return $http({
			method: 'POST',
			url: TUTOR_API.server + '/send-speech-text',
			dataType: "json",
			data: $.param(inputData),
			headers: {'Authorization': 'Bearer ' + window.localStorage['auth_token'] || null, 'content-type': 'application/x-www-form-urlencoded'},
		});
	}
	
	return {
		sheetApi: sheetApi
	}
}])
.factory('tempSessionData', ['$q','$http', function($q, $http) {
	
	var inputData = {speechText: [],cat_id:[],cat_names:[]};
	function saveTempData(key, data) {
		if(!angular.isDefined(inputData[key])){
			inputData[key] = [data];
		} else {
			inputData[key].push(data);
		}
		return inputData;
	}
	
	function getTempData() {
		return inputData;
	}
	
	function destroyTempData() {
		return inputData = {speechText: [],cat_id:[],cat_names:[]};
	}
	return {
		savedTempData: saveTempData,
		getsavedTempData: getTempData,
		destsavedTempData: destroyTempData
	}
}])
.factory('TutorApi', ['$q', '$http', 'TUTOR_API', function($q, $http, TUTOR_API) {
	return {
		login: login,
		checkUser: checkUser,
		getTutors: getTutors,
		getTutees: getTutees,
		savedNotes: savedNotes,
		getCategories: getCategories
	}
	
	function login(inputdata) {
		return $http({
			method: 'POST',
			url: TUTOR_API.server + '/login',
			dataType: "json",
			data: $.param(inputdata),
			headers: {'content-type': 'application/x-www-form-urlencoded'},
		});
	}
	
	
	function checkUser(tutor) {
		return $http({
			method: 'GET',
			url: TUTOR_API.server + '/check-user/'+tutor,
			dataType: "json",
			headers: {'content-type': 'application/x-www-form-urlencoded'},
		});
	}
	
	function getTutors() {
		return $http({
			method: 'GET',
			url: TUTOR_API.server + '/tutors',
			dataType: "json",
			headers: {'Authorization': 'Bearer ' + window.localStorage['auth_token'] || null},
		});
	}
	function getTutees(id) {
		return $http({
			method: 'GET',
			url: TUTOR_API.server + '/tutees/'+id,
			dataType: "json",
			headers: {'Authorization': 'Bearer ' + window.localStorage['auth_token'] || null},
		});
	}
	function getCategories() {
		return $http({
			method: 'GET',
			url: TUTOR_API.server + '/categories',
			dataType: "json",
			headers: {'Authorization': 'Bearer ' + window.localStorage['auth_token'] || null},
		});
	}
	function savedNotes(tutor) {
		return $http({
			method: 'GET',
			url: TUTOR_API.server + '/saved-notes/'+tutor,
			dataType: "json",
			headers: {'Authorization': 'Bearer ' + window.localStorage['auth_token'] || null},
		});
	}
	
}])
.factory('connectionCheck', function($ionicPopup) {
	return {
		hasConnection: checkConnection
	};
	function checkConnection(){
		document.addEventListener("offline", onOffline, false);
		document.addEventListener("online", onOnline, false);
		function onOffline() {
			return false;
		}
		function onOnline() {
			var connection = navigator.connection.type;
			if(connection == 'none' || connection == 'unknown' || connection == 'cell_2G') {
				return false;
			}
			if(connection == '3g' || connection == '4g' || connection == 'wifi') {
				return true;
			}
		}
        /*var connection = navigator.connection.type;
		if(connection == 'none' || connection == 'unknown' || connection == 'cell_2G') {
            return false;
        } else if(connection == '3g' || connection == '4g' || connection == 'wifi') {
            return true;
        }*/
        return false;
    }
});