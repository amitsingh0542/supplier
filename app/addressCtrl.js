app.controller('addressCtrl', function ($scope, $rootScope, $routeParams, $location, $http, Data) { 
	$scope.supplier = {address1:'', address2:'', email:'', city:'', state:'', country:'', zipcode:'', phone1:'', phone2:'', mobile:''};
	$scope.supplierAddress = function(supplier){
		supplier.sid = $routeParams.id
		    Data.post('supplierAddress', {
            supplier: supplier
        }).then(function (results) {
            Data.toast(results);
            if (results.status == "success") {
                $location.path('dashboard');
            }
        });	
	}
});